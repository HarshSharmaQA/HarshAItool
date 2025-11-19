# DEPLOY NOW - Quick Steps to Get Your Site Live

## Step 1: Create GitHub Repository (2 minutes)

1. **Open this link in your browser**: https://github.com/new

2. **Fill in the form**:
   - Repository name: `HarshAItool`
   - Description: `Stratic CMS - Next.js Application`
   - Choose: **Public** (recommended) or Private
   - **IMPORTANT**: UNCHECK all boxes:
     - [ ] Add a README file
     - [ ] Add .gitignore
     - [ ] Choose a license
   
3. Click **"Create repository"**

## Step 2: Push Your Code (1 minute)

After creating the repository, run these commands in your terminal:

```bash
cd c:\Users\harsh\Downloads\harshqa-main\harshqa-main

# Push to GitHub
git push -u origin main
```

**If you get an authentication error**, GitHub will show you a login popup or ask for credentials.

## Step 3: Connect to Netlify (3 minutes)

### Option A: Use `uploadenext` site

1. Go to: **https://app.netlify.com/sites/uploadenext**
2. Click **"Site configuration"** → **"Build & deploy"**
3. Click **"Link repository"**
4. Choose **"GitHub"**
5. Authorize Netlify if asked
6. Select **`HarshAItool`** repository
7. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: (leave empty)
8. **Don't click Deploy yet!** Go to Step 4 first

### Option B: Use `qaharshifo` site

Same steps as above, but go to:
**https://app.netlify.com/sites/qaharshifo**

## Step 4: Add Environment Variables (CRITICAL!)

**Before deploying**, you MUST add these:

1. In Netlify, go to: **Site configuration** → **Environment variables**
2. Click **"Add a variable"** and add each one:

**Copy these from your `.env` file:**

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

**IMPORTANT for FIREBASE_PRIVATE_KEY:**
- Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- It should be multiple lines - Netlify will handle this correctly

## Step 5: Deploy!

1. Go to **"Deploys"** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes for the build to complete

## ✅ Your Site Will Be Live At:

- **Option A**: https://uploadenext.netlify.app
- **Option B**: https://qaharshifo.netlify.app

---

## Troubleshooting

**Build fails?**
- Check the deploy logs in Netlify
- Make sure all environment variables are set

**404 error?**
- The site might still be deploying (check the "Deploys" tab)
- Clear your browser cache

**Firestore errors?**
- Double-check your environment variables
- Make sure FIREBASE_PRIVATE_KEY is complete

---

## After Deployment

Don't forget to:
1. Deploy Firebase Functions: `firebase deploy --only functions`
2. Update your Firebase security rules to allow your Netlify domain
3. Test all functionality (login, admin panel, etc.)

---

## Need Help?

If GitHub repository creation asks for authentication:
- Use your GitHub username
- Use a **Personal Access Token** (not your password)
- Generate one at: https://github.com/settings/tokens
