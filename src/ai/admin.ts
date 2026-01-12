'use server';
import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

let firestore: admin.firestore.Firestore | null = null;

/**
 * Initializes the Firebase Admin SDK and returns a Firestore instance.
 * It uses a singleton pattern to ensure initialization only happens once.
 * This version explicitly provides the project ID and credentials to avoid
 * issues in environments where auto-discovery fails.
 * @returns {admin.firestore.Firestore} The initialized Firestore instance.
 */
function initializeAdmin(): admin.firestore.Firestore {
  if (admin.apps.length === 0) {
    console.log("Firebase Admin SDK: Initializing with explicit config...");
    try {
      admin.initializeApp({
        // When running in a Google Cloud environment, applicationDefault() 
        // finds the service account credentials automatically.
        credential: applicationDefault(),
        // Explicitly providing the project ID from the client config
        // makes the initialization more robust.
        projectId: firebaseConfig.projectId,
      });
      console.log("Firebase Admin SDK: Initialization successful.");
    } catch (error: any) {
      console.error("Firebase Admin SDK: CRITICAL - Initialization failed!", error);
      // If initialization fails, we cannot proceed. Throw the error
      // to make the failure visible in the server logs.
      throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
  } else {
    console.log("Firebase Admin SDK: Already initialized.");
  }
  
  // Return the Firestore instance from the (now guaranteed) initialized app.
  return admin.firestore();
}

/**
 * Gets a Firestore admin instance, initializing it if necessary.
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (!firestore) {
    firestore = initializeAdmin();
  }
  return firestore;
}
