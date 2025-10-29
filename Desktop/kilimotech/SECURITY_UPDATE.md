# 🔒 Security Update: AI API Key Protection

## Overview

The Gemini AI API key has been moved from the frontend to secure backend API routes to prevent exposure in client-side code.

## Changes Made

### ✅ Before (Insecure)
- API key exposed in frontend via `VITE_GEMINI_API_KEY`
- Key visible in browser DevTools
- Key embedded in client-side bundle

### ✅ After (Secure)
- API key stored server-side as `GEMINI_API_KEY` (no VITE_ prefix)
- All AI calls go through secure backend API routes
- Key never sent to or exposed in client

## New Backend API Routes

All routes are located in `/api/gemini/`:

1. **`/api/gemini/insights.ts`** - Farm insights generation
2. **`/api/gemini/credit-score.ts`** - M-Pesa statement credit scoring
3. **`/api/gemini/chatbot.ts`** - AI chatbot responses
4. **`/api/gemini/plant-diagnosis.ts`** - Plant disease diagnosis

## Updated Frontend Services

All services now call backend APIs instead of using the API key directly:

- ✅ `services/geminiService.ts` - Updated to use `/api/gemini/insights` and `/api/gemini/credit-score`
- ✅ `services/chatbotService.ts` - Updated to use `/api/gemini/chatbot`
- ✅ `services/plantDiagnosisService.ts` - Updated to use `/api/gemini/plant-diagnosis`

## Environment Variable Setup

### Local Development (`.env.local`)
```env
# REMOVE THIS - No longer needed in frontend
# VITE_GEMINI_API_KEY=your_key_here

# ADD THIS - Server-side only (for Vercel API routes)
GEMINI_API_KEY=your_key_here
```

### Vercel Deployment

1. Go to Project Settings → Environment Variables
2. **Remove:** `VITE_GEMINI_API_KEY` (if exists)
3. **Add:** `GEMINI_API_KEY` (server-side only)

⚠️ **Important:** `GEMINI_API_KEY` should NOT have the `VITE_` prefix, as it's only used server-side.

## Testing

After deployment:
1. All AI features should work as before
2. API key should NOT be visible in browser DevTools
3. Check Network tab - all AI calls should go to `/api/gemini/*` routes

## Security Benefits

- ✅ API key never exposed to clients
- ✅ Rate limiting can be implemented at API level
- ✅ API key can be rotated without frontend changes
- ✅ Better control over API usage
- ✅ Compliance with security best practices

## Migration Checklist

- [x] Create backend API routes for all AI features
- [x] Update frontend services to call backend APIs
- [x] Remove `VITE_GEMINI_API_KEY` from frontend env
- [ ] Update Vercel environment variables
- [ ] Remove `VITE_GEMINI_API_KEY` from Vercel (if exists)
- [ ] Add `GEMINI_API_KEY` to Vercel
- [ ] Test all AI features after deployment
- [ ] Verify API key not visible in browser

