# Google Earth Engine Integration Guide

## Service Account

**Email**: `earth-engine@kiimotech.iam.gserviceaccount.com`  
**Project**: Kiimotech

---

## Current Implementation

The Farm Health feature currently uses **simulated data** to demonstrate functionality. This allows:
- ✅ Immediate testing and development
- ✅ UI/UX validation
- ✅ Integration testing
- ✅ No GEE authentication needed initially

---

## Production Setup (Real GEE)

### Architecture Options

#### Option 1: Python Microservice (Recommended)

**Why:** GEE Python API has best service account support

1. **Create Python Service**:
   ```python
   # gee-backend/main.py
   import ee
   from flask import Flask, request, jsonify
   import os
   
   app = Flask(__name__)
   
   # Initialize with service account
   credentials = ee.ServiceAccountCredentials(
       'earth-engine@kiimotech.iam.gserviceaccount.com',
       os.environ.get('GEE_SERVICE_ACCOUNT_KEY_PATH')
   )
   ee.Initialize(credentials)
   
   @app.route('/api/process', methods=['POST'])
   def process_farm_health():
       data = request.json
       lat, lon = data['latitude'], data['longitude']
       start, end = data['startDate'], data['endDate']
       
       # Process with GEE
       # Return real NDVI, NDWI, weather
       return jsonify(result)
   ```

2. **Deploy Python Service**:
   - Deploy to: Railway, Render, Google Cloud Run, AWS Lambda
   - Get service URL
   - Update `VITE_GEE_API_URL` environment variable

3. **Update Vercel API Route**:
   - Call Python service instead of simulating

#### Option 2: Supabase Edge Function (Python)

1. **Create Supabase Edge Function**:
   ```python
   # supabase/functions/earth-engine/index.py
   import ee
   from supabase import create_client
   
   # Authenticate GEE
   credentials = ee.ServiceAccountCredentials(...)
   ee.Initialize(credentials)
   
   def handler(req):
       # Process request
       # Return GEE data
       pass
   ```

2. **Deploy to Supabase**
3. **Update frontend** to call Edge Function

#### Option 3: Google Cloud Function (Python)

1. **Create Cloud Function** with service account
2. **Deploy to Google Cloud**
3. **Update API route** to call Cloud Function

---

## Getting Service Account Key

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/iam-admin/serviceaccounts?project=kiimotech

2. **Find Service Account**:
   - Email: `earth-engine@kiimotech.iam.gserviceaccount.com`

3. **Create Key**:
   - Click "Actions" → "Manage Keys"
   - "Add Key" → "Create New Key"
   - Choose "JSON"
   - Download key file

4. **Secure Storage**:
   - **DO NOT** commit to Git
   - Add to `.gitignore`: `*-service-account-key.json`
   - Store in environment variables or secrets manager

---

## Environment Configuration

### For Python Service

```env
GEE_SERVICE_ACCOUNT_EMAIL=earth-engine@kiimotech.iam.gserviceaccount.com
GEE_SERVICE_ACCOUNT_KEY_PATH=/path/to/key.json
```

### For Vercel/Supabase

```env
GEE_SERVICE_ACCOUNT_EMAIL=earth-engine@kiimotech.iam.gserviceaccount.com
GEE_SERVICE_ACCOUNT_KEY_BASE64=<base64-encoded-json>
```

### For Frontend

```env
VITE_GEE_API_URL=https://your-python-service.railway.app/api/process
```

---

## Real GEE Implementation Example

```python
import ee
from datetime import datetime

# Authenticate
credentials = ee.ServiceAccountCredentials(
    'earth-engine@kiimotech.iam.gserviceaccount.com',
    'service-account-key.json'
)
ee.Initialize(credentials)

def get_farm_health(lat, lon, start_date, end_date, area_ha=1):
    # Create point
    point = ee.Geometry.Point([lon, lat])
    
    # Create area around point (if area provided)
    if area_ha:
        radius = (area_ha / 3.14159) ** 0.5 * 1000  # meters
        area = point.buffer(radius)
    else:
        area = point.buffer(500)  # 500m default
    
    # Load Sentinel-2 imagery
    sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR') \
        .filterBounds(area) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    
    # Compute NDVI
    ndvi = sentinel2.map(lambda img: img.normalizedDifference(['B8', 'B4']).rename('NDVI'))
    ndvi_mean = ndvi.mean().select('NDVI')
    
    # Compute NDWI
    ndwi = sentinel2.map(lambda img: img.normalizedDifference(['B3', 'B8']).rename('NDWI'))
    ndwi_mean = ndwi.mean().select('NDWI')
    
    # Get weather data (CHIRPS for rainfall, MODIS for temperature)
    rainfall = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY') \
        .filterBounds(area) \
        .filterDate(start_date, end_date) \
        .sum()
    
    # Extract statistics
    ndvi_stats = ndvi_mean.reduceRegion(
        reducer=ee.Reducer.mean().combine(
            ee.Reducer.minMax(), '', True
        ),
        geometry=area,
        scale=10,
        maxPixels=1e9
    )
    
    # Return data
    return {
        'ndvi': {
            'avg': ndvi_stats.get('NDVI_mean').getInfo(),
            'min': ndvi_stats.get('NDVI_min').getInfo(),
            'max': ndvi_stats.get('NDVI_max').getInfo()
        },
        # ... more processing
    }
```

---

## Testing Setup

1. **Test Service Account Access**:
   ```python
   import ee
   credentials = ee.ServiceAccountCredentials(...)
   ee.Initialize(credentials)
   print(ee.Image('COPERNICUS/S2_SR/20210101T075241_20210101T075239_T36LYH').getInfo())
   ```

2. **Test API Endpoint**:
   ```bash
   curl -X POST https://your-service.com/api/process \
     -H "Content-Type: application/json" \
     -d '{"latitude": -1.2921, "longitude": 36.8219, "startDate": "2025-01-01", "endDate": "2025-01-31"}'
   ```

---

## Migration Path

1. **Phase 1** (Current): Simulated data ✅
2. **Phase 2**: Set up Python service/Edge Function
3. **Phase 3**: Test with real coordinates
4. **Phase 4**: Replace simulation in API route
5. **Phase 5**: Deploy and verify production

---

## Security Checklist

- [ ] Service account key downloaded
- [ ] Key file added to `.gitignore`
- [ ] Key stored in secure environment variable
- [ ] Service account has Earth Engine access
- [ ] API endpoint secured (if needed)
- [ ] Rate limiting implemented
- [ ] Error handling for GEE quota limits

---

## Support

- **GEE Documentation**: https://developers.google.com/earth-engine
- **Service Account Guide**: https://developers.google.com/earth-engine/guides/service_account
- **Python API**: https://github.com/google/earthengine-api

---

## Current Status

✅ **Simulated Implementation** - Working, ready for testing  
⏳ **Real GEE Integration** - Ready to implement when Python service is set up

The service account is configured: `earth-engine@kiimotech.iam.gserviceaccount.com`

Next step: Download service account key and set up Python backend service.

