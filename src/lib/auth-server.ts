
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import type { AuthenticatedUser } from './types';
import { MASTER_ADMIN_EMAIL } from './auth-constants';
import { cookies } from 'next/headers';
import { initializeFirebase } from '@/firebase/server-initialization';

async function getDecodedIdToken(admin: App) {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('idToken')?.value;
    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await getAuth(admin).verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        // console.error("Error verifying ID token:", error);
        return null;
    }
}

export async function getAuthenticatedUser(idToken: string, admin: App): Promise<AuthenticatedUser | null> {
    try {
        const decodedToken = await getAuth(admin).verifyIdToken(idToken);
        if (!decodedToken) {
            return null;
        }
        return {
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            displayName: decodedToken.name || null,
            approved: (decodedToken.approved as boolean) || false
        };
    } catch (e) {
        return null;
    }
}


export async function isAdmin(idToken: string, admin: App): Promise<boolean> {
    const decodedToken = await getAuthenticatedUser(idToken, admin);
    if (!decodedToken) {
        return false;
    }
    
    // Check for master admin email
    if (decodedToken.email === MASTER_ADMIN_EMAIL) {
        return true;
    }
    
    try {
        const user = await getAuth(admin).getUser(decodedToken.uid);
        // Check for admin custom claim
        return user.customClaims?.role === 'admin';
    } catch (e) {
        return false;
    }
}
