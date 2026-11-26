import React, { useState } from 'react'
import { Check, Database, Globe, Loader2, Sparkles, X } from 'lucide-react'
import { TCG_GAMES } from '../config/product-types.ts'
import { classifyProductName } from '../shared/productClassifier.ts'
import { productService, type WordPressSyncResponse } from '../services/productService.ts'
import type { ProductData, ProductLanguage, ProductType, TcgGame } from '../types/product.ts'

interface WordPressSyncModalProps {
  onClose: () => void
  onProductCreated: (product: ProductData) => void
  onCatalogSynced: () => Promise<void> | void
}

type ModalTab = 'single' | 'wp-rest' | 'wp-sql' | 'batch'

export const WordPressSyncModal: React.FC<WordPressSyncModalProps> = ({
  onClose,
  onProductCreated,
  onCatalogSynced,
}) => {
  const [tab, setTab] = useState<ModalTab>('single')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncReport, setSyncReport] = useState<WordPressSyncResponse | null>(null)

  // Single product auto-discover form
  const [name, setName] = useState('')
  const [gameOverride, setGameOverride] = useState<TcgGame | 'auto'>('auto')
  const [typeOverride, setTypeOverride] = useState<ProductType | 'auto'>('auto')
  const [langOverride, setLangOverride] = useState<ProductLanguage | 'auto'>('auto')
  const [price, setPrice] = useState('54.99')
  const [imageUrl, setImageUrl] = useState('')

  // WordPress REST form
  const [wpUrl, setWpUrl] = useState('https://vas-eshop.sk')
  const [wcKey, setWcKey] = useState('')
  const [wcSecret, setWcSecret] = useState('')
  const [wpLimit, setWpLimit] = useState('25')

  // WordPress Basic SQL form
  const [sqlHost, setSqlHost] = useState('localhost')
  const [sqlPort, setSqlPort] = useState('3306')
  const [sqlDb, setSqlDb] = useState('wordpress')
  const [sqlUser, setSqlUser] = useState('wp_user')
  const [sqlPass, setSqlPass] = useState('')
  const [sqlPrefix, setSqlPrefix] = useState('wp_')

  // Batch DB names list
  const [batchLines, setBatchLines] = useState(
    'Prismatic Evolutions Elite Trainer Box EN\nSurging Sparks Booster Display Box DE\nOne Piece OP-09 Booster Box\nMagic Foundations Play Booster Box\nRiftbound League of Legends Starter Deck'
  )

  const liveClassification = name.trim() ? classifyProductName(name) : null

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)
    try {
      const product = await productService.resolveByName({
        name: name.trim(),
        game: gameOverride === 'auto' ? undefined : gameOverride,
        type: typeOverride === 'auto' ? undefined : typeOverride,
        language: langOverride === 'auto' ? undefined : langOverride,
        price: parseFloat(price) || undefined,
        existingImageUrl: imageUrl.trim() || undefined,
      })
      onProductCreated(product)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Backend API nie je spustené. Spustite `npm run dev:full` pre automatické hľadanie obrázkov.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSyncReport(null)

    try {
      let report: WordPressSyncResponse
      if (tab === 'wp-rest') {
        report = await productService.syncWordPress({
          mode: 'wp-rest',
          siteUrl: wpUrl.trim(),
          consumerKey: wcKey.trim() || undefined,
          consumerSecret: wcSecret.trim() || undefined,
          limit: parseInt(wpLimit, 10) || 25,
        })
      } else if (tab === 'wp-sql') {
        report = await productService.syncWordPress({
          mode: 'wp-sql',
          host: sqlHost.trim(),
          port: parseInt(sqlPort, 10) || 3306,
          database: sqlDb.trim(),
          user: sqlUser.trim(),
          password: sqlPass,
          tablePrefix: sqlPrefix.trim() || 'wp_',
          limit: parseInt(wpLimit, 10) || 25,
        })
      } else {
        const items = batchLines
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map((productName) => ({ name: productName }))
        report = await productService.syncWordPress({
          mode: 'batch',
          products: items,
        })
      }

      setSyncReport(report)
      await onCatalogSynced()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Synchronizácia zlyhala. Overte, či beží backend (`npm run server`) a pripojenie k WordPressu.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Zavrieť"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Napojenie WordPress / SQL & Automatický hľadač obrázkov
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Zadajte názov produktu z databázy alebo spustite synchronizáciu s WooCommerce REST API či WordPress SQL. Backend automaticky vyhľadá reálne fotky a vytvorí 3D textúry.
        </p>

        {/* Modal Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 border-b border-slate-800 pb-3 text-xs font-semibold">
          {(
            [
              { id: 'single', label: '1 produkt (Auto-nájdenie)' },
              { id: 'wp-rest', label: 'WordPress / Woo API' },
              { id: 'wp-sql', label: 'WordPress Basic SQL' },
              { id: 'batch', label: 'Hromadný import z DB' },
            ] as { id: ModalTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                setError(null)
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {syncReport && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Synchronizácia dokončená ({syncReport.mode})
            </div>
            <p>
              Načítané: <b>{syncReport.totalFetched}</b> · Nové/aktualizované 3D modely:{' '}
              <b>{syncReport.createdOrUpdated}</b> · Už existujúce: <b>{syncReport.skippedExisting}</b>
              {syncReport.failed.length > 0 && ` · Zlyhané: ${syncReport.failed.length}`}
            </p>
          </div>
        )}

        {/* TAB 1: Single Product Auto-Discovery */}
        {tab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Názov produktu z e-shopu / DB</label>
              <input
                type="text"
                required
                placeholder="napr. Pokémon Surging Sparks Booster Box DE alebo One Piece OP-09 Booster Box"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {liveClassification && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                    Hra: {TCG_GAMES[liveClassification.game].shortLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                    Typ: {liveClassification.type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                    Verzia: {liveClassification.language.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kartová hra</label>
                <select
                  value={gameOverride}
                  onChange={(e) => setGameOverride(e.target.value as TcgGame | 'auto')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="auto">Auto-detekcia</option>
                  <option value="pokemon">Pokémon TCG</option>
                  <option value="magic">Magic: The Gathering</option>
                  <option value="one-piece">One Piece Card Game</option>
                  <option value="lol">League of Legends (Riftbound)</option>
                  <option value="other">Ostatné TCG</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Typ balenia</label>
                <select
                  value={typeOverride}
                  onChange={(e) => setTypeOverride(e.target.value as ProductType | 'auto')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="auto">Auto-detekcia</option>
                  <option value="booster-pack">Booster Pack</option>
                  <option value="booster-box">Booster Box (18–36 packov)</option>
                  <option value="booster-bundle">Booster Bundle / Fat Pack</option>
                  <option value="elite-trainer-box">Elite Trainer Box (ETB)</option>
                  <option value="tin">Collector Tin (Plechovka)</option>
                  <option value="mini-tin">Mini Tin</option>
                  <option value="blister-pack">Blister Pack</option>
                  <option value="collection-box">Collection / UPC Box</option>
                  <option value="build-and-battle">Build & Battle / Prerelease</option>
                  <option value="starter-deck">Starter / Commander Deck</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jazyková verzia</label>
                <select
                  value={langOverride}
                  onChange={(e) => setLangOverride(e.target.value as ProductLanguage | 'auto')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="auto">Auto-detekcia</option>
                  <option value="en">Anglická (EN)</option>
                  <option value="de">Nemecká (DE)</option>
                  <option value="jp">Japonská (JP)</option>
                  <option value="cs">Česká (CZ)</option>
                  <option value="sk">Slovenská (SK)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cena (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vlastná URL fotky (nepovinné)</label>
                <input
                  type="url"
                  placeholder="Nechajte prázdne pre automatické vyhľadanie"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
              >
                Zrušiť
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Vyhľadávam obrázky...' : 'Nájsť obrázky a vytvoriť 3D'}
              </button>
            </div>
          </form>
        ) : (
          /* TAB 2-4: WordPress REST / Basic SQL / Batch Sync */
          <form onSubmit={handleSyncSubmit} className="mt-5 space-y-4 text-xs">
            {tab === 'wp-rest' && (
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL vášho WordPress / WooCommerce webu</label>
                  <input
                    type="url"
                    required
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Funguje cez WooCommerce Store API (bez kľúčov) aj cez WooCommerce REST API v3.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Consumer Key (voliteľné)</label>
                    <input
                      type="text"
                      placeholder="ck_..."
                      value={wcKey}
                      onChange={(e) => setWcKey(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Consumer Secret (voliteľné)</label>
                    <input
                      type="password"
                      placeholder="cs_..."
                      value={wcSecret}
                      onChange={(e) => setWcSecret(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600"
                    />
                  </div>
                </div>
              </>
            )}

            {tab === 'wp-sql' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MySQL Host</label>
                  <input
                    type="text"
                    required
                    value={sqlHost}
                    onChange={(e) => setSqlHost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Port</label>
                  <input
                    type="number"
                    value={sqlPort}
                    onChange={(e) => setSqlPort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Databáza</label>
                  <input
                    type="text"
                    required
                    value={sqlDb}
                    onChange={(e) => setSqlDb(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SQL Používateľ</label>
                  <input
                    type="text"
                    required
                    value={sqlUser}
                    onChange={(e) => setSqlUser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SQL Heslo</label>
                  <input
                    type="password"
                    value={sqlPass}
                    onChange={(e) => setSqlPass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prefix tabuliek</label>
                  <input
                    type="text"
                    value={sqlPrefix}
                    onChange={(e) => setSqlPrefix(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            {tab === 'batch' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Zoznam názvov produktov (1 na riadok)</label>
                <textarea
                  rows={6}
                  value={batchLines}
                  onChange={(e) => setBatchLines(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                />
              </div>
            )}

            {(tab === 'wp-rest' || tab === 'wp-sql') && (
              <div className="w-40">
                <label className="block text-slate-300 font-semibold mb-1">Limit produktov</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={wpLimit}
                  onChange={(e) => setWpLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
              >
                Zavrieť
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {loading ? 'Synchronizujem a hľadám obrázky...' : 'Spustiť synchronizáciu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
