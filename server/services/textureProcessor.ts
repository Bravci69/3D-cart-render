import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getDefaultProductConfig } from '../../src/config/product-types.ts'
import type {
  ProductDimensions,
  ProductImageItem,
  ProductTextures,
  ProductType,
  TcgGame,
} from '../../src/types/product.ts'

export interface TextureBuildInput {
  slug: string
  name: string
  game: TcgGame
  type: ProductType
  set?: string
  frontBuffer: Buffer
  backBuffer?: Buffer
  sideBuffer?: Buffer
  topBuffer?: Buffer
  extraGalleryBuffers?: { buffer: Buffer; label: string; angle: ProductImageItem['angle'] }[]
  publicDir?: string
}

export interface TextureBuildResult {
  textures: ProductTextures
  images: ProductImageItem[]
  dimensions: ProductDimensions
}

interface Palette {
  primaryRgb: { r: number; g: number; b: number }
  primaryHex: string
  secondaryHex: string
  darkHex: string
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

/**
 * Extracts dominant & darker studio colors directly from a real product image buffer.
 */
async function extractPalette(buffer: Buffer): Promise<Palette> {
  try {
    const stats = await sharp(buffer).removeAlpha().resize(64, 64, { fit: 'inside' }).stats()
    const [rChan, gChan, bChan] = stats.channels
    const r = rChan?.mean ?? 30
    const g = gChan?.mean ?? 41
    const b = bChan?.mean ?? 59

    // Boost saturation slightly if muted white/gray
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const isNearNeutral = maxC - minC < 18

    const pr = isNearNeutral ? 30 : Math.min(210, r * 0.85)
    const pg = isNearNeutral ? 58 : Math.min(210, g * 0.85)
    const pb = isNearNeutral ? 138 : Math.min(210, b * 0.85)

    return {
      primaryRgb: { r: Math.round(pr * 0.35), g: Math.round(pg * 0.35), b: Math.round(pb * 0.35) },
      primaryHex: rgbToHex(pr, pg, pb),
      secondaryHex: rgbToHex(pr * 0.55, pg * 0.55, pb * 0.55),
      darkHex: rgbToHex(pr * 0.22, pg * 0.22, pb * 0.22),
    }
  } catch {
    return {
      primaryRgb: { r: 15, g: 23, b: 42 },
      primaryHex: '#1e3a8a',
      secondaryHex: '#0f172a',
      darkHex: '#080c16',
    }
  }
}

/**
 * Gently trims solid white or transparent studio padding around a product image.
 */
async function trimStudioPadding(buffer: Buffer): Promise<{ buffer: Buffer; width: number; height: number; hasAlpha: boolean }> {
  try {
    const meta = await sharp(buffer).metadata()
    const hasAlpha = Boolean(meta.hasAlpha)
    const trimmed = await sharp(buffer)
      .trim({ threshold: hasAlpha ? 10 : 18 })
      .toBuffer({ resolveWithObject: true })

    if (trimmed.info.width >= 120 && trimmed.info.height >= 120) {
      return {
        buffer: trimmed.data,
        width: trimmed.info.width,
        height: trimmed.info.height,
        hasAlpha,
      }
    }
    return {
      buffer,
      width: meta.width || 800,
      height: meta.height || 800,
      hasAlpha,
    }
  } catch {
    const meta = await sharp(buffer).metadata().catch(() => ({ width: 800, height: 800, hasAlpha: false }))
    return {
      buffer,
      width: meta.width || 800,
      height: meta.height || 800,
      hasAlpha: Boolean(meta.hasAlpha),
    }
  }
}

function getGameTitle(game: TcgGame): string {
  switch (game) {
    case 'pokemon':
      return 'POKÉMON TRADING CARD GAME'
    case 'magic':
      return 'MAGIC: THE GATHERING'
    case 'one-piece':
      return 'ONE PIECE CARD GAME'
    case 'lol':
      return 'RIFTBOUND · LEAGUE OF LEGENDS'
    default:
      return 'TRADING CARD GAME'
  }
}

/**
 * Generates a subtle color-matched back overlay when no separate back scan exists online,
 * composited over a soft blurred mirror of the real product image so it blends realistically.
 */
async function buildMatchedBackTexture(
  frontCleanBuffer: Buffer,
  width: number,
  height: number,
  palette: Palette,
  name: string,
  game: TcgGame,
  isBooster: boolean
): Promise<Buffer> {
  const blurredBase = await sharp(frontCleanBuffer)
    .resize(width, height, { fit: 'cover' })
    .blur(26)
    .modulate({ brightness: 0.35, saturation: 0.85 })
    .toBuffer()

  const safeTitle = escapeXml(name.slice(0, 48))
  const safeGame = escapeXml(getGameTitle(game))

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="seamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.darkHex}" stop-opacity="0.65"/>
        <stop offset="48%" stop-color="${palette.primaryHex}" stop-opacity="0.35"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.22"/>
        <stop offset="52%" stop-color="${palette.primaryHex}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${palette.darkHex}" stop-opacity="0.65"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#seamGrad)"/>
    <rect x="${Math.round(width * 0.06)}" y="${Math.round(height * 0.06)}" width="${Math.round(width * 0.88)}" height="${Math.round(height * 0.88)}" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>
    ${isBooster ? `<line x1="${Math.round(width / 2)}" y1="0" x2="${Math.round(width / 2)}" y2="${height}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>` : ''}
    <text x="${Math.round(width / 2)}" y="${Math.round(height * 0.24)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.042)}" font-weight="bold" fill="#ffffff" fill-opacity="0.92" letter-spacing="2">${safeGame}</text>
    <text x="${Math.round(width / 2)}" y="${Math.round(height * 0.31)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.032)}" fill="#cbd5e1" fill-opacity="0.88">${safeTitle}</text>
    <g transform="translate(${Math.round(width / 2)}, ${Math.round(height * 0.80)})">
      <rect x="-${Math.round(width * 0.25)}" y="-${Math.round(height * 0.055)}" width="${Math.round(width * 0.5)}" height="${Math.round(height * 0.11)}" rx="8" fill="#ffffff" fill-opacity="0.92"/>
      ${Array.from({ length: 30 })
        .map(
          (_, i) =>
            `<rect x="${-Math.round(width * 0.21) + Math.round((i * width * 0.42) / 30)}" y="-${Math.round(height * 0.038)}" width="${i % 3 === 0 ? 5 : 2}" height="${Math.round(height * 0.055)}" fill="#0f172a"/>`
        )
        .join('')}
      <text x="0" y="${Math.round(height * 0.04)}" text-anchor="middle" font-family="monospace" font-size="${Math.round(width * 0.024)}" fill="#0f172a" font-weight="bold">SEALED COLLECTOR EDITION</text>
    </g>
  </svg>`

  return sharp(blurredBase)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toBuffer()
}

/**
 * Generates side or top panel textures either from a real edge strip or color-matched gradient + bevel seam.
 */
async function buildMatchedEdgeTexture(
  frontCleanBuffer: Buffer,
  width: number,
  height: number,
  palette: Palette,
  isVerticalSide: boolean,
  isBoosterPack: boolean
): Promise<Buffer> {
  if (isBoosterPack) {
    const meta = await sharp(frontCleanBuffer).metadata()
    const fw = meta.width || 600
    const fh = meta.height || 1000
    if (isVerticalSide) {
      const stripW = Math.max(16, Math.floor(fw * 0.05))
      return sharp(frontCleanBuffer)
        .flatten({ background: palette.primaryRgb })
        .extract({ left: 0, top: 0, width: stripW, height: fh })
        .resize(width, height, { fit: 'fill' })
        .webp({ quality: 88 })
        .toBuffer()
    } else {
      const stripH = Math.max(20, Math.floor(fh * 0.07))
      return sharp(frontCleanBuffer)
        .flatten({ background: palette.primaryRgb })
        .extract({ left: 0, top: 0, width: fw, height: stripH })
        .resize(width, height, { fit: 'fill' })
        .webp({ quality: 88 })
        .toBuffer()
    }
  }

  // Non-booster boxes/tins: blurred edge color slice + metallic/cardboard lid seam line
  const meta = await sharp(frontCleanBuffer).metadata()
  const fw = meta.width || 800
  const fh = meta.height || 800

  const sampleRegion = isVerticalSide
    ? { left: 0, top: Math.floor(fh * 0.1), width: Math.max(24, Math.floor(fw * 0.18)), height: Math.max(40, Math.floor(fh * 0.8)) }
    : { left: Math.floor(fw * 0.1), top: 0, width: Math.max(40, Math.floor(fw * 0.8)), height: Math.max(24, Math.floor(fh * 0.18)) }

  const stretchedBase = await sharp(frontCleanBuffer)
    .flatten({ background: palette.primaryRgb })
    .extract(sampleRegion)
    .resize(width, height, { fit: 'fill' })
    .blur(18)
    .modulate({ brightness: 0.72 })
    .toBuffer()

  const seamLine = isVerticalSide
    ? `<line x1="0" y1="${Math.round(height * 0.28)}" x2="${width}" y2="${Math.round(height * 0.28)}" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>`
    : `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="6" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>`

  const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${palette.darkHex}" fill-opacity="0.32"/>
    ${seamLine}
  </svg>`

  return sharp(stretchedBase)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toBuffer()
}

/**
 * Processes all downloaded buffers for a product into WebP 3D textures & crisp 2D gallery images.
 */
export async function processAndSaveProductTextures(input: TextureBuildInput): Promise<TextureBuildResult> {
  const publicDir = input.publicDir || path.resolve(process.cwd(), 'public')
  const targetDir = path.join(publicDir, 'textures', input.slug)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const preset = getDefaultProductConfig(input.type)
  const trimmedFront = await trimStudioPadding(input.frontBuffer)
  const palette = await extractPalette(trimmedFront.buffer)
  const isBooster = input.type === 'booster-pack'

  // Adapt box height proportionally so front images never stretch or show letterbox bars
  const aspect = trimmedFront.width / Math.max(1, trimmedFront.height)
  const baseWidth = preset.dimensions.width
  const adjustedHeight = isBooster
    ? preset.dimensions.height
    : Number(Math.max(1.8, Math.min(4.4, baseWidth / Math.max(0.5, Math.min(2.0, aspect)))).toFixed(2))

  const dimensions: ProductDimensions = {
    ...preset.dimensions,
    width: baseWidth,
    height: adjustedHeight,
  }

  // Exact face pixel dimensions matching 3D face proportions
  const frontW = 1024
  const frontH = Math.round(1024 * (dimensions.height / dimensions.width))
  const sideW = Math.max(160, Math.round(1024 * (dimensions.depth / dimensions.width)))
  const sideH = frontH
  const topW = frontW
  const topH = Math.max(160, Math.round(1024 * (dimensions.depth / dimensions.height)))

  // 1. Save crisp 2D Gallery images (preserving clean transparency for cutouts)
  const galleryItems: ProductImageItem[] = []
  const gallery0File = 'gallery-0.webp'
  await sharp(trimmedFront.buffer)
    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 92 })
    .toFile(path.join(targetDir, gallery0File))
  galleryItems.push({
    url: `/textures/${input.slug}/${gallery0File}`,
    label: 'Hlavný pohľad',
    angle: 'front',
  })

  if (input.backBuffer) {
    const trimmedBack = await trimStudioPadding(input.backBuffer)
    const backGalleryFile = 'gallery-1.webp'
    await sharp(trimmedBack.buffer)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, backGalleryFile))
    galleryItems.push({
      url: `/textures/${input.slug}/${backGalleryFile}`,
      label: 'Zadná strana',
      angle: 'back',
    })
  }

  if (input.extraGalleryBuffers && input.extraGalleryBuffers.length > 0) {
    let idx = galleryItems.length
    for (const extra of input.extraGalleryBuffers.slice(0, 4)) {
      const trimmedExtra = await trimStudioPadding(extra.buffer)
      const fileName = `gallery-${idx}.webp`
      await sharp(trimmedExtra.buffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(path.join(targetDir, fileName))
      galleryItems.push({
        url: `/textures/${input.slug}/${fileName}`,
        label: extra.label,
        angle: extra.angle,
      })
      idx++
    }
  }

  // 2. Process 3D Front texture (fill cleanly with matched studio backdrop if alpha padding remains)
  const frontTexPipeline = trimmedFront.hasAlpha
    ? sharp(trimmedFront.buffer).flatten({ background: palette.primaryRgb })
    : sharp(trimmedFront.buffer)

  await frontTexPipeline
    .resize(frontW, frontH, {
      fit: isBooster ? 'fill' : 'contain',
      background: palette.primaryRgb,
    })
    .webp({ quality: 92 })
    .toFile(path.join(targetDir, 'front.webp'))

  // 3. Process 3D Back texture (real back scan if found, else color-matched studio back)
  if (input.backBuffer) {
    const trimmedBack = await trimStudioPadding(input.backBuffer)
    await sharp(trimmedBack.buffer)
      .flatten({ background: palette.primaryRgb })
      .resize(frontW, frontH, {
        fit: isBooster ? 'fill' : 'contain',
        background: palette.primaryRgb,
      })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'back.webp'))
  } else {
    const backBuf = await buildMatchedBackTexture(trimmedFront.buffer, frontW, frontH, palette, input.name, input.game, isBooster)
    fs.writeFileSync(path.join(targetDir, 'back.webp'), backBuf)
  }

  // 4. Process 3D Side texture
  if (input.sideBuffer) {
    await sharp(input.sideBuffer)
      .flatten({ background: palette.primaryRgb })
      .resize(sideW, sideH, { fit: 'fill' })
      .webp({ quality: 88 })
      .toFile(path.join(targetDir, 'side.webp'))
  } else {
    const sideBuf = await buildMatchedEdgeTexture(trimmedFront.buffer, sideW, sideH, palette, true, isBooster)
    fs.writeFileSync(path.join(targetDir, 'side.webp'), sideBuf)
  }

  // 5. Process 3D Top texture
  if (input.topBuffer) {
    await sharp(input.topBuffer)
      .flatten({ background: palette.primaryRgb })
      .resize(topW, topH, { fit: 'fill' })
      .webp({ quality: 88 })
      .toFile(path.join(targetDir, 'top.webp'))
  } else {
    const topBuf = await buildMatchedEdgeTexture(trimmedFront.buffer, topW, topH, palette, false, isBooster)
    fs.writeFileSync(path.join(targetDir, 'top.webp'), topBuf)
  }

  // 6. Thumbnail (420x420 crisp transparent WebP for 2D grid cards)
  await sharp(trimmedFront.buffer)
    .resize(420, 420, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toFile(path.join(targetDir, 'thumbnail.webp'))

  return {
    dimensions,
    images: galleryItems,
    textures: {
      front: `/textures/${input.slug}/front.webp`,
      back: `/textures/${input.slug}/back.webp`,
      side: `/textures/${input.slug}/side.webp`,
      top: `/textures/${input.slug}/top.webp`,
      thumbnail: `/textures/${input.slug}/thumbnail.webp`,
    },
  }
}
