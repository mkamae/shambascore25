# Local Development Setup

## ⚠️ Important: API Routes in Development

The Farm Health and Plant Diagnosis features use backend API routes (`/api/*`) which are Vercel serverless functions. These **do not work** with the standard `npm run dev` (Vite) command.

## ✅ Solution: Use Vercel CLI for Full Functionality

### Option 1: Use Vercel Dev (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Run development server with API support**:
   ```bash
   npm run dev:api
   ```
   
   Or directly:
   ```bash
   vercel dev
   ```

3. **The server will start and handle both:**
   - Frontend (React/Vite app)
   - API routes (`/api/gemini/*`, `/api/earth-engine`)

### Option 2: Frontend Only (npm run dev)

For frontend-only development (without API features):
```bash
npm run dev
```

**Note:** Farm Health and Plant Diagnosis will show 404 errors with this method.

## 🔧 Environment Variables for Local Development

### For `npm run dev` (Frontend only):
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For `vercel dev` (Full functionality):
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API keys (no VITE_ prefix for server-side routes)
GEMINI_API_KEY=your_gemini_api_key
```

## 📝 API Routes

These routes require `vercel dev` to work locally:

- `/api/gemini/insights` - Farm insights
- `/api/gemini/credit-score` - Credit scoring  
- `/api/gemini/chatbot` - AI chatbot
- `/api/gemini/plant-diagnosis` - Plant disease diagnosis
- `/api/earth-engine` - Farm health analysis

## 🚀 Quick Start

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run full development server (frontend + API)
npm run dev:api

# Or for frontend only
npm run dev
```

## ⚠️ Common Issues

### "404 Not Found" on API Routes
- **Cause:** Using `npm run dev` instead of `vercel dev`
- **Fix:** Use `npm run dev:api` or `vercel dev`

### "GEMINI_API_KEY not found"
- **Cause:** Missing environment variable
- **Fix:** Add `GEMINI_API_KEY` to `.env.local` (no `VITE_` prefix)

### Port Already in Use
- Vercel dev uses port 3000 by default
- Stop other servers or specify a different port:
  ```bash
  vercel dev --listen 3001
  ```

