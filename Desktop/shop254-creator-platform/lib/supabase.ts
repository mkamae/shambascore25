import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { config } from './config'

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey)
