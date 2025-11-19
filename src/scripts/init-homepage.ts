import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase Admin configuration
const serviceAccount = {
  "type": process.env.FIREBASE_TYPE || "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID || "",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "",
  "private_key": (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL || "",
  "client_id": process.env.FIREBASE_CLIENT_ID || "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL || "",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin
const app = !getApps().length 
  ? initializeApp({
      credential: cert(serviceAccount as any),
    })
  : getApp();

const db = getFirestore(app);

// Default home page data
const defaultHomePage = {
  blocks: [
    {
      id: 'hero-1',
      type: 'hero',
      title: 'Welcome to Stratic CMS',
      subtitle: 'A powerful content management system built with Next.js and Firebase',
      preTitle: 'Modern & Flexible',
      ctaText: 'Get Started',
      ctaLink: '/admin',
      theme: 'light',
      showScroll: true,
    },
    {
      id: 'features-1',
      type: 'features',
      title: 'Powerful Features',
      subtitle: 'Everything you need to build amazing websites',
      features: [
        {
          id: 'feature-1',
          icon: 'Zap',
          title: 'Lightning Fast',
          description: 'Built with Next.js for optimal performance and speed'
        },
        {
          id: 'feature-2',
          icon: 'Database',
          title: 'Firebase Backend',
          description: 'Secure and scalable backend with real-time database'
        },
        {
          id: 'feature-3',
          icon: 'Layout',
          title: 'Flexible Blocks',
          description: 'Drag-and-drop interface for building custom pages'
        }
      ]
    },
    {
      id: 'cta-1',
      type: 'cta',
      title: 'Ready to get started?',
      subtitle: 'Join thousands of developers using Stratic CMS',
      ctaText: 'Sign Up Free',
      ctaLink: '/admin',
      ctaOpenInNewTab: false
    }
  ],
  seoTitle: 'Home',
  seoDescription: 'Welcome to our website',
  canonicalUrl: '',
  noIndex: false,
  author: '',
  publisher: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

async function initHomePage() {
  try {
    console.log('Initializing home page data...');
    
    // Check if homepage data already exists
    const homePageDoc = await db.collection('settings').doc('homepage').get();
    
    if (!homePageDoc.exists) {
      // Create homepage data
      await db.collection('settings').doc('homepage').set(defaultHomePage);
      console.log('Home page data initialized successfully!');
    } else {
      console.log('Home page data already exists.');
    }
    
    // Also initialize default settings if they don't exist
    const settingsDoc = await db.collection('settings').doc('site').get();
    
    if (!settingsDoc.exists) {
      const defaultSettings = {
        siteTitle: 'Stratic CMS',
        siteDescription: 'A statically generated website using Next.js and Firebase.',
        siteLogoUrl: '',
        faviconUrl: '',
        theme: 'system',
        currency: '₹',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('settings').doc('site').set(defaultSettings);
      console.log('Default site settings initialized successfully!');
    } else {
      console.log('Site settings already exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing home page data:', error);
    process.exit(1);
  }
}

// Run the initialization
initHomePage();