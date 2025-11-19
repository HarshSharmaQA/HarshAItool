
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser as useFirebaseAuthUser } from '@/firebase/auth/use-user';
import type { UserProfile, Settings } from '@/lib/types';
import type { User } from 'firebase/auth';

interface AppUserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => void;
  settings: Settings | null;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

export function AppProviders({ children, settings }: { children: ReactNode; settings: Settings | null }) {
  const authUserHook = useFirebaseAuthUser();
  
  const value = {
    ...authUserHook,
    settings
  };

  return (
    <AppUserContext.Provider value={value}>
      {children}
    </AppUserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AppUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AppProviders');
  }
  return context;
}
