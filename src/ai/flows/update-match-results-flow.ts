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
import {
  getFirestore,
  writeBatch,
  doc,
  collection,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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

    const validResults = results.filter(result => 
        !isNaN(result.homeScore) && !isNaN(result.awayScore)
    );

    validResults.forEach(result => {
      const docRef = doc(matchesCollectionRef, result.matchId);
      batch.update(docRef, { 
          homeScore: result.homeScore, 
          awayScore: result.awayScore 
      });
    });

    try {
      await batch.commit();
      return { success: true, updatedCount: validResults.length };
    } catch (error) {
      console.error(`Error updating match results for week ${week}:`, error);
      throw new Error('Failed to update match results.');
    }
  }
);
