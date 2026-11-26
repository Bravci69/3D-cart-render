import { createProduct } from '../../src/config/product-types.ts'
import { classifyProductName, normalizeSlug } from '../../src/shared/productClassifier.ts'
import type { ProductData, ProductLanguage, ProductType, TcgGame } from '../../src/types/product.ts'
import { getTcgProvider } from '../providers/index.ts'
import { processAndSaveProductTextures } from './textureProcessor.ts'
import { downloadFirstValidImages } from './webImageSearch.ts'

export interface ResolveProductInput {
  name: string
  game?: TcgGame
  type?: ProductType
  language?: ProductLanguage
  price?: number
  currency?: string
  description?: string
  sku?: string
  externalId?: string | number
  sourceUrl?: string
  existingImageUrl?: string
  extraImageUrls?: string[]
  featured?: boolean
  slug?: string
}

/**
 * End-to-end automated pipeline:
 * 1. Classifies product title -> game (Pokemon / MTG / One Piece / LoL), type (ETB / Tin / Box...), language (EN / DE / JP...)
 * 2. Finds best official & multi-angle real product images online
 * 3. Downloads & validates raster buffers
 * 4. Generates WebP textures (3D box/pack faces + 2D gallery images)
 */
export async function discoverAndBuildProduct(
  input: ResolveProductInput,
  options: { publicDir?: string } = {}
): Promise<ProductData> {
  const classified = classifyProductName(input.name, {
    game: input.game,
    type: input.type,
    language: input.language,
  })

  const slug = input.slug || normalizeSlug(`${classified.game}-${classified.language}-${input.name}`)
  const provider = getTcgProvider(classified.game)

  const candidates = await provider.resolveImageCandidates({
    name: input.name,
    cleanQuery: classified.cleanQuery,
    variantTerms: classified.variantTerms,
    game: classified.game,
    type: classified.type,
    language: classified.language,
    setCode: classified.setCode,
    existingImageUrl: input.existingImageUrl,
    extraImageUrls: input.extraImageUrls,
  })

  // Download primary front image
  const frontImgs = await downloadFirstValidImages(candidates.frontCandidates, 1, 220)
  if (frontImgs.length === 0) {
    throw new Error(`Nepodarilo sa nájsť žiadny validný obrázok pre produkt "${input.name}"`)
  }
  const primaryFront = frontImgs[0]

  // Download back & extra gallery photos concurrently without blocking if unavailable
  const extraUrls = candidates.galleryCandidates
    .map((g) => g.url)
    .filter((u) => u !== primaryFront.url)

  const [backImgs, extraImgs] = await Promise.all([
    downloadFirstValidImages(
      candidates.backCandidates.filter((u) => u !== primaryFront.url),
      1,
      220
    ),
    downloadFirstValidImages(extraUrls, 3, 240),
  ])

  const backImg = backImgs[0]
  const extraGallery = extraImgs.map((img, i) => ({
    buffer: img.buffer,
    label: candidates.galleryCandidates.find((g) => g.url === img.url)?.label || `Pohľad ${i + 2}`,
    angle: (candidates.galleryCandidates.find((g) => g.url === img.url)?.angle || 'gallery') as 'gallery',
  }))

  const built = await processAndSaveProductTextures({
    slug,
    name: input.name,
    game: classified.game,
    type: classified.type,
    set: candidates.set,
    frontBuffer: primaryFront.buffer,
    backBuffer: backImg?.buffer,
    extraGalleryBuffers: extraGallery,
    publicDir: options.publicDir,
  })

  return createProduct({
    id: input.externalId ? `${classified.game}-${input.externalId}` : slug,
    name: input.name,
    slug,
    game: classified.game,
    type: classified.type,
    language: classified.language,
    series: candidates.series,
    set: candidates.set,
    setCode: candidates.setCode,
    releaseYear: candidates.releaseYear,
    sku: input.sku,
    externalId: input.externalId,
    sourceUrl: input.sourceUrl,
    price: input.price,
    currency: input.currency || '€',
    description: input.description,
    featured: input.featured,
    textures: built.textures,
    images: built.images,
    customDimensions: built.dimensions,
    syncedAt: new Date().toISOString(),
    imageSource: `${candidates.imageSource}${backImg ? ' + zadná fotka' : ''}`,
  })
}
