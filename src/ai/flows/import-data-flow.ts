
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
          db = getAdminFirestore();
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
    let db;
    let databaseURL: string | undefined;

    if (databaseId) {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT;
        if (projectId) {
            databaseURL = `https://${projectId}.firebaseio.com`;
        }
    }
    
    try {
        db = getAdminFirestore(databaseURL);
    } catch (initError: any) {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || '[UNKNOWN]';
        const errorMessage = `Firebase Admin SDK initialization failed. Project: ${projectId}. Error: ${initError.message}. Check server logs for details.`;
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

      return { success: true, message: 'All data imported successfully.' };
    } catch (error: any) {
      console.error("Error importing data to Firestore:", error);
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || '[UNKNOWN]';
      if (error.message.includes('firestore/not-found') || error.message.includes('does not exist')) {
        return { success: false, message: `The project '${projectId}' does not have an active Cloud Firestore database. Please enable it in the Firebase console.` };
      }
      return { success: false, message: `An error occurred during data import: ${error.message}` };
    }
  }
);
