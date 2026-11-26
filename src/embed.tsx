import { createRoot } from 'react-dom/client'
import { ProductDisplay } from './components/ProductDisplay.tsx'
import { ProductGallery } from './components/ProductGallery.tsx'
import { ProductMediaView } from './components/ProductMediaView.tsx'
import { ProductViewer } from './components/ProductViewer.tsx'
import { productService } from './services/productService.ts'
import type { ProductData } from './types/product.ts'
import './index.css'

export { ProductViewer, ProductDisplay, ProductMediaView, ProductGallery, productService }

/**
 * Universal Embed Runner for WordPress / WooCommerce & custom e-shops:
 * Discovers elements matching `[data-cardcatcher-3d]` or `[data-cardcatcher-gallery]`
 * and renders product photos + 3D toggle button seamlessly.
 */
export function initCardCatcherEmbed() {
  const productContainers = document.querySelectorAll<HTMLElement>('[data-cardcatcher-3d]')
  productContainers.forEach(async (el) => {
    if (el.dataset.cardcatcherMounted === 'true') return
    el.dataset.cardcatcherMounted = 'true'

    const apiBase = el.getAttribute('data-api-url')
    if (apiBase) {
      productService.setApiBaseUrl(apiBase)
    }

    const slug = el.getAttribute('data-product-slug') || el.getAttribute('data-product')
    const name = el.getAttribute('data-product-name')
    const defaultView = el.getAttribute('data-default-view') === '3d' ? '3d' : 'images'
    const height = el.getAttribute('data-height') || '520px'

    let product: ProductData | null = null
    if (slug) {
      product = await productService.getBySlug(slug)
    }
    if (!product && name) {
      product = await productService.matchByName(name)
    }

    if (product) {
      const root = createRoot(el)
      root.render(<ProductMediaView product={product} defaultMode={defaultView} height={height} />)
    }
  })

  const galleryContainers = document.querySelectorAll<HTMLElement>('[data-cardcatcher-gallery]')
  galleryContainers.forEach(async (el) => {
    if (el.dataset.cardcatcherMounted === 'true') return
    el.dataset.cardcatcherMounted = 'true'

    const apiBase = el.getAttribute('data-api-url')
    if (apiBase) {
      productService.setApiBaseUrl(apiBase)
    }

    const products = await productService.getAll()
    const root = createRoot(el)
    root.render(<ProductGallery products={products} />)
  })
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { CardCatcher3D: unknown }).CardCatcher3D = {
    init: initCardCatcherEmbed,
    ProductViewer,
    ProductDisplay,
    ProductMediaView,
    ProductGallery,
    productService,
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardCatcherEmbed)
  } else {
    initCardCatcherEmbed()
  }
}
