import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

export interface TextureProcessOptions {
  inputDir: string
  outputDir: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Creates ribbed foil crimp texture (for booster pack top & bottom seal)
 */
export async function createFoilCrimpTexture(width = 512, height = 128, baseColor = '#e2e8f0'): Promise<Buffer> {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${baseColor}" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="100%" stop-color="${baseColor}" stop-opacity="0.8"/>
        </linearGradient>
        <pattern id="crimp" width="8" height="${height}" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="${height}" fill="#1e293b" fill-opacity="0.25"/>
          <rect x="4" y="0" width="4" height="${height}" fill="#ffffff" fill-opacity="0.35"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#metal)"/>
      <rect width="${width}" height="${height}" fill="url(#crimp)"/>
    </svg>
  `
  return sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer()
}

/**
 * Creates side strip texture derived from dominant colors or pattern
 */
export async function createSideStripTexture(width = 128, height = 1024, primaryColor = '#3b82f6', secondaryColor = '#1d4ed8'): Promise<Buffer> {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="50%" stop-color="${secondaryColor}"/>
          <stop offset="100%" stop-color="${primaryColor}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" stroke-dasharray="8 8"/>
    </svg>
  `
  return sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer()
}

/**
 * Optimizes an image for 3D web textures
 */
export async function processProductImage(
  inputBufferOrPath: string | Buffer,
  outputPath: string,
  options: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'contain' | 'fill' } = {}
) {
  const { width = 1024, height = 1024, quality = 85, fit = 'contain' } = options

  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  await sharp(inputBufferOrPath)
    .resize(width, height, {
      fit,
      background: { r: 15, g: 23, b: 42, alpha: 1 },
    })
    .webp({ quality })
    .toFile(outputPath)
}

/**
 * Main batch runner
 */
export async function processAllTextures(options: TextureProcessOptions) {
  const { inputDir, outputDir, maxWidth = 1024, maxHeight = 1024, quality = 85 } = options

  if (!fs.existsSync(inputDir)) {
    console.log(`Input dir ${inputDir} does not exist yet. Creating...`)
    fs.mkdirSync(inputDir, { recursive: true })
    return
  }

  const entries = fs.readdirSync(inputDir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const productSlug = entry.name
      const productInputDir = path.join(inputDir, productSlug)
      const productOutputDir = path.join(outputDir, productSlug)

      console.log(`Processing textures for product: ${productSlug}`)
      const files = fs.readdirSync(productInputDir)

      for (const file of files) {
        if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue
        const inPath = path.join(productInputDir, file)
        const nameWithoutExt = path.parse(file).name
        const outPath = path.join(productOutputDir, `${nameWithoutExt}.webp`)

        await processProductImage(inPath, outPath, {
          width: maxWidth,
          height: maxHeight,
          quality,
        })
      }
    }
  }

  console.log('✅ Texture processing completed.')
}
