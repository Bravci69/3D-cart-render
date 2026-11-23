import React, { useState, useMemo } from 'react'
import { Search, Filter, Layers, PlusCircle, Check, X } from 'lucide-react'
import { ProductDisplay } from './ProductDisplay.tsx'
import { ProductViewer } from './ProductViewer.tsx'
import type { ProductData, ProductType } from '../types/product.ts'
import { createProduct } from '../config/product-types.ts'

interface ProductGalleryProps {
  products: ProductData[]
  onSelectProduct?: (product: ProductData) => void
}

const FILTER_OPTIONS: { label: string; value: ProductType | 'all' }[] = [
  { label: 'Všetky produkty', value: 'all' },
  { label: 'Booster balíčky', value: 'booster-pack' },
  { label: 'Booster boxy (36)', value: 'booster-box' },
  { label: 'Elite Trainer Boxy', value: 'elite-trainer-box' },
  { label: 'Plechovky (Tins)', value: 'tin' },
  { label: 'Blister balenia', value: 'blister-pack' },
]

export const ProductGallery: React.FC<ProductGalleryProps> = ({ products: initialProducts }) => {
  const [productsList, setProductsList] = useState<ProductData[]>(initialProducts)
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModalProduct, setActiveModalProduct] = useState<ProductData | null>(null)

  // Custom DB item connector modal state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState<ProductType>('booster-pack')
  const [customFrontUrl, setCustomFrontUrl] = useState('')
  const [customPrice, setCustomPrice] = useState('4.99')

  // Keep synced if parent products change
  React.useEffect(() => {
    setProductsList(initialProducts)
  }, [initialProducts])

  // Filter & Search computation
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesType = selectedType === 'all' || p.type === selectedType
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.set?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesType && matchesQuery
    })
  }, [productsList, selectedType, searchQuery])

  // Add custom product from database / e-shop input
  const handleAddCustomProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const slug = customName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const newProduct = createProduct({
      id: `custom-${Date.now()}`,
      name: customName,
      slug,
      type: customType,
      price: parseFloat(customPrice) || 0,
      textures: {
        front: customFrontUrl || '/textures/pokemon-151-booster/front.webp',
        back: '/textures/pokemon-151-booster/back.webp',
        side: '/textures/pokemon-151-booster/side.webp',
        top: '/textures/pokemon-151-booster/top.webp',
        thumbnail: customFrontUrl || '/textures/pokemon-151-booster/thumbnail.webp',
      },
    })

    setProductsList((prev) => [newProduct, ...prev])
    setShowAddCustomModal(false)
    setCustomName('')
    setCustomFrontUrl('')
    setActiveModalProduct(newProduct)
  }

  return (
    <div className="w-full space-y-8">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hľadať Pokémon produkt (napr. 151, Charizard, Box)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Buttons / Database hookup */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Napojiť produkt z môjho webu / DB</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedType(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === opt.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">Žiadne produkty sa nenašli</h4>
          <p className="text-xs text-slate-500 mt-1">Skúste upraviť hľadaný výraz alebo filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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

      {/* Interactive 3D Inspect Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Top Close Button */}
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Zavrieť"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 3D Viewer Side */}
            <div className="w-full md:w-3/5 h-[400px] md:h-[550px]">
              <ProductViewer
                product={activeModalProduct}
                height="100%"
                className="border-none rounded-none"
              />
            </div>

            {/* Product Details Side */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-slate-950">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-blue-400">
                  {activeModalProduct.type}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{activeModalProduct.name}</h3>
                <p className="text-emerald-400 font-extrabold text-xl mt-2">
                  {activeModalProduct.price?.toFixed(2)} {activeModalProduct.currency}
                </p>

                <p className="text-slate-400 text-xs mt-4 leading-relaxed">
                  {activeModalProduct.description}
                </p>

                <div className="mt-6 space-y-2 border-t border-slate-800 pt-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Séria:</span>
                    <span className="text-slate-300">{activeModalProduct.series || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Set:</span>
                    <span className="text-slate-300">{activeModalProduct.set || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rozmery (Š×V×H):</span>
                    <span className="text-slate-300">
                      {activeModalProduct.dimensions.width} × {activeModalProduct.dimensions.height} ×{' '}
                      {activeModalProduct.dimensions.depth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Foil odlesk (Clearcoat):</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round(activeModalProduct.material.clearcoat * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
                >
                  Zavrieť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Product from DB Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Napojiť produkt z vlastnej databázy</h3>
            <p className="text-xs text-slate-400 mb-5">
              Zadajte názov produktu z vášho e-shopu alebo databázy. Systém automaticky priradí 3D geometriu, rozmery a foil materiály.
            </p>

            <form onSubmit={handleAddCustomProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Názov produktu v e-shope / DB</label>
                <input
                  type="text"
                  required
                  placeholder="napr. Pokémon Paldea Evolved Booster Box"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Typ balenia (Typ geometrie)</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as ProductType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="booster-pack">Booster Pack (Fóliový balíček)</option>
                  <option value="booster-box">Booster Box (Displej box)</option>
                  <option value="elite-trainer-box">Elite Trainer Box (ETB)</option>
                  <option value="tin">Plechová krabička (Tin)</option>
                  <option value="blister-pack">Blister balenie</option>
                  <option value="collection-box">Collection Box</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL fotky produktu (voliteľné)</label>
                <input
                  type="url"
                  placeholder="https://... (ak necháte prázdne, použije sa demo textúra)"
                  value={customFrontUrl}
                  onChange={(e) => setCustomFrontUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cena (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Vytvoriť 3D Render
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
