/**
 * Environment Variable Validation Utility
 * 
 * Use this to validate all required environment variables at app startup
 * Run this check early in your application lifecycle
 */

interface EnvValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates all required environment variables
 * Call this function early in your app (e.g., in main.tsx or App.tsx)
 */
export function validateEnvironmentVariables(): EnvValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check Supabase variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl === '') {
        errors.push('VITE_SUPABASE_URL is missing or empty');
    } else if (!supabaseUrl.startsWith('https://')) {
        warnings.push('VITE_SUPABASE_URL should start with https://');
    }

    if (!supabaseKey || supabaseKey === 'undefined' || supabaseKey === '') {
        errors.push('VITE_SUPABASE_ANON_KEY is missing or empty');
    }

    // Check Gemini API key
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'undefined' || geminiKey === '') {
        errors.push('VITE_GEMINI_API_KEY is missing or empty');
    }

    // Check Weather API keys (optional for weather feature)
    const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!googleMapsKey || googleMapsKey === 'undefined' || googleMapsKey === '') {
        warnings.push('VITE_GOOGLE_MAPS_API_KEY is missing (required for weather forecasts)');
    }
    
    if (!openWeatherKey || openWeatherKey === 'undefined' || openWeatherKey === '') {
        warnings.push('VITE_OPENWEATHER_API_KEY is missing (required for weather forecasts)');
    }

    // Log helpful information
    if (errors.length > 0) {
        console.error('❌ Environment variable validation failed:');
        errors.forEach(err => console.error(`  - ${err}`));
        
        console.log('\n📋 Available environment variables:');
        const allEnvVars = Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'));
        allEnvVars.forEach(key => {
            const value = import.meta.env[key];
            console.log(`  - ${key}: ${value ? '***' + value.slice(-4) : 'undefined'}`);
        });
        
        console.log('\n💡 Current mode:', import.meta.env.MODE);
        console.log('💡 Dev mode:', import.meta.env.DEV);
        console.log('💡 Production mode:', import.meta.env.PROD);
    }

    if (warnings.length > 0) {
        console.warn('⚠️ Environment variable warnings:');
        warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get a safe environment variable with fallback
 */
export function getEnvVar(key: string, defaultValue?: string): string {
    const value = import.meta.env[key];
    if (!value || value === 'undefined' || value === '') {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is missing and no default value provided`);
    }
    return value;
}

