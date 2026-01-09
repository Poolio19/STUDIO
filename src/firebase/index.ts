'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableNetwork } from 'firebase/firestore';

// This function now robustly initializes Firebase, ensuring it only happens once.
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  const firestore = getFirestore(app);
  
  // Explicitly enable the network for Firestore. This is crucial for environments
  // where the SDK might default to an offline state.
  enableNetwork(firestore).catch((err) => {
    console.error("Firebase: Failed to enable network.", err);
  });

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: firestore,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';