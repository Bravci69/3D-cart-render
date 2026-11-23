import React, { useState } from 'react'
import { Box, Sparkles, X } from 'lucide-react'
import { ProductViewer } from './ProductViewer.tsx'
import type { ProductData } from '../types/product.ts'

interface ProductDisplayProps {
  product: ProductData
  height?: number | string
  enable3DByDefault?: boolean
  onSelect?: (product: ProductData) => void
}

/**
 * Lazy-loaded Product Display component (Click-to-3D pattern).
 * Renders an optimized 2D WebP image by default to guarantee 100% Core Web Vitals,
 * and seamlessly loads the WebGL 3D context only when the user requests it.
 */
export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  height = '420px',
  enable3DByDefault = false,
  onSelect,
}) => {
  const [is3DActive, setIs3DActive] = useState(enable3DByDefault)

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-lg group flex flex-col"
      style={{ height }}
    >
      {/* 2D Fallback / Teaser State */}
      {!is3DActive ? (
        <div className="relative w-full h-full flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900/60 to-slate-950">
          {/* Card Top Badges */}
          <div className="flex justify-between items-start z-10">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/90 text-blue-400 border border-slate-700/80 backdrop-blur-md">
              {product.set || product.series || 'Pokémon TCG'}
            </span>
            {product.featured && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> HOT
              </span>
            )}
          </div>

          {/* Centered Preview Image */}
          <div
            className="flex-1 flex items-center justify-center my-3 cursor-pointer group-hover:scale-105 transition-transform duration-300"
            onClick={() => setIs3DActive(true)}
          >
            <img
              src={product.textures.thumbnail || product.textures.front}
              alt={product.name}
              loading="lazy"
              className="max-h-[220px] max-w-full object-contain drop-shadow-2xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Card Bottom: Product Info & 3D Action Button */}
          <div className="z-10 pt-2 border-t border-slate-800/60">
            <h4 className="text-sm font-bold text-white truncate" title={product.name}>
              {product.name}
            </h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-emerald-400">
                {product.price ? `${product.price.toFixed(2)} ${product.currency}` : 'Na dopyt'}
              </span>

              <button
                onClick={() => setIs3DActive(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Pohľad ✨</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active 3D WebGL Canvas */
        <div className="relative w-full h-full">
          <ProductViewer
            product={product}
            height="100%"
            onDetailsClick={() => onSelect?.(product)}
            className="border-none rounded-none"
          />

          {/* Close 3D Button (Revert back to 2D image) */}
          <button
            onClick={() => setIs3DActive(false)}
            title="Späť na 2D náhľad"
            className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
