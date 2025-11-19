
"use client";

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, type DocumentReference, refEqual } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useFirestore } from '../provider';
import { convertTimestamps } from '@/lib/utils';

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const refRef = useRef(ref);
  useEffect(() => {
    if (ref && (!refRef.current || !refEqual(ref, refRef.current))) {
      refRef.current = ref;
    }
  }, [ref]);

  useEffect(() => {
    if (!refRef.current || !firestore) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(refRef.current, (doc) => {
      if (doc.exists()) {
        setData(convertTimestamps({ id: doc.id, ...doc.data() }) as T);
      } else {
        setData(null);
      }
      setLoading(false);
    },
    (error) => {
        const permissionError = new FirestorePermissionError({
            path: refRef.current!.path,
            operation: 'get',
            message: error.message
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, refRef.current]);

  return { data, loading };
}
