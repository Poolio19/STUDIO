'use server';
/**
 * @fileOverview A one-time test flow to prove database write capability.
 */

import { ai } from '@/ai/genkit';
import { getFirestoreAdmin } from '@/ai/admin';
import { z } from 'zod';

const TestWriteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function testDbWrite(): Promise<z.infer<typeof TestWriteOutputSchema>> {
  return testDbWriteFlow();
}

const testDbWriteFlow = ai.defineFlow(
  {
    name: 'testDbWriteFlow',
    outputSchema: TestWriteOutputSchema,
  },
  async (_, { logger }) => {
    logger.info("Attempting to get Firestore admin instance...");
    const db = await getFirestoreAdmin();
    logger.info("Firestore admin instance acquired. Getting document reference...");
    const matchRef = db.collection('matches').doc('19-team_01-team_02');
    const newScore = 5;

    logger.info(`Attempting to update match '19-team_01-team_02' homeScore to ${newScore}.`);
    
    // IMPORTANT: No try/catch block. Let the original error propagate.
    await matchRef.set({
      homeScore: newScore,
    }, { merge: true });

    logger.info('Database write successful.');
    
    return {
      success: true,
      message: "Successfully updated document '19-team_01-team_02'. homeScore is now 5.",
    };
  }
);
