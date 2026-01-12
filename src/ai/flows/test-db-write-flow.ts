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
    inputSchema: z.undefined(),
    outputSchema: TestWriteOutputSchema,
  },
  async (_, { logger }) => {
    logger.info("Attempting to get Firestore admin instance...");
    const db = await getFirestoreAdmin();
    logger.info("Firestore admin instance acquired. Getting collection reference...");
    const testCollectionRef = db.collection('testCollection');

    const testData = { test: 'success', timestamp: new Date().toISOString() };
    
    logger.info(`Attempting to add a new document to 'testCollection'.`);
    
    const docRef = await testCollectionRef.add(testData);

    logger.info(`Database write successful. New document ID: ${docRef.id}`);
    
    return {
      success: true,
      message: `Successfully created document in 'testCollection' with ID: ${docRef.id}.`,
    };
  }
);
