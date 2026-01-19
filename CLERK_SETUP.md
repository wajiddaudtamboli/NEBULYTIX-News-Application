# Clerk Configuration Guide - Fix Development Key Warning

## The Problem

You're seeing this error:
```
"Clerk has been loaded with development keys. Development instances have strict usage limits..."
"ClerkJS: Something went wrong initializing Clerk in development mode..."
```

**Root Cause**: Your `.env` file contains a **test/development Clerk key** (`pk_test_*`) instead of a **production key** (`pk_live_*`).

---

## Solution: Get Your Production Clerk Key

### Step 1: Access Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Sign in with your Clerk account
3. Select your application (should be "solid-ounce-68")

### Step 2: Find Your API Keys

1. In the left sidebar, click **"API Keys"** or **"Settings"**
2. Look for the section labeled **"Publishable Key"** or **"API Keys"**
3. You should see two keys:
   - **Development**: `pk_test_...` (what you currently have)
   - **Production**: `pk_live_...` (what you need)

### Step 3: Copy Production Key

1. Find the line that says **"Production"**
2. Click **"Copy"** next to the `pk_live_*` key
3. Save it somewhere safe (you'll need it)

---

## Update Your Environment Variables

### For Local Development
Edit `.env` file:
```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c29saWQtb3VuY2UtNjguY2xlcmsuYWNjb3VudHMuZGV2JA
```
(Keep the test key for local development - it's fine)

### For Production (Vercel)

When you deploy to Vercel:

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **"Environment Variables"**
3. Add or update this variable:
   - **Name**: `VITE_CLERK_PUBLISHABLE_KEY`
   - **Value**: `pk_live_YOUR_KEY_HERE` (from Step 3 above)
   - **Environments**: Check `Production`, `Preview`, `Development`
4. Click **"Save"**
5. Redeploy your project

---

## Clerk Domain Configuration (Important!)

After deploying to Vercel, you MUST add your domain to Clerk:

### Step 1: Get Your Deployment Domain
- Vercel automatically gives you a domain like: `nebulytix-news-app.vercel.app`
- Or use your custom domain

### Step 2: Add Domain to Clerk
1. Go to Clerk Dashboard → **Settings** → **Domains**
2. Click **"Add Domain"** or **"Add Production URL"**
3. Enter your domain:
   - `https://nebulytix-news-app.vercel.app` (with https://)
4. Click **"Add"**
5. Clerk will verify automatically (may take a few seconds)

### Step 3: Configure Redirect URLs (if needed)
1. In Clerk Dashboard → **Settings** → **Redirect URLs**
2. Add your Vercel domain and paths:
   - `https://nebulytix-news-app.vercel.app/sign-in`
   - `https://nebulytix-news-app.vercel.app/sign-up`
   - `https://nebulytix-news-app.vercel.app/`

---

## Verification Checklist

- [ ] I found my production Clerk key (`pk_live_*`)
- [ ] I added it to Vercel environment variables
- [ ] I added my Vercel domain to Clerk → Settings → Domains
- [ ] I redeployed my Vercel project
- [ ] I cleared browser cache (Ctrl+Shift+Delete)
- [ ] The error message is gone
- [ ] Login/Signup buttons work

---

## Still Getting the Error?

### Debug Steps:

1. **Check Vercel Environment Variables**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   # Look for VITE_CLERK_PUBLISHABLE_KEY
   # Make sure it starts with pk_live_
   ```

2. **Verify Domain in Clerk**
   ```
   Clerk Dashboard → Settings → Domains
   Should see your Vercel domain listed
   ```

3. **Check Build Logs**
   ```
   Vercel Dashboard → Deployments
   Click your deployment → View Build Logs
   Search for "VITE_CLERK_PUBLISHABLE_KEY"
   ```

4. **Force Redeploy**
   ```
   Vercel Dashboard → Deployments
   Click your latest deployment → Redeploy
   ```

5. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Or clear cache: F12 → Application → Clear Storage

---

## Environment Variable Reference

### Development (.env)
```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c29saWQtb3VuY2UtNjguY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_API_URL=http://localhost:5001/api/v1
```

### Production (.env.production or Vercel)
```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## Key Differences: Development vs Production

| Aspect | Development | Production |
|--------|-------------|-----------|
| Key Format | `pk_test_*` | `pk_live_*` |
| Rate Limits | Strict | Higher limits |
| Warnings | "Development keys" warning | No warnings |
| Use Cases | Local development, testing | Live production app |
| Domain | localhost | Your Vercel/custom domain |

---

## Quick Copy-Paste

When deploying, use this template for Vercel environment variables:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_KEY_HERE]
VITE_API_URL=https://your-backend-api.vercel.app/api/v1
GNEWS_API_KEY=620573593e0bd3334493a1ba37c66d8c
```

---

## Need More Help?

- **Clerk Docs**: https://clerk.com/docs
- **Environment Variables**: https://clerk.com/docs/deployments/overview
- **Custom Domains**: https://clerk.com/docs/deployments/set-up-your-application

---

**Once you follow these steps, the "development keys" error will be gone! 🎉**
