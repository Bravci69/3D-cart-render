import { useCallback, useState } from 'react'
import { Box, Code2, Database, Globe, RefreshCw, ShieldCheck, Sliders, Sparkles } from 'lucide-react'
import { ProductGallery } from './components/ProductGallery.tsx'
import { ProductMediaView } from './components/ProductMediaView.tsx'
import { LoadingSpinner } from './components/LoadingSpinner.tsx'
import { useProducts } from './hooks/useProducts.ts'
import { productService } from './services/productService.ts'
import type { ProductData } from './types/product.ts'

export function App() {
  const { products, loading, setProducts } = useProducts()
  const [selectedHeroProduct, setSelectedHeroProduct] = useState<ProductData | null>(null)

  // Material slider overrides for quick shader tuning
  const [roughness, setRoughness] = useState<number>(0.24)
  const [metalness, setMetalness] = useState<number>(0.32)
  const [clearcoat, setClearcoat] = useState<number>(0.78)

  const refreshCatalog = useCallback(async () => {
    const fresh = await productService.getAll()
    setProducts(fresh)
  }, [setProducts])

  const heroProduct: ProductData | null = selectedHeroProduct || products[0] || null
  const customizedHeroProduct = heroProduct
    ? {
        ...heroProduct,
        material: {
          ...heroProduct.material,
          roughness,
          metalness,
          clearcoat,
        },
      }
    : null

  // Pick a diverse sample of up to 5 featured products across product types/games for the Hero switcher
  const heroQuickSamples = (() => {
    const seenTypes = new Set<string>()
    const picks: ProductData[] = []
    for (const p of products) {
      const key = `${p.game}:${p.type}`
      if (!seenTypes.has(key)) {
        seenTypes.add(key)
        picks.push(p)
      }
      if (picks.length >= 6) break
    }
    return picks
  })()

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#080c16]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              CardCatcher <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">3D ENGINE</span>
            </h1>
            <p className="text-xs text-slate-400">Pokémon · Magic · One Piece · League of Legends 3D Showcase</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WordPress &amp; SQL Sync Ready
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Fotky ↔ 3D prepínač
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-16">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border border-slate-800/80 p-6 md:p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Multi-TCG Automatický 3D Engine
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Fotky produktu &amp; okamžitý 3D render pre váš WordPress
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Systém sa synchronizuje s WooCommerce REST API alebo základnou WordPress SQL databázou, automaticky vyhľadá reálne fotografie pre ETB, boxy, tinky, bundle aj balíčky (EN aj DE verzie) a ponúkne zákazníkovi prepínač medzi obrázkami a 3D modelom.
              </p>

              {/* Material Shader Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Ladenie odleskov materiálu
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRoughness(0.24)
                      setMetalness(0.32)
                      setClearcoat(0.78)
                    }}
                    title="Obnoviť predvolené"
                    className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fóliový lesk (Clearcoat):</span>
                    <span className="font-mono text-blue-400">{Math.round(clearcoat * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={clearcoat}
                    onChange={(e) => setClearcoat(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Metalickosť (Metalness):</span>
                    <span className="font-mono text-blue-400">{Math.round(metalness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={metalness}
                    onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Drsnosť povrchu (Roughness):</span>
                    <span className="font-mono text-blue-400">{Math.round(roughness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={roughness}
                    onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Format Switcher */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Rýchla ukážka rôznych balení a TCG:</span>
                <div className="flex flex-wrap gap-2">
                  {heroQuickSamples.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedHeroProduct(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        heroProduct?.id === p.id
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md shadow-blue-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.name.length > 26 ? `${p.name.slice(0, 26)}…` : p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Hero ProductMediaView (Images + 3D Toggle!) */}
            <div className="lg:col-span-7 h-[480px] sm:h-[550px]">
              {loading || !customizedHeroProduct ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800">
                  <LoadingSpinner message="Načítavam ukážkový produkt..." />
                </div>
              ) : (
                <ProductMediaView
                  key={customizedHeroProduct.id}
                  product={customizedHeroProduct}
                  defaultMode="3d"
                  height="100%"
                  className="rounded-3xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </section>

        {/* SECTION: Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automatické hľadanie obrázkov</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stačí názov z databázy. Backend vyhľadá oficiálne EN/DE obrázky aj zadné uhly, oreže okraje a vygeneruje ľahké WebP textúry bez black barov.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">WordPress REST API &amp; Basic SQL</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Priama synchronizácia WooCommerce produktov cez `wp-json` alebo MySQL dopyt do `wp_posts`/`wp_postmeta` + pripravený PHP plugin pre WordPress.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Pripravené pre ďalšie TCG hry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modulárni provideri pre <b>Pokémon TCG</b>, <b>Magic: The Gathering</b>, <b>One Piece Card Game</b> aj <b>League of Legends (Riftbound)</b>.
            </p>
          </div>
        </section>

        {/* SECTION: Full Catalog Gallery */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Katalóg TCG produktov</h2>
              <p className="text-xs text-slate-400 mt-1">
                Kliknite na produkt alebo &quot;Detail&quot; pre zobrazenie fotiek s tlačidlom prepnutia na 3D render
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Celkovo {products.length} synchronizovaných produktov
            </span>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingSpinner message="Načítavam katalóg produktov..." />
            </div>
          ) : (
            <ProductGallery
              products={products}
              onCatalogRefresh={refreshCatalog}
            />
          )}
        </section>

        {/* SECTION: WordPress Integration Guide */}
        <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Integrácia do WordPress / WooCommerce</h3>
              <p className="text-xs text-slate-400">
                Zákazník vidí fotky produktu a jedným klikom prepne do interaktívneho 3D modelu (súbor wordpress/cardcatcher-3d-viewer.php)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">1. WooCommerce šablóna / Shortcode [cardcatcher_3d]:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-blue-300 font-mono overflow-x-auto">
{`<div
  data-cardcatcher-3d
  data-api-url="https://api.vas-web.sk/api"
  data-product-name="Pokémon Prismatic Evolutions ETB"
  data-default-view="images">
</div>
<script src="/dist/lib/cardcatcher-3d.umd.js"></script>`}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">2. Automatická synchronizácia z WordPress SQL / REST:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto">
{`POST /api/sync/wordpress
{
  "mode": "wp-rest", // alebo "wp-sql"
  "siteUrl": "https://vas-eshop.sk",
  "limit": 50
}`}
              </pre>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>CardCatcher 3D Render Engine – Multi-TCG (Pokémon, Magic, One Piece, LoL) s WordPress &amp; SQL synchronizáciou.</p>
      </footer>
    </div>
  )
}

export default App
