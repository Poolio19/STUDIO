
'use server';
/**
 * @fileOverview A flow to populate Firestore with initial data.
 *
 * - importData - A function that populates Firestore collections.
 */

import { ai } from '@/ai/genkit';
import {
  teams,
  predictions as staticPredictions,
  users as staticUsers,
  allMatches as staticMatches,
  previousSeasonStandings as staticPreviousSeasonStandings,
} from '@/lib/data';
import { z } from 'zod';
import {
  getFirestore,
  collection,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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

async function ensureDefaultUser() {
    const { auth } = initializeFirebase();
    const email = 'alex@example.com';
    const password = 'password123';
    const displayName = 'Alex';

    try {
        // Attempt to create the user.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // If creation is successful, update the profile with the display name.
        await updateProfile(userCredential.user, { displayName });
        console.log(`Successfully created and set up user: ${displayName}`);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            // This is expected if the user has already been created.
            // We don't need to update the profile here, as the login flow in the provider
            // will handle ensuring the user state is correct for the app session.
            console.log(`User ${displayName} already exists.`);
        } else {
            // For other errors, log them.
            console.error(`Error ensuring default user exists:`, error);
        }
    }
}


export async function importData(): Promise<{ success: boolean }> {
  return importDataFlow();
}

const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
    outputSchema: z.object({ success: z.boolean() }),
  },
  async () => {
    const { firestore: db } = initializeFirebase();

    try {
      // Ensure the default user exists and has a displayName before importing data that might rely on it.
      await ensureDefaultUser();

      await batchWrite(db, 'teams', teams, 'id');
      await batchWrite(db, 'users', staticUsers, 'id');
      
      const predBatch = writeBatch(db);
      const predCollectionRef = collection(db, 'predictions');
      staticPredictions.forEach(item => {
          // Use the userId as the document ID for predictions
          const docRef = doc(predCollectionRef, item.userId);
          predBatch.set(docRef, item);
      });
      await predBatch.commit();

      const matchesBatch = writeBatch(db);
      const matchesCollectionRef = collection(db, 'matches');
      staticMatches.forEach(item => {
        // Create a unique ID based on the home and away team IDs
        const matchId = `${item.homeTeamId.replace('team_', '')}.${item.awayTeamId.replace('team_', '')}`;
        const docRef = doc(matchesCollectionRef, matchId);
        matchesBatch.set(docRef, item);
      });
      await matchesBatch.commit();
      
      const prevStandingsBatch = writeBatch(db);
      const prevStandingsRef = collection(db, 'previousSeasonStandings');
      staticPreviousSeasonStandings.forEach(item => {
        const docRef = doc(prevStandingsRef, item.teamId);
        prevStandingsBatch.set(docRef, item);
      });
      await prevStandingsBatch.commit();


      return { success: true };
    } catch (error) {
      console.error("Error importing data to Firestore:", error);
      throw new Error('Failed to import data.');
    }
  }
);
