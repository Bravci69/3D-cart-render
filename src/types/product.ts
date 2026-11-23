export type ProductType =
  | 'booster-pack'
  | 'booster-box'
  | 'elite-trainer-box'
  | 'tin'
  | 'blister-pack'
  | 'collection-box'

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
  thumbnail?: string
}

export interface ProductData {
  id: string
  name: string
  slug: string
  type: ProductType
  series?: string
  set?: string
  releaseYear?: number
  dimensions: ProductDimensions
  material: ProductMaterial
  textures: ProductTextures
  price?: number
  currency?: string
  description?: string
  featured?: boolean
}

export interface ProductTypePreset {
  type: ProductType
  label: string
  description: string
  dimensions: ProductDimensions
  material: ProductMaterial
}
