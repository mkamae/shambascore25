# Google Earth Engine Integration Setup

## Overview

The Farm Health feature uses Google Earth Engine (simulated) to analyze satellite imagery and compute vegetation indices, weather data, and overall farm health scores.

---

## 🗄️ Database Setup

### Step 1: Run Farm Health Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `supabase-farm-health-schema.sql`
3. Click **Run**

This creates:
- `farm_health_scores` table
- Indexes for performance
- RLS policies for security

---

## 🔧 API Configuration

### Current Implementation

The API route (`api/earth-engine.ts`) currently uses **simulated data** for demonstration purposes. This allows the feature to work immediately without Google Earth Engine authentication.

### For Production with Real Google Earth Engine

To use actual Google Earth Engine, you'll need:

1. **Google Earth Engine Account**
   - Sign up: https://earthengine.google.com/
   - Request access (can take 24-48 hours)

2. **Service Account Setup**
   ```bash
   # Install Google Earth Engine Python API
   pip install earthengine-api
   
   # Authenticate
   earthengine authenticate
   earthengine project set your-project-name
   ```

3. **Update API Route**
   - Replace `simulateEarthEngineData()` in `api/earth-engine.ts`
   - Call actual GEE JavaScript API or Python API
   - Process real satellite imagery

### Alternative: Use GEE JavaScript API Client-Side

For a simpler approach without backend:

1. Add GEE JavaScript API to frontend:
   ```html
   <script src="https://code.earthengine.google.com/client-api?v=1"></script>
   ```

2. Authenticate users via Google OAuth
3. Process imagery directly in browser

---

## 📊 How It Works

### 1. **Data Flow**

```
User enters coordinates & dates
    ↓
FarmHealth component
    ↓
farmHealthService.fetchFarmHealth()
    ↓
POST /api/earth-engine
    ↓
Process satellite data (simulated or real GEE)
    ↓
Calculate NDVI, NDWI, weather
    ↓
Compute health score (0-100)
    ↓
Save to Supabase
    ↓
Display in UI
```

### 2. **Health Score Calculation**

The health score combines:
- **NDVI (40%)** - Vegetation health (0.3-0.8 = healthy)
- **Weather (30%)** - Rainfall and temperature suitability
- **NDWI (20%)** - Water availability (0.3-0.6 = good)
- **Trend (10%)** - NDVI trend (increasing > stable > decreasing)

**Categories:**
- **Excellent** (80-100): Optimal conditions
- **Good** (65-79): Healthy with minor concerns
- **Moderate** (50-64): Needs attention
- **Poor** (35-49): Significant issues
- **Critical** (0-34): Urgent intervention needed

### 3. **Indices Explained**

**NDVI (Normalized Difference Vegetation Index)**
- Range: -1 to +1
- Healthy crops: 0.3 to 0.8
- Measures: Chlorophyll density, vegetation vigor
- Interpretation:
  - > 0.6: Dense, healthy vegetation
  - 0.4-0.6: Moderate vegetation
  - 0.2-0.4: Sparse or stressed
  - < 0.2: Bare soil/water

**NDWI (Normalized Difference Water Index)**
- Range: -1 to +1
- Water presence: 0.3 to 1.0
- Measures: Water content in vegetation/soil
- Interpretation:
  - > 0.5: Good water availability
  - 0.3-0.5: Moderate moisture
  - < 0.3: Dry conditions

---

## 🎯 Usage

### For Farmers

1. Navigate to **Farm Health** in sidebar
2. Enter GPS coordinates (or use default Nairobi: -1.2921, 36.8219)
3. Select date range (default: last 30 days)
4. Click **"Analyze Farm Health"**
5. View:
   - Overall health score (0-100)
   - NDVI analysis
   - NDWI analysis
   - Weather summary
   - Historical assessments

### Finding GPS Coordinates

**Using Google Maps:**
1. Open Google Maps
2. Navigate to your farm location
3. Right-click on the farm
4. Click coordinates to copy
5. Paste into Farm Health form

**Format:** Latitude, Longitude
- Example: `-1.2921, 36.8219` (Nairobi, Kenya)

---

## 🔐 Security & Privacy

### Data Storage
- All health assessments saved to Supabase
- Linked to farmer via `farmer_id`
- Historical tracking enabled
- RLS policies ensure data privacy

### API Keys
- Currently simulated (no API key needed)
- For production GEE: Store service account credentials securely
- Use environment variables in Vercel

---

## 🚀 Future Enhancements

### Phase 1: Real GEE Integration
- [ ] Authenticate with Google Earth Engine
- [ ] Process actual satellite imagery
- [ ] Compute real NDVI/NDWI from MODIS/Landsat

### Phase 2: Advanced Features
- [ ] Polygon boundaries (not just point coordinates)
- [ ] Historical trend analysis
- [ ] Crop type detection
- [ ] Pest/disease risk alerts
- [ ] Irrigation recommendations

### Phase 3: Visualizations
- [ ] Map view with farm boundary
- [ ] NDVI heat maps
- [ ] Time-series charts
- [ ] Comparison with regional averages

### Phase 4: Integration
- [ ] Link to insurance module (risk assessment)
- [ ] Connect to loan eligibility (farm health as factor)
- [ ] AI chatbot recommendations based on health score

---

## 📝 Example API Request/Response

### Request
```json
POST /api/earth-engine
{
  "latitude": -1.2921,
  "longitude": 36.8219,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "area": 1.0
}
```

### Response
```json
{
  "success": true,
  "data": {
    "ndvi": {
      "avg": 0.653,
      "min": 0.412,
      "max": 0.789,
      "trend": "increasing"
    },
    "ndwi": {
      "avg": 0.487,
      "min": 0.321,
      "max": 0.654
    },
    "weather": {
      "rainfall": {
        "total": 87.5,
        "avgDaily": 2.82,
        "daysWithRain": 18
      },
      "temperature": {
        "avg": 22.3,
        "min": 15.8,
        "max": 28.9
      }
    },
    "healthScore": 82,
    "healthCategory": "Excellent",
    "timestamp": "2025-01-31T12:00:00Z"
  }
}
```

---

## 🧪 Testing

### Local Testing
1. Start dev server: `npm run dev`
2. Navigate to Farm Health tab
3. Use default coordinates or enter your own
4. Click "Analyze Farm Health"
5. Verify data displays correctly

### Production Testing
1. Deploy to Vercel
2. Verify API route works: `POST /api/earth-engine`
3. Test with various coordinates
4. Check Supabase for saved records

---

## 🔍 Troubleshooting

### "Failed to fetch farm health data"

**Check:**
1. API route exists at `/api/earth-engine`
2. Vercel functions are configured
3. Network tab shows correct POST request

**Fix:**
- Verify `vercel.json` includes functions configuration
- Check API route logs in Vercel dashboard
- Ensure date format is correct (YYYY-MM-DD)

### "Invalid coordinates"

**Check:**
- Latitude: -90 to 90
- Longitude: -180 to 180

**Fix:**
- Use correct coordinate format
- Get coordinates from Google Maps

### Data Not Saving

**Check:**
1. `farm_health_scores` table exists in Supabase
2. RLS policies allow inserts
3. `farmer_id` is valid UUID

**Fix:**
- Run `supabase-farm-health-schema.sql`
- Check RLS policies in Supabase dashboard
- Verify farmer record exists

---

## 📚 Resources

- [Google Earth Engine Documentation](https://developers.google.com/earth-engine)
- [Earth Engine Code Editor](https://code.earthengine.google.com/)
- [NDVI Explanation](https://gisgeography.com/ndvi-normalized-difference-vegetation-index/)
- [NDWI Explanation](https://gisgeography.com/ndwi-normalized-difference-water-index/)

---

## ✅ Checklist

After setup, verify:
- [ ] Database schema run successfully
- [ ] API route accessible (`/api/earth-engine`)
- [ ] Farm Health component visible in sidebar
- [ ] Can fetch health data with coordinates
- [ ] Health scores save to database
- [ ] History loads correctly
- [ ] UI displays all metrics properly

---

## Summary

The Farm Health feature provides:
- ✅ Satellite-based farm analysis
- ✅ NDVI and NDWI computation
- ✅ Weather data integration
- ✅ Health score (0-100)
- ✅ Historical tracking
- ✅ Beautiful, informative UI

Currently uses **simulated data** for immediate functionality. Upgrade to real Google Earth Engine for production satellite imagery analysis.

