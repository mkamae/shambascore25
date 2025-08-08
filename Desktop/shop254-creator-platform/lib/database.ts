import { supabase } from './supabase'
import type { Database } from './database.types'

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

// Creator functions
export const creatorsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getByStatus(status: Creator['status']) {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(creator: CreatorInsert) {
    const { data, error } = await supabase
      .from('creators')
      .insert(creator)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: CreatorUpdate) {
    const { data, error } = await supabase
      .from('creators')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Product functions
export const productsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Sales functions
export const salesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(sale: SaleInsert) {
    const { data, error } = await supabase
      .from('sales')
      .insert(sale)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Analytics functions
export const analyticsApi = {
  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('creator_id', creatorId)
      .order('date', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return data
  },

  async create(analytics: AnalyticsInsert) {
    const { data, error } = await supabase
      .from('analytics')
      .insert(analytics)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(creatorId: string, updates: Partial<AnalyticsInsert>) {
    const { data, error } = await supabase
      .from('analytics')
      .update(updates)
      .eq('creator_id', creatorId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
