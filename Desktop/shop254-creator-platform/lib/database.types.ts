export interface Database {
  public: {
    Tables: {
      creators: {
        Row: {
          id: string
          name: string
          id_number: string
          telephone_number: string
          handle: string
          avatar_url: string
          bio: string
          mpesa_number: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          business_category: string
          rejection_reason?: string
          instagram_handle?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          id_number: string
          telephone_number: string
          handle: string
          avatar_url: string
          bio: string
          mpesa_number: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          business_category: string
          rejection_reason?: string
          instagram_handle?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          id_number?: string
          telephone_number?: string
          handle?: string
          avatar_url?: string
          bio?: string
          mpesa_number?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          business_category?: string
          rejection_reason?: string
          instagram_handle?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          creator_id: string
          name: string
          price: number
          description: string
          image_urls: string[]
          type: 'product' | 'service' | 'event'
          stock?: number
          event_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          price: number
          description: string
          image_urls: string[]
          type: 'product' | 'service' | 'event'
          stock?: number
          event_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          price?: number
          description?: string
          image_urls?: string[]
          type?: 'product' | 'service' | 'event'
          stock?: number
          event_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          creator_id: string
          customer_phone: string
          total: number
          payment_method: 'M-Pesa' | 'Airtel Money'
          items: any
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          customer_phone: string
          total: number
          payment_method: 'M-Pesa' | 'Airtel Money'
          items: any
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          customer_phone?: string
          total?: number
          payment_method?: 'M-Pesa' | 'Airtel Money'
          items?: any
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          creator_id: string
          views: number
          clicks: number
          sales: number
          revenue: number
          platform_fee: number
          net_revenue: number
          date: string
        }
        Insert: {
          id?: string
          creator_id: string
          views?: number
          clicks?: number
          sales?: number
          revenue?: number
          platform_fee?: number
          net_revenue?: number
          date?: string
        }
        Update: {
          id?: string
          creator_id?: string
          views?: number
          clicks?: number
          sales?: number
          revenue?: number
          platform_fee?: number
          net_revenue?: number
          date?: string
        }
      }
    }
  }
}
