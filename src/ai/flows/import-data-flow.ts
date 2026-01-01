
'use server';
/**
 * @fileOverview A flow to populate Firestore with initial data.
 *
 * - importData - A function that populates Firestore collections.
 * - ensureUser - A function that creates the default user for the app.
 * - testDatabaseConnection - A function to verify connection to a specific database.
 */

import { ai } from '@/ai/genkit';
import {
  teams,
  fullUsers,
  fullPredictions,
  matches,
  previousSeasonStandings,
  seasonMonths,
  monthlyMimoM,
  fullUserHistories,
  playerTeamScores,
  weeklyTeamStandings,
  teamRecentResults
} from '@/lib/data';
import { z } from 'zod';
import { getAdminAuth, getAdminFirestore } from '@/ai/firebase-admin';
import admin from 'firebase-admin';

async function batchWrite(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  data: any[],
  idField: string = 'id'
) {
  const batch = db.batch();
  const collectionRef = db.collection(collectionName);
  data.forEach((item) => {
    const docRef = collectionRef.doc(item[idField].toString());
    batch.set(docRef, item);
  });
  await batch.commit();
}

export async function ensureUser(): Promise<{ success: boolean; message: string }> {
    return ensureUserFlow();
}

const ImportDataInputSchema = z.object({
  databaseId: z.string().optional(),
});
export type ImportDataInput = z.infer<typeof ImportDataInputSchema>;


export async function importData(input: ImportDataInput): Promise<{ success: boolean; message?: string }> {
  return importDataFlow(input);
}

const TestDatabaseConnectionInputSchema = z.object({
    databaseId: z.string().optional(),
});
export type TestDatabaseConnectionInput = z.infer<typeof TestDatabaseConnectionInputSchema>;

export async function testDatabaseConnection(input: TestDatabaseConnectionInput): Promise<{ success: boolean; message: string }> {
    return testDatabaseConnectionFlow(input);
}


const testDatabaseConnectionFlow = ai.defineFlow(
    {
        name: 'testDatabaseConnectionFlow',
        inputSchema: TestDatabaseConnectionInputSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async ({ databaseId }) => {
        const targetDbId = databaseId || '(default)';
        try {
            // We get a Firestore instance. The actual connection test happens
            // by trying to perform a lightweight operation.
            const db = getAdminFirestore(targetDbId);

            // In a multi-database project, db.collection() will target the default DB
            // unless the environment is configured correctly. The most reliable test
            // is to attempt a write/read that would fail if the DB doesn't exist.
            // A more direct check isn't available in the client-facing Admin SDK.
            // Let's try to list collections, which should fail if the DB is inaccessible.
            await db.listCollections();

            return { success: true, message: `Successfully connected to project. The import will target database '${targetDbId}'.` };
        } catch (error: any) {
            const projectId = process.env.GOOGLE_CLOUD_PROJECT || '[UNKNOWN]';
            console.error(`Error in testDatabaseConnectionFlow for DB '${targetDbId}':`, error);

            if (error.message.includes('Could not find endpoint')) {
                 return { success: false, message: `Connection failed: The specified database ID '${targetDbId}' might not exist in project '${projectId}'. Please verify the ID in the Firebase console.` };
            }
             if (error.code === 5 || error.message.includes('NOT_FOUND')) { // 5 is gRPC code for NOT_FOUND
                 return { success: false, message: `Connection failed: The project '${projectId}' does not have an active Cloud Firestore database with ID '${targetDbId}'. Please create it in the Firebase console or verify the name.` };
            }
             return { success: false, message: `An unexpected error occurred while connecting to '${targetDbId}': ${error.message}` };
        }
    }
);

const ensureUserFlow = ai.defineFlow(
    {
        name: 'ensureUserFlow',
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async () => {
        const email = 'alex@example.com';
        const password = 'password123';
        const displayName = 'Alex Anderson';
        
        let auth;
        let db;

        try {
          // This will now throw a descriptive error if initialization fails.
          auth = getAdminAuth();
          db = getAdminFirestore(); // Connect to default for user creation
        } catch (initError: any) {
            const errorMessage = `Firebase Admin SDK initialization failed. Check your server console logs for a detailed error message and instructions on how to fix your local credentials.`;
            return { success: false, message: errorMessage };
        }


        try {
            // Check if user already exists
            const userRecord = await auth.getUserByEmail(email);
            return { success: true, message: `User ${displayName} (${email}) already exists. No action taken.` };
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // User does not exist, so create them
                try {
                    const userRecord = await auth.createUser({
                        email: email,
                        password: password,
                        displayName: displayName,
                    });
                    
                    const userId = userRecord.uid;
                    const alexUser = fullUsers.find(u => u.id === 'usr_1');

                    if (alexUser) {
                        const userProfileData = { ...alexUser, id: userId, email: email };
                        await db.collection('users').doc(userId).set(userProfileData);
                         return { success: true, message: `Successfully created user and profile for ${displayName}.` };
                    } else {
                        // This case should ideally not happen if data is consistent
                        return { success: false, message: "New user created, but Alex's profile data was not found to populate Firestore." };
                    }

                } catch (creationError: any) {
                    console.error('Error creating user:', creationError);
                    return { success: false, message: `Failed to create user: ${creationError.message}` };
                }
            } else {
                // Other errors (e.g., network issues)
                console.error('Error checking for user:', error);
                return { success: false, message: `An unexpected error occurred: ${error.message}` };
            }
        }
    }
);


const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
    inputSchema: ImportDataInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async ({ databaseId }) => {
    // This is a workaround for the fact that the Node.js Admin SDK is tricky
    // when targeting a non-default database for standard operations.
    // By setting this env var, we tell the SDK which database to use for
    // the subsequent `getAdminFirestore()` call within this flow's process.
    if (databaseId) {
        process.env.FIRESTORE_DATABASE_ID = databaseId;
    }
    
    let db: FirebaseFirestore.Firestore;
    const targetDbId = databaseId || '(default)';
    
    try {
        db = getAdminFirestore(targetDbId);
    } catch (initError: any) {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || '[UNKNOWN]';
        const errorMessage = `Firebase Admin SDK initialization failed for DB '${targetDbId}'. Project: ${projectId}. Error: ${initError.message}. Check server logs for details.`;
        return { success: false, message: errorMessage };
    }

    try {
      await batchWrite(db, 'teams', teams, 'id');
      await batchWrite(db, 'users', fullUsers, 'id');
      
      const predBatch = db.batch();
      const predCollectionRef = db.collection('predictions');
      fullPredictions.forEach(item => {
          const docRef = predCollectionRef.doc(item.userId);
          predBatch.set(docRef, item);
      });
      await predBatch.commit();

      const matchesBatch = db.batch();
      const matchesCollectionRef = db.collection('matches');
      matches.forEach(item => {
        const matchId = `${item.week}-${item.homeTeamId}-${item.awayTeamId}`;
        const docRef = matchesCollectionRef.doc(matchId);
        matchesBatch.set(docRef, item);
      });
      await matchesBatch.commit();
      
      await batchWrite(db, 'previousSeasonStandings', previousSeasonStandings, 'teamId');
      await batchWrite(db, 'seasonMonths', seasonMonths, 'id');
      await batchWrite(db, 'monthlyMimoM', monthlyMimoM, 'id');
      await batchWrite(db, 'userHistories', fullUserHistories, 'userId');
      
      const ptsBatch = db.batch();
      const ptsCollectionRef = db.collection('playerTeamScores');
      playerTeamScores.forEach(item => {
        const docId = `${item.userId}_${item.teamId}`;
        const docRef = ptsCollectionRef.doc(docId);
        ptsBatch.set(docRef, item);
      });
      await ptsBatch.commit();

      const wtsBatch = db.batch();
      const wtsCollectionRef = db.collection('weeklyTeamStandings');
      weeklyTeamStandings.forEach(item => {
        const docId = `${item.week}_${item.teamId}`;
        const docRef = wtsCollectionRef.doc(docId);
        wtsBatch.set(docRef, item);
      });
      await wtsBatch.commit();

      await batchWrite(db, 'teamRecentResults', teamRecentResults, 'teamId');

      return { success: true, message: `All data imported successfully into '${targetDbId}'.` };
    } catch (error: any) {
      console.error(`Error importing data to Firestore DB '${targetDbId}':`, error);
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || '[UNKNOWN]';

       if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        return { success: false, message: `Import failed: The project '${projectId}' does not have an active Cloud Firestore database with ID '${targetDbId}'. Please create it in the Firebase console or verify the name.` };
      }
      return { success: false, message: `An error occurred during data import to '${targetDbId}': ${error.message}` };
    } finally {
        // Unset the env var to clean up.
        if (databaseId) {
            delete process.env.FIRESTORE_DATABASE_ID;
        }
    }
  }
);
