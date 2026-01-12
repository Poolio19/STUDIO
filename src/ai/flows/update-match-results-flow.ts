'use server';
/**
 * @fileOverview A flow to update match results in Firestore.
 *
 * - updateMatchResults - A function that updates match scores.
 */

import { ai } from '@/ai/genkit';
import {
  UpdateMatchResultsInputSchema,
  UpdateMatchResultsOutputSchema,
  type UpdateMatchResultsInput,
  type UpdateMatchResultsOutput,
} from './update-match-results-flow-types';
import { getAdminFirestore } from '@/ai/firebase-admin';

export async function updateMatchResults(
  input: UpdateMatchResultsInput
): Promise<UpdateMatchResultsOutput> {
  return updateMatchResultsFlow(input);
}

const updateMatchResultsFlow = ai.defineFlow(
  {
    name: 'updateMatchResultsFlow',
    inputSchema: UpdateMatchResultsInputSchema,
    outputSchema: UpdateMatchResultsOutputSchema,
  },
  async ({ results }) => {
    try {
      const db = getAdminFirestore();
      const matchesCollectionRef = db.collection('matches');
      
      const validResults = results.filter(
        (result) => !isNaN(result.homeScore) && !isNaN(result.awayScore)
      );

      if (validResults.length === 0) {
        console.log("No valid match results to update.");
        return { success: true, updatedCount: 0 };
      }

      // Firestore batch writes are limited to 500 operations.
      // A batch with one `set` operation per document is safe.
      const CHUNK_SIZE = 400;
      let totalUpdatedCount = 0;

      for (let i = 0; i < validResults.length; i += CHUNK_SIZE) {
        const chunk = validResults.slice(i, i + CHUNK_SIZE);
        const batch = db.batch();

        chunk.forEach(result => {
          // The result.id from the client is the intended document ID
          const docRef = matchesCollectionRef.doc(result.id);
          // Exclude the 'id' field from the data being written to Firestore
          const { id, ...matchData } = result;
          batch.set(docRef, matchData, { merge: true });
        });

        await batch.commit();
        totalUpdatedCount += chunk.length;
        console.log(`Successfully committed a batch of ${chunk.length} match results.`);
      }

      return { success: true, updatedCount: totalUpdatedCount };
    } catch (error) {
      console.error(`Error in updateMatchResultsFlow:`, error);
      // Re-throw the error to propagate it to the client, where it will be displayed in the toast.
      // The custom error from getAdminFirestore will provide actionable steps.
      throw new Error(
        `Flow failed. Reason: ${(error as Error).message}`
      );
    }
  }
);
