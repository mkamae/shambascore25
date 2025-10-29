# 🔧 Vercel Build Fix - "vite: command not found"

## Problem
```
sh: line 1: vite: command not found
Error: Command 'vite build' exited with 127
```

---

## ✅ SOLUTION - All Points Addressed

### 1. ✅ Vite in Dependencies (NOT devDependencies)

**File: `package.json`**
```json
{
  "dependencies": {
    "vite": "^6.2.0",              // ✅ In dependencies
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2"
  },
  "devDependencies": {}              // ✅ Empty
}
```

**Why:** Vercel doesn't always install devDependencies in production builds.

---

### 2. ✅ Scripts Use "npx vite build"

**File: `package.json`**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "npx vite build",        // ✅ Uses npx
    "preview": "npx vite preview",
    "vercel-build": "npx vite build"  // ✅ Vercel's preferred name
  }
}
```

**Why:** `npx` ensures vite is found even when not in PATH.

---

### 3. ✅ Correct vercel.json

**File: `vercel.json`**
```json
{
  "version": 2,
  "buildCommand": "npm run build",      // ✅ Explicit build command
  "installCommand": "npm install",      // ✅ Explicit install
  "outputDirectory": "dist",            // ✅ Correct output
  "framework": null,                    // ✅ Don't auto-detect
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Changes:**
- `buildCommand` explicitly set to `npm run build`
- `installCommand` set to `npm install`
- `framework: null` prevents Vercel auto-detection conflicts
- `outputDirectory` directly specified

---

### 4. ✅ Dev Dependencies Installation

**Already handled by `installCommand: "npm install"`**

Since all build tools are in `dependencies`, they'll be installed automatically.

**Alternative (if needed):**
```json
{
  "installCommand": "npm install --include=dev"
}
```

But not needed since we don't use devDependencies.

---

### 5. ✅ Node Engine Requirements

**File: `package.json`**
```json
{
  "engines": {
    "node": ">=18.0.0",    // ✅ Minimum Node version
    "npm": ">=9.0.0"       // ✅ Minimum npm version
  }
}
```

**Vercel Node Version:** Set to 18 (compatible with React 19 & Vite 6)

---

## 📋 COMPLETE FILES

### package.json (Final Version)
```json
{
  "name": "kilimotech",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "npx vite build",
    "preview": "npx vite preview",
    "vercel-build": "npx vite build"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@google/genai": "^1.27.0",
    "@supabase/supabase-js": "^2.39.0",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  },
  "devDependencies": {}
}
```

### vercel.json (Final Version)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Push Changes to GitHub
```bash
git add package.json vercel.json
git commit -m "fix: Vercel build configuration for vite"
git push
```

### Step 2: Clear Vercel Cache
In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "..." on latest deployment
4. Select "Redeploy"
5. ✅ **CHECK "Clear Build Cache"** (CRITICAL!)
6. Click "Redeploy"

### Step 3: Manual Build Settings (If Automatic Fails)
If Vercel still fails, override in dashboard:

**Project Settings → General → Build & Development Settings:**
```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

### Step 4: Verify Environment Variables
**Project Settings → Environment Variables**

Ensure these 3 are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

For all environments: Production, Preview, Development

---

## 🐛 TROUBLESHOOTING

### Issue: Still getting "vite: command not found"

**Solution 1: Verify package.json on GitHub**
```bash
# Check what's actually on GitHub
git log --oneline -5
git show HEAD:package.json | grep vite
```

**Solution 2: Force Fresh Deployment**
1. Delete `.vercel` folder in your project
2. Reconnect project in Vercel dashboard
3. Import as new project
4. Add environment variables
5. Deploy

**Solution 3: Check Build Logs**
In Vercel deployment:
1. Click on the failed deployment
2. View "Build Logs"
3. Look for:
   - "Installing dependencies"
   - "Running build command"
   - Exact error location

**Solution 4: Test Build Locally**
```bash
# Clean build test
rm -rf node_modules dist
npm install
npm run build

# Should succeed without errors
```

---

## ✅ VERIFICATION CHECKLIST

Before deploying, verify:

- [ ] `vite` in `dependencies` (not devDependencies)
- [ ] All scripts use `npx vite build`
- [ ] `vercel.json` has `buildCommand: "npm run build"`
- [ ] `vercel.json` has `installCommand: "npm install"`
- [ ] `vercel.json` has `outputDirectory: "dist"`
- [ ] `framework: null` in vercel.json
- [ ] Node engine `>=18.0.0` specified
- [ ] Changes committed to GitHub
- [ ] Build works locally: `npm run build`
- [ ] Vercel cache cleared
- [ ] Environment variables set in Vercel

---

## 📊 WHY THIS WORKS

### Problem: Vercel couldn't find vite
```
❌ vite in devDependencies → not installed
❌ Direct "vite build" → not in PATH
❌ Framework auto-detection → wrong config
```

### Solution: Everything explicit
```
✅ vite in dependencies → always installed
✅ "npx vite build" → finds vite in node_modules
✅ framework: null → no auto-detection conflicts
✅ Explicit commands → no guessing
```

---

## 🎯 EXPECTED BUILD LOG

After fix, you should see:
```
Installing dependencies...
✓ Installed dependencies in 15s

Building...
✓ Running "npm run build"
✓ Executing "npx vite build"
✓ 130 modules transformed
✓ Build completed in 8s

Deployment ready
```

---

## 🆘 STILL FAILING?

### Last Resort: Manual Vercel Config

In Vercel dashboard, manually set:

1. **General → Build & Development Settings**
   - Framework Preset: **Other**
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Force Redeploy with Cache Clear**

3. **Check Node Version**
   - Vercel → Project Settings → General
   - Node.js Version: **18.x**

---

## 📞 SUPPORT

If still failing after all steps:
1. Share full Vercel build log
2. Verify GitHub has latest package.json
3. Check Vercel dashboard settings
4. Try creating new Vercel project

---

## ✨ SUCCESS INDICATORS

**Build succeeds when you see:**
- ✓ Dependencies installed (vite included)
- ✓ Build command runs (npm run build)
- ✓ Vite transforms modules
- ✓ Dist folder created
- ✓ Deployment live

**Build time:** ~15-30 seconds  
**Output:** 2 files (index.html + JS bundle)  
**Status:** Ready ✅

---

**Your Vercel deployment should now work!** 🚀

