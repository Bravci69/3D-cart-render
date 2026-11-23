import { useState } from 'react'
import { Sparkles, Sliders, Code2, Database, ShieldCheck, Box, RefreshCw } from 'lucide-react'
import { useProducts } from './hooks/useProducts.ts'
import { ProductViewer } from './components/ProductViewer.tsx'
import { ProductGallery } from './components/ProductGallery.tsx'
import { LoadingSpinner } from './components/LoadingSpinner.tsx'
import type { ProductData } from './types/product.ts'

export function App() {
  const { products, loading } = useProducts()
  const [selectedHeroProduct, setSelectedHeroProduct] = useState<ProductData | null>(null)

  // Realtime Material Customization for Hero
  const [roughness, setRoughness] = useState<number>(0.22)
  const [metalness, setMetalness] = useState<number>(0.35)
  const [clearcoat, setClearcoat] = useState<number>(0.85)

  // Active hero product or fallback
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
            <p className="text-xs text-slate-400">Optimalizovaný 3D web render Pokémon balíčkov</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WebGPU / WebGL 2 ready
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ⚡ ~110 KB na produkt
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-16">
        {/* HERO SECTION: 3D Showcase & Material Configurator */}
        <section className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border border-slate-800/80 p-6 md:p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Hero Text & Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Fotorealistický procedurálny render
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Okamžitý 3D náhľad pre váš Pokémon web
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Z obyčajných fotografií alebo názvov produktov vo vašej databáze systém vytvorí odľahčený, interaktívny 3D model s realistickým fóliovým leskom bez sťahovania gigantických 3D súborov.
              </p>

              {/* Realtime 3D Shader Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Ladenie odleskov v reálnom čase
                  </span>
                  <button
                    onClick={() => {
                      setRoughness(0.22)
                      setMetalness(0.35)
                      setClearcoat(0.85)
                    }}
                    title="Obnoviť predvolené"
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Clearcoat (Foil gloss) */}
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

                {/* Metalness */}
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

                {/* Roughness */}
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

              {/* Quick Model Selector */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Vyskúšajte iný produkt:</span>
                <div className="flex flex-wrap gap-2">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedHeroProduct(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        (heroProduct?.id === p.id)
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md shadow-blue-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.name.split(' ')[1] || p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Hero Canvas */}
            <div className="lg:col-span-7 h-[460px] sm:h-[540px]">
              {loading || !customizedHeroProduct ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800">
                  <LoadingSpinner message="Inicializujem 3D scénu..." />
                </div>
              ) : (
                <ProductViewer
                  product={customizedHeroProduct}
                  height="100%"
                  className="rounded-3xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </section>

        {/* SECTION: Features / Performance Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Maximálna web optimalizácia</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Žiadne 15MB glTF súbory. Používa procedurálnu geometriu v browseri a mikroskopické WebP textúry (~110KB na celý balíček).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Napojenie na vašu databázu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funguje na základe názvov produktov cez inteligentné mapovanie. Stačí poslať názov z e-shopu a engine zvolí správne proporcie.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Jednoduchý Embed kód</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pripravené na integráciu do ľubovoľného webu (WordPress, WooCommerce, Shoptet, vlastný HTML/PHP web) jedným riadkom.
            </p>
          </div>
        </section>

        {/* SECTION: Catalog Gallery */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Katalóg Pokémon produktov</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ukážka lazy-loadingu – kliknutím na "3D Pohľad" sa inicializuje WebGL plátno len pre daný produkt
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Celkovo {products.length} produktov pripravených na render
            </span>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingSpinner message="Načítavam katalóg produktov..." />
            </div>
          ) : (
            <ProductGallery
              products={products}
              onSelectProduct={(p) => setSelectedHeroProduct(p)}
            />
          )}
        </section>

        {/* SECTION: How to integrate into your website */}
        <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Ako to vložiť do vášho existujúceho webu</h3>
              <p className="text-xs text-slate-400">Príklad integrácie do Shoptet, WooCommerce alebo vlastného e-shopu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HTML snippet */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">1. Vloženie jedného 3D produktu na stránku produktu:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-blue-300 font-mono overflow-x-auto">
{`<!-- Miesto vo vašej produktovej šablóne -->
<div 
  data-cardcatcher-3d
  data-product-name="Pokémon 151 Booster Pack">
</div>

<!-- Načítanie ľahkého skriptu -->
<script src="/dist/lib/cardcatcher-3d.umd.js"></script>`}
              </pre>
            </div>

            {/* REST API snippet */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">2. Napojenie na vašu databázu produktov (JavaScript API):</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto">
{`// Automatické namapovanie podľa názvu z vašej DB
import { productService, ProductViewer } from 'cardcatcher-3d'

const product = await productService.matchByName("Paldea Evolved Box");
// Vráti optimalizovaný 3D config s presnými rozmermi!`}
              </pre>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>CardCatcher 3D Render Engine – Navrhnuté pre maximálny výkon a rýchlosť načítania e-shopov s Pokémon kartami.</p>
        <p className="mt-1">Využíva React Three Fiber, WebGL / WebGPU a procedurálne materiály.</p>
      </footer>
    </div>
  )
}

export default App
