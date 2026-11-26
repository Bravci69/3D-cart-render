import fs from 'node:fs'
import path from 'node:path'
import { createProduct } from '../../src/config/product-types.ts'
import { classifyProductName } from '../../src/shared/productClassifier.ts'
import type { ProductData, ProductType, TcgGame } from '../../src/types/product.ts'

const DEFAULT_MANIFEST_PATH = path.resolve(process.cwd(), 'public', 'products.json')

/**
 * Normalizes legacy product records loaded from disk into full multi-TCG ProductData objects.
 */
function hydrateLegacyProduct(raw: ProductData): ProductData {
  if (raw.game && raw.images && raw.images.length > 0 && raw.language) {
    return raw
  }
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

export class ProductStore {
  private manifestPath: string
  private products: ProductData[] = []

  constructor(manifestPath = DEFAULT_MANIFEST_PATH) {
    this.manifestPath = manifestPath
    this.reload()
  }

  reload(): ProductData[] {
    if (!fs.existsSync(this.manifestPath)) {
      this.products = []
      return this.products
    }
    try {
      const raw = JSON.parse(fs.readFileSync(this.manifestPath, 'utf-8')) as ProductData[]
      this.products = Array.isArray(raw) ? raw.map(hydrateLegacyProduct) : []
    } catch {
      this.products = []
    }
    return this.products
  }

  private persist(): void {
    const dir = path.dirname(this.manifestPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.products, null, 2), 'utf-8')
  }

  getAll(filters?: { game?: TcgGame | 'all'; type?: ProductType | 'all'; language?: string; query?: string }): ProductData[] {
    let list = this.products
    if (filters?.game && filters.game !== 'all') {
      list = list.filter((p) => p.game === filters.game)
    }
    if (filters?.type && filters.type !== 'all') {
      list = list.filter((p) => p.type === filters.type)
    }
    if (filters?.language && filters.language !== 'all') {
      list = list.filter((p) => p.language === filters.language)
    }
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.set?.toLowerCase().includes(q) ||
          p.series?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      )
    }
    return list
  }

  findBySlugOrId(slugOrId: string): ProductData | null {
    const target = slugOrId.toLowerCase().trim()
    return (
      this.products.find(
        (p) =>
          p.slug.toLowerCase() === target ||
          p.id.toLowerCase() === target ||
          String(p.externalId || '').toLowerCase() === target
      ) || null
    )
  }

  findBestLocalMatch(productName: string): ProductData | null {
    const clean = productName.toLowerCase().trim()
    if (!clean) return null

    // 1. Exact title match
    const exact = this.products.find((p) => p.name.toLowerCase() === clean)
    if (exact) return exact

    // 2. Score overlap by meaningful words + matching product type/language/game
    const classified = classifyProductName(productName)
    const tokens = clean
      .split(/[\s\-_()[\]/]+/)
      .filter((t) => t.length >= 2)

    let best: { product: ProductData; score: number } | null = null

    for (const p of this.products) {
      if (p.game !== classified.game) continue
      let score = 0
      if (p.type === classified.type) score += 25
      if (p.language === classified.language) score += 10

      const pLower = p.name.toLowerCase()
      let tokenHits = 0
      for (const tok of tokens) {
        if (pLower.includes(tok)) {
          tokenHits++
          score += tok.length >= 4 ? 16 : 8
        }
      }
      if (tokenHits >= 2 && score > (best?.score ?? 0)) {
        best = { product: p, score }
      }
    }

    return best && best.score >= 45 ? best.product : null
  }

  upsert(product: ProductData): ProductData {
    const idx = this.products.findIndex(
      (p) =>
        p.id === product.id ||
        p.slug === product.slug ||
        (product.externalId !== undefined && p.externalId === product.externalId)
    )
    if (idx >= 0) {
      this.products[idx] = product
    } else {
      this.products.unshift(product)
    }
    this.persist()
    return product
  }

  replaceAll(products: ProductData[]): void {
    this.products = products
    this.persist()
  }

  remove(idOrSlug: string): boolean {
    const before = this.products.length
    this.products = this.products.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug)
    if (this.products.length !== before) {
      this.persist()
      return true
    }
    return false
  }
}

export const productStore = new ProductStore()
