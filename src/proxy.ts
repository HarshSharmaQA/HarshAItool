import { NextResponse, type NextRequest } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/redirects';
import { getFirestore } from 'firebase-admin/firestore';
import type { Redirect } from '@/lib/types';

let redirects: Redirect[] = [];
let lastFetched: number | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

async function fetchRedirects() {
    // Only fetch redirects in server environment
    if (typeof window !== 'undefined') {
        return;
    }

    const now = Date.now();
    if (lastFetched && (now - lastFetched) < CACHE_DURATION) {
        return;
    }
    
    try {
        const adminApp = initializeFirebaseAdmin();
        if (!adminApp.options) { // Check if the dummy object was returned
            console.warn("Proxy: Firebase Admin SDK not initialized, cannot fetch redirects.");
            return;
        }
        const db = getFirestore(adminApp);
        const redirectsSnapshot = await db.collection('redirects').get();
        
        if (redirectsSnapshot.empty) {
            redirects = [];
        } else {
            redirects = redirectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redirect));
        }
        lastFetched = now;
    } catch (error) {
        console.error("Error fetching redirects in proxy:", error);
    }
}

// Fetch redirects on server start (only in server environment)
if (typeof window === 'undefined') {
    fetchRedirects();
}

export async function proxy(request: NextRequest) {
    // Re-fetch in the background if cache is stale.
    // This won't block the current request.
    if (!lastFetched || (Date.now() - lastFetched) > CACHE_DURATION) {
         await fetchRedirects();
    }
    
    const { pathname } = new URL(request.url);

    for (const redirect of redirects) {
        if (redirect.source === pathname) {
            const url = new URL(redirect.destination, request.url);
            
            const response = NextResponse.redirect(url, redirect.type === '301' ? 301 : 302);
            
            // To handle 'openInNewTab', we can't do it server-side.
            // This would require a client-side solution if strictly needed.
            // For now, we'll just perform the redirect.
            return response;
        }
    }

  return NextResponse.next();
}

export const config = {
  // Match all paths except for API routes, Next.js internal paths, and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};