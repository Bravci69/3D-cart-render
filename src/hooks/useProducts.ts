import { useState, useEffect } from 'react'
import type { ProductData, ProductType } from '../types/product.ts'
import { productService } from '../services/productService.ts'

export function useProducts(filterType?: ProductType | 'all') {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchItems = async () => {
      try {
        let data: ProductData[]
        if (filterType && filterType !== 'all') {
          data = await productService.getByType(filterType)
        } else {
          data = await productService.getAll()
        }
        if (mounted) {
          setProducts(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Chyba načítavania produktov')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchItems()

    return () => {
      mounted = false
    }
  }, [filterType])

  return { products, loading, error, setProducts }
}
