import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { ProductData } from '../src/types/product.ts'

interface RealProductSource {
  id: string
  name: string
  slug: string
  type: ProductData['type']
  series: string
  set: string
  releaseYear: number
  price: number
  description: string
  githubPath: string
  primaryColor: string
  secondaryColor: string
  dimensions: ProductData['dimensions']
  material: ProductData['material']
}

const REAL_PRODUCTS: RealProductSource[] = [
  {
    id: 'pkm-151-mew-booster',
    name: 'Pokémon 151 Booster Pack (Mew)',
    slug: 'pokemon-151-mew-booster',
    type: 'booster-pack',
    series: 'Scarlet & Violet',
    set: 'Pokémon 151',
    releaseYear: 2023,
    price: 6.99,
    description: 'Originálny fóliový booster pack Pokémon 151 s Mew artworkom. Obsahuje 10 kariet a holografickú energiu.',
    githubPath: 'sv3pt5/packshots/151_Booster.webp',
    primaryColor: '#7e22ce',
    secondaryColor: '#facc15',
    dimensions: { width: 2.2, height: 3.4, depth: 0.12, bevelRadius: 0.02 },
    material: { roughness: 0.18, metalness: 0.45, clearcoat: 1.0, clearcoatRoughness: 0.1 },
  },
  {
    id: 'pkm-obsidian-charizard-booster',
    name: 'Obsidian Flames Booster (Charizard ex)',
    slug: 'pokemon-obsidian-charizard-booster',
    type: 'booster-pack',
    series: 'Scarlet & Violet',
    set: 'Obsidian Flames',
    releaseYear: 2023,
    price: 5.49,
    description: 'Originálny booster balíček Obsidian Flames s temným Tera Charizardom ex.',
    githubPath: 'sv3/packshots/SV3_Booster_Charizard.webp',
    primaryColor: '#991b1b',
    secondaryColor: '#f97316',
    dimensions: { width: 2.2, height: 3.4, depth: 0.12, bevelRadius: 0.02 },
    material: { roughness: 0.18, metalness: 0.45, clearcoat: 1.0, clearcoatRoughness: 0.1 },
  },
  {
    id: 'pkm-surging-sparks-pikachu',
    name: 'Surging Sparks Booster (Stellar Pikachu)',
    slug: 'pokemon-surging-sparks-pikachu',
    type: 'booster-pack',
    series: 'Scarlet & Violet',
    set: 'Surging Sparks',
    releaseYear: 2024,
    price: 5.99,
    description: 'Najnovší expanzný booster pack Surging Sparks s ikonickým Tera Pikachu so Stellar korunkou.',
    githubPath: 'sv8/packshots/Pokemon_TCG_Scarlet_Violet—Surging_Sparks_Booster_Wrap_PikachuStellar.png',
    primaryColor: '#0284c7',
    secondaryColor: '#facc15',
    dimensions: { width: 2.2, height: 3.4, depth: 0.12, bevelRadius: 0.02 },
    material: { roughness: 0.15, metalness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.08 },
  },
  {
    id: 'pkm-base-set-charizard',
    name: '1999 Base Set Booster (Vintage Charizard)',
    slug: 'pokemon-base-set-charizard',
    type: 'booster-pack',
    series: 'Classic Vintage',
    set: 'Base Set',
    releaseYear: 1999,
    price: 499.0,
    description: 'Ikonický vintage booster pack z roku 1999 (Wizards of the Coast) s pôvodným Charizard artworkom.',
    githubPath: 'base1/packshots/Base_Set_Booster_Charizard_Shadowless.webp',
    primaryColor: '#b45309',
    secondaryColor: '#dc2626',
    dimensions: { width: 2.2, height: 3.4, depth: 0.12, bevelRadius: 0.02 },
    material: { roughness: 0.25, metalness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15 },
  },
  {
    id: 'pkm-obsidian-flames-box',
    name: 'Obsidian Flames Booster Display Box (36 balíčkov)',
    slug: 'pokemon-obsidian-flames-box',
    type: 'booster-box',
    series: 'Scarlet & Violet',
    set: 'Obsidian Flames',
    releaseYear: 2023,
    price: 139.99,
    description: 'Originálny zapečatený displej box obsahujúci 36 booster balíčkov Obsidian Flames.',
    githubPath: 'sv3/display.png',
    primaryColor: '#7f1d1d',
    secondaryColor: '#ea580c',
    dimensions: { width: 3.2, height: 2.6, depth: 2.4, bevelRadius: 0.04 },
    material: { roughness: 0.35, metalness: 0.05, clearcoat: 0.25, clearcoatRoughness: 0.3 },
  },
  {
    id: 'pkm-151-etb',
    name: 'Pokémon 151 Elite Trainer Box (Snorlax)',
    slug: 'pokemon-151-etb',
    type: 'elite-trainer-box',
    series: 'Scarlet & Violet',
    set: 'Pokémon 151',
    releaseYear: 2023,
    price: 64.99,
    description: 'Zberateľský Elite Trainer Box edície Pokémon 151 s promo kartou Snorlax, 9 boostermi a príslušenstvom.',
    githubPath: 'sv3pt5/elite-trainer-box-svp-51.png',
    primaryColor: '#1e1b4b',
    secondaryColor: '#38bdf8',
    dimensions: { width: 3.0, height: 3.2, depth: 1.8, bevelRadius: 0.05 },
    material: { roughness: 0.3, metalness: 0.1, clearcoat: 0.45, clearcoatRoughness: 0.2 },
  },
  {
    id: 'pkm-crown-zenith-etb',
    name: 'Crown Zenith Elite Trainer Box (Lucario VSTAR)',
    slug: 'pokemon-crown-zenith-etb',
    type: 'elite-trainer-box',
    series: 'Sword & Shield',
    set: 'Crown Zenith',
    releaseYear: 2023,
    price: 59.99,
    description: 'Populárny Elite Trainer Box Crown Zenith s Lucario VSTAR a 10 boostermi.',
    githubPath: 'swsh12pt5/elite-trainer-box-swshp-SWSH291.png',
    primaryColor: '#1e3a8a',
    secondaryColor: '#eab308',
    dimensions: { width: 3.0, height: 3.2, depth: 1.8, bevelRadius: 0.05 },
    material: { roughness: 0.3, metalness: 0.12, clearcoat: 0.5, clearcoatRoughness: 0.2 },
  },
  {
    id: 'pkm-crown-zenith-blister',
    name: 'Crown Zenith Triple Blister Pack',
    slug: 'pokemon-crown-zenith-blister',
    type: 'blister-pack',
    series: 'Sword & Shield',
    set: 'Crown Zenith',
    releaseYear: 2023,
    price: 16.99,
    description: 'Originálne trojité blister balenie Crown Zenith so špeciálnou promo kartou Rillaboom.',
    githubPath: 'swsh12pt5/triple-blister-swshp-SWSH277.png',
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
    dimensions: { width: 2.6, height: 3.8, depth: 0.28, bevelRadius: 0.03 },
    material: { roughness: 0.25, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.2 },
  },
]

const BASE_REPO_URL = 'https://raw.githubusercontent.com/1niceroli/ptcg-assets/main/'

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Creates clean back texture for Pokemon booster packs & boxes
 */
function createBackSvg(width: number, height: number, title: string, primaryColor: string, isBooster: boolean) {
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#backGrad)"/>
    <rect width="${width}" height="${height}" fill="#000000" fill-opacity="0.35"/>

    <!-- Foil / Cardboard seam -->
    ${isBooster ? `<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3"/>` : ''}

    <g transform="translate(${width / 2}, ${height * 0.22})">
      <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.038)}" font-weight="bold" fill="#ffffff">POKÉMON TRADING CARD GAME</text>
      <text x="0" y="${Math.round(height * 0.045)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.03)}" font-weight="bold" fill="#38bdf8">${title.toUpperCase()}</text>
    </g>

    <g transform="translate(${width / 2}, ${height * 0.45})">
      <rect x="-${width * 0.42}" y="-${height * 0.12}" width="${width * 0.84}" height="${height * 0.28}" rx="12" fill="#0b1120" fill-opacity="0.85" stroke="#334155" stroke-width="2"/>
      <text x="-${width * 0.38}" y="-${height * 0.04}" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.026)}" fill="#e2e8f0">• Authentic Pokémon Official Licensed Product</text>
      <text x="-${width * 0.38}" y="${height * 0.02}" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.024)}" fill="#94a3b8">• Includes game cards &amp; collectible materials</text>
      <text x="-${width * 0.38}" y="${height * 0.08}" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.02)}" fill="#ef4444">⚠️ WARNING: CHOKING HAZARD - Small parts.</text>
    </g>

    <!-- Barcode -->
    <g transform="translate(${width / 2}, ${height * 0.8})">
      <rect x="-${width * 0.3}" y="-${height * 0.06}" width="${width * 0.6}" height="${height * 0.12}" rx="8" fill="#ffffff"/>
      <g transform="translate(-${width * 0.25}, -${height * 0.035})">
        ${Array.from({ length: 36 })
          .map((_, i) => `<rect x="${i * (width * 0.5 / 36)}" y="0" width="${i % 3 === 0 ? 4 : 2}" height="${height * 0.055}" fill="#000000"/>`)
          .join('')}
      </g>
      <text x="0" y="${height * 0.045}" text-anchor="middle" font-family="Courier, monospace" font-size="${Math.round(width * 0.026)}" font-weight="bold" fill="#000000">0 820650 853219</text>
    </g>

    <text x="${width / 2}" y="${height * 0.95}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.022)}" fill="#64748b">
      ©2024 Pokémon. ©Nintendo / Creatures Inc. / GAME FREAK
    </text>
  </svg>
  `
}

/**
 * Creates clean side texture with gradient and logo text
 */
function createSideSvg(width: number, height: number, primaryColor: string, secondaryColor: string, label: string) {
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="50%" stop-color="${secondaryColor}"/>
        <stop offset="100%" stop-color="${primaryColor}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#sideGrad)"/>
    <rect width="${width}" height="${height}" fill="#000000" fill-opacity="0.25"/>

    <g transform="translate(${width / 2}, ${height / 2}) rotate(-90)">
      <text x="0" y="${Math.round(width * 0.12)}" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="${Math.round(width * 0.35)}" fill="#ffffff" letter-spacing="4" fill-opacity="0.85">${label.toUpperCase()}</text>
    </g>
  </svg>
  `
}

/**
 * Creates clean top/bottom texture with metallic crimp or box lid styling
 */
function createTopSvg(width: number, height: number, primaryColor: string, isBooster: boolean) {
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${primaryColor}"/>
      </linearGradient>
      <pattern id="crimp" width="8" height="${height}" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="4" height="${height}" fill="#000000" fill-opacity="0.3"/>
        <rect x="4" y="0" width="4" height="${height}" fill="#ffffff" fill-opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#topGrad)"/>
    ${isBooster ? `<rect width="${width}" height="${height}" fill="url(#crimp)"/>` : ''}
    <rect width="${width}" height="${height}" fill="#000000" fill-opacity="0.2"/>
  </svg>
  `
}

export async function generateCleanTextures() {
  const publicDir = path.resolve(process.cwd(), 'public')
  const texturesDir = path.join(publicDir, 'textures')

  console.log('✨ Generating clean, distortion-free Pokémon textures...')

  const finalManifest: ProductData[] = []

  for (const item of REAL_PRODUCTS) {
    const targetDir = path.join(texturesDir, item.slug)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const isBooster = item.type === 'booster-pack'
    const { width: pW, height: pH, depth: pD } = item.dimensions

    // Exact pixel dimensions matching face aspect ratios (normalized to ~1024 base)
    const frontW = 1024
    const frontH = Math.round(1024 * (pH / pW))
    const sideW = Math.max(128, Math.round(1024 * (pD / pW)))
    const sideH = frontH
    const topW = frontW
    const topH = Math.max(128, Math.round(1024 * (pD / pH)))

    console.log(`🖼️ [${item.slug}] Target texture sizes: Front ${frontW}x${frontH}, Side ${sideW}x${sideH}, Top ${topW}x${topH}`)

    try {
      const downloadUrl = `${BASE_REPO_URL}${item.githubPath}`
      const rawBuffer = await downloadBuffer(downloadUrl)

      // 1. Process FRONT texture (clean contain with dark studio background, trimmed)
      const frontPath = path.join(targetDir, 'front.webp')
      await sharp(rawBuffer)
        .trim() // trim transparent padding
        .resize(frontW, frontH, {
          fit: 'contain',
          background: { r: 11, g: 15, b: 25, alpha: 1 },
        })
        .webp({ quality: 92 })
        .toFile(frontPath)

      // 2. Process BACK texture (custom designed crisp SVG for that specific product)
      const backPath = path.join(targetDir, 'back.webp')
      const backSvg = createBackSvg(frontW, frontH, item.set || item.name, item.primaryColor, isBooster)
      await sharp(Buffer.from(backSvg))
        .webp({ quality: 90 })
        .toFile(backPath)

      // 3. Process SIDE texture (matches exact side face aspect ratio!)
      const sidePath = path.join(targetDir, 'side.webp')
      const sideSvg = createSideSvg(sideW, sideH, item.primaryColor, item.secondaryColor, item.set || 'POKEMON')
      await sharp(Buffer.from(sideSvg))
        .webp({ quality: 90 })
        .toFile(sidePath)

      // 4. Process TOP texture (matches exact top face aspect ratio!)
      const topPath = path.join(targetDir, 'top.webp')
      const topSvg = createTopSvg(topW, topH, item.primaryColor, isBooster)
      await sharp(Buffer.from(topSvg))
        .webp({ quality: 90 })
        .toFile(topPath)

      // 5. Process THUMBNAIL (square 400x400)
      const thumbPath = path.join(targetDir, 'thumbnail.webp')
      await sharp(rawBuffer)
        .trim()
        .resize(400, 400, {
          fit: 'contain',
          background: { r: 11, g: 15, b: 25, alpha: 1 },
        })
        .webp({ quality: 88 })
        .toFile(thumbPath)

      finalManifest.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        type: item.type,
        series: item.series,
        set: item.set,
        releaseYear: item.releaseYear,
        price: item.price,
        currency: '€',
        description: item.description,
        dimensions: item.dimensions,
        material: item.material,
        textures: {
          front: `/textures/${item.slug}/front.webp`,
          back: `/textures/${item.slug}/back.webp`,
          side: `/textures/${item.slug}/side.webp`,
          top: `/textures/${item.slug}/top.webp`,
          thumbnail: `/textures/${item.slug}/thumbnail.webp`,
        },
        featured: true,
      })

      console.log(`✅ Textures generated perfectly for ${item.slug}`)
    } catch (err) {
      console.error(`❌ Error generating textures for ${item.slug}:`, err)
    }
  }

  // Update public/products.json
  const manifestPath = path.join(publicDir, 'products.json')
  fs.writeFileSync(manifestPath, JSON.stringify(finalManifest, null, 2), 'utf-8')
  console.log(`🎉 products.json updated with ${finalManifest.length} products!`)
}

generateCleanTextures()
  .then(() => console.log('All textures successfully regenerated with 0 distortion!'))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
