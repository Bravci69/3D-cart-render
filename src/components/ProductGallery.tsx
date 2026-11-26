import React, { useMemo, useState } from 'react'
import { Database, Filter, Layers, PlusCircle, Search, X } from 'lucide-react'
import { LANGUAGE_LABELS, PRODUCT_TYPE_PRESETS, TCG_GAMES } from '../config/product-types.ts'
import type { ProductData, ProductType, TcgGame } from '../types/product.ts'
import { ProductDisplay } from './ProductDisplay.tsx'
import { ProductMediaView } from './ProductMediaView.tsx'
import { WordPressSyncModal } from './WordPressSyncModal.tsx'

interface ProductGalleryProps {
  products: ProductData[]
  onSelectProduct?: (product: ProductData) => void
  onCatalogRefresh?: () => Promise<void> | void
}

const GAME_FILTERS: { label: string; value: TcgGame | 'all' }[] = [
  { label: 'Všetky hry', value: 'all' },
  { label: 'Pokémon TCG', value: 'pokemon' },
  { label: 'Magic (MTG)', value: 'magic' },
  { label: 'One Piece', value: 'one-piece' },
  { label: 'League of Legends', value: 'lol' },
]

const TYPE_FILTER_OPTIONS: { label: string; value: ProductType | 'all' }[] = [
  { label: 'Všetky typy', value: 'all' },
  { label: 'Booster balíčky', value: 'booster-pack' },
  { label: 'Booster boxy', value: 'booster-box' },
  { label: 'Booster Bundle', value: 'booster-bundle' },
  { label: 'Elite Trainer Boxy', value: 'elite-trainer-box' },
  { label: 'Plechovky (Tins)', value: 'tin' },
  { label: 'Mini Tinky', value: 'mini-tin' },
  { label: 'Blister balenia', value: 'blister-pack' },
  { label: 'Collection boxy', value: 'collection-box' },
  { label: 'Build & Battle', value: 'build-and-battle' },
  { label: 'Decky (Starter/Battle)', value: 'starter-deck' },
]

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  products: initialProducts,
  onCatalogRefresh,
}) => {
  const [productsList, setProductsList] = useState<ProductData[]>(initialProducts)
  const [selectedGame, setSelectedGame] = useState<TcgGame | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')
  const [selectedLang, setSelectedLang] = useState<'all' | 'en' | 'de' | 'jp'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModalProduct, setActiveModalProduct] = useState<ProductData | null>(null)
  const [showSyncModal, setShowSyncModal] = useState(false)

  React.useEffect(() => {
    setProductsList(initialProducts)
  }, [initialProducts])

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesGame = selectedGame === 'all' || (p.game || 'pokemon') === selectedGame
      const matchesType = selectedType === 'all' || p.type === selectedType
      const matchesLang = selectedLang === 'all' || (p.language || 'en') === selectedLang
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.set?.toLowerCase().includes(q) ||
        p.series?.toLowerCase().includes(q)

      return matchesGame && matchesType && matchesLang && matchesQuery
    })
  }, [productsList, selectedGame, selectedType, selectedLang, searchQuery])

  // Show only type tabs that currently have items (or all if >0 matching) so UI stays tidy
  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of productsList) {
      if (selectedGame === 'all' || p.game === selectedGame) {
        map.set(p.type, (map.get(p.type) || 0) + 1)
      }
    }
    return map
  }, [productsList, selectedGame])

  return (
    <div className="w-full space-y-6">
      {/* Search, Language Filter & DB/WordPress Sync Action */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Hľadať produkt (napr. Prismatic, 151 ETB, OP-09, Charizard)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold self-start">
            {(
              [
                { label: 'Všetky jazyky', value: 'all' },
                { label: 'EN', value: 'en' },
                { label: 'DE', value: 'de' },
                { label: 'JP', value: 'jp' },
              ] as const
            ).map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setSelectedLang(l.value)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLang === l.value ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSyncModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pridať podľa názvu / WordPress SQL Sync</span>
        </button>
      </div>

      {/* Multi-TCG Game Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {GAME_FILTERS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => {
              setSelectedGame(g.value)
              setSelectedType('all')
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedGame === g.value
                ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Product Type Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
        {TYPE_FILTER_OPTIONS.filter((opt) => opt.value === 'all' || (typeCounts.get(opt.value) || 0) > 0).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelectedType(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === opt.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {opt.label}
            {opt.value !== 'all' && ` (${typeCounts.get(opt.value) || 0})`}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-300">Žiadne produkty v tejto kombinácii filtrov</h4>
          <p className="text-xs text-slate-500">
            Môžete pridať nový produkt automaticky cez vyhľadávač alebo synchronizovať WordPress katalóg.
          </p>
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" /> Automaticky pridať produkt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductDisplay
              key={product.id}
              product={product}
              height="430px"
              onSelect={(p) => setActiveModalProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal with Obrázky <-> 3D Render Switcher */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              type="button"
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-3.5 right-3.5 z-40 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Zavrieť"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: ProductMediaView (Starts on 2D Images, 1-click Switch to 3D Render!) */}
            <div className="w-full md:w-3/5 h-[430px] md:h-[580px]">
              <ProductMediaView
                key={activeModalProduct.id}
                product={activeModalProduct}
                defaultMode="images"
                height="100%"
                className="border-none rounded-none"
              />
            </div>

            {/* Right Side: Product Specs & Metadata */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-slate-950">
              <div>
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      (TCG_GAMES[activeModalProduct.game] || TCG_GAMES.pokemon).accentClass
                    }`}
                  >
                    {(TCG_GAMES[activeModalProduct.game] || TCG_GAMES.pokemon).label}
                  </span>
                  {activeModalProduct.language && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {LANGUAGE_LABELS[activeModalProduct.language] || activeModalProduct.language}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mt-3">{activeModalProduct.name}</h3>
                {activeModalProduct.price !== undefined && (
                  <p className="text-emerald-400 font-extrabold text-xl mt-2">
                    {activeModalProduct.price.toFixed(2)} {activeModalProduct.currency || '€'}
                  </p>
                )}

                <p className="text-slate-400 text-xs mt-4 leading-relaxed">{activeModalProduct.description}</p>

                <div className="mt-6 space-y-2 border-t border-slate-800 pt-4 text-xs font-mono">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Typ balenia:</span>
                    <span className="text-slate-200 text-right">
                      {PRODUCT_TYPE_PRESETS[activeModalProduct.type]?.label || activeModalProduct.type}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Séria:</span>
                    <span className="text-slate-300 text-right">{activeModalProduct.series || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Set:</span>
                    <span className="text-slate-300 text-right">{activeModalProduct.set || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Rozmery 3D:</span>
                    <span className="text-slate-300">
                      {activeModalProduct.dimensions.width} × {activeModalProduct.dimensions.height} ×{' '}
                      {activeModalProduct.dimensions.depth}
                    </span>
                  </div>
                  {activeModalProduct.imageSource && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Zdroj obrázkov:</span>
                      <span className="text-blue-400 text-right truncate max-w-[180px]" title={activeModalProduct.imageSource}>
                        {activeModalProduct.imageSource}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalProduct(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Zavrieť detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WordPress / SQL & Auto-Resolve Modal */}
      {showSyncModal && (
        <WordPressSyncModal
          onClose={() => setShowSyncModal(false)}
          onProductCreated={(product) => {
            setProductsList((prev) => {
              const filtered = prev.filter((p) => p.id !== product.id && p.slug !== product.slug)
              return [product, ...filtered]
            })
            setActiveModalProduct(product)
          }}
          onCatalogSynced={async () => {
            if (onCatalogRefresh) await onCatalogRefresh()
          }}
        />
      )}
    </div>
  )
}
