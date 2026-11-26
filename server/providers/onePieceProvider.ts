import { resolveViaWebImageSearch } from './baseWebProvider.ts'
import type { ITcgProvider, ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'

interface OpSetSummary {
  set_id: string
  set_name: string
}

let optcgSetsCache: OpSetSummary[] | null = null

async function getOnePieceSets(): Promise<OpSetSummary[]> {
  if (optcgSetsCache) return optcgSetsCache
  try {
    const res = await fetch('https://optcgapi.com/api/allSets/')
    if (res.ok) {
      const data = (await res.json()) as OpSetSummary[]
      optcgSetsCache = Array.isArray(data) ? data : []
      return optcgSetsCache
    }
  } catch {
    // ignore
  }
  return []
}

export class OnePieceTcgProvider implements ITcgProvider {
  readonly game = 'one-piece' as const

  async resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls> {
    const sets = await getOnePieceSets()
    const cleanLower = req.cleanQuery.toLowerCase()
    const matched = sets.find(
      (s) =>
        cleanLower.includes(s.set_id.toLowerCase()) ||
        cleanLower.includes(s.set_id.replace('-', '').toLowerCase()) ||
        cleanLower.includes(s.set_name.toLowerCase())
    )

    return resolveViaWebImageSearch(req, {
      set: matched ? `${matched.set_id} ${matched.set_name}` : req.cleanQuery,
      series: 'One Piece Card Game',
      setCode: matched?.set_id || req.setCode,
      imageSource: matched ? `OPTCG API + Web Search (${matched.set_id})` : 'One Piece Web Image Search',
    })
  }
}
