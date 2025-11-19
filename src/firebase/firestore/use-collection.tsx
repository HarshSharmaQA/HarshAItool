
"use client";

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, type Query, queryEqual } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useFirestore } from '../provider';
import { convertTimestamps } from '@/lib/utils';
import { useMemo } from 'react';

// A custom hook to memoize the query object, preventing re-renders.
const useMemoizedQuery = (queryParam: Query | null): Query | null => {
  const queryRef = useRef<Query | null>(null);

  if (queryParam) {
    if (!queryRef.current || !queryEqual(queryRef.current, queryParam)) {
      queryRef.current = queryParam;
    }
  } else {
    queryRef.current = null;
  }
  
  return queryRef.current;
};

export function useCollection<T>(queryParam: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const query = useMemoizedQuery(queryParam);

  useEffect(() => {
    if (!firestore || !query) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const list: T[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...convertTimestamps(doc.data()) }) as T
        );
        setData(list);
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'collection query',
          operation: 'list',
          message: error.message,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Firestore Collection Error:", error);
        setLoading(false);
        setData(null); // Clear data on error
      }
    );

    return () => unsubscribe();
  }, [firestore, query]);

  return { data, loading, setData };
}
