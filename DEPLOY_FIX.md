# Quick Deployment Fix

## The Problem
- Netlify CLI has a Windows path bug
- GitHub repository doesn't exist or isn't accessible

## ✅ SOLUTION: Create GitHub Repo & Deploy

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `HarshAItool`
3. Description: "Stratic CMS - Next.js"
4. Choose **Public** or **Private**
5. **UNCHECK** "Add a README file"
6. **UNCHECK** "Add .gitignore"
7. Click **"Create repository"**

### Step 2: Push Your Code

After creating the repo, run these commands:

```bash
cd c:\Users\harsh\Downloads\harshqa-main\harshqa-main

# Push to GitHub
git push -u origin main
```

### Step 3: Connect to Netlify

1. Go to https://app.netlify.com/projects/uploadenext
2. Click **Site settings** → **Build & deploy** → **Link repository**
3. Connect your GitHub account
4. Select the `HarshAItool` repository
5. Netlify will automatically deploy on every push!

## Environment Variables (Required!)

After connecting, add these in **Site settings** → **Environment variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value

FIREBASE_PROJECT_ID=your_value
FIREBASE_CLIENT_EMAIL=your_value
FIREBASE_PRIVATE_KEY=your_value
```

## Done!
Your site will be live at: **https://uploadenext.netlify.app**
