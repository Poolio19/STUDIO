
import admin from 'firebase-admin';

// This is the Google Cloud Project that Firebase Studio has provisioned for your backend.
// It is used by the Admin SDK to access your project's resources.
const TARGET_PROJECT_ID = 'prempred-43933';

// A variable to hold the singleton instance of the Firebase Admin App.
let adminApp: admin.app.App | null = null;

/**
 * Initializes and returns a singleton Firebase Admin App instance.
 * It ensures that the app is only initialized once.
 * @returns An initialized Firebase Admin App.
 * @throws An error with a detailed message if initialization fails.
 */
function initializeAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  try {
    console.log(`Attempting to initialize Firebase Admin SDK for project: '${TARGET_PROJECT_ID}'...`);
    
    // Check if the default app already exists. This can happen in some environments.
    const existingApp = admin.apps.find(app => app?.name === '[DEFAULT]');
    if (existingApp) {
        adminApp = existingApp;
        return adminApp;
    }

    adminApp = admin.initializeApp({
      // Using Application Default Credentials. The SDK will automatically find
      // the credentials you set up with 'gcloud auth application-default login'.
      credential: admin.credential.applicationDefault(),
      projectId: TARGET_PROJECT_ID,
      databaseURL: `https://${TARGET_PROJECT_ID}.firebaseio.com`
    });

    console.log(`Successfully initialized Firebase Admin SDK.`);
    return adminApp;

  } catch (e: any) {
    // Enhanced error checking for various credential-related issues.
    const errorMessageContent = e.message || '';
    if (errorMessageContent.includes('Could not refresh access token') || errorMessageContent.includes('credential')) {
        const errorMessage =
        '********************************************************************************\n' +
        '** FIREBASE ADMIN SDK AUTHENTICATION FAILED                                   **\n' +
        '********************************************************************************\n' +
        'The Admin SDK could not authenticate. This is likely due to an issue with\n' +
        'Application Default Credentials (ADC) in your local development environment.\n' +
        'This means the server process cannot access Google Cloud services.\n\n' +
        'THE RAW ERROR MESSAGE:\n' +
        `  ${errorMessageContent}\n\n` +
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
  const app = initializeAdminApp();
  return app.auth();
}

/**
 * Gets a Firestore database instance from the Admin SDK.
 * @param databaseId Optional. The specific database to connect to. This parameter is ignored in the singleton implementation but kept for API compatibility.
 */
export function getAdminFirestore(databaseId?: string) {
    const app = initializeAdminApp();
    return app.firestore();
}
