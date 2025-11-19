
'use client';

import { AppProviders } from '@/components/providers/app-providers';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import type { Settings } from '@/lib/types';

export function ClientProviders({ children, settings }: { children: React.ReactNode, settings: Settings }) {
  return (
    <FirebaseClientProvider>
      <AppProviders settings={settings}>
        {children}
      </AppProviders>
    </FirebaseClientProvider>
  );
}
