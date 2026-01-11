
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore, getFirestore, enableNetwork } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig as originalFirebaseConfig } from './config';

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
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children
}) => {
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
    const firebaseConfig = {
      ...originalFirebaseConfig,
      apiKey: "FIREBASE_API_KEY",
    };

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
        if (firebaseUser) {
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        } else {
          const defaultUserEmail = 'jim.poole@prempred.com';
          const defaultUserPassword = 'password123';
          
          signInWithEmailAndPassword(auth, defaultUserEmail, defaultUserPassword)
            .catch((error) => {
              console.error("FirebaseProvider: Default user sign-in failed:", error);
              setUserAuthState({ user: null, isUserLoading: false, userError: error });
            });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, []);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp: services?.firebaseApp || null,
    firestore: services?.firestore || null,
    auth: services?.auth || null,
    ...userAuthState,
  }), [services, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
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
    // If defineProperty fails (e.g., on a frozen object), fall back to a less ideal but functional approach.
    (memoized as T & {__memo?: boolean}).__memo = true;
  }
  
  return memoized;
}
