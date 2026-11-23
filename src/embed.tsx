import { createRoot } from 'react-dom/client'
import { ProductViewer } from './components/ProductViewer.tsx'
import { ProductDisplay } from './components/ProductDisplay.tsx'
import { ProductGallery } from './components/ProductGallery.tsx'
import { productService } from './services/productService.ts'
import type { ProductData } from './types/product.ts'
import './index.css'

export { ProductViewer, ProductDisplay, ProductGallery, productService }

/**
 * Universal Embed Runner:
 * Automatically discovers all elements matching `[data-cardcatcher-3d]` or `[data-cardcatcher-gallery]`
 * and mounts the 3D viewer.
 */
export function initCardCatcherEmbed() {
  // 1. Single Product Viewers
  const productContainers = document.querySelectorAll<HTMLElement>('[data-cardcatcher-3d]')
  productContainers.forEach(async (el) => {
    const slug = el.getAttribute('data-product-slug') || el.getAttribute('data-product')
    const name = el.getAttribute('data-product-name')

    let product: ProductData | null = null
    if (slug) {
      product = await productService.getBySlug(slug)
    }
    if (!product && name) {
      product = await productService.matchByName(name)
    }

    if (product) {
      const root = createRoot(el)
      root.render(<ProductDisplay product={product} />)
    }
  })

  // 2. Full Gallery Viewers
  const galleryContainers = document.querySelectorAll<HTMLElement>('[data-cardcatcher-gallery]')
  galleryContainers.forEach(async (el) => {
    const products = await productService.getAll()
    const root = createRoot(el)
    root.render(<ProductGallery products={products} />)
  })
}

// Auto-run when DOM is ready
if (typeof window !== 'undefined') {
  ;(window as unknown as { CardCatcher3D: unknown }).CardCatcher3D = {
    init: initCardCatcherEmbed,
    ProductViewer,
    ProductDisplay,
    ProductGallery,
    productService,
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardCatcherEmbed)
  } else {
    initCardCatcherEmbed()
  }
}
