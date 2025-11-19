
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // This is a placeholder since we are only using Google Auth
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("Password reset is not available for Google sign-in accounts.");
    };

    return (
        <div className="flex items-center justify-center py-12 container mx-auto">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold font-headline">Forgot Password</h1>
                    <p className="text-balance text-muted-foreground">
                        Enter your email to reset your password
                    </p>
                </div>
                <form onSubmit={handleResetPassword} className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                     {success && (
                        <Alert variant="default">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Remember your password?{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
