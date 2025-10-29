# 🚀 Deployment Guide - KilimoTech

This guide will walk you through deploying KilimoTech to Vercel and pushing to GitHub.

## Prerequisites

- ✅ Git installed
- ✅ GitHub account
- ✅ Vercel account (free tier works great)
- ✅ All environment variables ready

## Part 1: Push to GitHub

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Name your repository: `kilimotech`
3. **Important:** Do NOT initialize with README (we already have one)
4. Click "Create repository"

### Step 2: Add Files to Git

From your project directory, run:

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Commit the changes
git commit -m "Initial commit: KilimoTech agricultural finance platform"
```

### Step 3: Connect to GitHub

Copy the commands from your new GitHub repository page:

```bash
# If you haven't set the remote yet
git remote add origin https://github.com/yourusername/kilimotech.git

# Or if remote already exists, update it
git remote set-url origin https://github.com/yourusername/kilimotech.git

# Push to GitHub
git push -u origin main
```

### Step 4: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files
3. **Verify `.env.local` is NOT visible** (it should be gitignored)
4. Check that `README.md` displays correctly

## Part 2: Deploy to Vercel

### Step 1: Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. **Recommended:** Sign up with your GitHub account for easier integration

### Step 2: Import Your Repository

1. Click "Add New..." → "Project"
2. You'll see a list of your GitHub repositories
3. Find `kilimotech` and click "Import"

### Step 3: Configure Project

Vercel will auto-detect your Vite project:

**Build & Development Settings:**
- Framework Preset: `Vite` (auto-detected)
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)
- Install Command: `npm install` (auto-detected)

**Root Directory:** Leave as `.` (root)

### Step 4: Add Environment Variables

**CRITICAL:** Add these before deploying!

1. Click "Environment Variables"
2. Add each variable:

```
Name: VITE_SUPABASE_URL
Value: https://jvqyfxlozoehozunfzkv.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXlmeGxvem9laG96dW5memt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQ5MzAsImV4cCI6MjA3NzMwMDkzMH0.YjX377R6ScVbh7l29-iEA_GQjusI0Y7oS9TWJkg4bmo
```

```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

**Environment:** Select "Production", "Preview", and "Development"

### Step 5: Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build your project
   - Deploy to a unique URL

**Deployment takes about 2-3 minutes** ⏱️

### Step 6: Verify Deployment

Once complete, you'll see:
- ✅ "Your project has been deployed"
- 🔗 A production URL (e.g., `kilimotech.vercel.app`)

**Test your deployment:**
1. Click "Visit" to open your live site
2. Test login functionality
3. Try generating AI insights
4. Verify Supabase connection works

## Part 3: Configure Custom Domain (Optional)

### Add a Custom Domain

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Enter your custom domain (e.g., `kilimotech.com`)
4. Follow Vercel's DNS configuration instructions

**Domain providers supported:**
- Namecheap
- GoDaddy
- Cloudflare
- Route53
- Any DNS provider

## Part 4: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push

# Vercel will automatically:
# 1. Detect the push
# 2. Build your project
# 3. Deploy to production
```

### Preview Deployments

- Every branch gets a unique preview URL
- Perfect for testing before merging to main

### Rollback

If something goes wrong:
1. Go to Vercel dashboard → "Deployments"
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Environment-Specific Settings

### Development
Local `.env.local` file (already configured)

### Production
Vercel environment variables (configured in dashboard)

### Preview Branches
Same as production by default, can be customized

## Monitoring & Analytics

### Vercel Analytics

1. Go to your project → "Analytics"
2. Click "Enable Analytics"
3. View:
   - Page views
   - User locations
   - Performance metrics

### Error Tracking

Check deployment logs:
1. Go to "Deployments"
2. Click on any deployment
3. View build logs and runtime logs

## Vercel CLI (Optional)

Install Vercel CLI for local deployment testing:

```bash
# Install globally
npm install -g vercel

# Login
vercel login

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

## Security Best Practices

### ✅ Do's
- Use environment variables for all secrets
- Enable Vercel's security headers (already configured in `vercel.json`)
- Regularly rotate API keys
- Monitor deployment logs for errors

### ❌ Don'ts
- Never commit `.env.local` to GitHub
- Don't share your deployment URL with untrusted users during development
- Don't use the same API keys for dev and production

## Troubleshooting Deployment Issues

### Build Failures

**Error: "Build failed"**
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel logs for specific errors
```

**Error: "Module not found"**
```bash
# Ensure all dependencies are in package.json
npm install

# Commit updated package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variable Issues

**Error: "Missing environment variables"**
1. Go to Vercel → Project Settings → Environment Variables
2. Verify all three variables are present
3. Ensure they're set for Production, Preview, and Development
4. Redeploy the project

### Supabase Connection Fails in Production

1. Check Supabase URL is correct (no trailing slash)
2. Verify API key is the anon key, not service role key
3. Check Supabase project is active
4. Verify Row Level Security policies allow access

### Gemini API Errors in Production

1. Verify API key is correct
2. Check quota limits in Google AI Studio
3. Ensure API key has no usage restrictions

## Performance Optimization

### Enable Vercel Speed Insights

```bash
npm install @vercel/analytics

# Add to your main App component
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Edge Caching

Vercel automatically caches static assets at the edge for faster load times.

## Cost Estimation

### Free Tier (Hobby)
- ✅ 100 GB bandwidth per month
- ✅ Unlimited personal projects
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Preview deployments

**Perfect for KilimoTech MVP!**

### Pro Tier ($20/month)
- Needed if you exceed free tier limits
- Team collaboration features
- Priority support

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Test locally
npm run dev
npm run build

# Commit and push
git add .
git commit -m "Update dependencies"
git push
```

### Monitor Deployment Status

- Enable email notifications in Vercel settings
- Check deployment status at vercel.com/dashboard

## Backup & Recovery

### Supabase Backup

Supabase automatically backs up your database daily.

Manual backup:
1. Go to Supabase → Database → Backups
2. Create a manual backup before major changes

### Code Backup

Your code is safely stored on GitHub. Always:
- Commit regularly
- Use descriptive commit messages
- Create branches for major features

## Success Checklist

Before considering deployment complete:

- [ ] GitHub repository is public/private as intended
- [ ] `.env.local` is NOT in GitHub (check!)
- [ ] Vercel project is deployed successfully
- [ ] All three environment variables added to Vercel
- [ ] Production URL loads correctly
- [ ] Login functionality works
- [ ] AI Insights generate successfully
- [ ] Supabase data loads correctly
- [ ] M-Pesa upload feature works
- [ ] Mobile responsive (test on phone)

## Next Steps

After successful deployment:

1. **Share your app:** Send the Vercel URL to users
2. **Monitor usage:** Check Vercel analytics
3. **Gather feedback:** Collect user feedback
4. **Iterate:** Make improvements based on feedback
5. **Scale:** Upgrade Vercel plan if needed

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev

## Congratulations! 🎉

Your KilimoTech platform is now live and accessible to users worldwide!

**Your deployment URLs:**
- Production: `https://kilimotech.vercel.app` (or your custom domain)
- GitHub: `https://github.com/yourusername/kilimotech`

---

**Need help?** Open an issue on GitHub or check the Vercel dashboard for deployment logs.

