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
    const db = await getFirestoreAdmin();
    const matchRef = db.collection('matches').doc('19-team_01-team_02');
    const newScore = 5;

    try {
      logger.info(`Attempting to update match '19-team_01-team_02' homeScore to ${newScore}.`);
      
      await matchRef.update({
        homeScore: newScore,
      });

      logger.info('Database write successful.');
      return {
        success: true,
        message: "Successfully updated document '19-team_01-team_02'. homeScore is now 5.",
      };
    } catch (error: any) {
      logger.error('Database write test failed:', error);
      throw new Error(`Test failed: ${error.message}`);
    }
  }
);
