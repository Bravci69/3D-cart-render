import type { ProductType } from '../types/product.ts'

export type MatchStrategy = 'exact' | 'fuzzy' | 'contains'
export type DataSourceType = 'hybrid' | 'json' | 'api' | 'database'

export interface IntegrationConfig {
  dataSource: DataSourceType
  apiBaseUrl?: string
  apiKey?: string

  productMapping: {
    enabled: boolean
    matchStrategy: MatchStrategy
    sourceField: string
    targetField: string
  }

  textureConfig: {
    maxWidth: number
    maxHeight: number
    format: 'webp' | 'avif' | 'png' | 'jpg'
    quality: number
  }

  renderConfig: {
    enableAutoRotate: boolean
    enableShadows: boolean
    enablePostProcessing: boolean
    backgroundColor: string | null
    maxPixelRatio: number
    defaultProductType: ProductType
    ambientLightIntensity: number
    directionalLightIntensity: number
    environmentPreset:
      | 'city'
      | 'studio'
      | 'sunset'
      | 'dawn'
      | 'night'
      | 'warehouse'
      | 'forest'
      | 'apartment'
      | 'park'
      | 'lobby'
  }
}

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  dataSource: 'hybrid',
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || '/api',
  apiKey: import.meta.env?.VITE_API_KEY || '',

  productMapping: {
    enabled: true,
    matchStrategy: 'fuzzy',
    sourceField: 'title',
    targetField: 'name',
  },

  textureConfig: {
    maxWidth: 1024,
    maxHeight: 1024,
    format: 'webp',
    quality: 90,
  },

  renderConfig: {
    enableAutoRotate: true,
    enableShadows: true,
    enablePostProcessing: false,
    backgroundColor: null,
    maxPixelRatio: 2,
    defaultProductType: 'booster-pack',
    ambientLightIntensity: 0.8,
    directionalLightIntensity: 1.5,
    environmentPreset: 'city',
  },
}
