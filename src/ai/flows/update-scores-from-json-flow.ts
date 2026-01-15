
'use server';
/**
 * @fileOverview A flow to update a week's match results in the database from a JSON object.
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
const UpdateScoresInputSchema = z.object({
  week: z.number(),
  results: z.array(MatchResultSchema),
});
export type UpdateScoresInput = z.infer<typeof UpdateScoresInputSchema>;

// Define the output schema for the flow
const UpdateScoresOutputSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number(),
  week: z.number(),
  message: z.string().optional(),
});
export type UpdateScoresOutput = z.infer<typeof UpdateScoresOutputSchema>;


/**
 * Gets a Firestore admin instance, initializing the app if needed.
 * This is a safer pattern for Next.js server environments.
 */
function getDb() {
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }
    return admin.firestore();
}


/**
 * Exported wrapper function to be called from the client.
 */
export async function updateScoresFromJson(
  input: UpdateScoresInput
): Promise<UpdateScoresOutput> {
  return updateScoresFromJsonFlow(input);
}


const updateScoresFromJsonFlow = ai.defineFlow(
  {
    name: 'updateScoresFromJsonFlow',
    inputSchema: UpdateScoresInputSchema,
    outputSchema: UpdateScoresOutputSchema,
  },
  async (input, context) => {
    const { week, results } = input;
    const db = getDb();
    const matchesCollection = db.collection('matches');

    try {
      const batch = db.batch();
      let updatedCount = 0;

      for (const result of results) {
        if (!result.id) {
          context.logger.warn('Skipping result with no ID:', result);
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
      
      context.logger.info(`Successfully updated ${updatedCount} matches for Week ${week}.`);

      return {
        success: true,
        updatedCount,
        week,
        message: `Successfully updated ${updatedCount} matches for Week ${week}.`,
      };

    } catch (error: any) {
      context.logger.error(`Failed to update scores for Week ${week}:`, error);
      throw new Error(`Flow failed during score update: ${error.message}`);
    }
  }
);

    