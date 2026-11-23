import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createFoilCrimpTexture, createSideStripTexture } from './process-textures.ts'
import type { ProductData } from '../src/types/product.ts'

const PRODUCTS_METADATA: ProductData[] = [
  {
    id: 'pkm-151-booster',
    name: 'Pokémon 151 Booster Pack',
    slug: 'pokemon-151-booster',
    type: 'booster-pack',
    series: 'Scarlet & Violet',
    set: 'Pokémon 151',
    releaseYear: 2023,
    price: 6.99,
    currency: '€',
    description: 'Návrat k originálnym 151 Pokémonom! Fóliový booster pack obsahujúci 10 náhodných kariet s prémiovým holo odleskom.',
    dimensions: { width: 2.1, height: 3.3, depth: 0.14, bevelRadius: 0.02 },
    material: { roughness: 0.2, metalness: 0.45, clearcoat: 0.9, clearcoatRoughness: 0.1 },
    textures: {
      front: '/textures/pokemon-151-booster/front.webp',
      back: '/textures/pokemon-151-booster/back.webp',
      side: '/textures/pokemon-151-booster/side.webp',
      top: '/textures/pokemon-151-booster/top.webp',
      thumbnail: '/textures/pokemon-151-booster/thumbnail.webp',
    },
    featured: true,
  },
  {
    id: 'pkm-sv-paldea-booster',
    name: 'Paldea Evolved Booster Pack',
    slug: 'pokemon-paldea-evolved-booster',
    type: 'booster-pack',
    series: 'Scarlet & Violet',
    set: 'Paldea Evolved',
    releaseYear: 2023,
    price: 5.49,
    currency: '€',
    description: 'Paldea Evolved booster balíček s Meowscarada, Skeledirge a Quaquaval ex.',
    dimensions: { width: 2.1, height: 3.3, depth: 0.14, bevelRadius: 0.02 },
    material: { roughness: 0.22, metalness: 0.4, clearcoat: 0.85, clearcoatRoughness: 0.15 },
    textures: {
      front: '/textures/pokemon-paldea-evolved-booster/front.webp',
      back: '/textures/pokemon-paldea-evolved-booster/back.webp',
      side: '/textures/pokemon-paldea-evolved-booster/side.webp',
      top: '/textures/pokemon-paldea-evolved-booster/top.webp',
      thumbnail: '/textures/pokemon-paldea-evolved-booster/thumbnail.webp',
    },
    featured: true,
  },
  {
    id: 'pkm-obsidian-flames-box',
    name: 'Obsidian Flames Booster Box (36 balíčkov)',
    slug: 'pokemon-obsidian-flames-box',
    type: 'booster-box',
    series: 'Scarlet & Violet',
    set: 'Obsidian Flames',
    releaseYear: 2023,
    price: 139.99,
    currency: '€',
    description: 'Veľký booster displej box obsahujúci 36 booster balíčkov Obsidian Flames s temným Tera Charizardom ex.',
    dimensions: { width: 3.5, height: 2.8, depth: 2.2, bevelRadius: 0.05 },
    material: { roughness: 0.45, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.3 },
    textures: {
      front: '/textures/pokemon-obsidian-flames-box/front.webp',
      back: '/textures/pokemon-obsidian-flames-box/back.webp',
      side: '/textures/pokemon-obsidian-flames-box/side.webp',
      top: '/textures/pokemon-obsidian-flames-box/top.webp',
      thumbnail: '/textures/pokemon-obsidian-flames-box/thumbnail.webp',
    },
    featured: true,
  },
  {
    id: 'pkm-crown-zenith-etb',
    name: 'Crown Zenith Elite Trainer Box',
    slug: 'pokemon-crown-zenith-etb',
    type: 'elite-trainer-box',
    series: 'Sword & Shield',
    set: 'Crown Zenith',
    releaseYear: 2023,
    price: 59.99,
    currency: '€',
    description: 'Prémiový Elite Trainer Box s Lucario VSTAR promo kartou, 10 boostermi, obalmi a herným príslušenstvom.',
    dimensions: { width: 3.2, height: 3.4, depth: 1.9, bevelRadius: 0.06 },
    material: { roughness: 0.32, metalness: 0.18, clearcoat: 0.55, clearcoatRoughness: 0.2 },
    textures: {
      front: '/textures/pokemon-crown-zenith-etb/front.webp',
      back: '/textures/pokemon-crown-zenith-etb/back.webp',
      side: '/textures/pokemon-crown-zenith-etb/side.webp',
      top: '/textures/pokemon-crown-zenith-etb/top.webp',
      thumbnail: '/textures/pokemon-crown-zenith-etb/thumbnail.webp',
    },
    featured: true,
  },
  {
    id: 'pkm-charizard-tin',
    name: 'Charizard ex Collector Tin',
    slug: 'pokemon-charizard-tin',
    type: 'tin',
    series: 'Scarlet & Violet',
    set: 'Paldean Fates',
    releaseYear: 2024,
    price: 27.99,
    currency: '€',
    description: 'Zberateľská plechová krabička s fóliovou promo kartou Charizard ex a 4 boostermi.',
    dimensions: { width: 2.7, height: 3.3, depth: 1.4, bevelRadius: 0.15 },
    material: { roughness: 0.15, metalness: 0.85, clearcoat: 0.9, clearcoatRoughness: 0.1 },
    textures: {
      front: '/textures/pokemon-charizard-tin/front.webp',
      back: '/textures/pokemon-charizard-tin/back.webp',
      side: '/textures/pokemon-charizard-tin/side.webp',
      top: '/textures/pokemon-charizard-tin/top.webp',
      thumbnail: '/textures/pokemon-charizard-tin/thumbnail.webp',
    },
    featured: false,
  },
  {
    id: 'pkm-paradox-rift-blister',
    name: 'Paradox Rift 3-Booster Blister',
    slug: 'pokemon-paradox-rift-blister',
    type: 'blister-pack',
    series: 'Scarlet & Violet',
    set: 'Paradox Rift',
    releaseYear: 2023,
    price: 15.99,
    currency: '€',
    description: 'Trojitý blister pack s 3 booster balíčkami a špeciálnou promo kartou Arctibax.',
    dimensions: { width: 2.5, height: 4.1, depth: 0.3, bevelRadius: 0.04 },
    material: { roughness: 0.3, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25 },
    textures: {
      front: '/textures/pokemon-paradox-rift-blister/front.webp',
      back: '/textures/pokemon-paradox-rift-blister/back.webp',
      side: '/textures/pokemon-paradox-rift-blister/side.webp',
      top: '/textures/pokemon-paradox-rift-blister/top.webp',
      thumbnail: '/textures/pokemon-paradox-rift-blister/thumbnail.webp',
    },
    featured: false,
  },
]

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

function generateBoosterFrontSvg(title: string, subtitle: string, gradientA: string, gradientB: string, accentColor: string, iconSymbol = '⚡') {
  const safeTitle = escapeXml(title)
  const safeSubtitle = escapeXml(subtitle)
  return `
  <svg width="1024" height="1536" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientA}"/>
        <stop offset="45%" stop-color="${gradientB}"/>
        <stop offset="100%" stop-color="${gradientA}"/>
      </linearGradient>
      <radialGradient id="holoGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
        <stop offset="50%" stop-color="${accentColor}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="foilRib" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
        <stop offset="10%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="90%" stop-color="#000000" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
      </linearGradient>
    </defs>

    <!-- Base Foil -->
    <rect width="1024" height="1536" fill="url(#bg)"/>
    <rect width="1024" height="1536" fill="url(#holoGlow)"/>
    <rect width="1024" height="1536" fill="url(#foilRib)"/>

    <!-- Foil Crimp Lines Top & Bottom -->
    <rect x="0" y="0" width="1024" height="60" fill="#ffffff" fill-opacity="0.15"/>
    <line x1="0" y1="60" x2="1024" y2="60" stroke="#ffffff" stroke-opacity="0.4" stroke-width="3"/>
    <rect x="0" y="1476" width="1024" height="60" fill="#000000" fill-opacity="0.25"/>
    <line x1="0" y1="1476" x2="1024" y2="1476" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>

    <!-- Top Pokemon Banner -->
    <g transform="translate(512, 180)">
      <rect x="-380" y="-70" width="760" height="120" rx="30" fill="#ffcb05" stroke="#2a75bb" stroke-width="12"/>
      <text x="0" y="15" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="82" font-weight="900" fill="#1d2c5e" letter-spacing="4">POKÉMON</text>
      <text x="0" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="8">TRADING CARD GAME</text>
    </g>

    <!-- Central Hero Badge / Artwork placeholder -->
    <g transform="translate(512, 680)">
      <circle cx="0" cy="0" r="320" fill="#ffffff" fill-opacity="0.1" stroke="${accentColor}" stroke-width="8"/>
      <circle cx="0" cy="0" r="280" fill="url(#holoGlow)"/>
      <text x="0" y="80" text-anchor="middle" font-size="220">${iconSymbol}</text>
    </g>

    <!-- Set Title -->
    <g transform="translate(512, 1120)">
      <text x="0" y="0" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="76" font-weight="bold" fill="#ffffff" stroke="#000000" stroke-width="4" letter-spacing="2">${safeTitle}</text>
      <text x="0" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${accentColor}" letter-spacing="4">${safeSubtitle}</text>
    </g>

    <!-- Bottom details -->
    <g transform="translate(512, 1380)">
      <rect x="-240" y="-35" width="480" height="70" rx="35" fill="#0f172a" fill-opacity="0.85" stroke="#ffffff" stroke-width="2"/>
      <text x="0" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#f8fafc">10 ADDITIONAL GAME CARDS</text>
    </g>
  </svg>
  `
}

function generateBackSvg(title: string, bgColor = '#0f172a') {
  const safeTitle = escapeXml(title)
  return `
  <svg width="1024" height="1536" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1536" fill="${bgColor}"/>
    
    <g transform="translate(512, 160)">
      <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#94a3b8">OFFICIAL LICENSED PRODUCT</text>
      <text x="0" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff">${safeTitle}</text>
    </g>

    <g transform="translate(512, 450)">
      <rect x="-420" y="-120" width="840" height="420" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="-380" y="-50" font-family="Arial, sans-serif" font-size="26" fill="#cbd5e1" font-weight="bold">Each booster pack contains:</text>
      <text x="-380" y="0" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">• 10 Pokémon TCG cards</text>
      <text x="-380" y="45" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">• 1 Basic Energy card</text>
      <text x="-380" y="90" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">• 1 Code card for Pokémon TCG Live</text>
      <text x="-380" y="150" font-family="Arial, sans-serif" font-size="22" fill="#64748b">Cards vary by pack. Packs may contain cards with special holographic finishes.</text>
      <text x="-380" y="210" font-family="Arial, sans-serif" font-size="20" fill="#ef4444">⚠️ WARNING: CHOKING HAZARD - Small parts. Not for children under 3 years.</text>
    </g>

    <!-- Barcode Box -->
    <g transform="translate(512, 1200)">
      <rect x="-260" y="-90" width="520" height="180" rx="12" fill="#ffffff"/>
      <!-- Barcode simulation lines -->
      <g transform="translate(-220, -50)">
        ${Array.from({ length: 48 })
          .map((_, i) => `<rect x="${i * 9}" y="0" width="${i % 3 === 0 ? 5 : 2}" height="80" fill="#000000"/>`)
          .join('')}
      </g>
      <text x="0" y="65" text-anchor="middle" font-family="Courier, monospace" font-size="26" font-weight="bold" fill="#000000">0 820650 853219</text>
    </g>

    <text x="512" y="1420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#64748b">©2024 Pokémon. ©1995-2024 Nintendo / Creatures Inc. / GAME FREAK inc.</text>
  </svg>
  `
}

export async function generateAllSampleAssets() {
  const publicDir = path.resolve(process.cwd(), 'public')
  const texturesDir = path.join(publicDir, 'textures')

  console.log(`Generating textures into ${texturesDir}...`)

  const productsConfig = [
    {
      slug: 'pokemon-151-booster',
      title: 'POKÉMON 151',
      subtitle: 'SCARLET & VIOLET',
      gradA: '#3b0764',
      gradB: '#a855f7',
      accent: '#facc15',
      symbol: '🌟',
      sideColor: '#7e22ce',
    },
    {
      slug: 'pokemon-paldea-evolved-booster',
      title: 'PALDEA EVOLVED',
      subtitle: 'SCARLET & VIOLET',
      gradA: '#042f2e',
      gradB: '#0d9488',
      accent: '#38bdf8',
      symbol: '🍃',
      sideColor: '#0f766e',
    },
    {
      slug: 'pokemon-obsidian-flames-box',
      title: 'OBSIDIAN FLAMES',
      subtitle: 'BOOSTER DISPLAY BOX',
      gradA: '#450a0a',
      gradB: '#b91c1c',
      accent: '#f97316',
      symbol: '🔥',
      sideColor: '#991b1b',
    },
    {
      slug: 'pokemon-crown-zenith-etb',
      title: 'CROWN ZENITH',
      subtitle: 'ELITE TRAINER BOX',
      gradA: '#172554',
      gradB: '#2563eb',
      accent: '#fbbf24',
      symbol: '👑',
      sideColor: '#1d4ed8',
    },
    {
      slug: 'pokemon-charizard-tin',
      title: 'CHARIZARD EX',
      subtitle: 'COLLECTOR TIN',
      gradA: '#431407',
      gradB: '#ea580c',
      accent: '#fde047',
      symbol: '🐉',
      sideColor: '#c2410c',
    },
    {
      slug: 'pokemon-paradox-rift-blister',
      title: 'PARADOX RIFT',
      subtitle: '3-PACK BLISTER',
      gradA: '#1e1b4b',
      gradB: '#6366f1',
      accent: '#a855f7',
      symbol: '⚡',
      sideColor: '#4f46e5',
    },
  ]

  for (const p of productsConfig) {
    const targetDir = path.join(texturesDir, p.slug)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // 1. Front Texture
    const frontSvg = generateBoosterFrontSvg(p.title, p.subtitle, p.gradA, p.gradB, p.accent, p.symbol)
    await sharp(Buffer.from(frontSvg))
      .resize(1024, 1536, { fit: 'fill' })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'front.webp'))

    // 2. Back Texture
    const backSvg = generateBackSvg(`${p.title} ${p.subtitle}`, p.gradA)
    await sharp(Buffer.from(backSvg))
      .resize(1024, 1536, { fit: 'fill' })
      .webp({ quality: 85 })
      .toFile(path.join(targetDir, 'back.webp'))

    // 3. Side Texture
    const sideBuf = await createSideStripTexture(128, 1024, p.sideColor, p.gradB)
    await sharp(sideBuf).toFile(path.join(targetDir, 'side.webp'))

    // 4. Top/Crimp Texture
    const topBuf = await createFoilCrimpTexture(512, 128, p.accent)
    await sharp(topBuf).toFile(path.join(targetDir, 'top.webp'))

    // 5. Thumbnail (Square 400x400)
    await sharp(Buffer.from(frontSvg))
      .resize(400, 400, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .webp({ quality: 85 })
      .toFile(path.join(targetDir, 'thumbnail.webp'))

    console.log(`✓ Textures created for ${p.slug}`)
  }

  // Write products.json
  const manifestPath = path.join(publicDir, 'products.json')
  fs.writeFileSync(manifestPath, JSON.stringify(PRODUCTS_METADATA, null, 2), 'utf-8')
  console.log(`✓ Products manifest written to ${manifestPath}`)
}

generateAllSampleAssets()
  .then(() => console.log('🎉 All sample assets successfully generated!'))
  .catch((err) => {
    console.error('Error generating assets:', err)
    process.exit(1)
  })
