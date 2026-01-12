'use server';
import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

let firestore: admin.firestore.Firestore | null = null;

/**
 * Initializes the Firebase Admin SDK and returns a Firestore instance.
 * It uses a singleton pattern to ensure initialization only happens once.
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
function initializeAdmin(): admin.firestore.Firestore {
  // Check if the app is already initialized to prevent errors.
  if (admin.apps.length === 0) {
    console.log("Firebase Admin SDK not initialized. Initializing...");
    // When running in a Google Cloud environment (like App Hosting),
    // applicationDefault() automatically finds the service account credentials.
    admin.initializeApp({
      credential: applicationDefault(),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("Firebase Admin SDK already initialized.");
  }
  
  // Return the Firestore instance from the initialized app.
  return admin.firestore();
}

/**
 * Gets a Firestore admin instance, initializing it if necessary.
 * This function is async to align with modern JavaScript practices for resource management.
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (!firestore) {
    firestore = initializeAdmin();
  }
  return Promise.resolve(firestore);
}
