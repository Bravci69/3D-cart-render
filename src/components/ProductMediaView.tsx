import React, { useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'
import { ProductViewer } from './ProductViewer.tsx'
import type { ProductData, ProductImageItem } from '../types/product.ts'

interface ProductMediaViewProps {
  product: ProductData
  defaultMode?: 'images' | '3d'
  height?: number | string
  className?: string
}

/**
 * Product Detail Media Component:
 * Starts cleanly in 2D Images Gallery mode (all found real angles) and lets users
 * switch between Images and interactive 3D Render via one prominent toggle button.
 */
export const ProductMediaView: React.FC<ProductMediaViewProps> = ({
  product,
  defaultMode = 'images',
  height = '520px',
  className = '',
}) => {
  const [mode, setMode] = useState<'images' | '3d'>(defaultMode)
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const galleryImages: ProductImageItem[] = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images
    }
    const items: ProductImageItem[] = [{ url: product.textures.front, label: 'Predná strana', angle: 'front' }]
    if (product.textures.back && product.textures.back !== product.textures.front) {
      items.push({ url: product.textures.back, label: 'Zadná strana', angle: 'back' })
    }
    return items
  }, [product])

  const safeIndex = Math.min(activeIndex, Math.max(0, galleryImages.length - 1))
  const currentImg = galleryImages[safeIndex]

  const prevImage = () => setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
  const nextImage = () => setActiveIndex((i) => (i + 1) % galleryImages.length)

  return (
    <div
      className={`relative w-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden select-none ${className}`}
      style={{ height }}
    >
      {/* Top Mode Switcher Bar: Obrázky vs 3D Render */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-slate-800/90 z-20 shrink-0">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('images')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'images'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Obrázky ({galleryImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === '3d'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Render 360°</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === 'images' ? '3d' : 'images')}
          className="px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          {mode === 'images' ? 'Prepnúť na 3D →' : '← Späť na fotky'}
        </button>
      </div>

      {/* Active Viewport */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {mode === 'images' ? (
          <div className="relative flex-1 flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-950 min-h-0">
            {/* Main Stage Image */}
            <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
              {currentImg && (
                <img
                  src={currentImg.url}
                  alt={`${product.name} - ${currentImg.label || 'fotka'}`}
                  onClick={() => setZoomed(!zoomed)}
                  className={`max-h-full max-w-full object-contain transition-transform duration-300 drop-shadow-[0_18px_35px_rgba(0,0,0,0.65)] ${
                    zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                />
              )}

              {/* Angle Label Badge */}
              {currentImg?.label && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-medium text-slate-300 backdrop-blur-md">
                  {currentImg.label}
                </span>
              )}

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setZoomed(!zoomed)}
                title={zoomed ? 'Oddialiť' : 'Priblížiť'}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              >
                {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>

              {/* Left/Right Navigation Arrows when multiple images exist */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Predchádzajúci obrázok"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 transition-all cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Ďalší obrázok"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 transition-all cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Floating Quick Switch CTA inside image corner */}
              <button
                type="button"
                onClick={() => setMode('3d')}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Zobraziť 3D render</span>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/70 border-t border-slate-800/80 overflow-x-auto shrink-0">
                {galleryImages.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx)
                      setZoomed(false)
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 bg-slate-950 p-1 transition-all cursor-pointer ${
                      idx === safeIndex
                        ? 'border-blue-500 shadow-md shadow-blue-500/20'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                    title={img.label || `Obrázok ${idx + 1}`}
                  >
                    <img src={img.url} alt={img.label || product.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProductViewer
            product={product}
            height="100%"
            className="border-none rounded-none flex-1"
          />
        )}
      </div>
    </div>
  )
}
