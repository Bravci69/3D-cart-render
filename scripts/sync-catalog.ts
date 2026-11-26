import fs from 'node:fs'
import path from 'node:path'
import { productStore } from '../server/db/productStore.ts'
import { discoverAndBuildProduct, type ResolveProductInput } from '../server/services/imageDiscovery.ts'
import type { ProductData } from '../src/types/product.ts'

const CATALOG_SEED: ResolveProductInput[] = [
  // =========================================================================
  // 1. SWORD & SHIELD ERA (Evolving Skies, Crown Zenith, Silver Tempest, Lost Origin...)
  // =========================================================================
  {
    name: 'Evolving Skies Elite Trainer Box [Flareon/Jolteon/Umbreon/Leafeon]',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 229.0,
    featured: true,
    description: 'Zberateľský Elite Trainer Box zo série Sword & Shield – Evolving Skies (edícia Flareon / Jolteon / Umbreon / Leafeon).',
  },
  {
    name: 'Evolving Skies Elite Trainer Box [Vaporeon/Espeon/Glaceon/Sylveon]',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 229.0,
    featured: false,
    description: 'Zberateľský Elite Trainer Box Evolving Skies (edícia Vaporeon / Espeon / Glaceon / Sylveon).',
  },
  {
    name: 'Pokémon Evolving Skies Booster Display Box (36 packov)',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 899.0,
    featured: true,
    description: 'Ikonický zapečatený Booster Box Sword & Shield Evolving Skies (36 balíčkov).',
  },
  {
    name: 'Pokémon Evolving Skies Booster Pack (Umbreon)',
    game: 'pokemon',
    type: 'booster-pack',
    language: 'en',
    price: 19.99,
    featured: false,
    description: 'Samostatný booster balíček Evolving Skies s Umbreon artworkom.',
  },
  {
    name: 'Pokémon Crown Zenith Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 62.99,
    featured: false,
    description: 'Populárny Crown Zenith ETB s Lucario VSTAR a 10 booster balíčkami.',
  },
  {
    name: 'Pokémon Crown Zenith Rillaboom Triple Blister',
    game: 'pokemon',
    type: 'blister-pack',
    language: 'en',
    price: 18.99,
    featured: false,
    description: 'Trojité blister balenie Crown Zenith s odznakom Rillaboom.',
  },
  {
    name: 'Pokémon Silver Tempest Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 54.99,
    featured: false,
    description: 'Sword & Shield Silver Tempest ETB s Vulpix a Lugia tematikou.',
  },
  {
    name: 'Pokémon Silver Tempest Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 169.0,
    featured: false,
    description: 'Display box Silver Tempest obsahujúci 36 booster balíčkov.',
  },
  {
    name: 'Pokémon Lost Origin Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Elite Trainer Box edície Lost Origin s temným Giratina dizajnom.',
  },
  {
    name: 'Pokémon Lost Origin Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 219.0,
    featured: false,
    description: 'Display box Lost Origin s 36 balíčkami.',
  },
  {
    name: 'Pokémon Brilliant Stars Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Elite Trainer Box Brilliant Stars s Arceus VSTAR.',
  },
  {
    name: 'Pokémon Fusion Strike Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 79.99,
    featured: false,
    description: 'Elite Trainer Box Fusion Strike s Mewom VMAX.',
  },
  {
    name: 'Pokémon Shining Fates Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 69.99,
    featured: false,
    description: 'Špeciálny Shining Fates ETB s Gigantamax Eevee VMAX.',
  },
  {
    name: 'Pokémon Celebrations 25th Anniversary Elite Trainer Box',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 119.0,
    featured: false,
    description: 'Výročná zberateľská edícia Celebrations ETB s Greninja Gold Star promo kartou.',
  },

  // =========================================================================
  // 2. SCARLET & VIOLET ERA — Všetky edície (EN & DE)
  // =========================================================================
  {
    name: 'Pokémon Scarlet & Violet Base Elite Trainer Box (Koraidon)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Základná sada Scarlet & Violet ETB vo variante Koraidon.',
  },
  {
    name: 'Pokémon Scarlet & Violet Base Elite Trainer Box (Miraidon)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Základná sada Scarlet & Violet ETB vo variante Miraidon.',
  },
  {
    name: 'Pokémon ex Battle Deck Lucario',
    game: 'pokemon',
    type: 'starter-deck',
    language: 'en',
    price: 14.99,
    featured: false,
    description: 'Pripravený 60-kartový herný balíček Pokémon TCG s kartou Lucario ex.',
  },
  {
    name: 'Pokémon Paldea Evolved Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 54.99,
    featured: false,
    description: 'Elite Trainer Box edície Paldea Evolved so štartérmi regiónu Paldea.',
  },
  {
    name: 'Pokémon Paldea Evolved Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 159.0,
    featured: false,
    description: 'Booster Box Paldea Evolved obsahujúci 36 balíčkov.',
  },
  {
    name: 'Pokémon Obsidian Flames Elite Trainer Box (Charmander)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 58.99,
    featured: false,
    description: 'Obsidian Flames ETB s obľúbenou Full Art promo kartou Charmandera.',
  },
  {
    name: 'Pokémon Obsidian Flames Booster Box DE',
    game: 'pokemon',
    type: 'booster-box',
    language: 'de',
    price: 134.99,
    featured: false,
    description: 'Nemecká verzia (DE) displej boxu Obsidian Flames s 36 balíčkami.',
  },
  {
    name: 'Pokémon 151 Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 79.99,
    featured: true,
    description: 'Anglická edícia Elite Trainer Boxu Pokémon 151 so Snorlax promo kartou.',
  },
  {
    name: 'Pokémon Karmesin & Purpur 151 Top-Trainer-Box DE',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'de',
    price: 69.99,
    featured: false,
    description: 'Nemecká verzia (DE) Elite Trainer Boxu Pokémon 151.',
  },
  {
    name: 'Pokémon 151 Booster Bundle EN',
    game: 'pokemon',
    type: 'booster-bundle',
    language: 'en',
    price: 39.99,
    featured: false,
    description: '6 booster balíčkov Pokémon Scarlet & Violet 151 v kompaktnom boxe.',
  },
  {
    name: 'Pokémon 151 Ultra-Premium Collection EN',
    game: 'pokemon',
    type: 'collection-box',
    language: 'en',
    price: 169.0,
    featured: true,
    description: 'Luxusný Ultra-Premium Collection Box Pokémon 151 s kovovým Mewom ex a hernou podložkou.',
  },
  {
    name: 'Pokémon 151 Blooming Waters Premium Collection',
    game: 'pokemon',
    type: 'collection-box',
    language: 'en',
    price: 79.99,
    featured: false,
    description: 'Prémiový box 151 s 12 boostermi a kartami Venusaur ex & Blastoise ex.',
  },
  {
    name: 'Pokémon 151 Mini Tin Gengar EN',
    game: 'pokemon',
    type: 'mini-tin',
    language: 'en',
    price: 12.99,
    featured: false,
    description: 'Kovová Mini Tin plechovka s Gengar artworkom a 2 balíčkami 151.',
  },
  {
    name: 'Pokémon 151 Booster Pack (Mew)',
    game: 'pokemon',
    type: 'booster-pack',
    language: 'en',
    price: 6.99,
    featured: false,
    description: 'Moderný booster balíček Scarlet & Violet 151 s Mew artworkom.',
  },
  {
    name: 'Pokémon Paradox Rift Elite Trainer Box (Roaring Moon)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Paradox Rift ETB v červenej edícii Roaring Moon.',
  },
  {
    name: 'Pokémon Paradox Rift Elite Trainer Box (Iron Valiant)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Paradox Rift ETB v modro-fialovej edícii Iron Valiant.',
  },
  {
    name: 'Pokémon Paldean Fates Elite Trainer Box (Mimikyu)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Shiny edícia Paldean Fates ETB s promo kartou Mimikyu.',
  },
  {
    name: 'Pokémon Paldean Fates Charizard ex Tin EN',
    game: 'pokemon',
    type: 'tin',
    language: 'en',
    price: 29.99,
    featured: true,
    description: 'Zberateľská plechovka Paldean Fates s lesklým Tera Charizardom ex.',
  },
  {
    name: 'Pokémon Paldean Fates Booster Bundle EN',
    game: 'pokemon',
    type: 'booster-bundle',
    language: 'en',
    price: 34.99,
    featured: false,
    description: '6-pack Booster Bundle edície Paldean Fates.',
  },
  {
    name: 'Pokémon Temporal Forces Elite Trainer Box (Walking Wake)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Temporal Forces ETB vo variante Walking Wake.',
  },
  {
    name: 'Pokémon Temporal Forces Elite Trainer Box (Iron Leaves)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Temporal Forces ETB vo variante Iron Leaves.',
  },
  {
    name: 'Pokémon Twilight Masquerade Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 52.99,
    featured: false,
    description: 'Twilight Masquerade ETB s legendárnym Teal Mask Ogerponom.',
  },
  {
    name: 'Pokémon Twilight Masquerade Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 154.99,
    featured: false,
    description: 'Display box Twilight Masquerade (36 booster balíčkov).',
  },
  {
    name: 'Pokémon Shrouded Fable Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 47.99,
    featured: false,
    description: 'Špeciálny set Shrouded Fable Elite Trainer Box s Pecharunt promo kartou.',
  },
  {
    name: 'Pokémon Shrouded Fable Kingdra ex Collection Box',
    game: 'pokemon',
    type: 'collection-box',
    language: 'en',
    price: 36.99,
    featured: false,
    description: 'Special Illustration Collection box s promo kartou Kingdra ex.',
  },
  {
    name: 'Pokémon Stellar Crown Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 49.99,
    featured: false,
    description: 'Stellar Crown ETB s kryštálovým Terapagosom.',
  },
  {
    name: 'Pokémon Stellar Crown Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 149.99,
    featured: false,
    description: 'Booster Display Box Stellar Crown (36 balíčkov).',
  },
  {
    name: 'Pokémon Surging Sparks Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 56.99,
    featured: true,
    description: 'Surging Sparks ETB s Magneton promo kartou, kockami a obalmi.',
  },
  {
    name: 'Pokémon Surging Sparks Booster Display Box (36 packov)',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 149.99,
    featured: true,
    description: 'Zapečatený displej box s 36 balíčkami Surging Sparks.',
  },
  {
    name: 'Pokémon Surging Sparks Booster Bundle EN',
    game: 'pokemon',
    type: 'booster-bundle',
    language: 'en',
    price: 32.99,
    featured: false,
    description: '6-pack Booster Bundle edície Surging Sparks.',
  },
  {
    name: 'Pokémon Surging Sparks Build & Battle Box EN',
    game: 'pokemon',
    type: 'build-and-battle',
    language: 'en',
    price: 24.99,
    featured: false,
    description: 'Turnajový Build & Battle kit so 40-kartovým balíčkom a 4 boostermi.',
  },
  {
    name: 'Pokémon Surging Sparks Booster Pack (Pikachu)',
    game: 'pokemon',
    type: 'booster-pack',
    language: 'en',
    price: 5.49,
    featured: false,
    description: 'Booster pack Surging Sparks so Stellar Pikachu.',
  },
  {
    name: 'Pokémon Stürmische Funken Booster Pack Pikachu DE',
    game: 'pokemon',
    type: 'booster-pack',
    language: 'de',
    price: 4.99,
    featured: false,
    description: 'Nemecká verzia (DE) balíčka Surging Sparks.',
  },
  {
    name: 'Pokémon Prismatic Evolutions Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 69.99,
    featured: true,
    description: 'Prismatic Evolutions ETB s Eevee promo kartou.',
  },
  {
    name: 'Pokémon Prismatische Entwicklungen Top-Trainer-Box DE',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'de',
    price: 64.99,
    featured: false,
    description: 'Nemecká verzia (DE) Prismatic Evolutions Top-Trainer-Box.',
  },
  {
    name: 'Pokémon Prismatic Evolutions Booster Bundle EN',
    game: 'pokemon',
    type: 'booster-bundle',
    language: 'en',
    price: 34.99,
    featured: false,
    description: 'Kompaktný Booster Bundle obsahujúci 6 balíčkov Prismatic Evolutions.',
  },
  {
    name: 'Pokémon Prismatic Evolutions Mini Tin EN',
    game: 'pokemon',
    type: 'mini-tin',
    language: 'en',
    price: 13.99,
    featured: false,
    description: 'Zberateľská Mini plechovka Prismatic Evolutions s Eevee evolúciami.',
  },
  {
    name: 'Pokémon Prismatic Evolutions 3-Pack Blister EN',
    game: 'pokemon',
    type: 'blister-pack',
    language: 'en',
    price: 17.99,
    featured: false,
    description: 'Trojité blister balenie s promo kartou a mincou.',
  },
  {
    name: 'Pokémon Prismatic Evolutions Binder Collection EN',
    game: 'pokemon',
    type: 'collection-box',
    language: 'en',
    price: 39.99,
    featured: false,
    description: 'Zberateľský album + 5 balíčkov Prismatic Evolutions.',
  },
  {
    name: 'Pokémon Journey Together Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Trainer\'s Pokémon návrat – Journey Together ETB.',
  },
  {
    name: 'Pokémon Journey Together Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 159.99,
    featured: false,
    description: 'Booster Box Journey Together (36 balíčkov).',
  },
  {
    name: 'Pokémon Destined Rivals Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 62.99,
    featured: true,
    description: 'Destined Rivals ETB s Team Rocket tematikou.',
  },
  {
    name: 'Pokémon Destined Rivals Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 164.99,
    featured: false,
    description: 'Booster Display Box Destined Rivals (36 balíčkov).',
  },
  {
    name: 'Pokémon Destined Rivals Collector Tin',
    game: 'pokemon',
    type: 'tin',
    language: 'en',
    price: 26.99,
    featured: false,
    description: 'Kovová plechovka s promo kartou Team Rocket\'s Mewtwo ex a boostermi.',
  },
  {
    name: 'Pokémon Black Bolt Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Scarlet & Violet Black Bolt ETB s legendárnym Zekromom.',
  },
  {
    name: 'Pokémon White Flare Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Scarlet & Violet White Flare ETB s legendárnym Reshiramom.',
  },

  // =========================================================================
  // 3. MEGA EVOLUTION ERA (2025-2026, EN & DE)
  // =========================================================================
  {
    name: 'Pokémon Mega Evolution Elite Trainer Box (Mega Gardevoir)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Mega Evolution ETB s Mega Gardevoir edíciou.',
  },
  {
    name: 'Pokémon Mega Evolution Elite Trainer Box (Mega Lucario)',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Mega Evolution ETB s Mega Lucario edíciou.',
  },
  {
    name: 'Pokémon Mega Evolution Booster Display Box EN',
    game: 'pokemon',
    type: 'booster-box',
    language: 'en',
    price: 164.99,
    featured: true,
    description: 'Zapečatený Booster Display Box zo série Mega Evolution.',
  },
  {
    name: 'Pokémon Phantasmal Flames Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 62.99,
    featured: false,
    description: 'Phantasmal Flames ETB s Mega Charizardom X.',
  },
  {
    name: 'Pokémon Ascended Heroes Elite Trainer Box EN',
    game: 'pokemon',
    type: 'elite-trainer-box',
    language: 'en',
    price: 59.99,
    featured: false,
    description: 'Ascended Heroes ETB zo série Mega Evolution.',
  },
  {
    name: '1999 Base Set 1st Edition Booster (Charizard)',
    game: 'pokemon',
    type: 'booster-pack',
    language: 'en',
    price: 499.0,
    featured: false,
    description: 'Autentický vintage scan prednej aj zadnej strany originálneho balíčka Base Set z roku 1999.',
  },

  // =========================================================================
  // 4. MULTI-TCG SHOWCASE (One Piece, Magic: The Gathering, League of Legends)
  // =========================================================================
  {
    name: 'One Piece Card Game OP-09 Emperors in the New World Booster Box',
    game: 'one-piece',
    type: 'booster-box',
    language: 'en',
    price: 119.99,
    featured: true,
    description: 'Oficiálny One Piece TCG Display Box OP-09 (24 balíčkov).',
  },
  {
    name: 'One Piece Card Game OP-09 Booster Pack',
    game: 'one-piece',
    type: 'booster-pack',
    language: 'en',
    price: 4.99,
    featured: false,
    description: 'Samostatný One Piece OP-09 booster balíček (12 kariet).',
  },
  {
    name: 'Magic: The Gathering Foundations Play Booster Box',
    game: 'magic',
    type: 'booster-box',
    language: 'en',
    price: 139.99,
    featured: true,
    description: 'Magic: The Gathering Foundations Play Booster Display Box (36 balíčkov).',
  },
  {
    name: 'Magic: The Gathering Bloomburrow Commander Deck',
    game: 'magic',
    type: 'starter-deck',
    language: 'en',
    price: 44.99,
    featured: false,
    description: '100-kartový predpripravený MTG Commander balíček zo setu Bloomburrow.',
  },
  {
    name: 'Riftbound League of Legends TCG Booster Box',
    game: 'lol',
    type: 'booster-box',
    language: 'en',
    price: 124.99,
    featured: false,
    description: 'Oficiálna League of Legends zberateľská kartová hra Riftbound – Booster Display Box.',
  },
]

async function runPool<T, R>(items: T[], concurrency: number, worker: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIdx = 0

  async function spawnWorker() {
    while (true) {
      const idx = nextIdx++
      if (idx >= items.length) break
      results[idx] = await worker(items[idx], idx)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => spawnWorker())
  await Promise.all(workers)
  return results
}

async function run() {
  const publicDir = path.resolve(process.cwd(), 'public')
  const texturesDir = path.join(publicDir, 'textures')

  const filterArg = process.argv.find((a) => a.startsWith('--filter='))?.slice('--filter='.length).toLowerCase()
  const itemsToProcess = filterArg
    ? CATALOG_SEED.filter((s) => s.name.toLowerCase().includes(filterArg))
    : CATALOG_SEED

  console.log(`🚀 Synchronizujem ${itemsToProcess.length} reálnych TCG produktov (paralelne)...`)

  const builtRaw = await runPool(itemsToProcess, 4, async (seed, i) => {
    try {
      const product = await discoverAndBuildProduct(seed, { publicDir })
      console.log(`✅ [${i + 1}/${itemsToProcess.length}] ${seed.name} -> ${product.imageSource}`)
      return product
    } catch (err) {
      console.error(`❌ [${i + 1}/${itemsToProcess.length}] "${seed.name}":`, err instanceof Error ? err.message : err)
      return null
    }
  })

  const builtProducts: ProductData[] = builtRaw.filter((p): p is ProductData => p !== null)

  if (filterArg) {
    for (const p of builtProducts) {
      productStore.upsert(p)
    }
    console.log(`🎉 Hotovo! Aktualizovaných ${builtProducts.length} položiek v public/products.json.`)
    return
  }

  const usedSlugs = new Set(builtProducts.map((p) => p.slug))

  // Clean up any stale texture folders not in the manifest
  if (fs.existsSync(texturesDir)) {
    for (const entry of fs.readdirSync(texturesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !usedSlugs.has(entry.name)) {
        fs.rmSync(path.join(texturesDir, entry.name), { recursive: true, force: true })
        console.log(`🧹 Odstránený neaktívny priečinok: ${entry.name}`)
      }
    }
  }

  productStore.replaceAll(builtProducts)
  console.log(`🎉 Hotovo! Uložených ${builtProducts.length}/${CATALOG_SEED.length} reálnych produktov do public/products.json.`)
}

run().catch((err) => {
  console.error('Fatálna chyba synchronizácie:', err)
  process.exit(1)
})
