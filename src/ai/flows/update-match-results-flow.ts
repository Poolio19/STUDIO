'use server';
/**
 * @fileOverview A flow to update match results in Firestore.
 *
 * - updateMatchResults - A function that updates match scores for a given week.
 * - UpdateMatchResultsInput - The input type for the updateMatchResults function.
 * - UpdateMatchResultsOutput - The return type for the updateMatchResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getFirestore,
  writeBatch,
  doc,
  collection,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const MatchResultSchema = z.object({
    matchId: z.string(),
    homeScore: z.number().int(),
    awayScore: z.number().int(),
});

export const UpdateMatchResultsInputSchema = z.object({
  week: z.number().int(),
  results: z.array(MatchResultSchema),
});
export type UpdateMatchResultsInput = z.infer<
  typeof UpdateMatchResultsInputSchema
>;

export const UpdateMatchResultsOutputSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number().int(),
});
export type UpdateMatchResultsOutput = z.infer<
  typeof UpdateMatchResultsOutputSchema
>;


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
  async ({ week, results }) => {
    const { firestore: db } = initializeFirebase();
    const batch = writeBatch(db);
    const matchesCollectionRef = collection(db, 'matches');

    results.forEach(result => {
        if (isNaN(result.homeScore) || isNaN(result.awayScore)) {
            console.warn(`Skipping match ${result.matchId} due to invalid score.`);
            return; // Skip if scores are not valid numbers
        }
      const docRef = doc(matchesCollectionRef, result.matchId);
      batch.update(docRef, { 
          homeScore: result.homeScore, 
          awayScore: result.awayScore 
      });
    });

    try {
      await batch.commit();
      return { success: true, updatedCount: results.length };
    } catch (error) {
      console.error(`Error updating match results for week ${week}:`, error);
      throw new Error('Failed to update match results.');
    }
  }
);
