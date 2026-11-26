import { resolveViaWebImageSearch } from './baseWebProvider.ts'
import { LolTcgProvider } from './lolProvider.ts'
import { MagicTcgProvider } from './magicProvider.ts'
import { OnePieceTcgProvider } from './onePieceProvider.ts'
import { PokemonTcgProvider } from './pokemonProvider.ts'
import type { ITcgProvider, ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'
import type { TcgGame } from '../../src/types/product.ts'

class GenericTcgProvider implements ITcgProvider {
  readonly game = 'other' as const
  async resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls> {
    return resolveViaWebImageSearch(req, {
      series: 'Trading Card Game',
      imageSource: 'Generic TCG Web Image Search',
    })
  }
}

const PROVIDERS: Record<TcgGame, ITcgProvider> = {
  pokemon: new PokemonTcgProvider(),
  magic: new MagicTcgProvider(),
  'one-piece': new OnePieceTcgProvider(),
  lol: new LolTcgProvider(),
  other: new GenericTcgProvider(),
}

export function getTcgProvider(game: TcgGame): ITcgProvider {
  return PROVIDERS[game] || PROVIDERS.other
}
