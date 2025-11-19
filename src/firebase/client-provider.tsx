
'use client';

import { ReactNode, useMemo } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseValue = useMemo(() => {
    const { app, auth, db } = initializeFirebase();
    return { firebaseApp: app, auth, db };
  }, []);

  return (
    <FirebaseProvider value={firebaseValue}>
      {children}
    </FirebaseProvider>
  );
}
