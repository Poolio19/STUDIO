'use server';

import * as admin from 'firebase-admin';

// This is a singleton pattern to ensure we only initialize Firebase Admin once.
// We store the promise of the Firestore instance to handle concurrent requests.
let firestorePromise: Promise<admin.firestore.Firestore> | null = null;

/**
 * Initializes the Firebase Admin SDK if not already done, and returns a
 * Firestore instance. This function is designed to be called from server-side
 * Genkit flows. It correctly handles the singleton pattern for initialization.
 */
async function initializeAdmin(): Promise<admin.firestore.Firestore> {
  // Check if the app is already initialized. If not, initialize it.
  // In many cloud environments (including Firebase App Hosting), the SDK
  // automatically uses Google Application Default Credentials, so no explicit
  // config object is needed.
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  const db = admin.firestore();
  // Optional: Apply settings if needed, e.g., for different regions.
  // db.settings({ ... });

  return db;
}

/**
 * Gets a singleton instance of the authenticated Firestore admin client.
 *
 * @returns {Promise<admin.firestore.Firestore>} A promise that resolves to the Firestore instance.
 */
export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (!firestorePromise) {
    firestorePromise = initializeAdmin();
  }
  return firestorePromise;
}
