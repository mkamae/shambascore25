/**
 * Google Earth Engine Service Account Helper
 * 
 * Note: Google Earth Engine primarily uses Python for service account auth.
 * This file provides utilities for when using a Python backend or alternative approach.
 * 
 * Service Account: earth-engine@kiimotech.iam.gserviceaccount.com
 */

export const GEE_SERVICE_ACCOUNT = {
    email: 'earth-engine@kiimotech.iam.gserviceaccount.com',
    project: 'kiimotech'
};

/**
 * Get Earth Engine API endpoint
 * For now, uses Vercel function. Later can point to Python service.
 */
export function getEarthEngineApiUrl(): string {
    // In production, this could point to a Python microservice
    const customUrl = import.meta.env.VITE_GEE_API_URL;
    if (customUrl) {
        return customUrl;
    }
    
    // Default: Use Vercel serverless function
    // For dev: http://localhost:3000/api/earth-engine
    // For prod: https://your-domain.vercel.app/api/earth-engine
    if (import.meta.env.DEV) {
        return '/api/earth-engine';
    }
    
    return '/api/earth-engine';
}

/**
 * Validate service account configuration
 */
export function validateGEEConfig(): { valid: boolean; error?: string } {
    const serviceAccountEmail = import.meta.env.VITE_GEE_SERVICE_ACCOUNT_EMAIL || GEE_SERVICE_ACCOUNT.email;
    
    if (!serviceAccountEmail) {
        return {
            valid: false,
            error: 'GEE Service Account email not configured'
        };
    }
    
    return { valid: true };
}

