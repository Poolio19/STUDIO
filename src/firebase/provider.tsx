
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore, getFirestore, enableNetwork } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig } from './config';
import historicalPlayersData from '@/lib/historical-players.json';

interface FirebaseProviderProps {
  children: ReactNode;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isConfigured: boolean;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const isApiKeyPlaceholder = (key?: string) => !key || key.includes('AIzaSyB-');

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children
}) => {
  const isConfigured = !isApiKeyPlaceholder(firebaseConfig.apiKey);

  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);
  
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, 
    userError: null,
  });


  useEffect(() => {
    if (!isConfigured) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Firebase API Key is not configured.") });
      return;
    }

    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const firestore = getFirestore(app);
      const auth = getAuth(app);
      
      enableNetwork(firestore).catch((err) => {
        console.error("Firebase: Failed to enable network.", err);
      });

      setServices({ firebaseApp: app, auth, firestore });

      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
            // The user is either logged in or null. Do not attempt anonymous sign-in.
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        },
        (error) => {
          console.error("FirebaseProvider: onAuthStateChanged error:", error);
          setUserAuthState({ user: null, isUserLoading: false, userError: error });
        }
      );
      return () => unsubscribe();
    } catch (error: any) {
        console.error("Firebase initialization failed:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
    }
  }, [isConfigured]);


  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp: services?.firebaseApp || null,
    firestore: services?.firestore || null,
    auth: services?.auth || null,
    ...userAuthState,
    isConfigured,
  }), [services, userAuthState, isConfigured]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {isConfigured && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
};

function useFirebaseContext() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
  }
  return context;
}

export const useAuth = (): Auth | null => useFirebaseContext().auth;
export const useFirestore = (): Firestore | null => useFirebaseContext().firestore;
export const useFirebaseApp = (): FirebaseApp | null => useFirebaseContext().firebaseApp;
export const useUser = (): UserHookResult => {
    const { user, isUserLoading, userError } = useFirebaseContext();
    return { user, isUserLoading, userError };
};

/**
 * A hook that returns the correct document ID for the current user.
 * It maps the authenticated user's email to their canonical ID from the historical player data.
 * @returns The user's canonical document ID (e.g., 'usr_009') or null if not found or not authenticated.
 */
export const useResolvedUserId = (): string | null => {
    const { user } = useUser();

    if (!user || !user.email) {
      return null;
    }

    // This is the source of truth for mapping a logged-in user to their canonical ID.
    const historicalUser = (historicalPlayersData as any[]).find(
      (p) => p.email && p.email.toLowerCase() === user.email!.toLowerCase()
    );

    if (historicalUser && historicalUser.id) {
        return historicalUser.id;
    }
    
    // Fallback for a user that might exist in Auth but not in our historical data.
    // In the current "private league" model, this shouldn't happen for valid users.
    return null;
};


export const useFirebaseConfigStatus = (): { isConfigured: boolean } => {
    const { isConfigured } = useFirebaseContext();
    return { isConfigured };
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  const memoized = useMemo(factory, deps);
  
  if (typeof memoized !== 'object' || memoized === null || '__memo' in memoized) {
    return memoized;
  }

  try {
      Object.defineProperty(memoized, '__memo', {
          value: true,
          enumerable: false,
          writable: false,
          configurable: true, 
      });
  } catch (e) {
    (memoized as T & {__memo?: boolean}).__memo = true;
  }
  
  return memoized;
}
