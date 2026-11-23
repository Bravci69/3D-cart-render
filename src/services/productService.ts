import type { ProductData, ProductType } from '../types/product.ts'
import { createProduct } from '../config/product-types.ts'
import { DEFAULT_INTEGRATION_CONFIG, type IntegrationConfig } from '../config/integration.ts'

export interface IProductDataSource {
  getAll(): Promise<ProductData[]>
  getBySlug(slug: string): Promise<ProductData | null>
  getByType(type: ProductType): Promise<ProductData[]>
  search(query: string): Promise<ProductData[]>
  matchByName(productName: string): Promise<ProductData | null>
}

/**
 * Loads products from public/products.json containing 100% real Pokémon scans
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
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      this.cache = await response.json()
      return this.cache || []
    } catch (err) {
      console.error('Error fetching products.json:', err)
      return []
    }
  }

  async getBySlug(slug: string): Promise<ProductData | null> {
    const all = await this.getAll()
    return all.find((p) => p.slug === slug || p.id === slug) || null
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
        p.series?.toLowerCase().includes(q)
    )
  }

  /**
   * Intelligently maps a product title from the user's e-shop or database
   * to the real 3D Pokémon render asset.
   */
  async matchByName(productName: string): Promise<ProductData | null> {
    const all = await this.getAll()
    const clean = productName.toLowerCase().trim()

    // 1. Exact match
    const exact = all.find((p) => p.name.toLowerCase() === clean)
    if (exact) return exact

    // 2. Direct substring match
    const direct = all.find((p) => clean.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(clean))
    if (direct) return direct

    // 3. Keyword matching for specific Pokémon & sets
    const keywords: { words: string[]; id: string }[] = [
      { words: ['charizard', 'base', '1999', 'vintage'], id: 'pkm-1999-base-charizard' },
      { words: ['blastoise'], id: 'pkm-1999-base-blastoise' },
      { words: ['venusaur'], id: 'pkm-1999-base-venusaur' },
      { words: ['rocket', 'giovanni'], id: 'pkm-team-rocket-giovanni' },
      { words: ['fossil', 'aerodactyl'], id: 'pkm-fossil-pack' },
      { words: ['jungle', 'scyther'], id: 'pkm-jungle-pack' },
      { words: ['genesis', 'lugia'], id: 'pkm-neo-genesis-lugia' },
      { words: ['destiny', 'tyranitar'], id: 'pkm-neo-destiny-tyranitar' },
      { words: ['151', 'mew'], id: 'pkm-modern-151-mew' },
      { words: ['charizard', 'obsidian'], id: 'pkm-modern-obsidian-charizard' },
      { words: ['pikachu', 'surging', 'sparks'], id: 'pkm-modern-surging-sparks-pikachu' },
    ]

    for (const kw of keywords) {
      const matchCount = kw.words.filter((w) => clean.includes(w)).length
      if (matchCount >= 2 || (kw.words.length === 1 && matchCount === 1)) {
        const found = all.find((p) => p.id === kw.id)
        if (found) return found
      }
    }

    // Single keyword match fallback
    for (const kw of keywords) {
      if (kw.words.some((w) => clean.includes(w))) {
        const found = all.find((p) => p.id === kw.id)
        if (found) return found
      }
    }

    // Default to first real booster pack
    const fallback = all[0]
    return createProduct({
      id: `inferred-${Date.now()}`,
      name: productName,
      slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: 'booster-pack',
      textures: fallback.textures,
    })
  }
}

/**
 * Connects to an external REST API (e.g. your custom WooCommerce, Shopify, or PostgreSQL API)
 */
export class ApiProductDataSource implements IProductDataSource {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl
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
    return res.json()
  }

  async getBySlug(slug: string): Promise<ProductData | null> {
    const res = await fetch(`${this.baseUrl}/products/${slug}`, { headers: this.headers })
    if (!res.ok) return null
    return res.json()
  }

  async getByType(type: ProductType): Promise<ProductData[]> {
    const res = await fetch(`${this.baseUrl}/products?type=${type}`, { headers: this.headers })
    if (!res.ok) return []
    return res.json()
  }

  async search(query: string): Promise<ProductData[]> {
    const res = await fetch(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`, {
      headers: this.headers,
    })
    if (!res.ok) return []
    return res.json()
  }

  async matchByName(productName: string): Promise<ProductData | null> {
    const res = await fetch(`${this.baseUrl}/products/match?name=${encodeURIComponent(productName)}`, {
      headers: this.headers,
    })
    if (!res.ok) return null
    return res.json()
  }
}

/**
 * Service singleton
 */
class ProductService {
  private dataSource: IProductDataSource

  constructor(config: IntegrationConfig = DEFAULT_INTEGRATION_CONFIG) {
    if (config.dataSource === 'api' && config.apiBaseUrl) {
      this.dataSource = new ApiProductDataSource(config.apiBaseUrl, config.apiKey)
    } else {
      this.dataSource = new JsonProductDataSource()
    }
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
}

export const productService = new ProductService()
