import type { ProductImageItem, ProductLanguage, ProductType, TcgGame } from '../../src/types/product.ts'

export interface ProviderResolveRequest {
  name: string
  cleanQuery: string
  variantTerms?: string[]
  game: TcgGame
  type: ProductType
  language: ProductLanguage
  setCode?: string
  existingImageUrl?: string
  extraImageUrls?: string[]
}

export interface ProviderResolvedUrls {
  frontCandidates: string[]
  backCandidates: string[]
  galleryCandidates: { url: string; label: string; angle: ProductImageItem['angle'] }[]
  set?: string
  series?: string
  setCode?: string
  releaseYear?: number
  imageSource: string
}

export interface ITcgProvider {
  readonly game: TcgGame
  resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls>
}
