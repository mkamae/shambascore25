# Troubleshooting Guide

## "An API Key must be set when running in a browser"

This error occurs when the Gemini API key is not being loaded properly. Follow these steps:

### ✅ Solution Steps

#### 1. Verify Environment Variables
Check that `.env.local` exists and contains:
```env
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

**Check file location**: The `.env.local` file must be in the project root (same directory as `package.json`)

#### 2. Verify Variable Names
All environment variables MUST have the `VITE_` prefix to be accessible in the browser:
- ✅ `VITE_GEMINI_API_KEY` - Correct
- ❌ `GEMINI_API_KEY` - Won't work
- ❌ `API_KEY` - Won't work

#### 3. Restart Development Server
**This is the most common fix!** Environment variables are only loaded when the server starts.

**Windows (PowerShell)**:
```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

**Alternative - Kill all Node processes**:
```powershell
# Stop all Node processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

#### 4. Clear Browser Cache
Sometimes the browser caches the old version:
- Press `Ctrl + Shift + R` (Windows) to hard reload
- Or open DevTools (F12) → Network tab → Check "Disable cache"

#### 5. Check Console for Actual Values
Add this temporarily to `services/geminiService.ts` to debug:
```typescript
console.log('Environment check:', {
  hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
  apiKeyLength: import.meta.env.VITE_GEMINI_API_KEY?.length,
  allEnvVars: import.meta.env
});
```

Then check browser console (F12) for the output.

### Common Causes

| Issue | Cause | Fix |
|-------|-------|-----|
| Server not restarted | Env vars only load on startup | Restart `npm run dev` |
| Wrong variable name | Missing `VITE_` prefix | Rename to `VITE_GEMINI_API_KEY` |
| File in wrong location | `.env.local` not in root | Move to project root |
| Cached old code | Browser using old bundle | Hard reload (Ctrl+Shift+R) |
| Typo in variable name | Spelling mistake | Check exact spelling |

## Other Common Errors

### "Missing Supabase environment variables"

**Cause**: Supabase URL or API key not set properly

**Fix**:
1. Verify both variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. Restart dev server
3. Clear browser cache

### "Failed to load resource: 404" for favicon.ico

**Cause**: Missing favicon file (cosmetic issue, doesn't affect functionality)

**Fix**: Create a favicon or ignore this error - it won't break your app

### Supabase Connection Errors

**Symptoms**: 
- "Failed to fetch"
- Network errors in console
- No data loading

**Fixes**:
1. Check Supabase project is active: https://supabase.com/dashboard
2. Verify database tables are created (run `supabase-schema.sql`)
3. Check browser DevTools → Network tab for actual error
4. Verify project URL is correct

### TypeScript Errors for import.meta.env

**Cause**: Missing type definitions

**Fix**: The `vite-env.d.ts` file should exist in project root with:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Build Errors

**"Cannot find module" errors**

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**"Vite config errors"**

**Fix**: Ensure `vite.config.ts` is clean (no manual env loading):
```typescript
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
```

## Verification Checklist

Use this to verify everything is set up correctly:

- [ ] `.env.local` file exists in project root
- [ ] All env vars have `VITE_` prefix
- [ ] No spaces around `=` in `.env.local`
- [ ] Dev server was restarted after changes
- [ ] Browser cache was cleared
- [ ] `vite-env.d.ts` exists in project root
- [ ] `node_modules` installed (`npm install` completed)
- [ ] Port 3000 is not blocked by firewall

## Testing Your Setup

### Test 1: Environment Variables
Create a test file `test-env.ts`:
```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Supabase Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Has Gemini Key:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

Import it in `App.tsx` temporarily and check console output.

### Test 2: Supabase Connection
```typescript
import { supabase } from './services/supabaseClient';

// In a component
const testConnection = async () => {
  const { data, error } = await supabase.from('farmers').select('count');
  console.log('Supabase test:', { data, error });
};
```

### Test 3: Gemini API
Use the AI Insights feature in the app to generate insights for a farmer.

## Getting Help

If you're still stuck after trying these steps:

1. **Check browser console** (F12 → Console tab)
   - Look for specific error messages
   - Check what values the env vars actually have

2. **Check Network tab** (F12 → Network tab)
   - See if API requests are being made
   - Check response codes (401 = auth error, 404 = not found, etc.)

3. **Verify file contents**:
   ```bash
   # Windows
   type .env.local
   
   # Check it shows your actual keys
   ```

4. **Try a fresh start**:
   ```bash
   # Kill all Node processes
   taskkill /F /IM node.exe
   
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Start fresh
   npm run dev
   ```

## Quick Reference

### Correct File Structure
```
kilimotech/
├── .env.local           ← Your API keys (VITE_ prefix)
├── vite-env.d.ts        ← TypeScript types for env vars
├── vite.config.ts       ← Vite config (no manual env loading)
├── package.json
└── services/
    ├── supabaseClient.ts    ← Uses import.meta.env
    └── geminiService.ts     ← Uses import.meta.env
```

### How to Access Env Vars in Vite
```typescript
// ✅ Correct
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ Wrong (Node.js style, doesn't work in Vite)
const apiKey = process.env.VITE_GEMINI_API_KEY;

// ❌ Wrong (missing VITE_ prefix)
const apiKey = import.meta.env.GEMINI_API_KEY;
```

### Restart Commands
```bash
# Method 1: Stop with Ctrl+C, then:
npm run dev

# Method 2: Kill all Node and restart
taskkill /F /IM node.exe
npm run dev

# Method 3: Close terminal and open new one
# Then: npm run dev
```

## Still Having Issues?

Make sure you've completed ALL steps:
1. ✅ Created `.env.local` with all three variables
2. ✅ All variables have `VITE_` prefix
3. ✅ File is in project root (not in a subdirectory)
4. ✅ Restarted dev server (kill all node processes)
5. ✅ Hard-refreshed browser (Ctrl+Shift+R)
6. ✅ Checked browser console for errors
7. ✅ Verified `vite-env.d.ts` exists

**The #1 most common issue is forgetting to restart the dev server!** 🔄

