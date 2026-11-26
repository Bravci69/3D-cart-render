import mysql from 'mysql2/promise'
import type { ProductData } from '../../src/types/product.ts'
import { productStore } from '../db/productStore.ts'
import { discoverAndBuildProduct, type ResolveProductInput } from './imageDiscovery.ts'

export interface WordPressRestSyncConfig {
  mode: 'wp-rest'
  siteUrl: string
  consumerKey?: string
  consumerSecret?: string
  limit?: number
  forceRefresh?: boolean
}

export interface WordPressSqlSyncConfig {
  mode: 'wp-sql'
  host: string
  port?: number
  user: string
  password: string
  database: string
  tablePrefix?: string
  limit?: number
  forceRefresh?: boolean
}

export interface BatchSyncConfig {
  mode: 'batch'
  products: ResolveProductInput[]
  forceRefresh?: boolean
}

export type SyncRequestConfig = WordPressRestSyncConfig | WordPressSqlSyncConfig | BatchSyncConfig

export interface SyncReport {
  mode: SyncRequestConfig['mode']
  totalFetched: number
  createdOrUpdated: number
  skippedExisting: number
  failed: { name: string; error: string }[]
  products: ProductData[]
}

/**
 * Fetches products from WooCommerce REST API v3 or public WooCommerce Store API v1.
 */
async function fetchFromWordPressRest(cfg: WordPressRestSyncConfig): Promise<ResolveProductInput[]> {
  const baseUrl = cfg.siteUrl.replace(/\/+$/, '')
  const limit = Math.min(100, Math.max(1, cfg.limit || 25))
  const results: ResolveProductInput[] = []

  // Try authenticated WooCommerce REST API v3 first when keys are provided
  if (cfg.consumerKey && cfg.consumerSecret) {
    const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString('base64')
    const url = `${baseUrl}/wp-json/wc/v3/products?per_page=${limit}&status=publish`
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, 'User-Agent': 'CardCatcher-3D-Sync' },
    })
    if (!res.ok) {
      throw new Error(`WooCommerce REST API v3 zlyhalo: HTTP ${res.status}`)
    }
    const items = (await res.json()) as Array<{
      id: number
      name: string
      slug: string
      sku?: string
      price?: string
      permalink?: string
      short_description?: string
      images?: Array<{ src: string }>
    }>
    for (const item of items) {
      results.push({
        externalId: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku || undefined,
        price: item.price ? parseFloat(item.price) : undefined,
        sourceUrl: item.permalink,
        description: item.short_description?.replace(/<[^>]+>/g, '').trim() || undefined,
        existingImageUrl: item.images?.[0]?.src,
        extraImageUrls: item.images?.slice(1, 4).map((i) => i.src),
      })
    }
    return results
  }

  // Fallback to public WooCommerce Store API (usually requires zero keys!)
  const storeUrl = `${baseUrl}/wp-json/wc/store/v1/products?per_page=${limit}`
  const storeRes = await fetch(storeUrl, { headers: { 'User-Agent': 'CardCatcher-3D-Sync' } })
  if (storeRes.ok) {
    const items = (await storeRes.json()) as Array<{
      id: number
      name: string
      slug: string
      sku?: string
      permalink?: string
      short_description?: string
      prices?: { price?: string; currency_minor_unit?: number; currency_symbol?: string }
      images?: Array<{ src: string }>
    }>
    for (const item of items) {
      const minor = item.prices?.currency_minor_unit ?? 2
      const numericPrice = item.prices?.price ? Number(item.prices.price) / Math.pow(10, minor) : undefined
      results.push({
        externalId: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku || undefined,
        price: numericPrice,
        currency: item.prices?.currency_symbol || '€',
        sourceUrl: item.permalink,
        description: item.short_description?.replace(/<[^>]+>/g, '').trim() || undefined,
        existingImageUrl: item.images?.[0]?.src,
        extraImageUrls: item.images?.slice(1, 4).map((i) => i.src),
      })
    }
    return results
  }

  throw new Error(
    `Nepodarilo sa pripojiť na WooCommerce API na ${baseUrl} (Store API vrátilo HTTP ${storeRes.status}). Skontrolujte URL alebo zadajte WooCommerce REST API kľúče.`
  )
}

/**
 * Reads published WooCommerce products directly from WordPress MySQL / MariaDB SQL database.
 */
async function fetchFromWordPressSql(cfg: WordPressSqlSyncConfig): Promise<ResolveProductInput[]> {
  const prefix = cfg.tablePrefix || 'wp_'
  if (!/^[a-zA-Z0-9_]+$/.test(prefix)) {
    throw new Error('Neplatný prefix SQL tabuliek (povolené sú len znaky a-z, 0-9 a _).')
  }

  const limit = Math.min(200, Math.max(1, cfg.limit || 30))
  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port || 3306,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    connectTimeout: 8000,
  })

  try {
    const postsTable = `${prefix}posts`
    const metaTable = `${prefix}postmeta`

    const sql = `
      SELECT
        p.ID AS externalId,
        p.post_title AS name,
        p.post_name AS slug,
        p.post_excerpt AS description,
        p.guid AS sourceUrl,
        MAX(CASE WHEN pm.meta_key = '_price' THEN pm.meta_value END) AS price,
        MAX(CASE WHEN pm.meta_key = '_sku' THEN pm.meta_value END) AS sku,
        MAX(CASE WHEN pm.meta_key = '_thumbnail_id' THEN thumb.guid END) AS existingImageUrl
      FROM \`${postsTable}\` p
      LEFT JOIN \`${metaTable}\` pm ON p.ID = pm.post_id
      LEFT JOIN \`${postsTable}\` thumb
        ON pm.meta_key = '_thumbnail_id' AND thumb.ID = CAST(pm.meta_value AS UNSIGNED)
      WHERE p.post_type = 'product' AND p.post_status = 'publish'
      GROUP BY p.ID, p.post_title, p.post_name, p.post_excerpt, p.guid
      ORDER BY p.ID DESC
      LIMIT ?
    `

    const [rows] = await conn.query(sql, [limit])
    const typedRows = rows as Array<{
      externalId: number
      name: string
      slug: string
      description?: string
      sourceUrl?: string
      price?: string
      sku?: string
      existingImageUrl?: string
    }>

    return typedRows.map((r) => ({
      externalId: r.externalId,
      name: r.name,
      slug: r.slug,
      description: r.description ? r.description.replace(/<[^>]+>/g, '').trim() : undefined,
      sourceUrl: r.sourceUrl,
      price: r.price ? parseFloat(r.price) : undefined,
      sku: r.sku || undefined,
      existingImageUrl: r.existingImageUrl || undefined,
    }))
  } finally {
    await conn.end()
  }
}

/**
 * Synchronizes products from WordPress REST API, Basic WordPress SQL, or batch product names,
 * automatically discovering online images & building WebP 3D textures.
 */
export async function syncProductsFromSource(config: SyncRequestConfig): Promise<SyncReport> {
  let incoming: ResolveProductInput[] = []

  if (config.mode === 'wp-rest') {
    incoming = await fetchFromWordPressRest(config)
  } else if (config.mode === 'wp-sql') {
    incoming = await fetchFromWordPressSql(config)
  } else {
    incoming = config.products || []
  }

  const report: SyncReport = {
    mode: config.mode,
    totalFetched: incoming.length,
    createdOrUpdated: 0,
    skippedExisting: 0,
    failed: [],
    products: [],
  }

  for (const item of incoming) {
    if (!item.name || !item.name.trim()) continue

    const existing =
      (item.externalId !== undefined ? productStore.findBySlugOrId(String(item.externalId)) : null) ||
      (item.slug ? productStore.findBySlugOrId(item.slug) : null) ||
      productStore.findBestLocalMatch(item.name)

    if (existing && !config.forceRefresh && existing.name.toLowerCase() === item.name.trim().toLowerCase()) {
      report.skippedExisting++
      report.products.push(existing)
      continue
    }

    try {
      const built = await discoverAndBuildProduct(item)
      productStore.upsert(built)
      report.createdOrUpdated++
      report.products.push(built)
    } catch (err) {
      report.failed.push({
        name: item.name,
        error: err instanceof Error ? err.message : 'Neznáma chyba synchronizácie',
      })
    }
  }

  return report
}
