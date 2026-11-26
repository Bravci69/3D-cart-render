import sharp from 'sharp'
import type { ProductType } from '../../src/types/product.ts'

export interface WebImageCandidate {
  url: string
  score: number
  sourceDomain: string
}

export interface ValidatedImage {
  url: string
  buffer: Buffer
  width: number
  height: number
  format: string
}

const PREFERRED_DOMAINS = [
  'tcgplayer-cdn.tcgplayer.com',
  'assets.pokemon.com',
  'raw.githubusercontent.com',
  'en.onepiece-cardgame.com',
  'media.wizards.com',
  'magic.wizards.com',
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'i.ebayimg.com',
]

const BLOCKED_DOMAINS = [
  'shutterstock.com',
  'istockphoto.com',
  'gettyimages.com',
  'alamy.com',
  'dreamstime.com',
  '123rf.com',
  'depositphotos.com',
  'vectorstock.com',
  'pinterest.',
  'ytimg.com',
  'youtube.com',
  'tiktok.com',
  'facebook.com',
  'instagram.com',
  'spellroogaming.com.au',
]

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

function scoreTypeRelevanceInUrl(urlLower: string, targetType?: ProductType, requireBackHint = false): number {
  let bonus = 0

  if (requireBackHint) {
    if (/(back|rear|reverse|zadn)/i.test(urlLower)) bonus += 65
    else bonus -= 25
  }

  if (!targetType) return bonus

  switch (targetType) {
    case 'booster-box':
      if (/booster[-_ ]?box|display[-_ ]?box|play[-_ ]?booster[-_ ]?box|display/i.test(urlLower)) bonus += 55
      if (/booster[-_ ]?pack(?!s)|\bsingle[-_ ]?pack|\bsleeved/i.test(urlLower)) bonus -= 75
      break
    case 'elite-trainer-box':
      if (/elite[-_ ]?trainer|top[-_ ]?trainer|\betb\b/i.test(urlLower)) bonus += 55
      if (/poster[-_ ]?collection|binder[-_ ]?collection|booster[-_ ]?bundle|mini[-_ ]?tin/i.test(urlLower)) bonus -= 85
      break
    case 'booster-bundle':
      if (/bundle/i.test(urlLower)) bonus += 50
      if (/elite[-_ ]?trainer|display/i.test(urlLower)) bonus -= 70
      break
    case 'tin':
    case 'mini-tin':
      if (/\btin\b|\btins\b|mini[-_ ]?tin/i.test(urlLower)) bonus += 45
      if (/booster[-_ ]?pack|booster[-_ ]?box|elite[-_ ]?trainer/i.test(urlLower)) bonus -= 75
      break
    case 'booster-pack':
      if (/booster[-_ ]?pack|packshot|sleev|wrap/i.test(urlLower)) bonus += 40
      if (/booster[-_ ]?box|display|elite[-_ ]?trainer/i.test(urlLower)) bonus -= 60
      break
    case 'starter-deck':
      if (/deck|commander/i.test(urlLower)) bonus += 45
      if (/booster[-_ ]?box|play[-_ ]?booster/i.test(urlLower)) bonus -= 60
      break
    default:
      break
  }

  return bonus
}

/**
 * Queries Bing Image Search HTML (no API key required) and scores candidates against product type & angle.
 */
export async function searchBingImages(
  query: string,
  limit = 16,
  options: { targetType?: ProductType; requireBackHint?: boolean } = {}
): Promise<WebImageCandidate[]> {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3&first=1`
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000)

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    clearTimeout(timer)

    if (!res.ok) return []
    const html = await res.text()

    const rawMatches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g)].map((m) => m[1])
    const seen = new Set<string>()
    const candidates: WebImageCandidate[] = []

    for (let i = 0; i < rawMatches.length; i++) {
      const url = rawMatches[i]
      if (!url || seen.has(url)) continue
      seen.add(url)

      let domain = ''
      try {
        domain = new URL(url).hostname.toLowerCase()
      } catch {
        continue
      }

      if (BLOCKED_DOMAINS.some((b) => domain.includes(b))) continue
      if (/\.(svg|gif)(\?|$)/i.test(url)) continue

      const lowerUrl = url.toLowerCase()
      let score = 100 - i * 2

      if (PREFERRED_DOMAINS.some((d) => domain.includes(d) || lowerUrl.includes('/cdn/shop/'))) {
        score += 28
      }
      if (/\.(png|webp)(\?|$)/i.test(lowerUrl)) score += 6

      score += scoreTypeRelevanceInUrl(lowerUrl, options.targetType, options.requireBackHint)

      if (options.requireBackHint && score < 60) {
        continue
      }

      candidates.push({ url, score, sourceDomain: domain })
    }

    return candidates.sort((a, b) => b.score - a.score).slice(0, limit)
  } catch {
    return []
  }
}

export async function fetchValidImageBuffer(
  url: string,
  options: { timeoutMs?: number; minWidth?: number; minHeight?: number } = {}
): Promise<ValidatedImage | null> {
  const { timeoutMs = 8000, minWidth = 240, minHeight = 240 } = options
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'image/webp,image/apng,image/png,image/jpeg,image/*,*/*;q=0.8',
      },
    })
    clearTimeout(timer)

    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('svg')) {
      return null
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 4000) return null

    const meta = await sharp(buffer).metadata()
    const width = meta.width || 0
    const height = meta.height || 0
    if (width < minWidth || height < minHeight) return null

    return {
      url,
      buffer,
      width,
      height,
      format: meta.format || 'unknown',
    }
  } catch {
    return null
  }
}

export async function downloadFirstValidImages(
  urls: string[],
  maxResults = 1,
  minSize = 240
): Promise<ValidatedImage[]> {
  const valid: ValidatedImage[] = []
  const seenUrls = new Set<string>()
  const seenSizes = new Set<string>()

  for (const url of urls) {
    if (!url || seenUrls.has(url)) continue
    seenUrls.add(url)

    const img = await fetchValidImageBuffer(url, { minWidth: minSize, minHeight: minSize })
    if (!img) continue

    const sig = `${img.width}x${img.height}:${img.buffer.length}`
    if (seenSizes.has(sig)) continue
    seenSizes.add(sig)

    valid.push(img)
    if (valid.length >= maxResults) break
  }

  return valid
}
