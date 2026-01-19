# Deployment Setup Guide for Nebulytix News

## Prerequisites
1. Clerk Account: https://clerk.com
2. Vercel Account: https://vercel.com
3. GitHub Account with repository access
4. MongoDB Atlas Account (already configured)

## Step 1: Get Production Clerk Keys

1. Go to https://dashboard.clerk.com
2. Navigate to **API Keys** section
3. Copy your **Production Publishable Key** (starts with `pk_live_`)
4. You'll use this in Vercel environment variables

## Step 2: Prepare for Deployment

### Local Build Test
```bash
npm run build
```

### Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import GitHub repository: `wajiddaudtamboli/NEBULYTIX-News-Application`
4. Configure project settings:
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option C: Connect Repository (Recommended)
1. Go to https://vercel.com
2. Click "New Project"
3. Connect your GitHub account
4. Select `NEBULYTIX-News-Application` repository
5. Vercel will auto-detect Vite configuration

## Step 4: Set Environment Variables on Vercel

After creating the Vercel project, add these environment variables:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
VITE_API_URL=https://your-backend-api-url/api/v1
GNEWS_API_KEY=620573593e0bd3334493a1ba37c66d8c
```

### How to add environment variables:
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - Name: `VITE_CLERK_PUBLISHABLE_KEY`
   - Value: `pk_live_YOUR_PRODUCTION_KEY`
   - Environments: Select `Production`, `Preview`, `Development`
4. Click "Save"
5. Repeat for other variables
6. Redeploy your project

## Step 5: Backend Deployment (Optional for API)

If you want to deploy your Express backend to Vercel too:

1. Create separate `vercel.json` in `/server` directory
2. Deploy as separate project
3. Update `VITE_API_URL` to your backend Vercel URL

Or use Render, Railway, or your preferred hosting for the backend.

## Step 6: Configure Clerk for Production Domain

1. Go to https://dashboard.clerk.com
2. Navigate to **Settings** → **Domains**
3. Add your Vercel deployment domain:
   - Example: `nebulytix-news-app.vercel.app`
4. Also add any custom domains you plan to use
5. Update redirect URIs in Clerk settings

## Step 7: Verify Deployment

After deployment, test:
1. Visit your deployed app URL
2. Try signing up/logging in
3. Check console for any errors
4. Verify API calls are working

## Troubleshooting

### "Clerk has been loaded with development keys" error
- Your `VITE_CLERK_PUBLISHABLE_KEY` is still the test key
- Replace with production key from Clerk dashboard
- Make sure to rebuild and redeploy

### API calls failing in production
- Check `VITE_API_URL` environment variable
- Ensure CORS is properly configured on backend
- Verify backend is deployed and running

### Build fails on Vercel
- Check build logs: Vercel Dashboard → Deployments → View build logs
- Ensure all environment variables are set
- Run `npm run build` locally to debug

## Environment Variables Summary

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_*` | `pk_live_*` |
| `VITE_API_URL` | `http://localhost:5001/api/v1` | Your backend URL |
| `GNEWS_API_KEY` | Same | Same |

## Files Modified
- `.env` - Development configuration
- `.env.production` - Production configuration
- `vercel.json` - Vercel deployment settings

## Next Steps
1. ✅ Get production Clerk Publishable Key
2. ✅ Push code to GitHub
3. ✅ Create Vercel project from GitHub
4. ✅ Add environment variables to Vercel
5. ✅ Deploy and test

## Support
- Clerk Docs: https://clerk.com/docs
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
