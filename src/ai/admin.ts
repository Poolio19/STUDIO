'use server';
import * as admin from 'firebase-admin';

let firestorePromise: Promise<admin.firestore.Firestore> | null = null;

/**
 * Initializes the Firebase Admin SDK and returns a Firestore instance.
 * It uses a singleton pattern to ensure initialization only happens once.
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
function initializeAdmin(): Promise<admin.firestore.Firestore> {
  // Check if the app is already initialized to prevent errors.
  if (admin.apps.length === 0) {
    // When running in a Google Cloud environment (like App Hosting),
    // the SDK automatically detects the service account credentials.
    admin.initializeApp();
  }
  const db = admin.firestore();
  return Promise.resolve(db);
}

/**
 * Gets a Firestore admin instance, initializing it if necessary.
 * This function is async to align with modern JavaScript practices for resource management.
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (!firestorePromise) {
    firestorePromise = initializeAdmin();
  }
  return firestorePromise;
}
