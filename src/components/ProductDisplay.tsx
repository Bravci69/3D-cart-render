import React, { useState } from 'react'
import { Box, Eye, Image as ImageIcon, Sparkles, X } from 'lucide-react'
import { LANGUAGE_LABELS, PRODUCT_TYPE_PRESETS, TCG_GAMES } from '../config/product-types.ts'
import type { ProductData } from '../types/product.ts'
import { ProductViewer } from './ProductViewer.tsx'

interface ProductDisplayProps {
  product: ProductData
  height?: number | string
  enable3DByDefault?: boolean
  onSelect?: (product: ProductData) => void
}

/**
 * Grid card using Click-to-3D lazy loading.
 * Defaults to a fast 2D thumbnail, allows opening full Product Detail (Images ↔ 3D toggle)
 * or toggling quick inline 3D preview directly on the card.
 */
export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  height = '430px',
  enable3DByDefault = false,
  onSelect,
}) => {
  const [is3DActive, setIs3DActive] = useState(enable3DByDefault)
  const gameMeta = TCG_GAMES[product.game || 'pokemon'] || TCG_GAMES.pokemon
  const typePreset = PRODUCT_TYPE_PRESETS[product.type]
  const photoCount = product.images?.length || 1

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-lg group flex flex-col"
      style={{ height }}
    >
      {!is3DActive ? (
        <div className="relative w-full h-full flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900/60 to-slate-950">
          {/* Card Top Badges */}
          <div className="flex flex-wrap justify-between items-start gap-1.5 z-10">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gameMeta.accentClass}`}>
                {gameMeta.shortLabel}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80">
                {typePreset?.shortLabel || product.type}
              </span>
              {product.language && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {LANGUAGE_LABELS[product.language] || product.language.toUpperCase()}
                </span>
              )}
            </div>

            {product.featured && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> HOT
              </span>
            )}
          </div>

          {/* Centered Preview Image -> Opens Detail Modal (with Images / 3D switch) */}
          <div
            className="flex-1 flex items-center justify-center my-3 cursor-pointer group-hover:scale-105 transition-transform duration-300 min-h-0"
            onClick={() => (onSelect ? onSelect(product) : setIs3DActive(true))}
          >
            <img
              src={product.textures.thumbnail || product.textures.front}
              alt={product.name}
              loading="lazy"
              className="max-h-[210px] max-w-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.65)]"
            />
          </div>

          {/* Card Bottom: Product Info & Dual Actions */}
          <div className="z-10 pt-2.5 border-t border-slate-800/60">
            <h4 className="text-sm font-bold text-white truncate" title={product.name}>
              {product.name}
            </h4>
            <div className="flex items-center justify-between gap-2 mt-2.5">
              <span className="text-base font-extrabold text-emerald-400">
                {product.price ? `${product.price.toFixed(2)} ${product.currency || '€'}` : 'Na dopyt'}
              </span>

              <div className="flex items-center gap-1.5">
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(product)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                    title="Otvoriť detail s galériou fotiek a prepínačom do 3D"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Detail ({photoCount})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIs3DActive(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  title="Okamžite spustiť 3D náhľad"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <ProductViewer
            product={product}
            height="100%"
            onDetailsClick={() => onSelect?.(product)}
            className="border-none rounded-none"
          />

          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
            {onSelect && (
              <button
                type="button"
                onClick={() => onSelect(product)}
                title="Otvoriť detail produktu"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/85 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 backdrop-blur-md cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Detail
              </button>
            )}
            <button
              type="button"
              onClick={() => setIs3DActive(false)}
              title="Späť na 2D náhľad"
              className="p-1.5 rounded-full bg-slate-800/85 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
