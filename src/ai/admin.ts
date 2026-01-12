
import * as admin from 'firebase-admin';

let firestorePromise: Promise<admin.firestore.Firestore> | null = null;

function initializeAdmin(): Promise<admin.firestore.Firestore> {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  const db = admin.firestore();
  return Promise.resolve(db);
}

export async function getFirestoreAdmin(): Promise<admin.firestore.Firestore> {
  if (!firestorePromise) {
    firestorePromise = initializeAdmin();
  }
  return firestorePromise;
}
