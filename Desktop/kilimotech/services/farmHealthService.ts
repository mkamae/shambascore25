/**
 * Farm Health Service
 * 
 * Integrates with Google Earth Engine API to fetch satellite imagery
 * and compute farm health scores based on NDVI, NDWI, and weather data
 */

import { supabase } from './supabaseClient';

export interface FarmHealthRequest {
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
    area?: number;
}

export interface NDVIData {
    avg: number;
    min: number;
    max: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}

export interface NDWIData {
    avg: number;
    min: number;
    max: number;
}

export interface WeatherData {
    rainfall: {
        total: number;
        avgDaily: number;
        daysWithRain: number;
    };
    temperature: {
        avg: number;
        min: number;
        max: number;
    };
}

export interface FarmHealthData {
    ndvi: NDVIData;
    ndwi: NDWIData;
    weather: WeatherData;
    healthScore: number;
    healthCategory: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
    timestamp: string;
}

export interface FarmHealthRecord {
    id: string;
    farmerId: string;
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
    ndviAvg: number;
    ndviMin: number;
    ndviMax: number;
    ndwiAvg: number;
    rainfallTotal: number;
    rainfallAvgDaily: number;
    temperatureAvg: number;
    temperatureMin: number;
    temperatureMax: number;
    healthScore: number;
    healthCategory: string;
    rawData: any;
    createdAt: string;
    updatedAt: string;
}

// UUID validation helper
function isValidUUID(value: string | undefined | null): boolean {
    return !!value && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
}

// Provide a stable mock UUID in dev when no valid farmerId is available
function getSafeFarmerId(original: string | undefined | null): string | null {
    if (isValidUUID(original)) return original as string;
    if (import.meta && import.meta.env && import.meta.env.DEV) {
        try {
            const key = 'mock_farmer_uuid';
            const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            if (existing && isValidUUID(existing)) return existing;
            // Lazy load uuid only in dev
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { v4 } = require('uuid');
            const generated = v4();
            if (typeof window !== 'undefined') window.localStorage.setItem(key, generated);
            return generated;
        } catch (e) {
            console.warn('Could not generate mock UUID in dev environment:', e);
            return null;
        }
    }
    return null;
}

/**
 * Fetch farm health data from Earth Engine API
 */
export async function fetchFarmHealth(
    request: FarmHealthRequest
): Promise<FarmHealthData | null> {
    try {
        // Call Vercel API route (or Supabase Edge Function)
        const apiUrl = import.meta.env.VITE_EARTH_ENGINE_API_URL || '/api/earth-engine';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        // Check response status
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            // Provide helpful message for 404 in development
            if (response.status === 404 && import.meta.env.DEV) {
                errorMessage = 'API route not found. In local development, use `npm run dev:api` or `vercel dev` to enable API routes. Regular `npm run dev` does not support API routes.';
            } else {
                try {
                    // Try to parse error response if available (read body once)
                    const contentType = response.headers.get('content-type');
                    const text = await response.text();
                    
                    if (contentType && contentType.includes('application/json') && text) {
                        try {
                            const errorData = JSON.parse(text);
                            errorMessage = errorData.error || errorMessage;
                        } catch (e) {
                            // If JSON parse fails, use text
                            if (text.trim()) errorMessage = text;
                        }
                    } else if (text && text.trim()) {
                        errorMessage = text;
                    }
                } catch (e) {
                    // If anything fails, use status text
                    errorMessage = response.statusText || errorMessage;
                }
            }
            throw new Error(errorMessage);
        }

        // Check if response has content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API did not return JSON. Response type: ' + (contentType || 'unknown'));
        }

        // Get text first to check if empty
        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error('API returned empty response');
        }

        // Parse JSON
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error. Response text:', text.substring(0, 200));
            throw new Error('Invalid JSON response from API: ' + (parseError as Error).message);
        }
        
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid response from Earth Engine API');
        }

        return result.data;
    } catch (error: any) {
        console.error('Error fetching farm health:', error);
        throw error;
    }
}

/**
 * Save farm health assessment to database
 */
export async function saveFarmHealth(
    farmerId: string,
    request: FarmHealthRequest,
    healthData: FarmHealthData
): Promise<FarmHealthRecord | null> {
    try {
        const safeFarmerId = getSafeFarmerId(farmerId);
        if (!safeFarmerId) {
            console.warn('saveFarmHealth skipped: invalid farmerId');
            return null;
        }
        const { data, error } = await supabase
            .from('farm_health_scores')
            .insert({
                farmer_id: safeFarmerId,
                latitude: request.latitude,
                longitude: request.longitude,
                start_date: request.startDate,
                end_date: request.endDate,
                ndvi_avg: healthData.ndvi.avg,
                ndvi_min: healthData.ndvi.min,
                ndvi_max: healthData.ndvi.max,
                ndwi_avg: healthData.ndwi.avg,
                rainfall_total: healthData.weather.rainfall.total,
                rainfall_avg_daily: healthData.weather.rainfall.avgDaily,
                temperature_avg: healthData.weather.temperature.avg,
                temperature_min: healthData.weather.temperature.min,
                temperature_max: healthData.weather.temperature.max,
                health_score: healthData.healthScore,
                health_category: healthData.healthCategory,
                raw_data: healthData
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving farm health:', error);
            return null;
        }

        return {
            id: data.id,
            farmerId: data.farmer_id,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            startDate: data.start_date,
            endDate: data.end_date,
            ndviAvg: parseFloat(data.ndvi_avg),
            ndviMin: parseFloat(data.ndvi_min),
            ndviMax: parseFloat(data.ndvi_max),
            ndwiAvg: parseFloat(data.ndwi_avg),
            rainfallTotal: parseFloat(data.rainfall_total),
            rainfallAvgDaily: parseFloat(data.rainfall_avg_daily),
            temperatureAvg: parseFloat(data.temperature_avg),
            temperatureMin: parseFloat(data.temperature_min),
            temperatureMax: parseFloat(data.temperature_max),
            healthScore: data.health_score,
            healthCategory: data.health_category,
            rawData: data.raw_data,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } catch (error) {
        console.error('Error in saveFarmHealth:', error);
        return null;
    }
}

/**
 * Get farm health history for a farmer
 */
export async function getFarmHealthHistory(
    farmerId: string,
    limit: number = 10
): Promise<FarmHealthRecord[]> {
    try {
        if (!isValidUUID(farmerId)) {
            console.warn('getFarmHealthHistory skipped: invalid farmerId');
            return [];
        }
        const { data, error } = await supabase
            .from('farm_health_scores')
            .select('*')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching farm health history:', error);
            return [];
        }

        return (data || []).map(record => ({
            id: record.id,
            farmerId: record.farmer_id,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            startDate: record.start_date,
            endDate: record.end_date,
            ndviAvg: parseFloat(record.ndvi_avg),
            ndviMin: parseFloat(record.ndvi_min),
            ndviMax: parseFloat(record.ndvi_max),
            ndwiAvg: parseFloat(record.ndwi_avg),
            rainfallTotal: parseFloat(record.rainfall_total),
            rainfallAvgDaily: parseFloat(record.rainfall_avg_daily),
            temperatureAvg: parseFloat(record.temperature_avg),
            temperatureMin: parseFloat(record.temperature_min),
            temperatureMax: parseFloat(record.temperature_max),
            healthScore: record.health_score,
            healthCategory: record.health_category,
            rawData: record.raw_data,
            createdAt: record.created_at,
            updatedAt: record.updated_at
        }));
    } catch (error) {
        console.error('Error in getFarmHealthHistory:', error);
        return [];
    }
}

/**
 * Calculate health score from components
 * This matches the logic in the API
 */
export function calculateHealthScore(
    ndvi: NDVIData,
    ndwi: NDWIData,
    weather: WeatherData
): { score: number; category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical' } {
    // NDVI score (0-40 points, max at 0.8 NDVI)
    const ndviScore = Math.min(40, (ndvi.avg / 0.8) * 40);
    
    // Weather score (0-30 points)
    const rainfallScore = Math.min(15, ((weather.rainfall.total > 50 ? 1 : weather.rainfall.total / 50) * 15));
    const tempOptimal = weather.temperature.avg > 18 && weather.temperature.avg < 26;
    const tempScore = (tempOptimal ? 1 : 0.7) * 15;
    const weatherScore = rainfallScore + tempScore;
    
    // NDWI score (0-20 points, max at 0.6 NDWI)
    const ndwiScore = Math.min(20, (ndwi.avg / 0.6) * 20);
    
    // Trend score (0-10 points)
    const trendScore = ndvi.trend === 'increasing' ? 10 : (ndvi.trend === 'stable' ? 8 : 5);
    
    const totalScore = Math.round(ndviScore + weatherScore + ndwiScore + trendScore);
    
    // Categorize
    let category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
    if (totalScore >= 80) category = 'Excellent';
    else if (totalScore >= 65) category = 'Good';
    else if (totalScore >= 50) category = 'Moderate';
    else if (totalScore >= 35) category = 'Poor';
    else category = 'Critical';
    
    return { score: totalScore, category };
}

