import { resolveViaWebImageSearch } from './baseWebProvider.ts'
import type { ITcgProvider, ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'

interface ScryfallSetSummary {
  code: string
  name: string
  released_at?: string
}

let scryfallCache: ScryfallSetSummary[] | null = null

async function getMagicSets(): Promise<ScryfallSetSummary[]> {
  if (scryfallCache) return scryfallCache
  try {
    const res = await fetch('https://api.scryfall.com/sets', {
      headers: { 'User-Agent': 'CardCatcher-3D-Engine' },
    })
    if (res.ok) {
      const json = (await res.json()) as { data?: ScryfallSetSummary[] }
      scryfallCache = json.data || []
      return scryfallCache
    }
  } catch {
    // ignore network fail
  }
  return []
}

export class MagicTcgProvider implements ITcgProvider {
  readonly game = 'magic' as const

  async resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls> {
    const sets = await getMagicSets()
    const cleanLower = req.cleanQuery.toLowerCase()
    const matched = sets.find((s) => s.name.length > 3 && cleanLower.includes(s.name.toLowerCase()))

    return resolveViaWebImageSearch(req, {
      set: matched?.name || req.cleanQuery,
      series: 'Magic: The Gathering',
      setCode: matched?.code?.toUpperCase(),
      releaseYear: matched?.released_at ? Number(matched.released_at.slice(0, 4)) : undefined,
      imageSource: matched ? `Scryfall + Web Search (${matched.code.toUpperCase()})` : 'Magic Web Image Search',
    })
  }
}
