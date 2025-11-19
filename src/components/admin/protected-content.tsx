
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/app-providers';
import AdminLayout from '@/components/admin/admin-layout';
import { Loader2 } from 'lucide-react';
import { setCookie, deleteCookie } from 'cookies-next';
import type { Settings, MenuItem } from "@/lib/types";
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

export default function ProtectedContent({
  children,
  settings,
  adminMenu
}: {
  children: React.ReactNode;
  settings: Settings;
  adminMenu: MenuItem[];
}) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        deleteCookie('idToken');
        router.push('/admin/login?error=unauthorized');
      } else {
        user.getIdToken().then(token => {
          setCookie('idToken', token, { maxAge: 60 * 60 });
        });
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <AdminLayout adminMenu={adminMenu}>
      <FirebaseErrorListener />
      {children}
    </AdminLayout>
  );
}
