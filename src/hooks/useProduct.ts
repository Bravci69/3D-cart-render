import { useState, useEffect } from 'react'
import type { ProductData } from '../types/product.ts'
import { productService } from '../services/productService.ts'

export function useProduct(slugOrName: string) {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchProduct = async () => {
      try {
        let item = await productService.getBySlug(slugOrName)
        if (!item) {
          item = await productService.matchByName(slugOrName)
        }
        if (mounted) {
          setProduct(item)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Chyba načítavania')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (slugOrName) {
      fetchProduct()
    } else {
      setLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [slugOrName])

  return { product, loading, error }
}
