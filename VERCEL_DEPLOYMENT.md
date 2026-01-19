# Clerk Authentication Fix & Vercel Deployment Guide

## ✅ What's Been Done

1. **Fixed Clerk Configuration**
   - Updated environment variable setup for development and production
   - Created `.env.production` for Vercel deployment
   - Updated `vite.config.ts` to properly handle environment variables

2. **Removed Mock Data**
   - Only real API data is fetched
   - Removed breaking news ticker (red bar)
   - API-first architecture

3. **Backend Running**
   - MongoDB connected successfully
   - API endpoints available on http://localhost:5001/api/v1
   - News fetching through backend API

4. **Pushed to GitHub**
   - All changes committed to main branch
   - Repository: https://github.com/wajiddaudtamboli/NEBULYTIX-News-Application

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Get Production Clerk Keys

**IMPORTANT**: The error you're seeing is because the development Clerk key is being used. Follow these steps:

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Sign in with your account
3. Select your application: **solid-ounce-68**
4. Navigate to **API Keys** section
5. Copy the **Production Publishable Key** (starts with `pk_live_`)
6. Keep this safe - you'll need it for Vercel

### Step 2: Deploy Frontend to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Visit https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Paste GitHub URL: `https://github.com/wajiddaudtamboli/NEBULYTIX-News-Application.git`
5. Click **"Continue"**
6. Vercel will auto-detect Vite configuration
7. Scroll down to **"Environment Variables"**
8. Add these three variables:

   ```
   VITE_CLERK_PUBLISHABLE_KEY = pk_live_YOUR_PRODUCTION_KEY_HERE
   VITE_API_URL = https://your-backend-url/api/v1
   GNEWS_API_KEY = 620573593e0bd3334493a1ba37c66d8c
   ```

   Replace `YOUR_PRODUCTION_KEY_HERE` with the key from Step 1.

9. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally (if not already)
npm i -g vercel

# From project directory
cd "d:\All Projects\Nebulytix News"

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - When asked for directory, press Enter (uses current)
# - Set environment variables when prompted
```

### Step 3: Configure Clerk for Production

After deployment, you need to update Clerk settings:

1. Go to **Clerk Dashboard** → https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your Vercel deployment domain:
   - Example: `nebulytix-news-app.vercel.app`
   - Or your custom domain if you have one
5. Click **"Add"**
6. Wait for DNS verification (usually instant for Vercel)

### Step 4: Backend API Endpoint

You have two options for backend:

#### Option A: Deploy Backend to Vercel Too

1. Create a separate Vercel project for the backend
2. Deploy server code to `server/` directory
3. Get the deployment URL
4. Update `VITE_API_URL` in frontend Vercel project to your backend URL

#### Option B: Use Existing Backend (Recommended for now)

Since your MongoDB is already set up, you can:

1. Deploy the backend to Render, Railway, or keep it running locally
2. Update `VITE_API_URL` in Vercel to your backend URL
3. Example: `https://nebulytix-api.vercel.app/api/v1`

### Step 5: Verify Production Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://nebulytix-news-app.vercel.app`)
2. Check browser console (F12) for errors
3. The Clerk error should be gone
4. You should see:
   - News loading from API
   - Ability to sign up/login
   - No "development keys" warning

---

## 🔧 Environment Variables Explained

| Variable | Purpose | Development | Production |
|----------|---------|-------------|-----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication | `pk_test_*` (dev key) | `pk_live_*` (production key) |
| `VITE_API_URL` | Backend API endpoint | `http://localhost:5001/api/v1` | Your backend URL |
| `GNEWS_API_KEY` | GNews API for external news | Same key | Same key |

---

## 📋 Troubleshooting

### Problem: "Clerk has been loaded with development keys"
**Solution**: 
- Make sure you're using `pk_live_*` key, not `pk_test_*`
- Verify in Vercel: Settings → Environment Variables → Check `VITE_CLERK_PUBLISHABLE_KEY`
- Redeploy after updating variables

### Problem: API calls failing
**Solution**:
- Check `VITE_API_URL` is set correctly
- Verify backend is running and accessible
- Check CORS settings on backend

### Problem: Build fails on Vercel
**Solution**:
- Check Vercel build logs: Deployments → click failed deployment → View build logs
- Ensure all environment variables are set
- Try building locally: `npm run build`

### Problem: Login/Signup not working
**Solution**:
- Check Clerk dashboard → Settings → Domains
- Ensure your Vercel domain is added and verified
- Check browser console for error messages

---

## 📚 Files Modified/Created

1. **`.env`** - Development environment (local development)
2. **`.env.production`** - Production environment template
3. **`vite.config.ts`** - Updated to handle env variables
4. **`DEPLOYMENT_GUIDE.md`** - This detailed guide
5. **`vercel.json`** - Vercel deployment configuration

---

## 🎯 Quick Checklist

- [ ] Get production Clerk key from Clerk Dashboard
- [ ] Visit https://vercel.com and sign in
- [ ] Import GitHub repository
- [ ] Add environment variables to Vercel project
- [ ] Deploy
- [ ] Add Vercel domain to Clerk settings
- [ ] Test production site
- [ ] Verify no console errors

---

## 📞 Support Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev

---

## Next Steps After Deployment

1. ✅ Monitor Vercel deployments dashboard
2. ✅ Set up custom domain (optional)
3. ✅ Configure analytics/monitoring
4. ✅ Set up error tracking (Sentry, etc.)
5. ✅ Optimize performance
6. ✅ Set up CI/CD workflows

---

**Status**: Ready for deployment! 🚀
