
import admin from 'firebase-admin';

// A map to cache initialized Firebase Admin app instances.
const appInstances = new Map<string, admin.app.App>();

// This is the Google Cloud Project that Firebase Studio has provisioned for your backend.
// It is used by the Admin SDK to access your project's resources.
const TARGET_PROJECT_ID = 'prempred-43933';

/**
 * Initializes and returns a Firebase Admin App instance.
 * It ensures that an app for a given project/database combination is only initialized once.
 * @param databaseId The ID of the Firestore database. Pass an empty string or '(default)' for the default database.
 * @returns An initialized Firebase Admin App.
 * @throws An error with a detailed message if initialization fails.
 */
function initializeAdminApp(databaseId?: string): admin.app.App {
  // Use '(default)' as the internal key for the default database to avoid ambiguity.
  const effectiveDatabaseId = (databaseId && databaseId !== '(default)') ? databaseId : '(default)';
  const appName = `${TARGET_PROJECT_ID}-${effectiveDatabaseId}`;
  
  if (appInstances.has(appName)) {
    return appInstances.get(appName)!;
  }

  try {
    const existingApp = admin.apps.find(app => app?.name === appName);
    if (existingApp) {
        appInstances.set(appName, existingApp);
        return existingApp;
    }

    console.log(`Attempting to initialize Firebase Admin SDK for project: '${TARGET_PROJECT_ID}' and database: '${effectiveDatabaseId}'...`);
    const app = admin.initializeApp({
      // Using Application Default Credentials. The SDK will automatically find
      // the credentials you set up with 'gcloud auth application-default login'.
      credential: admin.credential.applicationDefault(),
      projectId: TARGET_PROJECT_ID,
      // Connect to the default database if no databaseId or '(default)' is passed.
      databaseURL: `https://${TARGET_PROJECT_ID}.firebaseio.com`
    }, appName);

    console.log(`Successfully initialized Firebase Admin SDK for app: ${appName}`);
    appInstances.set(appName, app);
    return app;

  } catch (e: any) {
    if (e.message.includes('Could not refresh access token') || e.message.includes('credential')) {
        const errorMessage =
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK AUTHENTICATION FAILED                                   **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not authenticate. This is likely due to an issue with\n' +
        'Application Default Credentials (ADC) in your local development environment.\n' +
        'This means the server process cannot access Google Cloud services.\n\n' +
        'THE RAW ERROR MESSAGE:\n' +
        `  ${e.message}\n\n` +
        'TO FIX THIS, YOU MUST:\n' +
        '1. Ensure you have the Google Cloud CLI installed.\n' +
        '2. Run the following command in your local terminal:\n' +
        '   gcloud auth application-default login\n' +
        '3. In the browser window that opens, log in with your Google account.\n' +
        '4. After authenticating, restart the development server.\n\n' +
        `NOTE: The system was attempting to connect to project: '${TARGET_PROJECT_ID}'.\n` +
        'Ensure your ADC is configured for that project.\n' +
        '********************************************************************************';
        
        // Throw a new error to halt the process and ensure this message is visible.
        throw new Error(errorMessage);
    }
    
    console.error(`An unexpected error occurred during Firebase Admin SDK initialization for project '${TARGET_PROJECT_ID}':`, e);
    // For other types of errors, throw a more generic but still informative message.
    throw new Error(`Failed to initialize Admin SDK for project '${TARGET_PROJECT_ID}'. Please check server logs for details. Original error: ${e.message}`);
  }
}

/**
 * Gets the Admin SDK Auth service for the specified project.
 * @returns The Firebase Admin Auth service.
 */
export function getAdminAuth() {
  // Auth lives at the project level, so we connect to the default instance.
  const app = initializeAdminApp();
  return app.auth();
}

/**
 * Gets a Firestore database instance from the Admin SDK.
 * @param databaseId Optional. The specific database to connect to. Defaults to '(default)'.
 */
export function getAdminFirestore(databaseId?: string) {
    const app = initializeAdminApp(databaseId);
    return app.firestore();
}
