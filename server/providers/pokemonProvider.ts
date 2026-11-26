import fs from 'node:fs'
import path from 'node:path'
import type { ProductImageItem, ProductType } from '../../src/types/product.ts'
import { searchBingImages } from '../services/webImageSearch.ts'
import type { ITcgProvider, ProviderResolveRequest, ProviderResolvedUrls } from './types.ts'

const PTCG_TREE_API = 'https://api.github.com/repos/1niceroli/ptcg-assets/git/trees/main?recursive=1'
const PTCG_RAW_BASE = 'https://raw.githubusercontent.com/1niceroli/ptcg-assets/main/'
const JWKEENA_RAW_BASE = 'https://raw.githubusercontent.com/jwkeena/pokemon-booster-pack-simulator/master/images/packart/'
const CACHE_PATH = path.resolve(process.cwd(), 'server', 'cache', 'ptcg-assets-tree.json')

interface SetMapping {
  code: string
  set: string
  series: string
  releaseYear: number
  aliases: string[]
}

const POKEMON_SETS: SetMapping[] = [
  // Mega Evolution Era (2025-2026)
  { code: 'me6', set: 'Delta Reign', series: 'Mega Evolution', releaseYear: 2026, aliases: ['delta reign', 'me6', 'mega rayquaza'] },
  { code: 'me5', set: 'Mega Evolution 5', series: 'Mega Evolution', releaseYear: 2026, aliases: ['me5', 'mega darkrai', 'mega zeraora'] },
  { code: 'me4', set: 'Chaos Rising', series: 'Mega Evolution', releaseYear: 2026, aliases: ['chaos rising', 'me4', 'mega greninja'] },
  { code: 'me3', set: 'Perfect Order', series: 'Mega Evolution', releaseYear: 2026, aliases: ['perfect order', 'me3', 'mega zygarde'] },
  { code: 'me2pt5', set: 'Ascended Heroes', series: 'Mega Evolution', releaseYear: 2025, aliases: ['ascended heroes', 'me2.5', 'me2pt5'] },
  { code: 'me2', set: 'Phantasmal Flames', series: 'Mega Evolution', releaseYear: 2025, aliases: ['phantasmal flames', 'me2', 'mega charizard x'] },
  { code: 'me1', set: 'Mega Evolution', series: 'Mega Evolution', releaseYear: 2025, aliases: ['mega evolution', 'me1', 'mega lucario', 'mega gardevoir'] },

  // Scarlet & Violet Era (2023-2025)
  { code: 'zsv10pt5', set: 'Black Bolt', series: 'Scarlet & Violet', releaseYear: 2025, aliases: ['black bolt', 'zsv10.5', 'zsv10pt5'] },
  { code: 'rsv10pt5', set: 'White Flare', series: 'Scarlet & Violet', releaseYear: 2025, aliases: ['white flare', 'rsv10.5', 'rsv10pt5'] },
  { code: 'sv10', set: 'Destined Rivals', series: 'Scarlet & Violet', releaseYear: 2025, aliases: ['destined rivals', 'ewige rivalen', 'sv10', 'giovanni mewtwo'] },
  { code: 'sv9', set: 'Journey Together', series: 'Scarlet & Violet', releaseYear: 2025, aliases: ['journey together', 'reisegefährten', 'sv9'] },
  { code: 'sv8pt5', set: 'Prismatic Evolutions', series: 'Scarlet & Violet', releaseYear: 2025, aliases: ['prismatic evolutions', 'prismatische entwicklungen', 'sv8.5', 'sv8pt5'] },
  { code: 'sv8', set: 'Surging Sparks', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['surging sparks', 'stürmische funken', 'sv8'] },
  { code: 'sv7', set: 'Stellar Crown', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['stellar crown', 'stellarkrone', 'sv7'] },
  { code: 'sv6pt5', set: 'Shrouded Fable', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['shrouded fable', 'nebel der sagen', 'sv6.5', 'sv6pt5'] },
  { code: 'sv6', set: 'Twilight Masquerade', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['twilight masquerade', 'maskerade im zwielicht', 'sv6'] },
  { code: 'sv5', set: 'Temporal Forces', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['temporal forces', 'gewalten der zeit', 'sv5'] },
  { code: 'sv4pt5', set: 'Paldean Fates', series: 'Scarlet & Violet', releaseYear: 2024, aliases: ['paldean fates', 'paldeas schicksale', 'sv4.5', 'sv4pt5'] },
  { code: 'sv4', set: 'Paradox Rift', series: 'Scarlet & Violet', releaseYear: 2023, aliases: ['paradox rift', 'paradoxrift', 'sv4'] },
  { code: 'sv3pt5', set: 'Pokémon 151', series: 'Scarlet & Violet', releaseYear: 2023, aliases: ['151', 'karmesin & purpur 151', 'sv3.5', 'sv3pt5', 'blooming waters'] },
  { code: 'sv3', set: 'Obsidian Flames', series: 'Scarlet & Violet', releaseYear: 2023, aliases: ['obsidian flames', 'obsidianflammen', 'sv3'] },
  { code: 'sv2', set: 'Paldea Evolved', series: 'Scarlet & Violet', releaseYear: 2023, aliases: ['paldea evolved', 'entwicklungen in paldea', 'sv2'] },
  { code: 'sv1', set: 'Scarlet & Violet Base', series: 'Scarlet & Violet', releaseYear: 2023, aliases: ['scarlet & violet base', 'scarlet and violet base', 'sv1', 'koraidon', 'miraidon'] },

  // Sword & Shield Era
  { code: 'swsh12pt5', set: 'Crown Zenith', series: 'Sword & Shield', releaseYear: 2023, aliases: ['crown zenith', 'zenit der konige', 'swsh12.5', 'swsh12pt5'] },
  { code: 'swsh12', set: 'Silver Tempest', series: 'Sword & Shield', releaseYear: 2022, aliases: ['silver tempest', 'silberne sturmwinde', 'swsh12'] },
  { code: 'swsh11', set: 'Lost Origin', series: 'Sword & Shield', releaseYear: 2022, aliases: ['lost origin', 'verlorener ursprung', 'swsh11'] },
  { code: 'swsh10', set: 'Astral Radiance', series: 'Sword & Shield', releaseYear: 2022, aliases: ['astral radiance', 'astralglanz', 'swsh10'] },
  { code: 'swsh9', set: 'Brilliant Stars', series: 'Sword & Shield', releaseYear: 2022, aliases: ['brilliant stars', 'strahlende sterne', 'swsh9'] },
  { code: 'swsh8', set: 'Fusion Strike', series: 'Sword & Shield', releaseYear: 2021, aliases: ['fusion strike', 'fusionsangriff', 'swsh8'] },
  { code: 'swsh7', set: 'Evolving Skies', series: 'Sword & Shield', releaseYear: 2021, aliases: ['evolving skies', 'drachenwandel', 'swsh7'] },
  { code: 'swsh6', set: 'Chilling Reign', series: 'Sword & Shield', releaseYear: 2021, aliases: ['chilling reign', 'schaurige herrschaft', 'swsh6'] },
  { code: 'swsh5', set: 'Battle Styles', series: 'Sword & Shield', releaseYear: 2021, aliases: ['battle styles', 'kampfstile', 'swsh5'] },
  { code: 'swsh45', set: 'Shining Fates', series: 'Sword & Shield', releaseYear: 2021, aliases: ['shining fates', 'glanzendes schicksal', 'swsh45', 'swsh4.5'] },
  { code: 'swsh4', set: 'Vivid Voltage', series: 'Sword & Shield', releaseYear: 2020, aliases: ['vivid voltage', 'farbenschock', 'swsh4'] },
  { code: 'swsh35', set: "Champion's Path", series: 'Sword & Shield', releaseYear: 2020, aliases: ["champion's path", 'champions path', 'weg des champs', 'swsh35'] },
  { code: 'swsh3', set: 'Darkness Ablaze', series: 'Sword & Shield', releaseYear: 2020, aliases: ['darkness ablaze', 'flammende finsternis', 'swsh3'] },
  { code: 'swsh2', set: 'Rebel Clash', series: 'Sword & Shield', releaseYear: 2020, aliases: ['rebel clash', 'clash der rebellen', 'swsh2'] },
  { code: 'swsh1', set: 'Sword & Shield Base', series: 'Sword & Shield', releaseYear: 2020, aliases: ['sword & shield base', 'sword and shield base', 'swsh1'] },
  { code: 'cel25', set: 'Celebrations', series: 'Sword & Shield', releaseYear: 2021, aliases: ['celebrations', '25th anniversary', 'cel25'] },
  { code: 'pgo', set: 'Pokémon GO', series: 'Sword & Shield', releaseYear: 2022, aliases: ['pokemon go', 'pokémon go'] },

  // Classic Vintage
  { code: 'base1', set: 'Base Set (1999)', series: 'Classic Vintage', releaseYear: 1999, aliases: ['base set', '1st edition'] },
  { code: 'base2', set: 'Jungle', series: 'Classic Vintage', releaseYear: 1999, aliases: ['jungle'] },
  { code: 'base3', set: 'Fossil', series: 'Classic Vintage', releaseYear: 1999, aliases: ['fossil'] },
  { code: 'base5', set: 'Team Rocket', series: 'Classic Vintage', releaseYear: 2000, aliases: ['team rocket'] },
  { code: 'neo1', set: 'Neo Genesis', series: 'Neo Series', releaseYear: 2000, aliases: ['neo genesis'] },
  { code: 'neo4', set: 'Neo Destiny', series: 'Neo Series', releaseYear: 2001, aliases: ['neo destiny'] },
]

const JWKEENA_VINTAGE: { match: RegExp; front: string; back: string }[] = [
  { match: /base set.*charizard|1stcharizard/i, front: '1stcharizard.jpg', back: 'basesetback1.jpg' },
  { match: /base set.*blastoise|1stblastoise/i, front: '1stblastoise.jpg', back: 'basesetback1.jpg' },
  { match: /base set.*venusaur|1stvenusaur/i, front: '1stvenusaur.jpg', back: 'basesetback1.jpg' },
  { match: /team rocket/i, front: 'teamrocket1.jpg', back: 'teamrocketback.jpg' },
  { match: /fossil/i, front: 'fossil1.jpg', back: 'fossilback.jpg' },
  { match: /jungle/i, front: 'jungle1.jpg', back: 'jungleback.jpg' },
  { match: /neo genesis/i, front: 'neogenesis1.jpg', back: 'neogenesisback1.jpg' },
  { match: /neo destiny/i, front: 'neodestiny1.jpg', back: 'neodestinyback1.jpg' },
]

let memoryTreeCache: string[] | null = null

/**
 * Fetches & caches the full file list of 1niceroli/ptcg-assets (excluding single cards).
 */
export async function getPtcgAssetsTree(): Promise<string[]> {
  if (memoryTreeCache) return memoryTreeCache

  try {
    if (fs.existsSync(CACHE_PATH)) {
      const stat = fs.statSync(CACHE_PATH)
      const ageHours = (Date.now() - stat.mtimeMs) / 3600000
      if (ageHours < 24) {
        const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as string[]
        if (Array.isArray(parsed) && parsed.length > 100) {
          memoryTreeCache = parsed
          return parsed
        }
      }
    }
  } catch {
    // ignore stale cache
  }

  try {
    const res = await fetch(PTCG_TREE_API, {
      headers: { 'User-Agent': 'CardCatcher-3D-Engine' },
    })
    if (res.ok) {
      const data = (await res.json()) as { tree?: { path: string; type: string }[] }
      const paths = (data.tree || [])
        .filter((n) => n.type === 'blob' && !n.path.includes('/cards/') && /\.(png|webp|jpg|jpeg)$/i.test(n.path))
        .map((n) => n.path)

      fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
      fs.writeFileSync(CACHE_PATH, JSON.stringify(paths), 'utf-8')
      memoryTreeCache = paths
      return paths
    }
  } catch {
    // fall back below
  }

  return memoryTreeCache || []
}

function findMatchingSet(query: string): SetMapping | undefined {
  const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return POKEMON_SETS.find((s) =>
    s.aliases.some((alias) => q.includes(alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()))
  )
}

function scoreRepoFileForProduct(filePath: string, type: ProductType, queryWords: string[], variantTerms: string[] = []): number {
  const lower = filePath.toLowerCase()
  if (lower.endsWith('logo.png') || lower.endsWith('symbol.png') || lower.includes('banner')) return -100
  if (lower.includes('/promo/')) return -50

  const allTerms = [...queryWords, ...variantTerms]
  const wantsPokemonCenter = allTerms.some((t) => t === 'center') || (allTerms.includes('pc') && allTerms.includes('etb'))
  const wantsVariant2 = allTerms.some((t) =>
    ['vaporeon', 'espeon', 'glaceon', 'sylveon', 'miraidon', 'valiant', 'leaves', 'gardevoir'].includes(t)
  )

  // Strict category enforcement so e.g. "Destined Rivals" never falsely matches "tin" substring!
  let score = 0
  switch (type) {
    case 'booster-pack':
      if (lower.includes('/packshots/') || lower.includes('sleeved')) score += 80
      else return -100
      break
    case 'booster-box':
      if (/\/display(?:-\d+)?\./i.test(lower)) score += 85
      else return -100
      break
    case 'booster-bundle':
      if (/booster-bundle/i.test(lower)) score += 85
      else return -100
      break
    case 'elite-trainer-box':
      if (/elite-trainer-box/i.test(lower)) {
        score += wantsPokemonCenter ? 60 : 85
      } else if (/\/pc-etb/i.test(lower)) {
        score += wantsPokemonCenter ? 105 : 40
      } else return -100

      if (/2\./i.test(lower) || /-14\.|-98\.|etb2/i.test(lower)) {
        score += wantsVariant2 ? 35 : -15
      } else {
        score += wantsVariant2 ? -10 : 20
      }
      break
    case 'mini-tin':
      if (lower.includes('/mini-tins/') || /mini-tin/i.test(lower)) score += 85
      else return -100
      break
    case 'tin':
      if (lower.includes('/tins/') && !lower.includes('mini-tins')) score += 85
      else return -100
      break
    case 'blister-pack':
      if (/triple-blister|single-blister|duo-blister/i.test(lower)) score += 80
      else return -100
      break
    case 'starter-deck':
      if (lower.includes('/decks/') || /\bdeck\b/i.test(lower)) score += 85
      else return -100
      break
    case 'build-and-battle':
      if (/build.*battle|stadium/i.test(lower)) score += 80
      else return -100
      break
    case 'collection-box':
      if (
        lower.includes('/collections/') ||
        (/collection|poster|binder|surprise-box|accessory-pouch|-box\./i.test(lower) && !lower.includes('blister') && !lower.includes('elite-trainer-box'))
      ) {
        score += 80
      } else return -100
      break
  }

  for (const w of allTerms) {
    if (w.length >= 3 && lower.includes(w)) {
      score += 18
    }
  }
  if (allTerms.some((w) => w === 'triple' || w === '3-pack' || w === '3') && lower.includes('triple-blister')) {
    score += 22
  }
  if (allTerms.some((w) => w === 'single' || w === 'checklane' || w === '1-pack') && lower.includes('single-blister')) {
    score += 22
  }

  return score
}

export class PokemonTcgProvider implements ITcgProvider {
  readonly game = 'pokemon' as const

  async resolveImageCandidates(req: ProviderResolveRequest): Promise<ProviderResolvedUrls> {
    const matchedSet = findMatchingSet(req.name)
    const tree = await getPtcgAssetsTree()
    const frontCandidates: string[] = []
    const backCandidates: string[] = []
    const galleryCandidates: { url: string; label: string; angle: ProductImageItem['angle'] }[] = []

    if (req.existingImageUrl) {
      frontCandidates.push(req.existingImageUrl)
    }

    // 1. Check vintage physical scans first if classic set booster pack
    if (req.type === 'booster-pack') {
      const vintage = JWKEENA_VINTAGE.find((v) => v.match.test(req.name))
      if (vintage) {
        frontCandidates.push(`${JWKEENA_RAW_BASE}${vintage.front}`)
        backCandidates.push(`${JWKEENA_RAW_BASE}${vintage.back}`)
      }
    }

    // 2. Match against 1niceroli/ptcg-assets repository (EN / DE / JP aware!)
    const queryWords = req.cleanQuery
      .toLowerCase()
      .split(/[\s\-_/]+/)
      .filter((w) => w.length >= 2)

    let imageSource = 'Web Image Search'

    if (matchedSet && tree.length > 0) {
      const candidateFolderPrefixes: string[] = []
      if (req.language === 'de') {
        candidateFolderPrefixes.push(`de_${matchedSet.code}/`, `${matchedSet.code}/`)
      } else if (req.language === 'jp') {
        candidateFolderPrefixes.push(`ja_${matchedSet.code}/`, `${matchedSet.code}/`)
      } else {
        candidateFolderPrefixes.push(`${matchedSet.code}/`)
      }

      const matches: { path: string; score: number }[] = []
      for (const prefix of candidateFolderPrefixes) {
        const filesInSet = tree.filter((p) => p.startsWith(prefix))
        for (const f of filesInSet) {
          const score = scoreRepoFileForProduct(f, req.type, queryWords, req.variantTerms)
          if (score > 0) {
            // Known exception: sv3pt5/elite-trainer-box-svp-51.png in ptcg-assets has DE artwork
            const isGerman151EtbAccident = f === 'sv3pt5/elite-trainer-box-svp-51.png' && req.language === 'en'
            if (!isGerman151EtbAccident) {
              matches.push({ path: f, score: prefix.startsWith('de_') && req.language === 'de' ? score + 25 : score })
            }
          }
        }
        if (matches.length > 0) break
      }

      matches.sort((a, b) => b.score - a.score)
      if (matches.length > 0) {
        const folderTag = matches[0].path.split('/')[0]
        imageSource = `ptcg-assets (${folderTag})`
        for (const m of matches.slice(0, 4)) {
          const url = `${PTCG_RAW_BASE}${m.path}`
          frontCandidates.push(url)
          if (galleryCandidates.length < 3) {
            galleryCandidates.push({
              url,
              label: m.path.split('/').pop()?.replace(/\.\w+$/, '').replace(/[_-]+/g, ' ') || 'Produktový variant',
              angle: 'gallery',
            })
          }
        }
      }
    }

    // 3. Search Bing Images for high-res photos, extra gallery angles, and verified rear scans
    const langTag = req.language === 'de' ? 'Deutsch' : req.language === 'jp' ? 'Japanese' : 'English'
    const variantStr = (req.variantTerms || []).slice(0, 2).join(' ')
    const baseSearch = req.cleanQuery.toLowerCase().includes('pokemon')
      ? `${req.cleanQuery} ${variantStr}`.trim()
      : `Pokemon ${req.cleanQuery} ${variantStr}`.trim()

    const [webFront, webBack] = await Promise.all([
      searchBingImages(`${baseSearch} ${langTag} TCG`, 10, { targetType: req.type }),
      searchBingImages(`${baseSearch} back`, 6, { targetType: req.type, requireBackHint: true }),
    ])

    // If ptcg-assets matched a tiny thumbnail or missed EN box, Bing candidates are ready right behind (or in gallery)
    for (const c of webFront) {
      frontCandidates.push(c.url)
      if (galleryCandidates.length < 4 && !frontCandidates.slice(0, 1).includes(c.url)) {
        galleryCandidates.push({ url: c.url, label: 'Produktová fotka', angle: 'gallery' })
      }
    }

    for (const b of webBack) {
      backCandidates.push(b.url)
    }

    return {
      frontCandidates,
      backCandidates,
      galleryCandidates,
      set: matchedSet?.set || req.cleanQuery,
      series: matchedSet?.series || 'Pokémon TCG',
      setCode: matchedSet?.code || req.setCode,
      releaseYear: matchedSet?.releaseYear,
      imageSource,
    }
  }
}
