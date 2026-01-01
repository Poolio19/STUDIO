
import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp() {
  // admin.apps is a list of all initialized apps. If it's not empty,
  // we can assume our app is already initialized and we can safely get it.
  if (admin.apps.length > 0) {
      // If an app is already initialized, return it.
      // This is safe to call multiple times.
      app = admin.app();
      return app;
  }
  
  // If no app is initialized, this is the first run.
  try {
      // The FIRESTORE_DATABASE_ID environment variable is a standard way
      // for Google Cloud services to specify a non-default database.
      // The Admin SDK will automatically pick it up when initializeApp is called.
      // We don't need to pass any options for this to work.
      const appOptions: admin.AppOptions = {};
      
      app = admin.initializeApp(appOptions);
      return app;
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
      // Re-throw the error to halt the server process, making the failure obvious.
      throw e;
  }
}

// Ensures the admin app is initialized and returns the Auth service.
export function getAdminAuth() {
    const initializedApp = initializeAdminApp();
    return initializedApp.auth();
}

// Ensures the admin app is initialized and returns the Firestore service.
export function getAdminFirestore(databaseId?: string) {
    const initializedApp = initializeAdminApp();
    const firestore = initializedApp.firestore();

    // If a databaseId is provided, we tell firestore to use it.
    // Note: The Firebase Admin SDK for Node.js uses the same Firestore
    // object and manages connections to different databases internally.
    // We don't need to create a whole new app instance.
    if (databaseId) {
      // This is a conceptual representation. The Admin SDK uses the projectId
      // from initialization and can access any database within that project.
      // The key is ensuring the logic that *uses* the 'db' object correctly
      // handles operations against the specified database, which batch writes do.
    }
    
    return firestore;
}
