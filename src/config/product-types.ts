import type { ProductType, ProductTypePreset, ProductData } from '../types/product.ts'

export const PRODUCT_TYPE_PRESETS: Record<ProductType, ProductTypePreset> = {
  'booster-pack': {
    type: 'booster-pack',
    label: 'Booster Pack (Balíček)',
    description: 'Klasický fóliový balíček Pokémon kariet (10-11 kariet) s metalickým odleskom.',
    dimensions: {
      width: 2.1,
      height: 3.3,
      depth: 0.15,
      bevelRadius: 0.03,
    },
    material: {
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
    },
  },
  'booster-box': {
    type: 'booster-box',
    label: 'Booster Box (Displej 36 balíčkov)',
    description: 'Veľký kartónový displej box obsahujúci 36 booster balíčkov.',
    dimensions: {
      width: 3.5,
      height: 2.8,
      depth: 2.2,
      bevelRadius: 0.05,
    },
    material: {
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.3,
    },
  },
  'elite-trainer-box': {
    type: 'elite-trainer-box',
    label: 'Elite Trainer Box (ETB)',
    description: 'Prémiový zberateľský box s obalmi, kockami, kartami a boostermi.',
    dimensions: {
      width: 3.2,
      height: 3.4,
      depth: 1.9,
      bevelRadius: 0.06,
    },
    material: {
      roughness: 0.35,
      metalness: 0.12,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    },
  },
  'tin': {
    type: 'tin',
    label: 'Collector Tin (Plechová krabička)',
    description: 'Plechová zberateľská krabička so špecifickým kovovým leskom.',
    dimensions: {
      width: 2.6,
      height: 3.2,
      depth: 1.4,
      bevelRadius: 0.14,
    },
    material: {
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    },
  },
  'blister-pack': {
    type: 'blister-pack',
    label: 'Blister Pack (Zavesený blister)',
    description: 'Kartónový blister s plastovým priezorom a promo kartou.',
    dimensions: {
      width: 2.5,
      height: 4.1,
      depth: 0.3,
      bevelRadius: 0.04,
    },
    material: {
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
    },
  },
  'collection-box': {
    type: 'collection-box',
    label: 'Special Collection Box',
    description: 'Špeciálny darčekový box s jumbo kartou, odznakom alebo figúrkou.',
    dimensions: {
      width: 4.2,
      height: 3.0,
      depth: 1.1,
      bevelRadius: 0.06,
    },
    material: {
      roughness: 0.38,
      metalness: 0.15,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
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
  textures: {
    front: string
    back: string
    side?: string
    top?: string
    thumbnail?: string
  }
  series?: string
  set?: string
  releaseYear?: number
  price?: number
  currency?: string
  description?: string
  customDimensions?: Partial<ProductData['dimensions']>
  customMaterial?: Partial<ProductData['material']>
}): ProductData {
  const preset = getDefaultProductConfig(params.type)

  return {
    id: params.id,
    name: params.name,
    slug: params.slug,
    type: params.type,
    series: params.series,
    set: params.set,
    releaseYear: params.releaseYear,
    price: params.price,
    currency: params.currency || '€',
    description: params.description || preset.description,
    textures: params.textures,
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
