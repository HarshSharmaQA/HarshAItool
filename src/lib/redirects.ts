
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { firebaseAdminConfig, isFirebaseAdminConfigValid } from '@/firebase/config-admin';
import type { ServiceAccount } from 'firebase-admin/app';

let adminApp: App | null = null;

// This function is intended to be used only in the middleware,
// where the full Firebase server context might not be available.
export function initializeFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }
  
  if (!isFirebaseAdminConfigValid()) {
    console.warn("Firebase Admin SDK credentials not configured in middleware. Redirects will not work.");
    // Return a dummy object to prevent crashes in case of no config
    return { options: null } as any;
  }

  if (getApps().length === 0) {
    try {
      adminApp = initializeApp({
        credential: cert(firebaseAdminConfig.credential as ServiceAccount),
      }, 'middlewareApp'); // Use a unique name for the app instance
      return adminApp;
    } catch (error) {
      console.error("Middleware: Failed to initialize Firebase Admin SDK:", error);
      return { options: null } as any;
    }
  } else {
    // Try to get the uniquely named app, or the default app.
    adminApp = getApps().find(app => app.name === 'middlewareApp') || getApp();
    return adminApp;
  }
}
