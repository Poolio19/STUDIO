
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
  
  try {
    const existingApp = admin.apps.find(app => app?.name === appName);
    if (existingApp) {
        return existingApp;
    }

    const app = admin.initializeApp({ credential: admin.credential.applicationDefault() }, appName);
    appInstances.set(appName, app);
    return app;

  } catch (e: any) {
    // This is the critical error handling block for authentication issues.
    const errorMessage = 
      '********************************************************************************\n' +
      '** FIREBASE ADMIN SDK INITIALIZATION FAILED                                   **\n' +
      '********************************************************************************\n' +
      'The Admin SDK could not be initialized. This is almost always due to a problem\n' +
      'with Application Default Credentials (ADC) in your local development environment.\n\n' +
      'THE ERROR MESSAGE:\n' +
      `  ${e.message}\n\n` +
      'This typically means:\n' +
      '1. You have not authenticated with the gcloud CLI.\n' +
      '2. Your gcloud credentials have expired or are not configured for the correct project.\n\n' +
      'TO FIX THIS, RUN THE FOLLOWING COMMAND IN YOUR TERMINAL:\n' +
      'gcloud auth application-default login\n\n' +
      'After running the command, restart the development server.\n' +
      '********************************************************************************';

    console.error(errorMessage);
    
    // Re-throw the error with a clear message to ensure the server process fails loudly.
    throw new Error(`Admin SDK Initialization Failed: ${e.message}. Please check your server console logs for detailed instructions.`);
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
    return app.firestore();
}
