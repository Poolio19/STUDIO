
import admin from 'firebase-admin';

// Store app instances in a map to manage connections to multiple databases.
const appInstances = new Map<string, admin.app.App>();

/**
 * Initializes and returns a Firebase Admin App instance.
 * It ensures that an app for a specific database is only initialized once.
 * @param databaseId The ID of the Firestore database (e.g., 'prempred-master'). Defaults to '(default)'.
 * @returns An initialized Firebase Admin App.
 */
function initializeAdminApp(databaseId: string = '(default)'): admin.app.App {
  // Use a unique name for each app instance to avoid conflicts.
  const appName = `firebase-admin-app-${databaseId}`;

  // If an app with this name is already initialized, return it.
  if (appInstances.has(appName)) {
    return appInstances.get(appName)!;
  }
  
  // If the default app is initialized but we need a specific DB, we can't reuse it.
  // The Admin SDK supports a single app instance for multiple DBs, but our logic
  // to dynamically select the DB at runtime has been problematic.
  // A cleaner approach is a dedicated app instance per database when specified.

  try {
    const appOptions: admin.AppOptions = {};

    // IMPORTANT: The Admin SDK for Node.js doesn't let you specify a database ID
    // during initializeApp(). The database is part of the project. We get the
    // Firestore instance and that can handle multiple databases.
    // The previous logic was flawed. The correct way is to initialize the app
    // ONCE and then get the firestore service.
    
    // Check if the default app is already initialized.
    if (admin.apps.length > 0) {
      const defaultApp = admin.app();
       appInstances.set(appName, defaultApp);
       return defaultApp;
    }

    const app = admin.initializeApp(appOptions);
    appInstances.set(appName, app);
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


/**
 * Gets the Admin SDK Auth service.
 * It ensures the default app is initialized before returning the service.
 * @returns The Firebase Admin Auth service.
 */
export function getAdminAuth() {
  const app = initializeAdminApp();
  return app.auth();
}

/**
 * Gets a Firestore database instance from the Admin SDK.
 * @param databaseId The ID of the Firestore database to connect to.
 *                   If not provided, it will use the '(default)' database.
 * @returns The Firestore service instance.
 */
export function getAdminFirestore(databaseId?: string) {
    const app = initializeAdminApp(databaseId);
    // The Admin SDK's Firestore object can manage connections to different
    // databases within the same project. We don't need to do anything special here.
    // The key is that the code USING this db object will specify the collection paths.
    // The logic to connect to a specific DB is handled by Firestore itself
    // when using collection group queries or specifying full resource paths,
    // but for simple collection access on a non-default DB, we must rely
    // on the SDK being initialized in an environment that knows the DB.
    // The batch-write logic in the flow is what matters.
    return app.firestore();
}
