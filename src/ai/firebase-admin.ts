
import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    try {
      // In a deployed Google Cloud environment, the SDK automatically detects project ID and credentials.
      // For local development, GOOGLE_APPLICATION_CREDENTIALS env var would be used if set.
      // If that's not set, it falls back to gcloud's Application Default Credentials.
      app = admin.initializeApp();
    } catch (e: any) {
      console.error(
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK INITIALIZATION FAILED **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not be initialized. This is almost always due to a problem with\n' +
        'Application Default Credentials (ADC) in your local development environment.\n\n' +
        'POSSIBLE CAUSES:\n' +
        '1. You have not authenticated with the gcloud CLI.\n' +
        '2. The gcloud credentials are not configured for the correct project.\n\n' +
        'TO FIX THIS, RUN THE FOLLOWING COMMAND IN YOUR TERMINAL:\n' +
        'gcloud auth application-default login\n\n' +
        'This will open a browser window to authenticate and set up the necessary\n' +
        'credential file on your local machine that the Admin SDK can find.\n\n' +
        'Original Error: ' + e.message + '\n' +
        '********************************************************************************'
      );
      // Re-throw the error to stop the process, as the application cannot function without it.
      throw e;
    }
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
