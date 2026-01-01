
'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  // In a deployed Google Cloud environment, the SDK automatically detects the project ID
  // and credentials. For local development, you would typically set the
  // GOOGLE_APPLICATION_CREDENTIALS environment variable if it's configured.
  // Otherwise, it might use default credentials if available.
  app = admin.initializeApp();
} else {
  app = admin.app();
}

export const adminAuth = app.auth();
export const adminFirestore = app.firestore();
