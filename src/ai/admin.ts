'use server';

import * as admin from 'firebase-admin';

let firestore: admin.firestore.Firestore | null = null;

/**
 * Initializes the Firebase Admin SDK and returns a Firestore instance.
 * This is a singleton pattern to ensure it's only initialized once.
 */
export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (firestore) {
    return firestore;
  }

  // Check if the app is already initialized
  if (admin.apps.length === 0) {
    // If not, initialize it.
    // When running locally or in many cloud environments, the SDK will
    // automatically use Google Application Default Credentials.
    // No config object is needed in those cases.
    admin.initializeApp();
  }

  firestore = admin.firestore();
  return firestore;
}
