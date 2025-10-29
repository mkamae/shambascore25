# 🌤️ Weather Forecast Feature Setup Guide

## Overview

The Weather Forecast feature allows farmers to:
- Search for weather forecasts by location name
- View 5-day weather forecasts with temperature, precipitation, and wind data
- Access recently searched locations for quick access
- Benefit from cached forecasts to reduce API calls

---

## 🔑 API Keys Required

### OpenWeatherMap API Key
**Purpose:** Used for both geocoding (location → coordinates) and weather forecasts
**Purpose:** Fetches actual weather forecast data

**Why OpenWeatherMap?**
- Google Maps Platform doesn't have a dedicated Weather API
- OpenWeatherMap offers reliable free tier
- Well-documented and widely used

**How to Get:**
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API Keys section
4. Copy your API key

**Add to `.env.local`:**
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Free Tier:**
- 1,000 API calls/day
- 60 calls/minute
- 5-day/3-hour forecast available
- Geocoding included (location lookup)

**Upgrade:** $40/month for 50,000 calls/day if needed

**Note:** OpenWeatherMap provides both geocoding and weather data, so only one API key is needed!

---

## 📋 Complete `.env.local` Template

```env
# Existing variables
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o

# Weather API key (used for both geocoding and weather)
VITE_OPENWEATHER_API_KEY=a874d14058093d9f32d280e94efc92bd
```

---

## 🌐 Vercel Environment Variables

**CRITICAL:** Add this to Vercel for production:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the OpenWeatherMap API key:
   ```
   VITE_OPENWEATHER_API_KEY = a874d14058093d9f32d280e94efc92bd
   ```
3. Select **Production, Preview, and Development** environments
4. **Save** and **Redeploy** with cache cleared

**Note:** Only one API key is needed since OpenWeatherMap handles both geocoding and weather!

---

## 📁 Files Created

### 1. `services/weatherService.ts`
- Uses OpenWeatherMap for both geocoding (location → coordinates) and weather
- Fetches weather forecasts from OpenWeatherMap API
- Implements caching with localStorage (24-hour TTL)
- Comprehensive error handling
- Only requires one API key!

### 2. `components/WeatherForecast.tsx`
- User-friendly weather forecast component
- Location search with recent searches
- Mobile-responsive card layout
- Beautiful weather icons and visualizations

### 3. Integration
- Added to `FarmerView` component (Dashboard tab)
- Displays below AI Insights
- Uses existing Card component for consistency

---

## 🎨 Features

### User Features:
- ✅ **Location Search:** Enter any city, town, or location name
- ✅ **5-Day Forecast:** View next 5 days of weather
- ✅ **Recent Locations:** Quick access to last 3 searched locations
- ✅ **Caching:** Forecasts cached for 24 hours (reduces API calls)
- ✅ **Mobile Responsive:** Works perfectly on all devices

### Weather Data Displayed:
- ✅ **Temperature:** High and low in Celsius
- ✅ **Precipitation:** Probability percentage and amount
- ✅ **Wind Speed:** In km/h
- ✅ **Conditions:** Clear, Cloudy, Rain, etc.
- ✅ **Icons:** Visual weather representation

---

## 🔧 How It Works

### Flow:
1. **User enters location** (e.g., "Nairobi, Kenya")
2. **Check cache** - If cached and recent, use cached data
3. **Geocode location** - Convert name to coordinates using OpenWeatherMap Geocoding API
4. **Fetch weather** - Get 5-day forecast from OpenWeatherMap API
5. **Cache result** - Save to localStorage with 24-hour expiry
6. **Display forecast** - Show beautiful forecast cards

### API Calls (All using OpenWeatherMap):
```
User Input → OpenWeatherMap Geocoding API → Coordinates → OpenWeatherMap Weather API → Forecast
```

---

## 💾 Caching Strategy

**Storage:** localStorage (browser)
**Key Format:** `weather_forecast_{location_name}`
**TTL:** 24 hours
**Benefits:**
- Reduces API calls
- Faster response for repeated searches
- Lower API costs

**Cache Structure:**
```json
{
  "data": {
    "forecasts": [...],
    "location": {...}
  },
  "timestamp": 1234567890
}
```

---

## 🎯 Usage Example

### In Component:
```tsx
import WeatherForecast from './components/WeatherForecast';

<WeatherForecast farmer={farmer} />
```

### Automatic Features:
- Pre-fills with farmer's location
- Shows recent searches
- Handles errors gracefully
- Responsive design

---

## 🐛 Troubleshooting

### Error: "Google Maps API key missing"
**Solution:**
- Check `.env.local` has `VITE_GOOGLE_MAPS_API_KEY`
- Restart dev server: `npm run dev`
- Clear browser cache: Ctrl+Shift+R

### Error: "OpenWeatherMap API key missing"
**Solution:**
- Check `.env.local` has `VITE_OPENWEATHER_API_KEY`
- Verify key is active at openweathermap.org
- Check API key restrictions

### Error: "Location not found"
**Solution:**
- Try more specific location (add country: "Nairobi, Kenya")
- Check spelling
- Try coordinates: "lat,lon" format

### Forecast not updating
**Solution:**
- Clear cache: localStorage.clear()
- Check API key is valid
- Verify API quotas not exceeded

### Vercel Production Issues
**Solution:**
1. Verify environment variables are set in Vercel
2. Check variable names have `VITE_` prefix
3. Clear build cache and redeploy
4. Check Vercel build logs for errors

---

## 📊 API Costs Estimate

### Free Tier Usage:
- **Google Geocoding:** $200/month credit ≈ 40,000 requests
- **OpenWeatherMap:** 1,000 calls/day = 30,000/month

**Typical Usage:**
- 100 farmers × 5 searches/day = 500 geocoding calls/day
- 500 forecasts/day × 5 days = ~2,500 API calls/day

**Recommendation:**
- Start with free tiers
- Monitor usage in Google Cloud Console
- Upgrade if needed (>50,000 API calls/month)

---

## 🔒 Security Best Practices

### 1. Google Maps API Key:
- ✅ Restrict to Geocoding API only
- ✅ Add HTTP referrer restrictions (for production)
- ✅ Use separate keys for dev/prod
- ✅ Rotate keys quarterly

### 2. OpenWeatherMap API Key:
- ✅ Use free tier initially
- ✅ Monitor usage dashboard
- ✅ Set up billing alerts
- ✅ Don't expose keys in client-side code (already handled via VITE_ prefix)

---

## ✨ Optional Enhancements

### Future Improvements:
1. **Store locations in Supabase:**
   - Create `weather_locations` table
   - Store farmer's recent 3 locations
   - Sync across devices

2. **Weather alerts:**
   - Notify farmers of extreme weather
   - Integration with farm data for crop-specific warnings

3. **Historical data:**
   - Show weather trends
   - Compare with farm yield data

4. **Multiple locations:**
   - Allow farmers with multiple farms
   - Quick switch between locations

---

## ✅ Quick Start Checklist

- [ ] Get Google Maps Geocoding API key
- [ ] Get OpenWeatherMap API key
- [ ] Add both keys to `.env.local`
- [ ] Restart dev server: `npm run dev`
- [ ] Test weather forecast in Dashboard
- [ ] Add keys to Vercel environment variables
- [ ] Redeploy to production
- [ ] Test production deployment

---

## 📞 Need Help?

**Common Issues:**
- API key not working → Check key is active and correct
- Location not found → Use more specific location names
- Forecast not loading → Check browser console for errors
- Vercel errors → Verify environment variables are set

**Documentation:**
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [KilimoTech ENV Setup](ENV_SETUP.md)

---

**Your weather forecast feature is ready to use!** 🌤️🌾

