'use server';
/**
 * @fileOverview A flow to update match results in Firestore.
 *
 * - updateMatchResults - A function that updates match scores for a given week.
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
    const batch = db.batch();
    const matchesCollectionRef = db.collection('matches');

    const validResults = results.filter(result => 
        !isNaN(result.homeScore) && !isNaN(result.awayScore)
    );

    validResults.forEach(result => {
      const docRef = matchesCollectionRef.doc(result.matchId);
      batch.set(docRef, { 
          week: result.week,
          homeTeamId: result.homeTeamId,
          awayTeamId: result.awayTeamId,
          matchDate: result.matchDate,
          homeScore: result.homeScore, 
          awayScore: result.awayScore 
      }, { merge: true });
    });

    try {
      await batch.commit();
      return { success: true, updatedCount: validResults.length };
    } catch (error) {
      console.error(`Error updating match results:`, error);
      throw new Error('Failed to update match results.');
    }
  }
);
