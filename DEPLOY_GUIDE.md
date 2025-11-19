# Deploying to Netlify - Step by Step Guide

## ⚠️ Important: CLI Deployment Issue
The Netlify CLI has a path duplication bug on Windows with this project. **Use Git integration instead** (recommended method below).

## ✅ Recommended Method: Deploy via Netlify Dashboard

### Step 1: Push Code to GitHub

Run these commands in your terminal (not in the Git Bash that has permission issues):

```bash
# Navigate to your project
cd c:\Users\harsh\Downloads\harshqa-main\harshqa-main

# Add only the project files (excluding node_modules, .next, etc.)
git status

# Commit your changes
git commit -m "Prepare for Netlify deployment"

# Push to GitHub
git push origin main
```

If `git add` hangs due to permission issues, add only specific files:
```bash
git add netlify.toml
git add src/
git add functions/
git add package.json
git add next.config.js
git add tailwind.config.ts
git add tsconfig.json
git add DEPLOY.md
git add PRD.md
```

### Step 2: Connect Repository to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click on your existing site: **uploadenext** (https://uploadenext.netlify.app)
3. Go to **Site settings** > **Build & deploy** > **Continuous deployment**
4. Under "Build settings":
   - **Build command**: `npm run build` (should be auto-detected)
   - **Publish directory**: Leave empty (the plugin handles this)
   - **Base directory**: Leave empty

### Step 3: Configure Environment Variables

Go to **Site settings** > **Environment variables** and add:

**Required Firebase Client Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

**Required Firebase Admin Variables (for server-side functions):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` ⚠️ **Important**: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. Replace `\n` with actual newlines.

### Step 4: Trigger Deployment

After pushing to GitHub, Netlify will:
1. Automatically detect the push
2. Start a new build
3. Deploy the site

You can monitor the deployment at: **Deploys** tab in your Netlify dashboard.

### Step 5: Deploy Firebase Functions Separately

The email functions and triggers need to be deployed to Firebase:

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions
```

## 🔧 Alternative: Force Deploy via CLI (if Git has issues)

Only use this if you cannot push to Git. This may still have path issues on Windows:

```bash
# Build locally first
npm run build

# Deploy the .next folder directly
npx netlify deploy --dir=.next --prod
```

## 🌐 Your Deployed Sites

- **Netlify URL**: https://uploadenext.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/uploadenext

## 📋 Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Firebase authentication works
- [ ] Admin dashboard is accessible
- [ ] Images load properly
- [ ] Forms submit successfully
- [ ] Email functions are deployed to Firebase
- [ ] Test email functionality

## ⚡ Troubleshooting

**Build fails on Netlify:**
- Check the deploy logs in Netlify dashboard
- Ensure all environment variables are set correctly

**Firebase features don't work:**
- Verify environment variables are set in Netlify
- Check Firebase security rules allow your Netlify domain

**Email functions don't work:**
- Make sure you ran `firebase deploy --only functions`
- Check Firebase Functions logs for errors
