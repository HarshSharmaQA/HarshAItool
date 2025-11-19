'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useUser } from '@/components/providers/app-providers';
import Logo from '@/components/icons/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ClientProviders } from '@/components/providers/client-providers';
import Image from 'next/image';
import Link from 'next/link';
import type { Settings } from '@/lib/types'; // Added import for Settings type

// Create a default settings object
const defaultSettings: Settings = {
  siteTitle: 'Stratic CMS',
  siteDescription: 'A modern CMS built with Next.js and Firebase.',
  siteLogoUrl: '',
  currency: '₹',
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, loading } = useUser();
    
    const [signInError, setSignInError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const unauthorizedError = searchParams.get('error') === 'unauthorized';
  
    useEffect(() => {
        if (!loading && user) {
            const redirectUrl = searchParams.get('redirect') || '/account';
            router.push(redirectUrl);
        }
    }, [user, isAdmin, loading, router, searchParams]);

    const handleSignIn = async () => {
        if (!auth) return;
        setSignInError(null);
        setIsSigningIn(true);
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
        } catch (error: any) {
          console.error("Google sign-in error:", error);
          if (error.code === 'auth/popup-blocked') {
            setSignInError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
          } else if (error.code === 'auth/popup-closed-by-user') {
            setSignInError('Sign-in process was cancelled. Please try again.');
          } else if (error.code === 'auth/account-exists-with-different-credential') {
            setSignInError('An account already exists with this email address.');
          } else {
            setSignInError('An error occurred during sign-in. Please try again.');
          }
        } finally {
          setIsSigningIn(false);
        }
    };
    
    if (loading || user) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Redirecting...</p>
            </div>
        );
    }
      
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold font-headline">Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>
                     <div className="space-y-4">
                        {unauthorizedError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Access Denied</AlertTitle>
                                <AlertDescription>You must be logged in to view this page.</AlertDescription>
                            </Alert>
                        )}
                        {signInError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Sign-in Failed</AlertTitle>
                                <AlertDescription>{signInError}</AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={handleSignIn} variant="outline" type="button" className="w-full" disabled={!auth || isSigningIn}>
                             {isSigningIn ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-79.3 80.5C308.5 117.8 280.7 104 248 104c-83.2 0-150.8 67.6-150.8 152s67.6 152 150.8 152c97.9 0 130.9-74.5 135.5-112.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                            )}
                            { !auth ? 'Initializing...' : isSigningIn ? 'Signing in...' : 'Sign in with Google' }
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{' '}
                      <Link href="/register" className="underline">
                        Register
                      </Link>
                    </div>
                </div>
            </div>
             <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                 <Image
                    src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx0ZWNobm9sb2d5JTIwYWJzdHJhY3R8ZW58MHx8fHwxNzU5NzQ4Nzc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Abstract background image"
                    fill
                    className="object-cover opacity-20"
                    unoptimized
                    data-ai-hint="technology abstract"
                />
                <div className="relative z-20 flex items-center text-lg font-medium">
                   <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-6 text-white" />
                        <span className="font-headline">Stratic CMS</span>
                    </Link>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                    <p className="text-lg">
                        &ldquo;This CMS has transformed our workflow, making content management a breeze. The block editor is a game-changer.&rdquo;
                    </p>
                    <footer className="text-sm">Sofia Davis, CTO</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
        }>
            <ClientProviders settings={defaultSettings}>
                <LoginContent />
            </ClientProviders>
        </Suspense>
    );
}