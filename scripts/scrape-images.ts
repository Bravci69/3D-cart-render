import fs from 'node:fs'
import path from 'node:path'
import { processProductImage } from './process-textures.ts'

export interface ScrapeTarget {
  name: string
  slug: string
  imageUrl: string
  type: 'booster-pack' | 'booster-box' | 'elite-trainer-box' | 'tin'
}

/**
 * Downloads an image from a URL and saves it
 */
export async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      return false
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const dir = path.dirname(destPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(destPath, buffer)
    return true
  } catch (err) {
    console.error(`Error downloading image from ${url}:`, err)
    return false
  }
}

/**
 * Scrapes or imports Pokemon images and automatically builds 3D textures
 */
export async function ingestPokemonProduct(target: ScrapeTarget) {
  const rawDir = path.resolve(process.cwd(), 'raw-images', target.slug)
  const textureDir = path.resolve(process.cwd(), 'public', 'textures', target.slug)

  console.log(`Ingesting product: ${target.name} (${target.slug})...`)
  const rawFrontPath = path.join(rawDir, 'front_raw.png')

  const downloaded = await downloadImage(target.imageUrl, rawFrontPath)
  if (!downloaded) {
    console.warn(`Could not download image for ${target.slug}`)
    return
  }

  // Process front texture
  await processProductImage(rawFrontPath, path.join(textureDir, 'front.webp'), {
    width: 1024,
    height: 1536,
    fit: 'contain',
    quality: 90,
  })

  // Create thumbnail
  await processProductImage(rawFrontPath, path.join(textureDir, 'thumbnail.webp'), {
    width: 400,
    height: 400,
    fit: 'contain',
    quality: 85,
  })

  console.log(`✅ Successfully processed and mapped textures for ${target.slug}`)
}
