
import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    // In a deployed Google Cloud environment, the SDK automatically detects project ID and credentials.
    // For local development, GOOGLE_APPLICATION_CREDENTIALS env var would be used if set.
    app = admin.initializeApp();
  } else {
    app = admin.app();
  }
  return app;
}

export function getAdminAuth() {
    return initializeAdminApp().auth();
}

export function getAdminFirestore() {
    return initializeAdminApp().firestore();
}
