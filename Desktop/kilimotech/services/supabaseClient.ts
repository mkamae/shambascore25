import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// ============================================
// SAFE ENVIRONMENT VARIABLE ACCESS
// ============================================
// Vite replaces import.meta.env.* at build time
// Only variables with VITE_ prefix are exposed to browser
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Comprehensive validation with helpful error messages
if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl === '') {
    console.error('❌ SUPABASE URL MISSING!');
    console.error('Expected: VITE_SUPABASE_URL');
    console.error('Current value:', supabaseUrl);
    console.error('Current MODE:', import.meta.env.MODE);
    console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    
    throw new Error(
        '🔴 Supabase URL is missing!\n\n' +
        'Local development:\n' +
        '1. Create .env.local in project root\n' +
        '2. Add: VITE_SUPABASE_URL=https://your-project.supabase.co\n\n' +
        'Vercel deployment:\n' +
        '1. Go to Project Settings → Environment Variables\n' +
        '2. Add VITE_SUPABASE_URL with your Supabase project URL\n' +
        '3. Redeploy your project'
    );
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey === '') {
    console.error('❌ SUPABASE ANON KEY MISSING!');
    console.error('Expected: VITE_SUPABASE_ANON_KEY');
    console.error('Current value:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined');
    console.error('Current MODE:', import.meta.env.MODE);
    console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    
    throw new Error(
        '🔴 Supabase Anon Key is missing!\n\n' +
        'Local development:\n' +
        '1. Add to .env.local: VITE_SUPABASE_ANON_KEY=your_anon_key\n' +
        '2. Get key from: Supabase Dashboard → Settings → API\n\n' +
        'Vercel deployment:\n' +
        '1. Go to Project Settings → Environment Variables\n' +
        '2. Add VITE_SUPABASE_ANON_KEY with your Supabase anon key\n' +
        '3. Redeploy your project'
    );
}

// Initialize Supabase client with validated credentials
let supabaseInstance: ReturnType<typeof createClient<Database>>;

try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw new Error('Failed to initialize Supabase client. Check your credentials.');
}

export const supabase = supabaseInstance;
