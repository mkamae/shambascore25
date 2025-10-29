export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      farmers: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          location: string
          farm_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone: string
          location: string
          farm_type: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string
          location?: string
          farm_type?: string
        }
      }
      farm_data: {
        Row: {
          id: string
          farmer_id: string
          created_at: string
          crop_type: string
          acreage: number
          yield_estimate: number
          annual_expenses: number
          rainfall: 'Low' | 'Average' | 'High'
          soil_health: 'Poor' | 'Average' | 'Good'
        }
        Insert: {
          id?: string
          farmer_id: string
          created_at?: string
          crop_type: string
          acreage: number
          yield_estimate: number
          annual_expenses: number
          rainfall: 'Low' | 'Average' | 'High'
          soil_health: 'Poor' | 'Average' | 'Good'
        }
        Update: {
          id?: string
          farmer_id?: string
          created_at?: string
          crop_type?: string
          acreage?: number
          yield_estimate?: number
          annual_expenses?: number
          rainfall?: 'Low' | 'Average' | 'High'
          soil_health?: 'Poor' | 'Average' | 'Good'
        }
      }
      credit_profiles: {
        Row: {
          id: string
          farmer_id: string
          created_at: string
          loan_eligibility: number
          repayment_ability_score: number
          risk_score: number
          summary: string | null
        }
        Insert: {
          id?: string
          farmer_id: string
          created_at?: string
          loan_eligibility: number
          repayment_ability_score: number
          risk_score: number
          summary?: string | null
        }
        Update: {
          id?: string
          farmer_id?: string
          created_at?: string
          loan_eligibility?: number
          repayment_ability_score?: number
          risk_score?: number
          summary?: string | null
        }
      }
      insurance: {
        Row: {
          id: string
          farmer_id: string
          created_at: string
          status: 'Active' | 'Inactive'
        }
        Insert: {
          id?: string
          farmer_id: string
          created_at?: string
          status: 'Active' | 'Inactive'
        }
        Update: {
          id?: string
          farmer_id?: string
          created_at?: string
          status?: 'Active' | 'Inactive'
        }
      }
      mpesa_statements: {
        Row: {
          id: string
          farmer_id: string
          created_at: string
          file_name: string
          upload_date: string
        }
        Insert: {
          id?: string
          farmer_id: string
          created_at?: string
          file_name: string
          upload_date: string
        }
        Update: {
          id?: string
          farmer_id?: string
          created_at?: string
          file_name?: string
          upload_date?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          farmer_id: string
          created_at: string
          yield_advice: string
          risk_advice: string
          loan_advice: string
        }
        Insert: {
          id?: string
          farmer_id: string
          created_at?: string
          yield_advice: string
          risk_advice: string
          loan_advice: string
        }
        Update: {
          id?: string
          farmer_id?: string
          created_at?: string
          yield_advice?: string
          risk_advice?: string
          loan_advice?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

