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
    const db = getAdminFirestore('prempred-master');
    const matchesCollectionRef = db.collection('matches');
    const validResults = results.filter(
      (result) => !isNaN(result.homeScore) && !isNaN(result.awayScore)
    );

    if (validResults.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    // Firestore batch writes are limited to 500 operations.
    // We'll process the results in chunks of 400 to be safe.
    const CHUNK_SIZE = 400;
    let totalUpdatedCount = 0;

    for (let i = 0; i < validResults.length; i += CHUNK_SIZE) {
      const chunk = validResults.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();

      chunk.forEach(result => {
        const docRef = matchesCollectionRef.doc(result.matchId);
        // This payload is clean and does not contain a redundant `id`.
        batch.set(docRef, {
          week: result.week,
          homeTeamId: result.homeTeamId,
          awayTeamId: result.awayTeamId,
          matchDate: result.matchDate,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
      });

      try {
        await batch.commit();
        totalUpdatedCount += chunk.length;
        console.log(`Successfully committed a batch of ${chunk.length} match results.`);
      } catch (error) {
        console.error(`Error committing a batch of match results:`, error);
        // If any batch fails, we throw an error to stop the process.
        throw new Error(
          `Failed to update match results batch starting at index ${i}. Reason: ${
            (error as Error).message
          }`
        );
      }
    }

    return { success: true, updatedCount: totalUpdatedCount };
  }
);
