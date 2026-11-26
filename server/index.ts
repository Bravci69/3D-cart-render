import path from 'node:path'
import cors from 'cors'
import express from 'express'
import { TCG_GAMES } from '../src/config/product-types.ts'
import type { ProductType, TcgGame } from '../src/types/product.ts'
import { productStore } from './db/productStore.ts'
import { discoverAndBuildProduct, type ResolveProductInput } from './services/imageDiscovery.ts'
import { syncProductsFromSource, type SyncRequestConfig } from './services/wordpressSync.ts'

const PORT = Number(process.env.PORT || 3001)

const app = express()
app.use(cors())
app.use(express.json({ limit: '4mb' }))

// Serve generated WebP textures directly if backend runs standalone alongside WordPress
app.use('/textures', express.static(path.resolve(process.cwd(), 'public', 'textures')))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'CardCatcher 3D Discovery & Sync Backend',
    productsCount: productStore.getAll().length,
    supportedGames: Object.keys(TCG_GAMES),
  })
})

app.get('/api/products', (req, res) => {
  const game = req.query.game as TcgGame | 'all' | undefined
  const type = req.query.type as ProductType | 'all' | undefined
  const language = req.query.language as string | undefined
  const query = req.query.q as string | undefined

  const items = productStore.getAll({ game, type, language, query })
  res.json(items)
})

app.get('/api/products/search', (req, res) => {
  const q = (req.query.q as string) || ''
  res.json(productStore.getAll({ query: q }))
})

/**
 * Matches a product by name from DB/WordPress.
 * If not found locally and `autoDiscover !== 'false'`, automatically discovers online images
 * and generates 3D textures on the fly.
 */
app.get('/api/products/match', async (req, res) => {
  const name = ((req.query.name as string) || '').trim()
  if (!name) {
    res.status(400).json({ error: 'Chýba parameter ?name=' })
    return
  }

  const localMatch = productStore.findBestLocalMatch(name)
  if (localMatch) {
    res.json(localMatch)
    return
  }

  if (req.query.autoDiscover === 'false') {
    res.status(404).json({ error: `Produkt "${name}" sa nenašiel v lokálnom katalógu.` })
    return
  }

  try {
    const game = req.query.game as ResolveProductInput['game']
    const type = req.query.type as ResolveProductInput['type']
    const language = req.query.language as ResolveProductInput['language']
    const existingImageUrl = req.query.imageUrl as string | undefined

    const resolved = await discoverAndBuildProduct({
      name,
      game,
      type,
      language,
      existingImageUrl,
    })
    productStore.upsert(resolved)
    res.json(resolved)
  } catch (err) {
    res.status(422).json({
      error: err instanceof Error ? err.message : 'Automatické vyhľadávanie zlyhalo',
    })
  }
})

app.get('/api/products/:slug', (req, res) => {
  const product = productStore.findBySlugOrId(req.params.slug)
  if (!product) {
    res.status(404).json({ error: 'Produkt nebol nájdený' })
    return
  }
  res.json(product)
})

/**
 * Explicitly resolves and generates 3D textures + gallery images from a product title.
 */
app.post('/api/products/resolve', async (req, res) => {
  const body = req.body as Partial<ResolveProductInput> & { forceRefresh?: boolean }
  if (!body.name || !body.name.trim()) {
    res.status(400).json({ error: 'Názov produktu (name) je povinný.' })
    return
  }

  try {
    const existing = !body.forceRefresh ? productStore.findBestLocalMatch(body.name) : null
    if (existing && existing.name.toLowerCase() === body.name.trim().toLowerCase() && !body.forceRefresh) {
      res.json(existing)
      return
    }

    const built = await discoverAndBuildProduct({
      name: body.name.trim(),
      game: body.game,
      type: body.type,
      language: body.language,
      price: body.price,
      currency: body.currency,
      description: body.description,
      sku: body.sku,
      externalId: body.externalId,
      sourceUrl: body.sourceUrl,
      existingImageUrl: body.existingImageUrl,
      extraImageUrls: body.extraImageUrls,
    })

    productStore.upsert(built)
    res.status(201).json(built)
  } catch (err) {
    res.status(422).json({
      error: err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť 3D render',
    })
  }
})

/**
 * WordPress REST API / Basic SQL / Batch product synchronization endpoint.
 */
app.post('/api/sync/wordpress', async (req, res) => {
  const body = req.body as SyncRequestConfig
  if (!body || !body.mode) {
    res.status(400).json({ error: 'Zadajte mode: "wp-rest", "wp-sql" alebo "batch".' })
    return
  }

  try {
    const report = await syncProductsFromSource(body)
    res.json(report)
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Synchronizácia s WordPressom zlyhala',
    })
  }
})

app.delete('/api/products/:id', (req, res) => {
  const removed = productStore.remove(req.params.id)
  if (!removed) {
    res.status(404).json({ error: 'Produkt neexistuje' })
    return
  }
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`CardCatcher 3D Backend API beží na http://localhost:${PORT}`)
  console.log(`Načítaných produktov v katalógu: ${productStore.getAll().length}`)
})
