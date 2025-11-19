# Manual Deployment to Netlify - Alternative Method

Since the Netlify CLI has issues on Windows with Next.js, here's an alternative approach:

## Option 1: Use Git Integration (STRONGLY RECOMMENDED)

This is the most reliable way to deploy Next.js apps to Netlify.

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `stratic-cms` (or any name)
3. Make it **Public**
4. **Don't** add README or .gitignore
5. Click "Create repository"

### Step 2: Push Your Code
```bash
cd c:\Users\harsh\Downloads\harshqa-main\harshqa-main

# Remove the invalid remote
git remote remove origin

# Add your new repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/stratic-cms.git

# Push
git push -u origin main
```

### Step 3: Connect to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: (leave empty, the plugin will handle it)
6. Click "Deploy site"

### Step 4: Add Environment Variables
In Netlify dashboard → Site settings → Environment variables, add all your Firebase credentials from your local `.env` file.

---

## Option 2: Deploy to Existing Site via Dashboard

If you want to use your existing `qaharsharma` site or create a new one:

### For Existing Site:
1. Go to https://app.netlify.com/projects/qaharsharma (or the correct URL)
2. Go to "Site settings" → "Build & deploy"
3. Click "Link repository"
4. Follow the Git integration steps above

### For New Site:
1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. For Next.js this won't work properly without Git integration

---

## ⚠️ Why CLI Doesn't Work

The Netlify CLI on Windows has a path duplication bug with this project structure:
```
Error path: C:\Users\harsh\Downloads\harshqa-main\harshqa-main\Downloads\harshqa-main\harshqa-main\.next\...
```

**Solution**: Use Git deployment instead.

---

## Your Available Sites

According to Netlify CLI, you have:

1. **uploadenext**
   - URL: https://uploadenext.netlify.app
   - ID: 3cbaf481-96e6-4d12-995b-038926d46ac2

2. **qaharshifo**
   - URL: https://qaharshifo.netlify.app
   - ID: 4ed74df6-cb32-4a42-a732-95c333b3ea71

Choose one of these or create a new one via Git integration.

---

## Quick Start - Git Method

```bash
# 1. Create repo on GitHub first, then:

cd c:\Users\harsh\Downloads\harshqa-main\harshqa-main

# 2. Update remote
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 3. Push
git push -u origin main

# 4. Go to Netlify dashboard and link the repo
```

This is the ONLY reliable way to deploy Next.js to Netlify from Windows.
