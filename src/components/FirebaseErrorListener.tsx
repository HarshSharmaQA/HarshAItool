"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a client component that will listen for Firestore permission errors
// and throw them to be caught by the Next.js development error overlay.
// This is only active in development and will not affect production builds.
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In development, throwing the error will display the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
      // In production, you might want to log this to a service like Sentry
      console.error('Firestore Permission Error:', error.message);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything
}
