
'use server';
/**
 * @fileOverview A flow to update a week's match results in the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import type { MatchResult } from '@/lib/types';


// Define the schema for a single match result
const MatchResultSchema = z.object({
  id: z.string(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
});

// Define the input schema for the flow
const UpdateMatchResultsInputSchema = z.object({
  week: z.number(),
  results: z.array(MatchResultSchema),
});
export type UpdateMatchResultsInput = z.infer<typeof UpdateMatchResultsInputSchema>;

// Define the output schema for the flow
const UpdateMatchResultsOutputSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number(),
  week: z.number(),
  message: z.string().optional(),
});
export type UpdateMatchResultsOutput = z.infer<typeof UpdateMatchResultsOutputSchema>;


// Initialize Firebase Admin SDK within this module's scope
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();


/**
 * Exported wrapper function to be called from the client.
 */
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
  async (input, context) => {
    const { week, results } = input;
    const matchesCollection = db.collection('matches');

    try {
      const batch = db.batch();
      let updatedCount = 0;

      for (const result of results) {
        if (!result.id) {
          console.warn('Skipping result with no ID:', result);
          continue;
        }

        const docRef = matchesCollection.doc(result.id);
        
        // We only update scores, preserving other match data.
        batch.update(docRef, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
        updatedCount++;
      }

      await batch.commit();
      
      return {
        success: true,
        updatedCount,
        week,
        message: `Successfully updated ${updatedCount} matches.`,
      };

    } catch (error: any) {
      console.error(`Failed to update scores for Week ${week}:`, error);
      throw new Error(`Flow failed during score update: ${error.message}`);
    }
  }
);
