
import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp(databaseURL?: string) {
  if (admin.apps.length === 0) {
    try {
      const options: admin.AppOptions = {};
      if (databaseURL) {
        options.databaseURL = databaseURL;
      }
      app = admin.initializeApp(options);
    } catch (e: any) {
      console.error(
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK INITIALIZATION FAILED **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not be initialized. This is almost always due to a problem with\n' +
        'Application Default Credentials (ADC) in your local development environment.\n\n' +
        'POSSIBLE CAUSES:\n' +
        '1. You have not authenticated with the gcloud CLI.\n' +
        '2. The gcloud credentials are not configured for the correct project.\n' +
        '3. The Firestore database has not been enabled for this project.\n\n' +
        'TO FIX THIS, RUN THE FOLLOWING COMMAND IN YOUR TERMINAL:\n' +
        'gcloud auth application-default login\n\n' +
        'Then, ensure Firestore is enabled in your Firebase project console.\n\n' +
        'Original Error: ' + e.message + '\n' +
        '********************************************************************************'
      );
      throw e;
    }
  } else {
    app = admin.app();
  }
  return app;
}

export function getAdminAuth(databaseURL?: string) {
    return initializeAdminApp(databaseURL).auth();
}

export function getAdminFirestore(databaseURL?: string) {
    return initializeAdminApp(databaseURL).firestore();
}
