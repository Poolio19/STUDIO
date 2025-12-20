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
  matches as staticMatches,
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
      await batchWrite(db, 'teams', teams, 'id');
      await batchWrite(db, 'users', staticUsers, 'id');
      
      // For predictions, the document ID is the userId
      const predBatch = writeBatch(db);
      const predCollectionRef = collection(db, 'predictions');
      staticPredictions.forEach(item => {
          const docRef = doc(predCollectionRef, item.userId);
          predBatch.set(docRef, item);
      });
      await predBatch.commit();

      await batchWrite(db, 'matches', staticMatches, 'week');
      
      const prevStandingsBatch = writeBatch(db);
      const prevStandingsRef = collection(db, 'previousSeasonStandings');
      staticPreviousSeasonStandings.forEach(item => {
        // Use teamId as the document ID for simplicity and to avoid duplicates
        const docRef = doc(prevStandingsRef, item.teamId);
        prevStandingsBatch.set(docRef, item);
      });
      await prevStandingsBatch.commit();


      return { success: true };
    } catch (error) {
      console.error("Error importing data to Firestore:", error);
      // In a real app, you might want more robust error handling
      throw new Error('Failed to import data.');
    }
  }
);
