# Google Earth Engine Service Account Setup

## Service Account Information

- **Service Account Email**: `earth-engine@kiimotech.iam.gserviceaccount.com`
- **Project**: Kiimotech

---

## Setup Instructions

### Option 1: Python Backend Service (Recommended for Real GEE)

Since Google Earth Engine primarily uses Python for service account authentication, you have two options:

#### A. Create a Separate Python Microservice

1. **Set up Python service** (on separate server or cloud function):
   ```python
   # gee-service.py
   import ee
   from flask import Flask, request, jsonify
   
   # Authenticate with service account
   credentials = ee.ServiceAccountCredentials(
       'earth-engine@kiimotech.iam.gserviceaccount.com',
       'path/to/service-account-key.json'
   )
   ee.Initialize(credentials)
   
   app = Flask(__name__)
   
   @app.route('/api/process', methods=['POST'])
   def process_farm():
       data = request.json
       # Process with GEE
       # Return NDVI, NDWI, weather
       pass
   ```

2. **Update Vercel API route** to call this Python service instead of simulating.

#### B. Use Supabase Edge Functions (Python)

Supabase Edge Functions support Python, so you could:
1. Create a Supabase Edge Function in Python
2. Authenticate with service account
3. Process GEE requests
4. Return results

### Option 2: JavaScript API with User Authentication

For direct browser integration:
1. Users authenticate with Google OAuth
2. Use GEE JavaScript API client-side
3. No service account needed (but requires user consent)

---

## Environment Variables

Add to `.env.local` and Vercel:

```env
# Google Earth Engine Service Account
GEE_SERVICE_ACCOUNT_EMAIL=earth-engine@kiimotech.iam.gserviceaccount.com
GEE_SERVICE_ACCOUNT_KEY_PATH=/path/to/key.json  # For Python services
# OR
GEE_SERVICE_ACCOUNT_KEY_BASE64=<base64-encoded-key>  # For serverless
```

---

## Service Account Key File

You'll need to:

1. **Download service account key** from Google Cloud Console:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Find: `earth-engine@kiimotech.iam.gserviceaccount.com`
   - Create/download JSON key file
   - **Store securely** (never commit to Git)

2. **For Vercel**:
   - Upload key as environment variable (base64 encoded)
   - Or use Vercel's secure file storage

3. **For Local Development**:
   - Place key file in project root (but add to `.gitignore`)
   - Reference in code: `./service-account-key.json`

---

## Updated API Route

The current `api/earth-engine.ts` uses simulated data. For production:

1. **Option A**: Create Python service → Update API route to call it
2. **Option B**: Use Supabase Edge Function → Replace current API route
3. **Option C**: Keep simulation → Upgrade later when Python service ready

---

## Next Steps

1. Download service account key from Google Cloud Console
2. Decide on architecture (Python service vs Supabase Edge Function)
3. Authenticate and test GEE access
4. Update API route to use real GEE calls
5. Deploy and test

---

## Security Notes

⚠️ **Never commit service account keys to Git!**
- Add to `.gitignore`
- Use environment variables
- Store in secure vault (Vercel, AWS Secrets Manager, etc.)

---

## Testing Service Account Access

Test if service account has Earth Engine access:

```python
import ee

credentials = ee.ServiceAccountCredentials(
    'earth-engine@kiimotech.iam.gserviceaccount.com',
    'service-account-key.json'
)
ee.Initialize(credentials)

# Test access
collection = ee.ImageCollection('COPERNICUS/S2_SR')
print(collection.size().getInfo())
```

If this works, your service account has Earth Engine access!

