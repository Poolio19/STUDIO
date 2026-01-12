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
    logger.info("Firestore admin instance acquired. Getting document reference...");

    const docRef = db.collection('test_01').doc('test_01.01');
    const testData = { 'test_01.01.01': 'success' };
    
    logger.info(`Attempting to create document 'test_01.01' in collection 'test_01'.`);
    
    await docRef.set(testData);

    logger.info(`Database write successful. Document ID: ${docRef.id}`);
    
    return {
      success: true,
      message: `Successfully created document 'test_01.01' in collection 'test_01'.`,
    };
  }
);
