
'use server';
/**
 * @fileOverview A flow to populate Firestore with initial data.
 *
 * - importData - A function that populates Firestore collections.
 * - ensureUser - A function that creates the default user for the app.
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
const TARGET_PROJECT_ID = 'studio-2138583336-cec5d';

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

export async function importData(): Promise<{ success: boolean; message?: string }> {
  return importDataFlow();
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
          // Initialize with the correct project for user management
          auth = getAdminAuth(TARGET_PROJECT_ID);
          db = getAdminFirestore(TARGET_PROJECT_ID); 
        } catch (initError: any) {
            console.error('Firebase Admin SDK initialization failed:', initError);
            const detailedMessage = initError.message.includes('Could not refresh access token') 
                ? `Authentication Failed: Could not get Google Cloud credentials for project '${TARGET_PROJECT_ID}'. Please run 'gcloud auth application-default login' in your terminal, select the project containing this ID, and restart the server.`
                : `Firebase Admin SDK initialization failed. Original error: ${initError.message}`;
            return { success: false, message: detailedMessage };
        }

        try {
            const userRecord = await auth.getUserByEmail(email);
            return { success: true, message: `User ${displayName} (${email}) already exists in project '${TARGET_PROJECT_ID}'.` };
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
                         return { success: true, message: `Successfully created user and profile for ${displayName} in project '${TARGET_PROJECT_ID}'.` };
                    } else {
                        return { success: false, message: "New user created, but Alex's profile data was not found to populate Firestore." };
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


const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async () => {
    let db: FirebaseFirestore.Firestore;
    
    try {
        db = getAdminFirestore(TARGET_PROJECT_ID);
    } catch (initError: any) {
        console.error(`Firebase Admin SDK initialization failed for project '${TARGET_PROJECT_ID}':`, initError);
        const detailedMessage = initError.message.includes('Could not refresh access token') 
            ? `Authentication Failed: Could not get Google Cloud credentials for project '${TARGET_PROJECT_ID}'. Please run 'gcloud auth application-default login' in your terminal, select the project containing this ID, and restart the server.`
            : `Firebase Admin SDK initialization failed: ${initError.message}.`;
        return { success: false, message: detailedMessage };
    }

    try {
      // Check for a dummy collection to verify connection before writing.
      await db.collection('__test_connection__').limit(1).get();
      
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

      return { success: true, message: `All data imported successfully into project '${TARGET_PROJECT_ID}'.` };
    } catch (error: any) {
      console.error(`Error importing data to Firestore project '${TARGET_PROJECT_ID}':`, error);
      if (error.message.includes('Could not refresh access token')) {
         return { success: false, message: `Authentication Failed: Could not get Google Cloud credentials for project '${TARGET_PROJECT_ID}'. Please run 'gcloud auth application-default login' in your terminal and restart the server.` };
      }
      // Firestore error code 5 is 'NOT_FOUND', which can happen if the DB doesn't exist.
      if (error.code === 5 || (error.message && error.message.includes('NOT_FOUND'))) {
         return { success: false, message: `Import failed: Project '${TARGET_PROJECT_ID}' does not have an active Cloud Firestore database. Please create a Firestore database (e.g., with ID 'prempred-master') in the Firebase console.` };
      }
      return { success: false, message: `An error occurred during data import to '${TARGET_PROJECT_ID}': ${error.message}` };
    }
  }
);
