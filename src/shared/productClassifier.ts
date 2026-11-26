import type { ProductLanguage, ProductType, TcgGame } from '../types/product.ts'

export interface ClassifiedProductInfo {
  game: TcgGame
  type: ProductType
  language: ProductLanguage
  cleanQuery: string
  variantTerms: string[]
  setCode?: string
}

const ONE_PIECE_KEYWORDS = [
  'one piece',
  'optcg',
  'op-',
  'op0',
  'op1',
  'op2',
  'eb-0',
  'prb-0',
  'st-0',
  'st-1',
  'st-2',
  'romance dawn',
  'paramount war',
  'pillars of strength',
  'kingdoms of intrigue',
  'awakening of the new era',
  'wings of the captain',
  '500 years in the future',
  'two legends',
  'emperors in the new world',
  'royal blood',
  'a fist of divine speed',
  'memorial collection',
  'luffy',
  'zoro',
  'nami',
]

const MAGIC_KEYWORDS = [
  'magic',
  'mtg',
  'wizards of the coast',
  'play booster',
  'collector booster',
  'draft booster',
  'set booster',
  'commander deck',
  'commander',
  'fat pack',
  'prerelease',
  'secret lair',
  'modern horizons',
  'bloomburrow',
  'duskmourn',
  'foundations',
  'aetherdrift',
  'tarkir',
  'innistrad',
  'ravnica',
  'phyrexia',
  'kamigawa',
  'dominaria',
  'murders at karlov',
  'outlaws of thunder junction',
  'edge of eternities',
]

const LOL_KEYWORDS = [
  'league of legends',
  'lol tcg',
  'riftbound',
  'runeterra',
  'legends of runeterra',
  'jinx',
  'ahri',
  'yasuo',
  'lux',
  'viktor',
  'arcane',
  'champion deck',
]

const POKEMON_KEYWORDS = [
  'pokemon',
  'pokémon',
  'ptcg',
  'etb',
  'elite trainer',
  'top-trainer-box',
  'top trainer box',
  'karmesin',
  'purpur',
  'scarlet',
  'violet',
  'sword & shield',
  'sword and shield',
  'mega evolution',
  'prismatic evolutions',
  'surging sparks',
  'destined rivals',
  'journey together',
  'obsidian flames',
  'paldean fates',
  'paldea evolved',
  'temporal forces',
  'twilight masquerade',
  'stellar crown',
  'shrouded fable',
  'crown zenith',
  'paradox rift',
  '151',
  'black bolt',
  'white flare',
  'ascended heroes',
  'perfect order',
  'chaos rising',
  'base set',
  'team rocket',
  'neo genesis',
  'charizard',
  'pikachu',
  'mew',
  'snorlax',
  'eevee',
  'blastoise',
  'venusaur',
  'lugia',
  'rayquaza',
  'gengar',
  'booster bundle',
  'build & battle',
]

/**
 * Generates an ASCII URL-safe slug from any multilingual product title.
 */
export function normalizeSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Detects which trading card game a product belongs to.
 */
export function detectTcgGame(name: string, hint?: TcgGame): TcgGame {
  if (hint && hint !== 'other') return hint
  const q = name.toLowerCase()

  if (LOL_KEYWORDS.some((kw) => q.includes(kw))) return 'lol'
  if (ONE_PIECE_KEYWORDS.some((kw) => q.includes(kw))) return 'one-piece'
  if (MAGIC_KEYWORDS.some((kw) => q.includes(kw))) return 'magic'
  if (POKEMON_KEYWORDS.some((kw) => q.includes(kw))) return 'pokemon'

  const POKEMON_EXTRA = [
    'evolving skies',
    'lost origin',
    'silver tempest',
    'astral radiance',
    'brilliant stars',
    'fusion strike',
    'chilling reign',
    'battle styles',
    'shining fates',
    'vivid voltage',
    'darkness ablaze',
    'rebel clash',
    'celebrations',
    'pokemon go',
    'pokémon go',
    'top-trainer',
  ]
  if (POKEMON_EXTRA.some((kw) => q.includes(kw))) return 'pokemon'

  // Set code patterns
  if (/\b(op|eb|prb|st)-?\d{2}\b/i.test(q)) return 'one-piece'
  if (/\b(sv\d+(?:\.\d|pt5)?|swsh\d+|me\d+|sm\d+)\b/i.test(q)) return 'pokemon'

  return hint || 'pokemon'
}

/**
 * Detects product edition language (supports EN, DE, JP, CZ/SK).
 */
export function detectProductLanguage(name: string, hint?: ProductLanguage): ProductLanguage {
  if (hint) return hint
  const q = name.toLowerCase()

  if (
    /\b(de|ger|deutsch|german)\b/.test(q) ||
    q.includes('top-trainer-box') ||
    q.includes('top trainer box') ||
    q.includes('karmesin') ||
    q.includes('purpur') ||
    q.includes('sammelkartenspiel') ||
    q.includes('kollektion') ||
    q.includes('blechdose') ||
    q.includes('prismatische') ||
    q.includes('stürmische')
  ) {
    return 'de'
  }

  if (/\b(jp|jpn|japanese|japonsk[aéy]?)\b/.test(q) || q.includes('terastal festival')) {
    return 'jp'
  }

  if (/\b(cz|cs|česk[aéy]?)\b/.test(q)) return 'cs'
  if (/\b(sk|slovensk[aéy]?)\b/.test(q)) return 'sk'

  return 'en'
}

/**
 * Detects packaging geometry type from EN, DE, CS, and SK product titles.
 */
export function detectProductType(name: string, hint?: ProductType): ProductType {
  if (hint) return hint
  const q = name.toLowerCase()

  if (
    q.includes('elite trainer') ||
    q.includes('top-trainer-box') ||
    q.includes('top trainer box') ||
    /\betb\b/.test(q)
  ) {
    return 'elite-trainer-box'
  }

  if (
    q.includes('booster bundle') ||
    q.includes('bundle') ||
    q.includes('fat pack') ||
    q.includes('6-pack') ||
    q.includes('6 pack') ||
    q.includes('6 balíčk') ||
    q.includes('6 balick')
  ) {
    return 'booster-bundle'
  }

  if (q.includes('mini tin') || q.includes('mini-tin') || q.includes('minitin')) {
    return 'mini-tin'
  }

  if (
    /\btins?\b/.test(q) ||
    q.includes('plechov') ||
    q.includes('blechdose') ||
    q.includes('collector chest') ||
    q.includes('lunchbox')
  ) {
    return 'tin'
  }

  if (
    q.includes('blister') ||
    q.includes('checklane') ||
    q.includes('3-pack') ||
    q.includes('3 pack') ||
    q.includes('sleeved') ||
    q.includes('pin collection')
  ) {
    return 'blister-pack'
  }

  if (
    q.includes('build & battle') ||
    q.includes('build and battle') ||
    q.includes('prerelease') ||
    q.includes('pre-release') ||
    q.includes('stadium')
  ) {
    return 'build-and-battle'
  }

  if (
    q.includes('starter deck') ||
    q.includes('battle deck') ||
    q.includes('commander deck') ||
    q.includes('theme deck') ||
    q.includes('champion deck') ||
    q.includes('structure deck') ||
    /\bdeck\b/.test(q)
  ) {
    return 'starter-deck'
  }

  if (
    q.includes('collection') ||
    q.includes('kollektion') ||
    q.includes('ultra-premium') ||
    q.includes('ultra premium') ||
    q.includes('super premium') ||
    /\bupc\b/.test(q) ||
    /\bspc\b/.test(q) ||
    q.includes('ex box') ||
    q.includes('v box') ||
    q.includes('vstar box') ||
    q.includes('binder') ||
    q.includes('poster') ||
    q.includes('figure') ||
    q.includes('double pack') ||
    q.includes('gift box') ||
    q.includes('darčekov')
  ) {
    return 'collection-box'
  }

  if (
    q.includes('booster box') ||
    q.includes('display box') ||
    /\bdisplay\b/.test(q) ||
    /\bdisplej\b/.test(q) ||
    q.includes('36 pack') ||
    q.includes('36 balíč') ||
    q.includes('24 pack') ||
    q.includes('18 pack') ||
    q.includes('18-pack')
  ) {
    return 'booster-box'
  }

  return 'booster-pack'
}

/**
 * Classifies a raw DB / e-shop product title into game, language, type, and a clean search string.
 */
export function classifyProductName(
  name: string,
  overrides?: { game?: TcgGame; type?: ProductType; language?: ProductLanguage }
): ClassifiedProductInfo {
  const game = detectTcgGame(name, overrides?.game)
  const language = detectProductLanguage(name, overrides?.language)
  const type = detectProductType(name, overrides?.type)

  const setCodeMatch = name.match(/\b(OP-?\d{2}|EB-?\d{2}|PRB-?\d{2}|ST-?\d{2}|SV\d+(?:\.\d|pt5)?|ME\d+|SWSH\d+)\b/i)
  const setCode = setCodeMatch ? setCodeMatch[1].toUpperCase() : undefined

  // Extract variant hints from brackets/parentheses (e.g. "[Flareon/Jolteon/Umbreon/Leafeon]")
  const bracketMatches = [...name.matchAll(/[[(]([^\]()]+)[\])]/g)].map((m) => m[1])
  const variantTerms = bracketMatches
    .flatMap((seg) => seg.split(/[\s/,|+&-]+/))
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length >= 2 && !['en', 'de', 'jp', 'cz', 'sk'].includes(w))

  const cleanQuery = name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(en|de|jp|cz|sk|slovensk[aéy]|česk[aéy]|36 balíčkov|36 packov|balíček|balicek)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    game,
    type,
    language,
    cleanQuery: cleanQuery || name,
    variantTerms,
    setCode,
  }
}
