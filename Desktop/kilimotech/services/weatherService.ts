/**
 * Weather Service
 * 
 * Handles weather forecast fetching using OpenWeatherMap for both:
 * - Geocoding API: location name → coordinates conversion
 * - Weather API: weather forecasts
 * 
 * Only requires one API key: VITE_OPENWEATHER_API_KEY
 * Get your free key at: https://openweathermap.org/api
 * Free tier: 1,000 calls/day, 60 calls/minute
 */

import { FEATURES } from '../config/featureFlags';

export interface WeatherForecast {
    date: string;
    temperature: {
        high: number;
        low: number;
        unit: 'celsius' | 'fahrenheit';
    };
    precipitation: {
        probability: number; // 0-100
        amount?: number; // mm
    };
    wind: {
        speed: number; // m/s or km/h
        direction?: number; // degrees
    };
    condition: string; // e.g., "Partly cloudy", "Light rain"
    icon?: string;
}

export interface WeatherApiResponse {
    forecasts: WeatherForecast[];
    location: {
        name: string;
        coordinates: {
            lat: number;
            lon: number;
        };
    };
}

/**
 * Get coordinates from location name using OpenWeatherMap Geocoding API
 * This uses the same API key as weather data, so only one key is needed!
 */
async function geocodeLocation(locationName: string): Promise<{ lat: number; lon: number } | null> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.error('❌ OpenWeatherMap API key missing!');
        throw new Error(
            'OpenWeatherMap API key is required for location lookup.\n' +
            'Add VITE_OPENWEATHER_API_KEY to your .env.local file.\n' +
            'Get a free key at: https://openweathermap.org/api'
        );
    }

    try {
        // OpenWeatherMap Geocoding API
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${apiKey}`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            }
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            const errorText = await response.text();
            console.error('Geocoding API error:', response.status, errorText);
            throw new Error(`Geocoding API error: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn(`No results found for location: ${locationName}`);
            throw new Error(`Location "${locationName}" not found. Please try a more specific location (e.g., "Nairobi, Kenya").`);
        }

        const location = data[0];
        return {
            lat: location.lat,
            lon: location.lon
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw new Error(`Failed to find location: ${locationName}. Please try a more specific location.`);
    }
}

/**
 * Fetch weather forecast using OpenWeatherMap API
 * 
 * Get your free API key from: https://openweathermap.org/api
 * Free tier: 1,000 calls/day, 60 calls/minute
 */
async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.error('❌ OpenWeatherMap API key missing!');
        throw new Error(
            'OpenWeatherMap API key is required for weather forecasts.\n' +
            'Add VITE_OPENWEATHER_API_KEY to your .env.local file.\n' +
            'Get a free key at: https://openweathermap.org/api'
        );
    }

    try {
        // OpenWeatherMap 5-day forecast endpoint
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            }
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            const errorText = await response.text();
            console.error('Weather API error:', response.status, errorText);
            let errorMessage = `Weather API error: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                errorMessage = errorText.substring(0, 100);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
            throw new Error('No weather data available for this location.');
        }

        // Group forecasts by day and extract daily summaries
        const dailyForecasts: { [key: string]: any[] } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        data.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Only include forecasts for today and future days
            const forecastDate = new Date(dateKey + 'T00:00:00');
            if (forecastDate >= today) {
                if (!dailyForecasts[dateKey]) {
                    dailyForecasts[dateKey] = [];
                }
                dailyForecasts[dateKey].push(item);
            }
        });

        // Sort dates and get next 5 days
        const sortedDates = Object.keys(dailyForecasts)
            .sort()
            .filter(dateKey => {
                // Filter out today if it has very few entries (incomplete day)
                if (dateKey === today.toISOString().split('T')[0]) {
                    return dailyForecasts[dateKey].length >= 2; // At least 2 forecasts for today
                }
                return true;
            })
            .slice(0, 5);

        // Convert to our WeatherForecast format (next 5 days)
        const forecasts: WeatherForecast[] = sortedDates
            .map(dateKey => {
                const dayItems = dailyForecasts[dateKey];
                
                // Find max/min temperatures for the day
                const temps = dayItems.map((item: any) => item.main.temp);
                const high = Math.max(...temps);
                const low = Math.min(...temps);
                
                // Get most common condition
                const conditions = dayItems.map((item: any) => item.weather[0].main);
                const mostCommon = conditions.reduce((a: string, b: string, i: number, arr: string[]) =>
                    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                );
                
                // Get average precipitation probability
                const avgPop = dayItems.reduce((sum: number, item: any) => {
                    return sum + (item.pop || 0);
                }, 0) / dayItems.length;
                
                // Get average wind speed
                const avgWindSpeed = dayItems.reduce((sum: number, item: any) => {
                    return sum + (item.wind?.speed || 0);
                }, 0) / dayItems.length;

                return {
                    date: dateKey,
                    temperature: {
                        high: Math.round(high),
                        low: Math.round(low),
                        unit: 'celsius'
                    },
                    precipitation: {
                        probability: Math.round(avgPop * 100),
                        amount: dayItems[0]?.rain?.['3h'] || 0
                    },
                    wind: {
                        speed: Math.round(avgWindSpeed * 3.6), // Convert m/s to km/h
                        direction: dayItems[0]?.wind?.deg
                    },
                    condition: mostCommon,
                    icon: dayItems[0]?.weather[0]?.icon
                };
            });

        return forecasts;
    } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
    }
}

/**
 * Main function to get weather forecast by location name
 */
export async function getWeatherForecast(locationName: string): Promise<WeatherApiResponse> {
    try {
        if (!FEATURES.weatherForecast) {
            console.warn('Weather forecast call suppressed: feature disabled');
            const today = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            const mkDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const days = [...Array(5)].map((_, i) => {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                return mkDate(d);
            });
            return {
                forecasts: days.map((date) => ({
                    date,
                    temperature: { high: 26, low: 17, unit: 'celsius' },
                    precipitation: { probability: 10, amount: 0 },
                    wind: { speed: 8, direction: 90 },
                    condition: 'Clear'
                })),
                location: { name: locationName, coordinates: { lat: 0, lon: 0 } }
            };
        }
        // Step 1: Convert location name to coordinates
        const coordinates = await geocodeLocation(locationName);
        
        if (!coordinates) {
            throw new Error(`Location "${locationName}" not found. Please try a more specific location (e.g., "Nairobi, Kenya").`);
        }

        // Step 2: Fetch weather forecast
        const forecasts = await fetchWeatherForecast(coordinates.lat, coordinates.lon);

        if (!forecasts || forecasts.length === 0) {
            throw new Error('No forecast data available. Please try again later.');
        }

        return {
            forecasts,
            location: {
                name: locationName,
                coordinates
            }
        };
    } catch (error: any) {
        // Re-throw with more context
        if (error.message) {
            throw error;
        }
        throw new Error(`Failed to get weather forecast: ${error.toString()}`);
    }
}

/**
 * Cache weather data in localStorage (24 hour TTL)
 */
const CACHE_KEY_PREFIX = 'weather_forecast_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedForecast(locationName: string): WeatherApiResponse | null {
    if (typeof window === 'undefined') return null;
    
    try {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${locationName}`);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp > CACHE_TTL) {
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${locationName}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
}

export function cacheForecast(locationName: string, forecast: WeatherApiResponse): void {
    if (typeof window === 'undefined') return;
    
    try {
        const cacheData = {
            data: forecast,
            timestamp: Date.now()
        };
        localStorage.setItem(`${CACHE_KEY_PREFIX}${locationName}`, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache write error:', error);
    }
}

