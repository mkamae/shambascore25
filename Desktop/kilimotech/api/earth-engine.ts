/**
 * Google Earth Engine API Route
 * 
 * Vercel Serverless Function for processing satellite imagery
 * 
 * Service Account: earth-engine@kiimotech.iam.gserviceaccount.com
 * 
 * Note: Google Earth Engine primarily uses Python for service account auth.
 * Current implementation uses simulated data.
 * 
 * For production with real GEE:
 * 1. Create a Python microservice that authenticates with service account
 * 2. Call that service from this route
 * 3. OR use Supabase Edge Function (Python) instead
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface EarthEngineRequest {
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
    area?: number; // Optional area in hectares
}

interface EarthEngineResponse {
    success: boolean;
    data?: {
        ndvi: {
            avg: number;
            min: number;
            max: number;
            trend: 'increasing' | 'stable' | 'decreasing';
        };
        ndwi: {
            avg: number;
            min: number;
            max: number;
        };
        weather: {
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
        };
        healthScore: number;
        healthCategory: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
        timestamp: string;
    };
    error?: string;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<EarthEngineResponse>
) {
    // Health check + simple GET mock for convenience in local dev
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            data: {
                ndvi: { avg: 0.52, min: 0.31, max: 0.75, trend: 'stable' },
                ndwi: { avg: 0.47, min: 0.22, max: 0.63 },
                weather: {
                    rainfall: { total: 68.2, avgDaily: 4.3, daysWithRain: 7 },
                    temperature: { avg: 24.1, min: 18.7, max: 29.6 }
                },
                healthScore: 72,
                healthCategory: 'Good',
                timestamp: new Date().toISOString()
            }
        });
    }

    // Only allow POST for compute requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    try {
        // Accept alternative param names (lat/lon) to match some clients
        const body = req.body || {};
        const latitude = body.latitude ?? body.lat;
        const longitude = body.longitude ?? body.lon ?? body.lng;
        const startDate = body.startDate;
        const endDate = body.endDate;
        const area = body.area ?? 1;

        // Validate inputs
        if (
            latitude === undefined || longitude === undefined || latitude === null || longitude === null ||
            !startDate || !endDate
        ) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: latitude, longitude, startDate, endDate'
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }

        // Simulated data for now
        const simulatedData = await simulateEarthEngineData(
            latitude,
            longitude,
            startDate,
            endDate,
            area
        );

        return res.status(200).json({
            success: true,
            data: simulatedData
        });

    } catch (error: any) {
        console.error('Earth Engine API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to process Earth Engine request'
        });
    }
}

async function simulateEarthEngineData(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    area: number
): Promise<EarthEngineResponse['data']> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const ndviBase = 0.5 + (Math.random() * 0.3);
    const ndviAvg = parseFloat((ndviBase + (Math.random() * 0.1 - 0.05)).toFixed(3));
    const ndviMin = parseFloat(Math.max(0.2, ndviAvg - 0.2).toFixed(3));
    const ndviMax = parseFloat(Math.min(0.9, ndviAvg + 0.2).toFixed(3));

    let trend: 'increasing' | 'stable' | 'decreasing';
    const trendRand = Math.random();
    if (trendRand > 0.66) trend = 'increasing';
    else if (trendRand > 0.33) trend = 'stable';
    else trend = 'decreasing';

    const ndwiAvg = parseFloat((0.4 + Math.random() * 0.3).toFixed(3));
    const ndwiMin = parseFloat(Math.max(0, ndwiAvg - 0.2).toFixed(3));
    const ndwiMax = parseFloat(Math.min(1, ndwiAvg + 0.2).toFixed(3));

    const rainfallTotal = parseFloat((Math.random() * 100 + 20).toFixed(2));
    const rainfallAvgDaily = parseFloat((rainfallTotal / days).toFixed(2));
    const daysWithRain = Math.floor(days * (0.2 + Math.random() * 0.3));

    const tempAvg = parseFloat((20 + Math.random() * 8).toFixed(2));
    const tempMin = parseFloat((tempAvg - 5 - Math.random() * 3).toFixed(2));
    const tempMax = parseFloat((tempAvg + 5 + Math.random() * 3).toFixed(2));

    const ndviScore = Math.min(100, (ndviAvg / 0.8) * 40);
    const weatherScore = Math.min(30, ((rainfallTotal > 50 ? 1 : rainfallTotal / 50) * 15) + 
                                     ((tempAvg > 18 && tempAvg < 26 ? 1 : 0.7) * 15));
    const ndwiScore = Math.min(20, (ndwiAvg / 0.6) * 20);
    const trendScore = trend === 'increasing' ? 10 : (trend === 'stable' ? 8 : 5);
    const healthScore = Math.round(ndviScore + weatherScore + ndwiScore + trendScore);

    let healthCategory: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
    if (healthScore >= 80) healthCategory = 'Excellent';
    else if (healthScore >= 65) healthCategory = 'Good';
    else if (healthScore >= 50) healthCategory = 'Moderate';
    else if (healthScore >= 35) healthCategory = 'Poor';
    else healthCategory = 'Critical';

    return {
        ndvi: { avg: ndviAvg, min: ndviMin, max: ndviMax, trend },
        ndwi: { avg: ndwiAvg, min: ndwiMin, max: ndwiMax },
        weather: {
            rainfall: { total: rainfallTotal, avgDaily: rainfallAvgDaily, daysWithRain },
            temperature: { avg: tempAvg, min: tempMin, max: tempMax }
        },
        healthScore,
        healthCategory,
        timestamp: new Date().toISOString()
    };
}


