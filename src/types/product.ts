export type TcgGame = 'pokemon' | 'magic' | 'one-piece' | 'lol' | 'other'

export type ProductLanguage = 'en' | 'de' | 'jp' | 'cs' | 'sk' | 'multi'

export type ProductType =
  | 'booster-pack'
  | 'booster-box'
  | 'booster-bundle'
  | 'elite-trainer-box'
  | 'tin'
  | 'mini-tin'
  | 'blister-pack'
  | 'collection-box'
  | 'build-and-battle'
  | 'starter-deck'

export interface ProductDimensions {
  width: number
  height: number
  depth: number
  bevelRadius?: number
}

export interface ProductMaterial {
  roughness: number
  metalness: number
  clearcoat: number
  clearcoatRoughness: number
  transmission?: number
  ior?: number
  reflectivity?: number
}

export interface ProductTextures {
  front: string
  back: string
  side?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  thumbnail?: string
}

export interface ProductImageItem {
  url: string
  label?: string
  angle?: 'front' | 'back' | 'side' | 'top' | 'contents' | 'gallery'
}

export interface ProductData {
  id: string
  name: string
  slug: string
  game: TcgGame
  type: ProductType
  language?: ProductLanguage
  series?: string
  set?: string
  setCode?: string
  releaseYear?: number
  sku?: string
  externalId?: string | number
  sourceUrl?: string
  dimensions: ProductDimensions
  material: ProductMaterial
  textures: ProductTextures
  images?: ProductImageItem[]
  price?: number
  currency?: string
  description?: string
  featured?: boolean
  syncedAt?: string
  imageSource?: string
}

export interface ProductTypePreset {
  type: ProductType
  label: string
  shortLabel: string
  description: string
  dimensions: ProductDimensions
  material: ProductMaterial
}

export interface TcgGameMeta {
  game: TcgGame
  label: string
  shortLabel: string
  accentClass: string
  ready: boolean
}
