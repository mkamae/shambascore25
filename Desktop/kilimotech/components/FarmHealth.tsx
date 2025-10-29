import React, { useState, useEffect } from 'react';
import { Farmer } from '../types';
import { 
    fetchFarmHealth, 
    saveFarmHealth, 
    getFarmHealthHistory,
    FarmHealthData,
    FarmHealthRecord,
    FarmHealthRequest
} from '../services/farmHealthService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface FarmHealthProps {
    farmer: Farmer;
}

const FarmHealth: React.FC<FarmHealthProps> = ({ farmer }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentData, setCurrentData] = useState<FarmHealthData | null>(null);
    const [history, setHistory] = useState<FarmHealthRecord[]>([]);
    
    // Form state
    const [latitude, setLatitude] = useState<string>('-1.2921'); // Default: Nairobi
    const [longitude, setLongitude] = useState<string>('36.8219');
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30); // 30 days ago
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [area, setArea] = useState<string>('1');

    useEffect(() => {
        loadHistory();
    }, [farmer.id]);

    const loadHistory = async () => {
        try {
            const healthHistory = await getFarmHealthHistory(farmer.id, 5);
            setHistory(healthHistory);
            if (healthHistory.length > 0) {
                setCurrentData(healthHistory[0].rawData as FarmHealthData);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleFetchHealth = async () => {
        setLoading(true);
        setError(null);

        try {
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);
            const areaNum = parseFloat(area);

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Please enter valid coordinates');
            }

            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                throw new Error('Coordinates out of range');
            }

            const request: FarmHealthRequest = {
                latitude: lat,
                longitude: lon,
                startDate,
                endDate,
                area: areaNum || undefined
            };

            const healthData = await fetchFarmHealth(request);
            
            if (healthData) {
                setCurrentData(healthData);
                
                // Save to database
                await saveFarmHealth(farmer.id, request, healthData);
                
                // Reload history
                await loadHistory();
            }
        } catch (err: any) {
            console.error('Error fetching farm health:', err);
            setError(err.message || 'Failed to fetch farm health data');
        } finally {
            setLoading(false);
        }
    };

    const getHealthColor = (category: string): string => {
        switch (category) {
            case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
            case 'Good': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'Moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'Poor': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getNDVIColor = (value: number): string => {
        if (value >= 0.6) return 'text-green-600';
        if (value >= 0.4) return 'text-yellow-600';
        if (value >= 0.2) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <Card title="Farm Location & Period">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude
                        </label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="-1.2921"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude
                        </label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="36.8219"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Area (Hectares) - Optional
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="1.0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleFetchHealth}
                    disabled={loading}
                    className="mt-4 w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner />
                            Analyzing Farm Health...
                        </span>
                    ) : (
                        '🔍 Analyze Farm Health'
                    )}
                </button>
            </Card>

            {/* Current Health Score */}
            {currentData && (
                <Card title="Current Farm Health Assessment">
                    <div className={`p-6 rounded-lg border-2 ${getHealthColor(currentData.healthCategory)}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold">{currentData.healthScore}/100</h3>
                                <p className="text-lg font-semibold">{currentData.healthCategory}</p>
                            </div>
                            <div className="text-4xl">
                                {currentData.healthCategory === 'Excellent' && '🌿'}
                                {currentData.healthCategory === 'Good' && '🌱'}
                                {currentData.healthCategory === 'Moderate' && '🍂'}
                                {currentData.healthCategory === 'Poor' && '⚠️'}
                                {currentData.healthCategory === 'Critical' && '🚨'}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {/* NDVI */}
                            <div className="bg-white/50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">NDVI (Vegetation)</p>
                                <p className={`text-2xl font-bold ${getNDVIColor(currentData.ndvi.avg)}`}>
                                    {currentData.ndvi.avg.toFixed(3)}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Range: {currentData.ndvi.min.toFixed(3)} - {currentData.ndvi.max.toFixed(3)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Trend: {currentData.ndvi.trend === 'increasing' ? '📈 Improving' : 
                                           currentData.ndvi.trend === 'stable' ? '➡️ Stable' : '📉 Declining'}
                                </p>
                            </div>

                            {/* NDWI */}
                            <div className="bg-white/50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">NDWI (Water)</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {currentData.ndwi.avg.toFixed(3)}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Range: {currentData.ndwi.min.toFixed(3)} - {currentData.ndwi.max.toFixed(3)}
                                </p>
                            </div>

                            {/* Weather Summary */}
                            <div className="bg-white/50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Weather</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    🌧️ {currentData.weather.rainfall.total.toFixed(1)}mm
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    🌡️ {currentData.weather.temperature.avg.toFixed(1)}°C avg
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Detailed Metrics */}
            {currentData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NDVI Details */}
                    <Card title="Vegetation Index (NDVI)">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average NDVI</span>
                                <span className={`font-bold ${getNDVIColor(currentData.ndvi.avg)}`}>
                                    {currentData.ndvi.avg.toFixed(3)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                        currentData.ndvi.avg >= 0.6 ? 'bg-green-600' :
                                        currentData.ndvi.avg >= 0.4 ? 'bg-yellow-600' :
                                        currentData.ndvi.avg >= 0.2 ? 'bg-orange-600' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${Math.min(100, (currentData.ndvi.avg + 1) * 50)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                NDVI range: -1 (water/bare) to +1 (dense vegetation).
                                Healthy crops typically range 0.3-0.8.
                            </p>
                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                    <strong>Trend:</strong> {currentData.ndvi.trend}
                                </p>
                                <p className="text-xs text-gray-600">
                                    <strong>Min:</strong> {currentData.ndvi.min.toFixed(3)} | 
                                    <strong> Max:</strong> {currentData.ndvi.max.toFixed(3)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Weather Details */}
                    <Card title="Weather Data">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Rainfall</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total</span>
                                        <span className="font-semibold">{currentData.weather.rainfall.total.toFixed(1)} mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Daily Average</span>
                                        <span className="font-semibold">{currentData.weather.rainfall.avgDaily.toFixed(2)} mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Rainy Days</span>
                                        <span className="font-semibold">{currentData.weather.rainfall.daysWithRain}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Temperature</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Average</span>
                                        <span className="font-semibold">{currentData.weather.temperature.avg.toFixed(1)}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Minimum</span>
                                        <span className="font-semibold">{currentData.weather.temperature.min.toFixed(1)}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Maximum</span>
                                        <span className="font-semibold">{currentData.weather.temperature.max.toFixed(1)}°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <Card title="Recent Assessments">
                    <div className="space-y-3">
                        {history.map((record) => (
                            <div 
                                key={record.id}
                                className={`p-4 rounded-lg border-2 ${getHealthColor(record.healthCategory)}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-semibold">{record.healthScore}/100 - {record.healthCategory}</p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(record.startDate).toLocaleDateString()} to {new Date(record.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                                    <span>NDVI: {record.ndviAvg.toFixed(3)}</span>
                                    <span>Rainfall: {record.rainfallTotal.toFixed(1)}mm</span>
                                    <span>Temp: {record.temperatureAvg.toFixed(1)}°C</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Info Card */}
            {!currentData && (
                <Card title="About Farm Health Analysis" className="bg-blue-50">
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>🌍 Google Earth Engine Integration</strong></p>
                        <p>This feature uses satellite imagery to analyze your farm's health:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li><strong>NDVI</strong> - Measures vegetation health (0.3-0.8 = healthy crops)</li>
                            <li><strong>NDWI</strong> - Detects water presence and irrigation effectiveness</li>
                            <li><strong>Weather</strong> - Rainfall and temperature data for the period</li>
                            <li><strong>Health Score</strong> - Composite score (0-100) combining all factors</li>
                        </ul>
                        <p className="mt-3 text-xs text-gray-600">
                            💡 <strong>Tip:</strong> Enter your farm's GPS coordinates to get started. 
                            You can find coordinates using Google Maps by right-clicking on your location.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FarmHealth;

