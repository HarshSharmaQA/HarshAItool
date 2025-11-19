'use client';

import { useEffect, useState, useCallback } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { MASTER_ADMIN_EMAIL } from '@/lib/auth-constants';
import type { UserProfile } from '@/lib/types';
import { useDoc } from '../firestore/use-doc';
import { doc } from 'firebase/firestore';

interface AppUserHook {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => void;
}

export function useUser(): AppUserHook {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(() => auth?.currentUser || null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const userRef = user && db ? doc(db, `users/${user.uid}`) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userRef);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (userState) => {
      setAuthLoading(true);
      setUser(userState);
      if (userState) {
        try {
          const tokenResult = await userState.getIdTokenResult();
          const userIsAdmin = tokenResult.claims.role === 'admin' || userState.email === MASTER_ADMIN_EMAIL;
          setIsAdmin(userIsAdmin);
        } catch (error) {
          console.error('Error getting ID token result:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signOut = useCallback(async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
        // The onIdTokenChanged listener will handle the rest.
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  }, [auth]);

  const loading = authLoading || (user ? profileLoading : false);
  
  return { 
    user, 
    userProfile: loading ? null : userProfile, // Return profile only when not loading
    loading, 
    isAdmin, 
    signOut 
  };
}