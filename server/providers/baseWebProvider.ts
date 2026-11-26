import { searchBingImages } from '../services/webImageSearch.ts'
import type { ProductImageItem, ProductLanguage, ProductType, TcgGame } from '../../src/types/product.ts'
import type { ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'

const TYPE_SEARCH_TERMS: Record<ProductType, string> = {
  'booster-pack': 'booster pack sealed',
  'booster-box': 'booster box display sealed',
  'booster-bundle': 'bundle box sealed',
  'elite-trainer-box': 'elite trainer box sealed',
  tin: 'collector tin sealed',
  'mini-tin': 'mini tin sealed',
  'blister-pack': 'blister pack sealed',
  'collection-box': 'collection box sealed',
  'build-and-battle': 'prerelease build battle kit box',
  'starter-deck': 'starter deck box sealed',
}

function getLanguageSearchTerm(lang: ProductLanguage): string {
  if (lang === 'de') return 'deutsch german'
  if (lang === 'jp') return 'japanese'
  return 'english'
}

function getGamePrefix(game: TcgGame): string {
  switch (game) {
    case 'pokemon':
      return 'Pokemon TCG'
    case 'magic':
      return 'Magic The Gathering MTG'
    case 'one-piece':
      return 'One Piece Card Game'
    case 'lol':
      return 'Riftbound League of Legends TCG'
    default:
      return 'Trading Card Game'
  }
}

/**
 * Shared multi-angle web search helper used across all TCG providers (Pokémon, Magic, One Piece, LoL).
 */
export async function resolveViaWebImageSearch(
  req: ProviderResolveRequest,
  meta: { set?: string; series?: string; setCode?: string; releaseYear?: number; imageSource?: string } = {}
): Promise<ProviderResolvedUrls> {
  const gamePrefix = getGamePrefix(req.game)
  const langTerm = getLanguageSearchTerm(req.language)
  const typeTerm = TYPE_SEARCH_TERMS[req.type]

  const baseName = req.cleanQuery.toLowerCase().includes(gamePrefix.split(' ')[0].toLowerCase())
    ? req.cleanQuery
    : `${gamePrefix} ${req.cleanQuery}`

  const frontQuery = `${baseName} ${langTerm} product`.trim()
  const backQuery = `${baseName} back ${typeTerm}`.trim()

  const [frontResults, backResults] = await Promise.all([
    searchBingImages(frontQuery, 14, { targetType: req.type }),
    searchBingImages(backQuery, 8, { targetType: req.type, requireBackHint: true }),
  ])

  const frontCandidates: string[] = []
  if (req.existingImageUrl) frontCandidates.push(req.existingImageUrl)
  frontCandidates.push(...frontResults.map((c) => c.url))

  // Only genuine rear/back shots go to backCandidates (so wrong products aren't mapped onto the 3D back face)
  const backCandidates = backResults
    .filter((b) => !frontCandidates.slice(0, 2).includes(b.url))
    .map((b) => b.url)

  const galleryCandidates: { url: string; label: string; angle: ProductImageItem['angle'] }[] = []
  if (req.extraImageUrls) {
    for (const u of req.extraImageUrls) {
      galleryCandidates.push({ url: u, label: 'E-shop galéria', angle: 'gallery' })
    }
  }
  for (const c of frontResults.slice(1, 5)) {
    galleryCandidates.push({ url: c.url, label: 'Alternatívny pohľad', angle: 'gallery' })
  }

  return {
    frontCandidates,
    backCandidates,
    galleryCandidates,
    set: meta.set || req.cleanQuery,
    series: meta.series,
    setCode: meta.setCode || req.setCode,
    releaseYear: meta.releaseYear,
    imageSource: meta.imageSource || 'Web Image Search',
  }
}
