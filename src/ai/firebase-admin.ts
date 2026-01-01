'use server';

import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp() {
  if (!admin.apps.length) {
    // In a deployed Google Cloud environment, the SDK automatically detects project ID and credentials.
    // For local development, GOOGLE_APPLICATION_CREDENTIALS env var would be used if set.
    app = admin.initializeApp();
  } else {
    app = admin.app();
  }
  return app;
}

// Initialize the app when the module is first loaded.
const adminApp = initializeAdminApp();

export const adminAuth = adminApp.auth();
export const adminFirestore = adminApp.firestore();
