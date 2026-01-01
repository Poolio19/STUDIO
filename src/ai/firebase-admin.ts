
import admin from 'firebase-admin';

// A map to cache initialized Firebase Admin app instances.
const appInstances = new Map<string, admin.app.App>();
const TARGET_PROJECT_ID = 'studio-2138583336-cec5d';

/**
 * Initializes and returns a Firebase Admin App instance.
 * It ensures that an app for a given project/database combination is only initialized once.
 * @param databaseId The ID of the Firestore database (e.g., 'prempred-master').
 * @returns An initialized Firebase Admin App.
 * @throws An error with a detailed message if initialization fails.
 */
function initializeAdminApp(databaseId?: string): admin.app.App {
  // Create a unique name for the app instance to avoid conflicts.
  // If a databaseId is provided, use it to ensure a unique instance for that database.
  const appName = databaseId ? `${TARGET_PROJECT_ID}-${databaseId}` : TARGET_PROJECT_ID;
  
  if (appInstances.has(appName)) {
    return appInstances.get(appName)!;
  }

  try {
    const existingApp = admin.apps.find(app => app?.name === appName);
    if (existingApp) {
        appInstances.set(appName, existingApp);
        return existingApp;
    }

    const databaseURL = databaseId 
        ? `https://${TARGET_PROJECT_ID}.firebaseio.com`
        : `https://${TARGET_PROJECT_ID}.firebaseio.com`;

    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: TARGET_PROJECT_ID,
      databaseURL: databaseURL
    }, appName);

    appInstances.set(appName, app);
    return app;

  } catch (e: any) {
    if (e.message.includes('Could not refresh access token') || e.message.includes('credential')) {
        const errorMessage =
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK AUTHENTICATION FAILED                                   **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not authenticate. This is due to an issue with Application\n' +
        'Default Credentials (ADC) in your local development environment.\n\n' +
        'THE ERROR MESSAGE:\n' +
        `  ${e.message}\n\n` +
        'TO FIX THIS, YOU MUST:\n' +
        '1. Install the Google Cloud CLI if you haven\'t already.\n' +
        '2. Run the following command in your local terminal:\n' +
        '   gcloud auth application-default login\n' +
        '3. Select the project that contains your database (e.g., prem-pred-proj-01).\n' +
        '4. After authenticating, restart the development server.\n' +
        '********************************************************************************';
        console.error(errorMessage);
        throw new Error(`Admin SDK Authentication Failed. Check server logs for instructions.`);
    }
    
    console.error(`Unexpected error during Firebase Admin SDK initialization for project '${TARGET_PROJECT_ID}':`, e);
    throw new Error(`Failed to initialize Admin SDK for project '${TARGET_PROJECT_ID}': ${e.message}`);
  }
}

/**
 * Gets the Admin SDK Auth service for the specified project.
 * @returns The Firebase Admin Auth service.
 */
export function getAdminAuth() {
  const app = initializeAdminApp();
  return app.auth();
}

/**
 * Gets a Firestore database instance from the Admin SDK.
 * @param databaseId Optional. The specific database to connect to. Defaults to '(default)'.
 * @returns The Firestore service instance.
 */
export function getAdminFirestore(databaseId?: string) {
    const app = initializeAdminApp(databaseId);
    return app.firestore();
}
