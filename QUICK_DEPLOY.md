# 🚀 QUICK START - Deploy to Vercel NOW

## 5-Minute Setup

### Step 1️⃣: Get Clerk Production Key (1 min)
```
1. Go to: https://dashboard.clerk.com
2. Settings → API Keys
3. Copy the key starting with "pk_live_"
```

### Step 2️⃣: Create Vercel Project (2 min)
```
1. Go to: https://vercel.com/dashboard
2. Click: "Add New Project"
3. Select: "Import Git Repository"
4. Paste: https://github.com/wajiddaudtamboli/NEBULYTIX-News-Application.git
5. Click: "Continue"
```

### Step 3️⃣: Add Environment Variables (1 min)
In the Vercel project setup page, scroll to "Environment Variables" and add:

```
Name: VITE_CLERK_PUBLISHABLE_KEY
Value: pk_live_YOUR_KEY_FROM_STEP_1

Name: VITE_API_URL
Value: https://your-backend-api.vercel.app/api/v1

Name: GNEWS_API_KEY
Value: 620573593e0bd3334493a1ba37c66d8c
```

### Step 4️⃣: Deploy (1 min)
```
Click: "Deploy"
Wait for completion
Visit your URL: https://your-project.vercel.app
```

### Step 5️⃣: Configure Clerk Domain (Optional but Recommended)
```
1. Go to: https://dashboard.clerk.com
2. Settings → Domains
3. Add your Vercel domain
4. Done!
```

---

## ✅ Verification Checklist

After deployment:
- [ ] Visit your Vercel URL
- [ ] No console errors (F12)
- [ ] Can see news loading
- [ ] Login/Signup works
- [ ] No "development keys" warning

---

## 📚 Detailed Guides Available

Need more help? Read these files in your project:

1. **PRODUCTION_READY.md** - Complete summary
2. **VERCEL_DEPLOYMENT.md** - Detailed Vercel guide
3. **CLERK_SETUP.md** - Clerk troubleshooting
4. **DEPLOYMENT_GUIDE.md** - All deployment options

---

## 🆘 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Development keys" error | Use `pk_live_*` key, not `pk_test_*` |
| API not loading | Check `VITE_API_URL` is set correctly |
| Login not working | Add Vercel domain to Clerk settings |
| Build fails | Run `npm install` locally, check build logs |

---

## 🎯 Done!

Your app is **ready for production** right now! Follow the 5 steps above to go live.

**GitHub Repository**: https://github.com/wajiddaudtamboli/NEBULYTIX-News-Application
