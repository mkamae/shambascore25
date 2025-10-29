import React, { useState, useEffect } from 'react';
import { Farmer } from '../types';
import Card from './shared/Card';
import { getWeatherForecast, getCachedForecast, cacheForecast } from '../services/weatherService';
import type { WeatherApiResponse, WeatherForecast as WeatherForecastType } from '../services/weatherService';

interface WeatherForecastProps {
    farmer: Farmer;
}

// Weather icon mapping based on OpenWeatherMap conditions
const getWeatherIcon = (condition: string, icon?: string): string => {
    const conditionLower = condition.toLowerCase();
    
    if (icon) {
        // OpenWeatherMap icon codes
        if (icon.includes('01')) return '☀️'; // Clear sky
        if (icon.includes('02')) return '⛅'; // Few clouds
        if (icon.includes('03') || icon.includes('04')) return '☁️'; // Clouds
        if (icon.includes('09') || icon.includes('10')) return '🌧️'; // Rain
        if (icon.includes('11')) return '⛈️'; // Thunderstorm
        if (icon.includes('13')) return '❄️'; // Snow
        if (icon.includes('50')) return '🌫️'; // Mist
    }
    
    // Fallback to condition-based icons
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    
    return '🌤️'; // Default
};

const WeatherForecast: React.FC<WeatherForecastProps> = ({ farmer }) => {
    const [location, setLocation] = useState<string>(farmer.location || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [forecast, setForecast] = useState<WeatherApiResponse | null>(null);
    const [recentLocations, setRecentLocations] = useState<string[]>([]);

    // Load recent locations from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('weather_recent_locations');
                if (saved) {
                    const locations = JSON.parse(saved);
                    setRecentLocations(locations);
                }
            } catch (error) {
                console.error('Error loading recent locations:', error);
            }
        }
    }, []);

    // Save location to recent searches
    const saveRecentLocation = (loc: string) => {
        if (typeof window === 'undefined') return;
        
        try {
            const updated = [loc, ...recentLocations.filter(l => l !== loc)].slice(0, 3);
            localStorage.setItem('weather_recent_locations', JSON.stringify(updated));
            setRecentLocations(updated);
        } catch (error) {
            console.error('Error saving recent location:', error);
        }
    };

    const fetchForecast = async (locationName: string) => {
        if (!locationName.trim()) {
            setError('Please enter a location');
            return;
        }

        setLoading(true);
        setError(null);
        setForecast(null);

        try {
            // Check cache first
            const cached = getCachedForecast(locationName);
            if (cached) {
                setForecast(cached);
                setLoading(false);
                saveRecentLocation(locationName);
                return;
            }

            // Fetch from API
            const data = await getWeatherForecast(locationName);
            
            if (data && data.forecasts && data.forecasts.length > 0) {
                setForecast(data);
                // Cache the result
                cacheForecast(locationName, data);
                saveRecentLocation(locationName);
            } else {
                setError('No forecast data received. Please try again.');
            }
        } catch (err: any) {
            console.error('Weather forecast error:', err);
            const errorMessage = err?.message || err?.toString() || 'Failed to fetch weather forecast.';
            setError(errorMessage);
            setForecast(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchForecast(location);
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (date.getTime() === today.getTime()) {
                return 'Today';
            }
            if (date.getTime() === tomorrow.getTime()) {
                return 'Tomorrow';
            }
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    return (
        <Card title="Weather Forecast" className="w-full">
            <div className="space-y-4">
                {/* Location Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter location (e.g., Nairobi, Kenya)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !location.trim()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            {loading ? 'Loading...' : 'Get Forecast'}
                        </button>
                    </div>

                    {/* Recent Locations */}
                    {recentLocations.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-sm text-gray-500 self-center">Recent:</span>
                            {recentLocations.map((loc, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setLocation(loc);
                                        fetchForecast(loc);
                                    }}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    disabled={loading}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600">Fetching weather data...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-semibold mb-1">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Forecast Display */}
                {forecast && !loading && forecast.forecasts && forecast.forecasts.length > 0 && (
                    <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {forecast.location.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {forecast.location.coordinates.lat.toFixed(4)}, {forecast.location.coordinates.lon.toFixed(4)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {forecast.forecasts.map((day: WeatherForecastType, index: number) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">
                                            {formatDate(day.date)}
                                        </p>
                                        <div className="text-4xl mb-2">
                                            {getWeatherIcon(day.condition, day.icon)}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 capitalize">
                                            {day.condition}
                                        </p>

                                        {/* Temperature */}
                                        <div className="mb-3">
                                            <p className="text-lg font-bold text-gray-800">
                                                {day.temperature.high}°C
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {day.temperature.low}°C
                                            </p>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-1 text-xs text-gray-600">
                                            {day.precipitation.probability > 0 && (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>🌧️</span>
                                                    <span>{day.precipitation.probability}%</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-center gap-1">
                                                <span>💨</span>
                                                <span>{day.wind.speed} km/h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500 text-center pt-2">
                            Forecast updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!forecast && !loading && !error && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">🌤️</p>
                        <p>Enter a location above to see the 5-day weather forecast</p>
                        <p className="text-sm mt-2">
                            Try: "{farmer.location}" or any city/town name
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default WeatherForecast;
