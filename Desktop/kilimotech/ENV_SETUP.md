# 🔐 Environment Variables Setup Guide

## Problem: "An API Key must be set when running in a browser"

This error occurs when environment variables aren't properly loaded in the browser.

---

## ✅ **1. IDENTIFY THE SOURCE**

**SDK:** Google Gemini AI (`@google/genai`)  
**File:** `services/geminiService.ts`  
**Also checks:** Supabase client in `services/supabaseClient.ts`

---

## ✅ **2. VERIFY .env CONFIGURATION**

### Required Variables (ALL must have `VITE_` prefix):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

### File Locations:

1. **Local Development:** `.env.local` (in project root)
   - ✅ Gitignored (not committed)
   - ✅ Loaded automatically by Vite

2. **Production (Vercel):** Set in Vercel dashboard
   - Project Settings → Environment Variables

---

## ✅ **3. SAFETY CHECKS (IMPLEMENTED)**

All services now have comprehensive validation:

### Supabase Client (`services/supabaseClient.ts`):
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl === '') {
    throw new Error('🔴 Supabase URL is missing!...');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey === '') {
    throw new Error('🔴 Supabase Anon Key is missing!...');
}
```

### Gemini AI Client (`services/geminiService.ts`):
```typescript
function getGeminiClient(): GoogleGenAI {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        throw new Error('🔴 Gemini API key is missing!...');
    }
    
    return new GoogleGenAI({ apiKey });
}
```

### App-Level Validation (`index.tsx`):
```typescript
import { validateEnvironmentVariables } from './services/validateEnv';

// Validates all env vars at startup
validateEnvironmentVariables();
```

---

## ✅ **4. VERCEL ENVIRONMENT SETUP**

### Step-by-Step:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your `kilimotech` project

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add All 3 Variables:**

   **Variable 1:**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://jvqyfxlozoehozunfzkv.supabase.co
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 2:**
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXlmeGxvem9laG96dW5memt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQ5MzAsImV4cCI6MjA3NzMwMDkzMH0.YjX377R6ScVbh7l29-iEA_GQjusI0Y7oS9TWJkg4bmo
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 3:**
   ```
   Name: VITE_GEMINI_API_KEY
   Value: AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

4. **Save and Redeploy:**
   - Click "Save" after adding each variable
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Select "Redeploy"
   - ✅ **CHECK "Clear Build Cache"**
   - Click "Redeploy"

---

## ✅ **5. VERIFY VITE EXPOSES VARIABLES**

### Test Locally:

1. **Check variables are loaded:**
   ```typescript
   // In browser console (F12)
   console.log(import.meta.env.VITE_SUPABASE_URL);
   console.log(import.meta.env.VITE_GEMINI_API_KEY);
   ```

2. **Build test:**
   ```bash
   npm run build
   # Should complete without errors
   ```

3. **Preview test:**
   ```bash
   npm run preview
   # Visit http://localhost:4173
   # Should load without API key errors
   ```

### Build Output Check:

Vite replaces `import.meta.env.VITE_*` at build time:
```javascript
// What you write:
const key = import.meta.env.VITE_GEMINI_API_KEY;

// What Vite outputs (example):
const key = "AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o";
```

**This happens during build, so variables must be available at build time!**

---

## ✅ **6. CORRECTED CODE**

### **`services/geminiService.ts`** (Already Fixed):
```typescript
// Lazy initialization - only creates client when needed
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
    if (aiInstance) return aiInstance;
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Comprehensive validation
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        throw new Error('🔴 Gemini API key is missing!...');
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
}

// Functions use getGeminiClient() instead of direct instance
export const getFarmInsights = async (farmer: Farmer) => {
    const ai = getGeminiClient(); // ✅ Lazy initialization
    // ... rest of function
};
```

### **`services/supabaseClient.ts`** (Now Fixed):
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Comprehensive validation
if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl === '') {
    throw new Error('🔴 Supabase URL is missing!...');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey === '') {
    throw new Error('🔴 Supabase Anon Key is missing!...');
}

// ✅ Safe initialization
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### **`index.tsx`** (Now Fixed):
```typescript
import { validateEnvironmentVariables } from './services/validateEnv';

// ✅ Validate at app startup
if (typeof window !== 'undefined') {
    const validation = validateEnvironmentVariables();
    if (!validation.isValid) {
        console.error('Environment variable errors:', validation.errors);
    }
}
```

### **`vite.config.ts`** (Verified):
```typescript
export default defineConfig({
  // ✅ No manual env handling needed
  // Vite automatically exposes VITE_ prefixed variables
  // via import.meta.env in browser
});
```

---

## 📋 **ENVIRONMENT VARIABLES TEMPLATE**

Create `.env.local` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXlmeGxvem9laG96dW5memt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQ5MzAsImV4cCI6MjA3NzMwMDkzMH0.YjX377R6ScVbh7l29-iEA_GQjusI0Y7oS9TWJkg4bmo

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

**Important Rules:**
- ✅ Must have `VITE_` prefix
- ✅ No spaces around `=`
- ✅ No quotes around values
- ✅ One variable per line
- ✅ File must be named `.env.local` (not `.env`)

---

## 🐛 **DEBUGGING CHECKLIST**

### Local Development:
- [ ] `.env.local` exists in project root
- [ ] All variables have `VITE_` prefix
- [ ] No spaces around `=` sign
- [ ] No quotes around values
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (Ctrl+Shift+R)

### Vercel Production:
- [ ] All 3 variables added in Vercel dashboard
- [ ] Variables set for Production, Preview, Development
- [ ] Variable names exactly match (including `VITE_` prefix)
- [ ] No extra spaces in values
- [ ] Build cache cleared before redeploy
- [ ] Redeployed after adding variables

### Verification:
```bash
# Local test
npm run build
npm run preview

# Check browser console
console.log(import.meta.env.VITE_GEMINI_API_KEY);
```

---

## 🎯 **EXPECTED BEHAVIOR**

### **Successful Setup:**
- ✅ App loads without errors
- ✅ Console shows: "✅ Environment variables validated"
- ✅ Supabase: "✅ Supabase client initialized successfully"
- ✅ Gemini: "✅ Gemini AI initialized successfully" (when used)
- ✅ No API key errors

### **If Still Failing:**

**Check Vercel Build Logs:**
1. Go to deployment
2. Click "Build Logs"
3. Look for:
   - "Installing dependencies"
   - "Running build command"
   - Any error messages

**Common Issues:**
- Variables not set in Vercel
- Wrong variable names (missing `VITE_` prefix)
- Variables set only for one environment
- Build cache using old config

---

## 🚀 **QUICK FIX FOR VERCEL**

If deployment is failing:

1. **Verify Variables Exist:**
   - Vercel → Settings → Environment Variables
   - Should see all 3 `VITE_` variables

2. **Clear Cache & Redeploy:**
   - Deployments → Latest → "..." → Redeploy
   - ✅ Check "Clear Build Cache"
   - Redeploy

3. **Manual Override (if needed):**
   - Settings → General → Build & Development Settings
   - Set explicitly:
     ```
     Build Command: npm run build
     Output Directory: dist
     ```

---

## 📞 **TROUBLESHOOTING**

### Error persists after fixes:

**Step 1:** Check browser console on deployed site
- Look for error messages
- Check which variable is missing

**Step 2:** Verify Vercel has latest code
- Check GitHub commit matches
- Force redeploy if needed

**Step 3:** Test variables manually
```typescript
// In browser console on deployed site
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Gemini Key:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

**If undefined:** Variables not set in Vercel  
**If defined but still error:** SDK initialization issue

---

## ✅ **SUMMARY**

**All fixes implemented:**
- ✅ Lazy initialization for Gemini AI
- ✅ Comprehensive Supabase validation
- ✅ App-level environment validation
- ✅ Detailed error messages
- ✅ Vercel setup documentation

**Your code is now production-ready!** 🚀

Set variables in Vercel and redeploy to see the fixes in action.

