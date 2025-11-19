
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseInstances {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
}

let firebaseInstances: FirebaseInstances | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isConfigValid = Object.values(firebaseConfig).every(Boolean);

export function initializeFirebase(): FirebaseInstances {
    if (firebaseInstances) {
        return firebaseInstances;
    }

    if (!isConfigValid) {
        throw new Error("Firebase environment variables are not set. Please check your .env file.");
    }

    let app: FirebaseApp;
    if (!getApps().length) {
        try {
            app = initializeApp(firebaseConfig);
        } catch (e) {
            console.error("Failed to initialize Firebase", e);
            throw e;
        }
    } else {
        app = getApp();
    }
    
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, db, auth };
    
    return firebaseInstances;
}

export const { app, db, auth } = initializeFirebase();
