import type {
  ProductData,
  ProductImageItem,
  ProductLanguage,
  ProductTextures,
  ProductType,
  ProductTypePreset,
  TcgGame,
  TcgGameMeta,
} from '../types/product.ts'

export const TCG_GAMES: Record<TcgGame, TcgGameMeta> = {
  pokemon: {
    game: 'pokemon',
    label: 'Pokémon TCG',
    shortLabel: 'Pokémon',
    accentClass: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    ready: true,
  },
  magic: {
    game: 'magic',
    label: 'Magic: The Gathering',
    shortLabel: 'Magic (MTG)',
    accentClass: 'text-orange-300 bg-orange-500/15 border-orange-500/30',
    ready: true,
  },
  'one-piece': {
    game: 'one-piece',
    label: 'One Piece Card Game',
    shortLabel: 'One Piece',
    accentClass: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    ready: true,
  },
  lol: {
    game: 'lol',
    label: 'League of Legends (Riftbound)',
    shortLabel: 'LoL TCG',
    accentClass: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
    ready: true,
  },
  other: {
    game: 'other',
    label: 'Ostatné TCG',
    shortLabel: 'Iné TCG',
    accentClass: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
    ready: true,
  },
}

export const LANGUAGE_LABELS: Record<ProductLanguage, string> = {
  en: 'EN',
  de: 'DE',
  jp: 'JP',
  cs: 'CZ',
  sk: 'SK',
  multi: 'INTL',
}

export const PRODUCT_TYPE_PRESETS: Record<ProductType, ProductTypePreset> = {
  'booster-pack': {
    type: 'booster-pack',
    label: 'Booster Pack (Balíček)',
    shortLabel: 'Booster Pack',
    description: 'Fóliový balíček kariet s metalickým odleskom a zvarom na okrajoch.',
    dimensions: {
      width: 2.0,
      height: 3.4,
      depth: 0.14,
      bevelRadius: 0.02,
    },
    material: {
      roughness: 0.2,
      metalness: 0.42,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    },
  },
  'booster-box': {
    type: 'booster-box',
    label: 'Booster Display Box (18–36 packov)',
    shortLabel: 'Booster Box',
    description: 'Zapečatený displej box s celofánovým leskom obsahujúci sériu booster balíčkov.',
    dimensions: {
      width: 3.4,
      height: 2.55,
      depth: 2.25,
      bevelRadius: 0.04,
    },
    material: {
      roughness: 0.36,
      metalness: 0.08,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
    },
  },
  'booster-bundle': {
    type: 'booster-bundle',
    label: 'Booster Bundle / Fat Pack',
    shortLabel: 'Booster Bundle',
    description: 'Kompaktný zberateľský box so 6 booster balíčkami (alebo MTG Bundle).',
    dimensions: {
      width: 2.4,
      height: 2.5,
      depth: 1.55,
      bevelRadius: 0.04,
    },
    material: {
      roughness: 0.38,
      metalness: 0.1,
      clearcoat: 0.45,
      clearcoatRoughness: 0.24,
    },
  },
  'elite-trainer-box': {
    type: 'elite-trainer-box',
    label: 'Elite Trainer Box (ETB)',
    shortLabel: 'ETB',
    description: 'Prémiový zberateľský box s viečkom, obalmi, kockami a boostermi.',
    dimensions: {
      width: 3.1,
      height: 3.4,
      depth: 1.85,
      bevelRadius: 0.05,
    },
    material: {
      roughness: 0.32,
      metalness: 0.14,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    },
  },
  tin: {
    type: 'tin',
    label: 'Collector Tin (Plechovka)',
    shortLabel: 'Tin',
    description: 'Kovová plechová krabička so zaoblenými rohmi a metalickým odleskom.',
    dimensions: {
      width: 2.8,
      height: 2.4,
      depth: 1.65,
      bevelRadius: 0.16,
    },
    material: {
      roughness: 0.18,
      metalness: 0.82,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
    },
  },
  'mini-tin': {
    type: 'mini-tin',
    label: 'Mini Tin (Malá plechovka)',
    shortLabel: 'Mini Tin',
    description: 'Vrecková kovová mini plechovka s 2 boostermi a art kartou.',
    dimensions: {
      width: 1.95,
      height: 3.05,
      depth: 0.65,
      bevelRadius: 0.12,
    },
    material: {
      roughness: 0.18,
      metalness: 0.85,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
    },
  },
  'blister-pack': {
    type: 'blister-pack',
    label: 'Blister Pack (1–3 balíčky)',
    shortLabel: 'Blister',
    description: 'Závesné kartónové balenie s priehľadným plastovým krytom a promo kartou.',
    dimensions: {
      width: 2.7,
      height: 3.8,
      depth: 0.34,
      bevelRadius: 0.03,
    },
    material: {
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
    },
  },
  'collection-box': {
    type: 'collection-box',
    label: 'Collection / Premium / UPC Box',
    shortLabel: 'Collection Box',
    description: 'Špeciálny darčekový box s promo kartami, podložkou alebo figurínou.',
    dimensions: {
      width: 4.3,
      height: 3.0,
      depth: 0.95,
      bevelRadius: 0.05,
    },
    material: {
      roughness: 0.34,
      metalness: 0.16,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    },
  },
  'build-and-battle': {
    type: 'build-and-battle',
    label: 'Build & Battle / Prerelease Kit',
    shortLabel: 'Build & Battle',
    description: 'Herný turnajový box so základným balíčkom, promo kartou a boostermi.',
    dimensions: {
      width: 2.5,
      height: 2.8,
      depth: 1.15,
      bevelRadius: 0.04,
    },
    material: {
      roughness: 0.36,
      metalness: 0.1,
      clearcoat: 0.45,
      clearcoatRoughness: 0.22,
    },
  },
  'starter-deck': {
    type: 'starter-deck',
    label: 'Starter / Battle / Commander Deck',
    shortLabel: 'Deck',
    description: 'Predpripravený herný balíček pripravený na okamžitú hru.',
    dimensions: {
      width: 2.2,
      height: 3.25,
      depth: 0.85,
      bevelRadius: 0.04,
    },
    material: {
      roughness: 0.34,
      metalness: 0.12,
      clearcoat: 0.5,
      clearcoatRoughness: 0.22,
    },
  },
}

export function getDefaultProductConfig(type: ProductType): ProductTypePreset {
  return PRODUCT_TYPE_PRESETS[type] ?? PRODUCT_TYPE_PRESETS['booster-pack']
}

export function createProduct(params: {
  id: string
  name: string
  slug: string
  type: ProductType
  game?: TcgGame
  language?: ProductLanguage
  textures: ProductTextures
  images?: ProductImageItem[]
  series?: string
  set?: string
  setCode?: string
  releaseYear?: number
  sku?: string
  externalId?: string | number
  sourceUrl?: string
  price?: number
  currency?: string
  description?: string
  featured?: boolean
  syncedAt?: string
  imageSource?: string
  customDimensions?: Partial<ProductData['dimensions']>
  customMaterial?: Partial<ProductData['material']>
}): ProductData {
  const preset = getDefaultProductConfig(params.type)
  const fallbackImages: ProductImageItem[] =
    params.images && params.images.length > 0
      ? params.images
      : [
          { url: params.textures.front, label: 'Predná strana', angle: 'front' },
          ...(params.textures.back ? [{ url: params.textures.back, label: 'Zadná strana', angle: 'back' as const }] : []),
        ]

  return {
    id: params.id,
    name: params.name,
    slug: params.slug,
    game: params.game || 'pokemon',
    type: params.type,
    language: params.language || 'en',
    series: params.series,
    set: params.set,
    setCode: params.setCode,
    releaseYear: params.releaseYear,
    sku: params.sku,
    externalId: params.externalId,
    sourceUrl: params.sourceUrl,
    price: params.price,
    currency: params.currency || '€',
    description: params.description || preset.description,
    textures: params.textures,
    images: fallbackImages,
    featured: params.featured,
    syncedAt: params.syncedAt,
    imageSource: params.imageSource,
    dimensions: {
      ...preset.dimensions,
      ...(params.customDimensions || {}),
    },
    material: {
      ...preset.material,
      ...(params.customMaterial || {}),
    },
  }
}
