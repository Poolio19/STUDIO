
'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
  apiKey: string;
}

/**
 * This provider component wraps the core FirebaseProvider.
 * It's a client component that ensures Firebase logic only runs in the browser.
 * It receives the API key from a server component and passes it down.
 */
export function FirebaseClientProvider({ children, apiKey }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider apiKey={apiKey}>
      {children}
    </FirebaseProvider>
  );
}
