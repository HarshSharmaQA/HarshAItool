# Deploying Stratic CMS to Netlify

This guide outlines the steps to deploy the Stratic CMS (Next.js application) to Netlify.

## Prerequisites

1.  **Netlify Account**: Create one at [netlify.com](https://www.netlify.com/).
2.  **Git Repository**: Push this code to a GitHub, GitLab, or Bitbucket repository.
3.  **Firebase Project**: You should have your Firebase project set up.

## Deployment Steps (Recommended Method: Git Integration)

1.  **Log in to Netlify**: Go to your Netlify dashboard.
2.  **Add New Site**: Click **"Add new site"** > **"Import an existing project"**.
3.  **Connect to Git**: Choose your Git provider (e.g., GitHub) and authorize Netlify.
4.  **Select Repository**: Pick the repository containing this code.
5.  **Configure Build Settings**:
    *   **Base directory**: (Leave empty or `./`)
    *   **Build command**: `npm run build`
    *   **Publish directory**: `.next` (Note: The `netlify.toml` file in the project should handle this automatically, but verify if asked).
    *   **Runtime**: Netlify should automatically detect Next.js and install the Essential Next.js plugin.

6.  **Environment Variables**:
    *   Click on **"Show advanced"** or go to **Site Settings > Environment variables** after the site is created.
    *   You MUST add the following variables from your `.env` file:
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        *   `NEXT_PUBLIC_FIREBASE_APP_ID`
        *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (if applicable)
    *   **For Server-Side Admin Features**:
        *   `FIREBASE_PROJECT_ID`
        *   `FIREBASE_CLIENT_EMAIL`
        *   `FIREBASE_PRIVATE_KEY` (Note: When pasting the private key into Netlify, ensure newlines are preserved or handled correctly. You might need to replace `\n` with actual newlines or check how Netlify handles it).

7.  **Deploy**: Click **"Deploy site"**.

## Alternative Method: Netlify CLI

If you prefer to deploy from your command line:

1.  Install Netlify CLI: `npm install -g netlify-cli`
2.  Login: `netlify login`
3.  Initialize: `netlify init` (Follow the prompts to link to a new or existing site).
4.  Deploy: `netlify deploy --prod` (This will build and deploy the site).

## Troubleshooting

*   **Build Fails**: Check the "Deploy log" in Netlify. Common issues include missing dependencies or type errors.
*   **Environment Variables**: If the app loads but Firebase features fail, double-check that the environment variables are set correctly in Netlify.
*   **Functions**: This deployment covers the Next.js application. The Firebase Functions (in `functions/`) are deployed separately to Firebase using `firebase deploy --only functions`.
