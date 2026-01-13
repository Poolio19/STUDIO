'use server';
import * as admin from 'firebase-admin';
import type { firestore as adminFirestore } from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';
import { applicationDefault } from 'firebase-admin/app';

let firestore: adminFirestore.Firestore | null = null;

/**
 * Initializes the Firebase Admin SDK if not already initialized
 * and returns a Firestore instance. This singleton pattern is crucial
 * for serverless environments like Next.js to prevent re-initialization errors.
 * @returns {adminFirestore.Firestore} The initialized Firestore instance.
 */
function initializeAdmin(): adminFirestore.Firestore {
  if (admin.apps.length === 0) {
    console.log("Firebase Admin SDK: No apps initialized. Initializing a new app instance...");
    try {
      admin.initializeApp({
        credential: applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
      console.log("Firebase Admin SDK: Initialization successful.");
    } catch (error: any) {
      console.error("Firebase Admin SDK: CRITICAL - Initialization failed!", error);
      throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
  } else {
    console.log("Firebase Admin SDK: App already initialized.");
  }
  
  // Return the Firestore instance from the initialized app.
  return admin.firestore();
}

/**
 * Gets a Firestore admin instance, initializing it if necessary.
 * @returns {Promise<adminFirestore.Firestore>} A promise that resolves to the Firestore instance.
 */
export async function getFirestoreAdmin(): Promise<adminFirestore.Firestore> {
  if (!firestore) {
    firestore = initializeAdmin();
  }
  return firestore;
}
