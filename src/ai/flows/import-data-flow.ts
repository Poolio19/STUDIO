
'use server';
/**
 * @fileOverview Flows to populate and manage Firestore data.
 *
 * - importData - Populates Firestore collections.
 * - ensureUser - Creates the default user for the app.
 * - testDatabaseConnection - Verifies connection to a specific Firestore database.
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

// This is the project ID that Firebase Studio uses for your backend.
const TARGET_PROJECT_ID = 'prem-pred-gmail';

async function batchWrite(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  data: any[],
  idField: string = 'id'
) {
  const batch = db.batch();
  const collectionRef = db.collection(collectionName);
  data.forEach((item) => {
    // Ensure the ID is a string, as Firestore requires non-empty document IDs.
    const docId = item[idField]?.toString();
    if (docId) {
      const docRef = collectionRef.doc(docId);
      batch.set(docRef, item);
    } else {
      console.warn(`Skipping item in ${collectionName} due to missing or invalid ID:`, item);
    }
  });
  await batch.commit();
}


export async function ensureUser(): Promise<{ success: boolean; message: string }> {
    return ensureUserFlow();
}

export async function importData(databaseId: string): Promise<{ success: boolean; message?: string }> {
  return importDataFlow({ databaseId });
}

export async function testDatabaseConnection(databaseId: string): Promise<{ success: boolean; message: string; }> {
    return testDatabaseConnectionFlow({ databaseId });
}

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
          // Default user profiles always go in the default DB, so no databaseId is passed.
          auth = getAdminAuth();
          db = getAdminFirestore(); 
        } catch (initError: any) {
            console.error('Firebase Admin SDK initialization failed in ensureUserFlow:', initError);
            const detailedMessage = initError.message.includes('FIREBASE ADMIN SDK AUTHENTICATION FAILED') 
                ? `Authentication Failed. Please check the server logs for detailed instructions on how to fix your Application Default Credentials (ADC).`
                : `Firebase Admin SDK initialization failed. Original error: ${initError.message}`;
            return { success: false, message: detailedMessage };
        }

        try {
            const userRecord = await auth.getUserByEmail(email);
            return { success: true, message: `User ${displayName} (${email}) already exists.` };
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
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
                        // This case should not happen if data is consistent
                        await auth.deleteUser(userId); // Clean up created user
                        return { success: false, message: "User creation failed: Alex's profile data was not found." };
                    }

                } catch (creationError: any) {
                    console.error('Error creating user:', creationError);
                    return { success: false, message: `Failed to create user: ${creationError.message}` };
                }
            } else {
                console.error('Error checking for user:', error);
                return { success: false, message: `An unexpected error occurred: ${error.message}` };
            }
        }
    }
);

const testDatabaseConnectionFlow = ai.defineFlow(
    {
        name: 'testDatabaseConnectionFlow',
        inputSchema: z.object({ databaseId: z.string() }),
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async ({ databaseId }) => {
        let db: FirebaseFirestore.Firestore;
        try {
            db = getAdminFirestore(databaseId);
        } catch (initError: any) {
            console.error(`Firebase Admin SDK initialization failed for database '${databaseId}':`, initError);
             const detailedMessage = initError.message.includes('FIREBASE ADMIN SDK AUTHENTICATION FAILED') 
                ? `Authentication Failed. Please check the server logs for detailed instructions on how to fix your Application Default Credentials (ADC).`
                : `Firebase Admin SDK initialization failed: ${initError.message}.`;
            return { success: false, message: detailedMessage };
        }

        try {
            // Attempt to read a non-existent document. This checks permissions and DB existence
            // without requiring any data to be present.
            await db.collection('__test_connection__').doc('__test_doc__').get();
            return { success: true, message: `Successfully connected to database '${databaseId}' in project '${TARGET_PROJECT_ID}'.` };
        } catch (error: any) {
            console.error(`Error connecting to Firestore database '${databaseId}':`, error);
            if (error.code === 5 || (error.message && (error.message.includes('NOT_FOUND') || error.message.includes("Could not find database")))) {
                return { success: false, message: `Connection failed: A database with ID '${databaseId}' was not found in project '${TARGET_PROJECT_ID}'. Please create it in the Firebase console.` };
            }
            if (error.message.includes('Could not refresh access token')) {
                 return { success: false, message: `Authentication Failed. Please check the server logs for detailed instructions on how to fix your Application Default Credentials (ADC).` };
            }
            return { success: false, message: `Connection failed: An error occurred while connecting to '${databaseId}': ${error.message}` };
        }
    }
);


const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
    inputSchema: z.object({ databaseId: z.string() }),
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async ({ databaseId }) => {
    let db: FirebaseFirestore.Firestore;
    
    try {
        db = getAdminFirestore(databaseId);
    } catch (initError: any) {
        console.error(`Firebase Admin SDK initialization failed for database '${databaseId}':`, initError);
        const detailedMessage = initError.message.includes('FIREBASE ADMIN SDK AUTHENTICATION FAILED') 
            ? `Authentication Failed. Please check the server logs for detailed instructions on how to fix your Application Default Credentials (ADC).`
            : `Firebase Admin SDK initialization failed: ${initError.message}.`;
        return { success: false, message: detailedMessage };
    }

    try {
      await batchWrite(db, 'teams', teams, 'id');
      
      const predBatch = db.batch();
      const predCollectionRef = db.collection('predictions');
      fullPredictions.forEach(item => {
          if (item.userId) { // Ensure userId exists
            const docRef = predCollectionRef.doc(item.userId);
            predBatch.set(docRef, item);
          }
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
      
      // Note: We do not write to the 'users' collection here, as that is handled by ensureUser
      // and should reside in the default database.

      return { success: true, message: `All game data imported successfully into database '${databaseId}'.` };
    } catch (error: any) {
      console.error(`Error importing data to Firestore database '${databaseId}':`, error);
      if (error.code === 5 || (error.message && (error.message.includes('NOT_FOUND') || error.message.includes("Could not find database")))) {
         return { success: false, message: `Import failed: A database with ID '${databaseId}' was not found in project '${TARGET_PROJECT_ID}'. Please create it in the Firebase console.` };
      }
      if (error.message.includes('Could not refresh access token')) {
         return { success: false, message: `Authentication Failed. Please check the server logs for detailed instructions on how to fix your Application Default Credentials (ADC).` };
      }
      return { success: false, message: `An error occurred during data import to '${databaseId}': ${error.message}` };
    }
  }
);
