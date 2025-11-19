
import { initializeApp, getApp, getApps, type App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig, isFirebaseAdminConfigValid } from './config-admin';

interface FirebaseAdminInstances {
  admin: App;
  db: Firestore;
}

const APP_NAME = 'stratic-cms-admin';

function getFirebaseAdmin(): FirebaseAdminInstances {
    if (getApps().some(app => app.name === APP_NAME)) {
        const app = getApp(APP_NAME);
        const db = getAdminFirestore(app);
        return { admin: app, db };
    }

    if (!isFirebaseAdminConfigValid()) {
        throw new Error("Firebase Admin SDK credentials are not configured. Server-side operations will fail.");
    }
      
    const app = initializeApp({
        credential: cert(firebaseAdminConfig.credential as ServiceAccount),
    }, APP_NAME);

    const db = getAdminFirestore(app);
    return { admin: app, db };
}


export function initializeFirebase(): FirebaseAdminInstances {
    return getFirebaseAdmin();
}
