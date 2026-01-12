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
import { getFirestoreAdmin } from '@/ai/admin';

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
  async (input, { logger }) => {
    const { results } = input;
    const db = await getFirestoreAdmin();
    
    const validResults = results.filter(
      (result) => !isNaN(result.homeScore) && !isNaN(result.awayScore)
    );

    if (validResults.length === 0) {
      logger.info("No valid match results to update.");
      return { success: true, updatedCount: 0 };
    }

    const batch = db.batch();
    results.forEach(result => {
      const { id, ...matchData } = result;
      const docRef = db.collection('matches').doc(id);
      // Use set with merge: true to handle both creation of new docs and update of existing ones
      batch.set(docRef, matchData, { merge: true });
    });
    
    await batch.commit();
    
    const totalUpdatedCount = results.length;
    logger.info(`Successfully committed a batch of ${totalUpdatedCount} match results.`);

    return { success: true, updatedCount: totalUpdatedCount };
  }
);
