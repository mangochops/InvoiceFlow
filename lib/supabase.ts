import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Browser client with session persistence - only initialize if credentials are present
let supabaseInstance: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = supabaseInstance

// TypeScript interfaces
export interface User {
  id: string
  email: string
  phone?: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  email: string
  phone: string
  amount: number
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string
}

export interface InvoiceStep {
  id: string
  invoice_id: string
  step_number: number
  step_name: string
  status: 'pending' | 'completed'
  data: Record<string, any> | null
  completed_at?: string
  created_at: string
}

