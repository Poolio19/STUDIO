'use client';

// Barrel file for exporting Firebase-related utilities and hooks.
// This simplifies imports in other parts of the application.

export { 
  FirebaseProvider, 
  useAuth, 
  useFirestore, 
  useStorage, 
  useFirebaseApp, 
  useUser, 
  useResolvedUserId, 
  useMemoFirebase,
  useFirebaseConfigStatus
} from './provider';

export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
