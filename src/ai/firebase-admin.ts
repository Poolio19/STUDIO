
import admin from 'firebase-admin';

// A map to cache initialized Firebase Admin app instances.
const appInstances = new Map<string, admin.app.App>();

/**
 * Initializes and returns a Firebase Admin App instance for a specific project.
 * It ensures that an app for a given project is only initialized once.
 * @param projectId The ID of the Google Cloud project.
 * @returns An initialized Firebase Admin App.
 * @throws An error with a detailed message if initialization fails.
 */
function initializeAdminApp(projectId: string): admin.app.App {
  // If an app for this project is already initialized, return it from the cache.
  if (appInstances.has(projectId)) {
    return appInstances.get(projectId)!;
  }

  try {
    // Check if an app with this name already exists (though our cache should prevent this).
    const existingApp = admin.apps.find(app => app?.name === projectId);
    if (existingApp) {
        appInstances.set(projectId, existingApp);
        return existingApp;
    }

    // Initialize a new app with specific credentials for the given project.
    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId, // Explicitly set the project ID
    }, projectId); // Use the project ID as the unique app name.

    appInstances.set(projectId, app);
    return app;

  } catch (e: any) {
    // This is the critical error handling block for authentication issues.
    if (e.message.includes('Could not refresh access token') || e.message.includes('credential')) {
        const errorMessage =
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK AUTHENTICATION FAILED                                   **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not authenticate, which is required for server-side operations.\n' +
        'This is almost always due to an issue with Application Default Credentials (ADC)\n' +
        'in your local development environment.\n\n' +
        'THE ERROR MESSAGE:\n' +
        `  ${e.message}\n\n` +
        'TO FIX THIS, YOU MUST:\n' +
        '1. Install the Google Cloud CLI if you haven\'t already.\n' +
        '2. Run the following command in your local terminal:\n' +
        '   gcloud auth application-default login\n' +
        '3. When prompted, select the project that contains your database (e.g., studio-...).\n' +
        '4. After authenticating, restart the development server.\n' +
        '********************************************************************************';

        console.error(errorMessage);
        // Re-throw the error with a clear message to ensure the server process fails loudly.
        throw new Error(`Admin SDK Authentication Failed: ${e.message}. Please check your server console logs for detailed instructions.`);
    }
    
    // For other initialization errors.
    console.error(`Unexpected error during Firebase Admin SDK initialization for project '${projectId}':`, e);
    throw new Error(`Failed to initialize Admin SDK for project '${projectId}': ${e.message}`);
  }
}

/**
 * Gets the Admin SDK Auth service for a specific project.
 * @param projectId The Google Cloud project ID.
 * @returns The Firebase Admin Auth service.
 */
export function getAdminAuth(projectId: string) {
  const app = initializeAdminApp(projectId);
  return app.auth();
}

/**
 * Gets a Firestore database instance from the Admin SDK for a specific project.
 * @param projectId The Google Cloud project ID.
 * @returns The Firestore service instance.
 */
export function getAdminFirestore(projectId: string) {
    const app = initializeAdminApp(projectId);
    return app.firestore();
}
