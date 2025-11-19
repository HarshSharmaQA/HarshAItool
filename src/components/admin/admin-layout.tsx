
"use client";

import * as React from "react"
import Link from "next/link";
import { useUser } from "@/components/providers/app-providers";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Button } from "../ui/button";
import { LogOut, PanelLeft, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "../ui/badge";
import type { Settings, MenuItem } from "@/lib/types";
import Breadcrumbs from "./breadcrumbs";
import ClientOnly from "../client-only";
import { useToast } from "@/hooks/use-toast";
import { clearCache } from "@/app/actions/admin-actions";
import { Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { deleteCookie, setCookie } from "cookies-next";
import FirebaseErrorListener from "../FirebaseErrorListener";

export default function AdminLayout({ children, adminMenu }: { children: React.ReactNode, adminMenu: MenuItem[] }) {
  const { userProfile, signOut, user, isAdmin, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isClearingCache, setIsClearingCache] = React.useState(false);

  React.useEffect(() => {
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


  const handleSignOut = () => {
    signOut();
  }

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const result = await clearCache();
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Success", description: "Application cache cleared." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsClearingCache(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
            <AdminSidebar menuItems={adminMenu} />
        </div>
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                        >
                        <PanelLeft className="h-5 w-5 text-current" />
                        <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0">
                        <AdminSidebar menuItems={adminMenu} />
                    </SheetContent>
                </Sheet>
                
                <div className="w-full flex-1">
                    <Breadcrumbs />
                </div>
                <ClientOnly>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full">
                      <Avatar>
                          <AvatarImage src={(userProfile?.photoURL as string)} />
                          <AvatarFallback>{getInitials(userProfile?.displayName || userProfile?.email)}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                          {userProfile?.email}
                          </p>
                      </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                      <Badge variant={userProfile?.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                          {userProfile?.role}
                      </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleClearCache} disabled={isClearingCache}>
                        {isClearingCache ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" /> : <RefreshCw className="mr-2 h-4 w-4 text-current" />}
                        Clear Cache
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4 text-current" />
                      Logout
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </ClientOnly>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-4 lg:p-6 bg-muted/40">
                <FirebaseErrorListener />
                {children}
            </main>
        </div>
    </div>
  );
}
