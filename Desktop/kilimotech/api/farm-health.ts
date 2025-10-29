import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            return res.status(200).json({ success: true, message: 'farm-health OK' });
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        const { farmerId, latitude, longitude, startDate, endDate, area = 1 } = req.body || {};
        if (!farmerId || latitude === undefined || longitude === undefined || !startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'Missing farmerId, latitude, longitude, startDate, or endDate' });
        }

        const data = simulate(latestNumber(latitude), latestNumber(longitude), String(startDate), String(endDate), Number(area || 1));

        const supabase = getAdminClient();
        const { data: inserted, error } = await supabase
            .from('farm_health_scores')
            .insert({
                farmer_id: farmerId,
                latitude,
                longitude,
                start_date: startDate,
                end_date: endDate,
                ndvi_avg: data.ndvi.avg,
                ndvi_min: data.ndvi.min,
                ndvi_max: data.ndvi.max,
                ndwi_avg: data.ndwi.avg,
                rainfall_total: data.weather.rainfall.total,
                rainfall_avg_daily: data.weather.rainfall.avgDaily,
                temperature_avg: data.weather.temperature.avg,
                temperature_min: data.weather.temperature.min,
                temperature_max: data.weather.temperature.max,
                health_score: data.healthScore,
                health_category: data.healthCategory,
                raw_data: data
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, data: { assessment: data, record: inserted } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}

function latestNumber(n: any): number { return typeof n === 'number' ? n : parseFloat(n); }

function simulate(lat: number, lon: number, startDate: string, endDate: string, area: number) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const ndviAvg = clamp(+(0.5 + Math.random() * 0.2).toFixed(3), 0, 1);
    const ndviMin = clamp(+(ndviAvg - 0.18).toFixed(3), 0, 1);
    const ndviMax = clamp(+(ndviAvg + 0.18).toFixed(3), 0, 1);
    const trend = Math.random() > 0.5 ? 'increasing' : 'stable' as 'increasing' | 'stable' | 'decreasing';
    const ndwiAvg = clamp(+(0.45 + Math.random() * 0.2).toFixed(3), 0, 1);

    const rainfallTotal = +(20 + Math.random() * 120).toFixed(2);
    const rainfallAvgDaily = +(rainfallTotal / days).toFixed(2);
    const daysWithRain = Math.floor(days * (0.25 + Math.random() * 0.3));

    const tempAvg = +(20 + Math.random() * 8).toFixed(2);
    const tempMin = +(tempAvg - (3 + Math.random() * 3)).toFixed(2);
    const tempMax = +(tempAvg + (3 + Math.random() * 3)).toFixed(2);

    const ndviScore = Math.min(40, (ndviAvg / 0.8) * 40);
    const rainfallScore = Math.min(15, (rainfallTotal > 60 ? 1 : rainfallTotal / 60) * 15);
    const tempScore = ((tempAvg > 18 && tempAvg < 26) ? 1 : 0.7) * 15;
    const ndwiScore = Math.min(20, (ndwiAvg / 0.6) * 20);
    const trendScore = trend === 'increasing' ? 10 : (trend === 'stable' ? 8 : 5);
    const healthScore = Math.round(ndviScore + rainfallScore + tempScore + ndwiScore + trendScore);

    const healthCategory = healthScore >= 80 ? 'Excellent' : healthScore >= 65 ? 'Good' : healthScore >= 50 ? 'Moderate' : healthScore >= 35 ? 'Poor' : 'Critical';

    return {
        ndvi: { avg: ndviAvg, min: ndviMin, max: ndviMax, trend },
        ndwi: { avg: ndwiAvg, min: Math.max(0, +(ndwiAvg - 0.2).toFixed(3)), max: Math.min(1, +(ndwiAvg + 0.2).toFixed(3)) },
        weather: {
            rainfall: { total: rainfallTotal, avgDaily: rainfallAvgDaily, daysWithRain },
            temperature: { avg: tempAvg, min: tempMin, max: tempMax }
        },
        healthScore,
        healthCategory,
        timestamp: new Date().toISOString()
    } as const;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }


