import { resolveViaWebImageSearch } from './baseWebProvider.ts'
import type { ITcgProvider, ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'

export class LolTcgProvider implements ITcgProvider {
  readonly game = 'lol' as const

  async resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls> {
    return resolveViaWebImageSearch(req, {
      set: req.cleanQuery,
      series: 'Riftbound: League of Legends TCG',
      setCode: req.setCode,
      imageSource: 'League of Legends / Riftbound Web Image Search',
    })
  }
}
