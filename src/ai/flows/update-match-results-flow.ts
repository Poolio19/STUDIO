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
import {getFirestore, setDoc, doc} from 'genkit/firestore';

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
      const db = getFirestore();
      
      const validResults = results.filter(
        (result) => !isNaN(result.homeScore) && !isNaN(result.awayScore)
      );

      if (validResults.length === 0) {
        console.log("No valid match results to update.");
        return { success: true, updatedCount: 0 };
      }

      const updatePromises = validResults.map(result => {
        const { id, ...matchData } = result;
        const docRef = doc(db, 'matches', id);
        return setDoc(docRef, matchData, { merge: true });
      });
      
      await Promise.all(updatePromises);
      
      const totalUpdatedCount = validResults.length;
      console.log(`Successfully committed a batch of ${totalUpdatedCount} match results.`);

      return { success: true, updatedCount: totalUpdatedCount };
    } catch (error: any) {
      console.error(`Error in updateMatchResultsFlow:`, error);
      throw new Error(
        `Flow failed. Reason: ${(error as Error).message}`
      );
    }
  }
);
