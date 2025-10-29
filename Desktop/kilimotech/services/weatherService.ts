/**
 * Weather Service
 * 
 * Handles weather forecast fetching using:
 * - Google Geocoding API for location → coordinates conversion
 * - OpenWeatherMap API for weather forecasts
 * 
 * Note: Google Maps Platform doesn't have a direct Weather API,
 * so we use OpenWeatherMap (free tier available) which is more reliable.
 * You can also use other weather APIs by changing the fetchWeatherForecast function.
 */

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
 * Get coordinates from location name using Google Geocoding API
 */
async function geocodeLocation(locationName: string): Promise<{ lat: number; lon: number } | null> {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.error('❌ Google Maps API key missing!');
        throw new Error(
            'Google Maps API key is required for location lookup.\n' +
            'Add VITE_GOOGLE_MAPS_API_KEY to your .env.local file.'
        );
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
            console.warn(`No results found for location: ${locationName}`);
            return null;
        }

        if (data.status !== 'OK') {
            throw new Error(`Geocoding API error: ${data.status}`);
        }

        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lon: location.lng
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
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            throw new Error('No weather data available for this location.');
        }

        // Group forecasts by day and extract daily summaries
        const dailyForecasts: { [key: string]: any[] } = {};
        
        data.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = [];
            }
            dailyForecasts[dateKey].push(item);
        });

        // Convert to our WeatherForecast format (next 5 days)
        const forecasts: WeatherForecast[] = Object.keys(dailyForecasts)
            .slice(0, 5)
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
    // Step 1: Convert location name to coordinates
    const coordinates = await geocodeLocation(locationName);
    
    if (!coordinates) {
        throw new Error(`Location "${locationName}" not found. Please try a more specific location name.`);
    }

    // Step 2: Fetch weather forecast
    const forecasts = await fetchWeatherForecast(coordinates.lat, coordinates.lon);

    return {
        forecasts,
        location: {
            name: locationName,
            coordinates
        }
    };
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

