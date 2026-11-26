import { DEFAULT_INTEGRATION_CONFIG, type IntegrationConfig } from '../config/integration.ts'
import { createProduct } from '../config/product-types.ts'
import { classifyProductName } from '../shared/productClassifier.ts'
import type { ProductData, ProductLanguage, ProductType, TcgGame } from '../types/product.ts'

export interface ResolveProductPayload {
  name: string
  game?: TcgGame
  type?: ProductType
  language?: ProductLanguage
  price?: number
  currency?: string
  existingImageUrl?: string
  forceRefresh?: boolean
}

export interface WordPressSyncPayload {
  mode: 'wp-rest' | 'wp-sql' | 'batch'
  siteUrl?: string
  consumerKey?: string
  consumerSecret?: string
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  tablePrefix?: string
  limit?: number
  forceRefresh?: boolean
  products?: ResolveProductPayload[]
}

export interface WordPressSyncResponse {
  mode: string
  totalFetched: number
  createdOrUpdated: number
  skippedExisting: number
  failed: { name: string; error: string }[]
  products: ProductData[]
}

export interface IProductDataSource {
  getAll(): Promise<ProductData[]>
  getBySlug(slug: string): Promise<ProductData | null>
  getByType(type: ProductType): Promise<ProductData[]>
  search(query: string): Promise<ProductData[]>
  matchByName(productName: string): Promise<ProductData | null>
}

function hydrateProduct(raw: ProductData): ProductData {
  if (raw.game && raw.images && raw.images.length > 0 && raw.language) return raw
  const classified = classifyProductName(raw.name, {
    game: raw.game,
    type: raw.type,
    language: raw.language,
  })
  return createProduct({
    ...raw,
    game: raw.game || classified.game,
    type: raw.type || classified.type,
    language: raw.language || classified.language,
    customDimensions: raw.dimensions,
    customMaterial: raw.material,
  })
}

/**
 * Loads static pre-synced products from public/products.json (instant, works without Node backend).
 */
export class JsonProductDataSource implements IProductDataSource {
  private cache: ProductData[] | null = null
  private jsonPath: string

  constructor(jsonPath = '/products.json') {
    this.jsonPath = jsonPath
  }

  async getAll(): Promise<ProductData[]> {
    if (this.cache) return this.cache
    try {
      const response = await fetch(this.jsonPath)
      if (!response.ok) throw new Error(`Failed to fetch ${this.jsonPath}: ${response.status}`)
      const raw = (await response.json()) as ProductData[]
      this.cache = Array.isArray(raw) ? raw.map(hydrateProduct) : []
      return this.cache
    } catch (err) {
      console.error('Error fetching products.json:', err)
      return []
    }
  }

  async getBySlug(slug: string): Promise<ProductData | null> {
    const all = await this.getAll()
    const target = slug.toLowerCase().trim()
    return all.find((p) => p.slug.toLowerCase() === target || p.id.toLowerCase() === target) || null
  }

  async getByType(type: ProductType): Promise<ProductData[]> {
    const all = await this.getAll()
    return all.filter((p) => p.type === type)
  }

  async search(query: string): Promise<ProductData[]> {
    const all = await this.getAll()
    const q = query.toLowerCase().trim()
    if (!q) return all

    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.set?.toLowerCase().includes(q) ||
        p.series?.toLowerCase().includes(q) ||
        p.game?.toLowerCase().includes(q)
    )
  }

  async matchByName(productName: string): Promise<ProductData | null> {
    const all = await this.getAll()
    if (all.length === 0) return null

    const clean = productName.toLowerCase().trim()
    const exact = all.find((p) => p.name.toLowerCase() === clean)
    if (exact) return exact

    const classified = classifyProductName(productName)
    const tokens = [
      ...clean.split(/[\s\-_()[\]/]+/).filter((t) => t.length >= 2),
      ...classified.variantTerms,
    ]

    let best: { product: ProductData; score: number } | null = null
    for (const p of all) {
      let score = 0
      if (p.game === classified.game) score += 20
      if (p.type === classified.type) score += 25
      if (p.language === classified.language) score += 8
      const pLower = p.name.toLowerCase()
      for (const tok of tokens) {
        if (pLower.includes(tok)) score += tok.length >= 4 ? 15 : 7
      }
      if (!best || score > best.score) {
        best = { product: p, score }
      }
    }

    if (best && best.score >= 30) return best.product

    // Fallback keeping the detected game & type proportions cleanly
    const sameTypeFallback = all.find((p) => p.type === classified.type) || all[0]
    return createProduct({
      id: `inferred-${Date.now()}`,
      name: productName,
      slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      game: classified.game,
      type: classified.type,
      language: classified.language,
      textures: sameTypeFallback.textures,
      images: sameTypeFallback.images,
    })
  }
}

/**
 * Connects to the CardCatcher Express backend API (/api/products, /api/sync/wordpress, etc.).
 */
export class ApiProductDataSource implements IProductDataSource {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl = '/api', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
  }

  private get headers(): HeadersInit {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) {
      h['Authorization'] = `Bearer ${this.apiKey}`
    }
    return h
  }

  async getAll(): Promise<ProductData[]> {
    const res = await fetch(`${this.baseUrl}/products`, { headers: this.headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = (await res.json()) as ProductData[]
    return data.map(hydrateProduct)
  }

  async getBySlug(slug: string): Promise<ProductData | null> {
    const res = await fetch(`${this.baseUrl}/products/${encodeURIComponent(slug)}`, { headers: this.headers })
    if (!res.ok) return null
    return hydrateProduct((await res.json()) as ProductData)
  }

  async getByType(type: ProductType): Promise<ProductData[]> {
    const res = await fetch(`${this.baseUrl}/products?type=${encodeURIComponent(type)}`, { headers: this.headers })
    if (!res.ok) return []
    const data = (await res.json()) as ProductData[]
    return data.map(hydrateProduct)
  }

  async search(query: string): Promise<ProductData[]> {
    const res = await fetch(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`, {
      headers: this.headers,
    })
    if (!res.ok) return []
    const data = (await res.json()) as ProductData[]
    return data.map(hydrateProduct)
  }

  async matchByName(productName: string): Promise<ProductData | null> {
    const res = await fetch(`${this.baseUrl}/products/match?name=${encodeURIComponent(productName)}`, {
      headers: this.headers,
    })
    if (!res.ok) return null
    return hydrateProduct((await res.json()) as ProductData)
  }

  async resolveProduct(payload: ResolveProductPayload): Promise<ProductData> {
    const res = await fetch(`${this.baseUrl}/products/resolve`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    })
    const json = (await res.json()) as ProductData & { error?: string }
    if (!res.ok) {
      throw new Error(json.error || `Nepodarilo sa automaticky spracovať produkt (${res.status})`)
    }
    return hydrateProduct(json)
  }

  async syncWordPress(payload: WordPressSyncPayload): Promise<WordPressSyncResponse> {
    const res = await fetch(`${this.baseUrl}/sync/wordpress`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    })
    const json = (await res.json()) as WordPressSyncResponse & { error?: string }
    if (!res.ok) {
      throw new Error(json.error || `Synchronizácia zlyhala (${res.status})`)
    }
    return {
      ...json,
      products: (json.products || []).map(hydrateProduct),
    }
  }
}

/**
 * Tries live Express Backend API first, and cleanly falls back to static products.json when offline.
 */
export class HybridProductDataSource implements IProductDataSource {
  private api: ApiProductDataSource
  private json: JsonProductDataSource

  constructor(baseUrl = '/api', apiKey?: string, jsonPath = '/products.json') {
    this.api = new ApiProductDataSource(baseUrl, apiKey)
    this.json = new JsonProductDataSource(jsonPath)
  }

  async getAll(): Promise<ProductData[]> {
    try {
      const apiProducts = await this.api.getAll()
      if (apiProducts.length > 0) return apiProducts
    } catch {
      // Static fallback when backend server is not running
    }
    return this.json.getAll()
  }

  async getBySlug(slug: string): Promise<ProductData | null> {
    try {
      const item = await this.api.getBySlug(slug)
      if (item) return item
    } catch {
      // ignore
    }
    return this.json.getBySlug(slug)
  }

  async getByType(type: ProductType): Promise<ProductData[]> {
    try {
      const items = await this.api.getByType(type)
      if (items.length > 0) return items
    } catch {
      // ignore
    }
    return this.json.getByType(type)
  }

  async search(query: string): Promise<ProductData[]> {
    try {
      return await this.api.search(query)
    } catch {
      return this.json.search(query)
    }
  }

  async matchByName(productName: string): Promise<ProductData | null> {
    try {
      const item = await this.api.matchByName(productName)
      if (item) return item
    } catch {
      // ignore
    }
    return this.json.matchByName(productName)
  }

  resolveProduct(payload: ResolveProductPayload): Promise<ProductData> {
    return this.api.resolveProduct(payload)
  }

  syncWordPress(payload: WordPressSyncPayload): Promise<WordPressSyncResponse> {
    return this.api.syncWordPress(payload)
  }
}

class ProductService {
  private dataSource: IProductDataSource
  private apiClient: ApiProductDataSource

  constructor(config: IntegrationConfig = DEFAULT_INTEGRATION_CONFIG) {
    const baseUrl = config.apiBaseUrl || '/api'
    this.apiClient = new ApiProductDataSource(baseUrl, config.apiKey)

    if (config.dataSource === 'api') {
      this.dataSource = this.apiClient
    } else if (config.dataSource === 'json') {
      this.dataSource = new JsonProductDataSource()
    } else {
      this.dataSource = new HybridProductDataSource(baseUrl, config.apiKey)
    }
  }

  setApiBaseUrl(url: string, apiKey?: string) {
    this.apiClient = new ApiProductDataSource(url, apiKey)
    this.dataSource = new HybridProductDataSource(url, apiKey)
  }

  setDataSource(source: IProductDataSource) {
    this.dataSource = source
  }

  getAll(): Promise<ProductData[]> {
    return this.dataSource.getAll()
  }

  getBySlug(slug: string): Promise<ProductData | null> {
    return this.dataSource.getBySlug(slug)
  }

  getByType(type: ProductType): Promise<ProductData[]> {
    return this.dataSource.getByType(type)
  }

  search(query: string): Promise<ProductData[]> {
    return this.dataSource.search(query)
  }

  matchByName(productName: string): Promise<ProductData | null> {
    return this.dataSource.matchByName(productName)
  }

  resolveByName(payload: ResolveProductPayload): Promise<ProductData> {
    return this.apiClient.resolveProduct(payload)
  }

  syncWordPress(payload: WordPressSyncPayload): Promise<WordPressSyncResponse> {
    return this.apiClient.syncWordPress(payload)
  }
}

export const productService = new ProductService()
