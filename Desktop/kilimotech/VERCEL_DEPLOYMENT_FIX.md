# 🔧 Vercel Deployment Fix Guide

## Common Vercel Deployment Issues & Solutions

### Issue #1: Build Failures

**Symptoms:**
- "Build failed"
- "Command exited with code X"
- Module not found errors

**Solutions:**

#### 1. Clear Build Cache
```
Vercel Dashboard → Project → Deployments → Latest Deployment
→ Click "..." → Redeploy → ✓ Check "Clear Build Cache"
```

#### 2. Verify Environment Variables
**CRITICAL:** All 3 must be set in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

**Where to set:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Set for: Production, Preview, AND Development

#### 3. Force Fresh Build
```bash
# In Vercel Dashboard → Project Settings → General:
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

---

### Issue #2: "vite: command not found"

**Already Fixed:** ✅
- `vite` in dependencies (not devDependencies)
- Build script uses `npx vite build`
- `vercel-build` script exists

**If still failing:**
- Verify `package.json` is correct on GitHub
- Check Vercel is using latest commit
- Clear cache and redeploy

---

### Issue #3: Authentication Errors in Production

**Problem:** Supabase Auth calls failing during build

**Fixed:** ✅
- Added `typeof window` checks
- Skip auth initialization during SSR
- Better error handling

**Verify in Vercel:**
1. Check browser console on deployed site
2. Look for Supabase connection errors
3. Verify environment variables are set

---

### Issue #4: Environment Variables Not Loading

**Problem:** `import.meta.env.VITE_*` are undefined

**Solutions:**

#### Check Vercel Settings:
1. Go to: Project → Settings → Environment Variables
2. Verify all 3 variables exist
3. Check they're set for the correct environment:
   - Production (for production deployments)
   - Preview (for PR deployments)
   - Development (for preview deployments)

#### Format Check:
```
✅ Correct:
VITE_SUPABASE_URL=https://...
VITE_GEMINI_API_KEY=...

❌ Wrong:
SUPABASE_URL=https://... (missing VITE_ prefix)
GEMINI_API_KEY=... (missing VITE_ prefix)
```

#### Redeploy After Adding Variables:
After adding/updating environment variables:
1. Go to Deployments
2. Click "Redeploy" on latest
3. Ensure variables are included

---

### Issue #5: Routing Issues (404 on Refresh)

**Fixed:** ✅ Already in `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Verify:**
- Check `vercel.json` in GitHub
- Ensure rewrite rules are present

---

### Issue #6: Import Errors

**Common Errors:**
- Cannot find module
- Import path errors
- TypeScript errors

**Solutions:**

#### Check TypeScript:
```bash
# Test locally first
npm run build

# If TypeScript errors, fix them before deploying
```

#### Verify All Imports:
- No circular dependencies
- All paths relative and correct
- No dynamic imports breaking build

---

## 🚀 STEP-BY-STEP DEPLOYMENT CHECKLIST

### Before Deploying:
- [ ] Build works locally: `npm run build` ✅
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Environment variables documented

### In Vercel Dashboard:

#### Step 1: Import/Connect Repository
- [ ] Repository connected: `mkamae/Kilimotech`
- [ ] Auto-deploy enabled

#### Step 2: Configure Project
```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

#### Step 3: Environment Variables
- [ ] `VITE_SUPABASE_URL` = `https://jvqyfxlozoehozunfzkv.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbG...`
- [ ] `VITE_GEMINI_API_KEY` = `AIzaSy...`
- [ ] All set for Production, Preview, Development

#### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (~2-3 minutes)
- [ ] Check build logs for errors

#### Step 5: Verify
- [ ] Build succeeds
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Authentication works
- [ ] API calls succeed

---

## 🐛 TROUBLESHOOTING SPECIFIC ERRORS

### Error: "Missing Supabase environment variables"

**Fix:**
1. Go to Vercel → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy with cache cleared

### Error: "An API Key must be set when running in a browser"

**Fix:**
1. Add `VITE_GEMINI_API_KEY` to Vercel
2. Ensure it has `VITE_` prefix
3. Redeploy

### Error: "Build command failed"

**Check:**
1. Build logs in Vercel dashboard
2. Look for specific error message
3. Test build locally first
4. Fix errors locally
5. Push to GitHub
6. Redeploy on Vercel

### Error: "Module not found"

**Fix:**
1. Verify `package.json` on GitHub
2. Check all dependencies are listed
3. Ensure `node_modules` is NOT in git
4. Run `npm install` locally to verify

### Error: "404 on page refresh"

**Fix:**
1. Verify `vercel.json` has rewrites
2. Check routing configuration
3. Ensure SPA mode is enabled

---

## 📋 QUICK FIX COMMANDS

### Test Build Locally:
```bash
npm run build
npm run preview  # Test production build
```

### Clean Install:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Check What Vercel Sees:
```bash
# Your GitHub repo should match:
git log --oneline -1
git show HEAD:package.json
git show HEAD:vercel.json
```

---

## ✅ VERIFICATION AFTER DEPLOYMENT

### Test Your Live Site:

1. **Landing Page:**
   - ✅ Loads correctly
   - ✅ Forms display
   - ✅ No console errors

2. **Authentication:**
   - ✅ Sign up works (if Supabase Auth enabled)
   - ✅ Sign in works
   - ✅ Logout works

3. **Dashboard:**
   - ✅ Loads after login
   - ✅ Data displays
   - ✅ Features work

4. **API Calls:**
   - ✅ Supabase connects
   - ✅ Gemini AI works
   - ✅ No network errors

---

## 🆘 STILL NOT WORKING?

### Get Build Logs:
1. Vercel Dashboard → Your Project
2. Deployments → Failed deployment
3. Click deployment
4. View "Build Logs"
5. Look for error messages
6. Share full error for help

### Common Solutions:
1. **Clear everything:**
   - Clear Vercel build cache
   - Delete `.vercel` folder (if exists)
   - Reconnect project

2. **Start fresh:**
   - Delete Vercel project
   - Create new project
   - Import from GitHub
   - Add environment variables
   - Deploy

3. **Check compatibility:**
   - Node version matches (18.x)
   - npm version compatible
   - All dependencies support Node 18

---

## 📞 NEED MORE HELP?

**Share these details:**
1. Full error message from Vercel build logs
2. What works locally vs production
3. Environment variables status (screenshot if possible)
4. GitHub commit hash

**Your current setup should work!** The fixes above address all common Vercel deployment issues.

---

## 🎯 EXPECTED BUILD OUTPUT

```
✓ Installing dependencies...
✓ Running "npm run build"
✓ Executing "npx vite build"
✓ 130 modules transformed
✓ Build completed
✓ Deployment ready
```

**If you see this, deployment is successful!** ✅

---

**Your platform is configured correctly for Vercel!** 🚀

