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
import { getFlow } from 'genkit';
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
  async ({ results }) => {
    const { logger } = getFlow().state();
    try {
      const db = getFirestoreAdmin();
      
      const validResults = results.filter(
        (result) => !isNaN(result.homeScore) && !isNaN(result.awayScore)
      );

      if (validResults.length === 0) {
        logger.info("No valid match results to update.");
        return { success: true, updatedCount: 0 };
      }

      const batch = db.batch();
      validResults.forEach(result => {
        const { id, ...matchData } = result;
        const docRef = db.collection('matches').doc(id);
        batch.set(docRef, matchData, { merge: true });
      });
      
      await batch.commit();
      
      const totalUpdatedCount = validResults.length;
      logger.info(`Successfully committed a batch of ${totalUpdatedCount} match results.`);

      return { success: true, updatedCount: totalUpdatedCount };
    } catch (error: any) {
      logger.error(`Error in updateMatchResultsFlow:`, error);
      throw new Error(
        `Flow failed. Reason: ${(error as Error).message}`
      );
    }
  }
);
