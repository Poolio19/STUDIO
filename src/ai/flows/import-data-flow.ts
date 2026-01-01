
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
import {
  collection,
  writeBatch,
  doc,
  setDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

async function batchWrite(
  db: any,
  collectionName: string,
  data: any[],
  idField: string = 'id'
) {
  const batch = writeBatch(db);
  const collectionRef = collection(db, collectionName);
  data.forEach((item) => {
    const docRef = doc(collectionRef, item[idField].toString());
    batch.set(docRef, item);
  });
  await batch.commit();
}

export async function ensureUser(): Promise<{ success: boolean; message: string }> {
    return ensureUserFlow();
}

export async function importData(): Promise<{ success: boolean }> {
  return importDataFlow();
}

const ensureUserFlow = ai.defineFlow(
    {
        name: 'ensureUserFlow',
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async () => {
        const { auth, firestore: db } = initializeFirebase();
        const email = 'alex@example.com';
        const password = 'password123';
        const displayName = 'Alex Anderson';

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
            const userId = userCredential.user.uid;
            
            const alexUser = fullUsers.find(u => u.id === 'usr_1');
            if (alexUser) {
                const userDocRef = doc(db, 'users', userId);
                const userProfileData = { ...alexUser, id: userId, email: email };
                await setDoc(userDocRef, userProfileData);
                return { success: true, message: `Successfully created user and profile for ${displayName}.` };
            } else {
                 return { success: false, message: "Could not find Alex's data in fullUsers." };
            }

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                return { success: true, message: `User ${displayName} already exists. No action taken.`};
            }
            console.error(`Error during default user setup:`, error);
            return { success: false, message: error.message || 'An unknown error occurred.' };
        }
    }
);


const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
    outputSchema: z.object({ success: z.boolean() }),
  },
  async () => {
    const { firestore: db } = initializeFirebase();

    try {
      await batchWrite(db, 'teams', teams, 'id');
      await batchWrite(db, 'users', fullUsers, 'id');
      
      const predBatch = writeBatch(db);
      const predCollectionRef = collection(db, 'predictions');
      fullPredictions.forEach(item => {
          const docRef = doc(predCollectionRef, item.userId);
          predBatch.set(docRef, item);
      });
      await predBatch.commit();

      const matchesBatch = writeBatch(db);
      const matchesCollectionRef = collection(db, 'matches');
      matches.forEach(item => {
        const matchId = `${item.week}-${item.homeTeamId}-${item.awayTeamId}`;
        const docRef = doc(matchesCollectionRef, matchId);
        matchesBatch.set(docRef, item);
      });
      await matchesBatch.commit();
      
      await batchWrite(db, 'previousSeasonStandings', previousSeasonStandings, 'teamId');
      await batchWrite(db, 'seasonMonths', seasonMonths, 'id');
      await batchWrite(db, 'monthlyMimoM', monthlyMimoM, 'id');
      await batchWrite(db, 'userHistories', fullUserHistories, 'userId');
      
      const ptsBatch = writeBatch(db);
      const ptsCollectionRef = collection(db, 'playerTeamScores');
      playerTeamScores.forEach(item => {
        const docId = `${item.userId}_${item.teamId}`;
        const docRef = doc(ptsCollectionRef, docId);
        ptsBatch.set(docRef, item);
      });
      await ptsBatch.commit();

      const wtsBatch = writeBatch(db);
      const wtsCollectionRef = collection(db, 'weeklyTeamStandings');
      weeklyTeamStandings.forEach(item => {
        const docId = `${item.week}_${item.teamId}`;
        const docRef = doc(wtsCollectionRef, docId);
        wtsBatch.set(docRef, item);
      });
      await wtsBatch.commit();

      await batchWrite(db, 'teamRecentResults', teamRecentResults, 'teamId');

      return { success: true };
    } catch (error) {
      console.error("Error importing data to Firestore:", error);
      return { success: false };
    }
  }
);
