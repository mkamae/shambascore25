import { useState, useEffect, useCallback } from 'react'
import { creatorsApi, productsApi, salesApi, analyticsApi } from '../lib/database'
import type { Database } from '../lib/database.types'

type Creator = Database['public']['Tables']['creators']['Row']
type CreatorInsert = Database['public']['Tables']['creators']['Insert']
type CreatorUpdate = Database['public']['Tables']['creators']['Update']

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

type Sale = Database['public']['Tables']['sales']['Row']
type SaleInsert = Database['public']['Tables']['sales']['Insert']

type Analytics = Database['public']['Tables']['analytics']['Row']
type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert']

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true)
      const data = await creatorsApi.getAll()
      setCreators(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creators')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCreator = useCallback(async (creator: CreatorInsert) => {
    try {
      const newCreator = await creatorsApi.create(creator)
      setCreators(prev => [newCreator, ...prev])
      return newCreator
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create creator')
      throw err
    }
  }, [])

  const updateCreator = useCallback(async (id: string, updates: CreatorUpdate) => {
    try {
      const updatedCreator = await creatorsApi.update(id, updates)
      setCreators(prev => prev.map(creator => 
        creator.id === id ? updatedCreator : creator
      ))
      return updatedCreator
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update creator')
      throw err
    }
  }, [])

  const deleteCreator = useCallback(async (id: string) => {
    try {
      await creatorsApi.delete(id)
      setCreators(prev => prev.filter(creator => creator.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete creator')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchCreators()
  }, [fetchCreators])

  return {
    creators,
    loading,
    error,
    refetch: fetchCreators,
    createCreator,
    updateCreator,
    deleteCreator
  }
}

export function useProducts(creatorId?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const data = creatorId 
        ? await productsApi.getByCreator(creatorId)
        : await productsApi.getAll()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [creatorId])

  const createProduct = useCallback(async (product: ProductInsert) => {
    try {
      const newProduct = await productsApi.create(product)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
      throw err
    }
  }, [])

  const updateProduct = useCallback(async (id: string, updates: ProductUpdate) => {
    try {
      const updatedProduct = await productsApi.update(id, updates)
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ))
      return updatedProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      throw err
    }
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsApi.delete(id)
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}

export function useSales(creatorId?: string) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true)
      const data = creatorId 
        ? await salesApi.getByCreator(creatorId)
        : await salesApi.getAll()
      setSales(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }, [creatorId])

  const createSale = useCallback(async (sale: SaleInsert) => {
    try {
      const newSale = await salesApi.create(sale)
      setSales(prev => [newSale, ...prev])
      return newSale
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  return {
    sales,
    loading,
    error,
    refetch: fetchSales,
    createSale
  }
}

export function useAnalytics(creatorId: string) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!creatorId) return
    
    try {
      setLoading(true)
      const data = await analyticsApi.getByCreator(creatorId)
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [creatorId])

  const createAnalytics = useCallback(async (analyticsData: AnalyticsInsert) => {
    try {
      const newAnalytics = await analyticsApi.create(analyticsData)
      setAnalytics(newAnalytics)
      return newAnalytics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analytics')
      throw err
    }
  }, [])

  const updateAnalytics = useCallback(async (updates: Partial<AnalyticsInsert>) => {
    if (!creatorId) return
    
    try {
      const updatedAnalytics = await analyticsApi.update(creatorId, updates)
      setAnalytics(updatedAnalytics)
      return updatedAnalytics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update analytics')
      throw err
    }
  }, [creatorId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    createAnalytics,
    updateAnalytics
  }
}
