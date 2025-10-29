# 🔧 Environment Variables Test & Fix Guide

## Problem: "An API Key must be set when running in a browser"

This error means Vite can't find your environment variables in the browser.

---

## ✅ SOLUTION STEPS

### Step 1: Verify .env.local File

**Location:** Project root (same level as package.json)

**Content should be:**
```env
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXlmeGxvem9laG96dW5memt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQ5MzAsImV4cCI6MjA3NzMwMDkzMH0.YjX377R6ScVbh7l29-iEA_GQjusI0Y7oS9TWJkg4bmo
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

**Check:**
```bash
# Windows
type .env.local

# Mac/Linux
cat .env.local
```

### Step 2: Kill ALL Node Processes

**Critical:** Environment variables only load when server starts!

```bash
# Windows PowerShell
taskkill /F /IM node.exe

# Mac/Linux
pkill node
```

### Step 3: Start Fresh Dev Server

```bash
npm run dev
```

### Step 4: Hard Refresh Browser

**MOST IMPORTANT STEP!**

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

Or:
1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"

---

## 🧪 TEST IF ENV VARS LOAD

Add this temporarily to `App.tsx` at the top:

```typescript
// TEMPORARY TEST CODE - Remove after testing
console.log('=== ENV VARS TEST ===');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Supabase Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Has Gemini Key:', !!import.meta.env.VITE_GEMINI_API_KEY);
console.log('Mode:', import.meta.env.MODE);
console.log('===================');
```

**Expected Output in Browser Console:**
```
=== ENV VARS TEST ===
Supabase URL: https://jvqyfxlozoehozunfzkv.supabase.co
Has Supabase Key: true
Has Gemini Key: true
Mode: development
===================
```

**If you see `undefined`:**
- Server wasn't restarted
- File is in wrong location
- Variable names are wrong (missing VITE_ prefix)

---

## 🔴 COMMON MISTAKES

### ❌ Wrong File Location
```
❌ kilimotech/src/.env.local
❌ kilimotech/services/.env.local
✅ kilimotech/.env.local  (project root)
```

### ❌ Wrong Variable Names
```
❌ SUPABASE_URL (missing VITE_ prefix)
❌ GEMINI_API_KEY (missing VITE_ prefix)
✅ VITE_SUPABASE_URL
✅ VITE_GEMINI_API_KEY
```

### ❌ Wrong Access Method
```
❌ process.env.VITE_GEMINI_API_KEY (Node.js style)
✅ import.meta.env.VITE_GEMINI_API_KEY (Vite style)
```

### ❌ Not Restarting Server
```
❌ Changing .env.local and just refreshing browser
✅ Kill node processes, restart server, THEN refresh browser
```

---

## 🚀 VERCEL DEPLOYMENT

When deploying to Vercel, add these 3 environment variables:

### Variable 1
```
Name: VITE_SUPABASE_URL
Value: https://jvqyfxlozoehozunfzkv.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

### Variable 2
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXlmeGxvem9laG96dW5memt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQ5MzAsImV4cCI6MjA3NzMwMDkzMH0.YjX377R6ScVbh7l29-iEA_GQjusI0Y7oS9TWJkg4bmo
Environments: ✓ Production ✓ Preview ✓ Development
```

### Variable 3
```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
Environments: ✓ Production ✓ Preview ✓ Development
```

**Where to add:**
1. Go to Vercel project
2. Settings → Environment Variables
3. Add all 3 variables
4. Redeploy

---

## 🔍 DEBUGGING CHECKLIST

- [ ] `.env.local` exists in project root
- [ ] File contains all 3 variables with VITE_ prefix
- [ ] No spaces around `=` sign
- [ ] No quotes around values
- [ ] Killed all node processes
- [ ] Restarted dev server
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked browser console for test output
- [ ] No console errors about missing keys

---

## 💡 WHY THIS HAPPENS

### Vite's Environment Variable Rules:

1. **Only `VITE_` prefixed vars are exposed to browser**
   - Security: Prevents leaking server-side secrets

2. **Variables are replaced at BUILD time**
   - Not runtime
   - Server restart required

3. **Browser caches old bundles**
   - Hard refresh required after server restart

---

## ✅ FINAL VERIFICATION

1. Start server: `npm run dev`
2. Open: `http://localhost:3000`
3. Open DevTools (F12) → Console
4. Look for: `✅ Gemini AI initialized successfully`
5. If you see that, it's working!

---

## 🆘 STILL NOT WORKING?

Try this nuclear option:

```bash
# 1. Kill all node
taskkill /F /IM node.exe

# 2. Delete cache
rm -rf node_modules/.vite
rm -rf dist

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev

# 5. New browser window (not just tab)
# 6. Hard refresh
```

---

## 📞 QUICK REFERENCE

| Issue | Fix |
|-------|-----|
| API key error | Restart server + hard refresh |
| `undefined` in console | Check file location & name |
| Still undefined | Kill node, restart, hard refresh |
| Works locally, not Vercel | Add env vars in Vercel dashboard |

**Remember:** Server restart + browser hard refresh = Solution to 90% of env var issues!

