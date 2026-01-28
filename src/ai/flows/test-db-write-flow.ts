
'use server';
/**
 * @fileOverview A one-time test flow to prove database write capability by creating a specific document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

const TestWriteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  path: z.string(),
});
export type TestDbWriteOutput = z.infer<typeof TestWriteOutputSchema>;

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

export const testDbWriteFlow = ai.defineFlow(
  {
    name: 'testDbWriteFlow',
    inputSchema: z.void(),
    outputSchema: TestWriteOutputSchema,
  },
  async (input, context) => {
    const db = getDb();
    context.logger.info("Firestore admin instance acquired.");

    const collectionName = 'test_01';
    const documentName = 'test_01.02.01'; // Using a new unique document name for a clear test
    const docRef = db.collection(collectionName).doc(documentName);
    const testData = { 'test_01.02.01.success': true, timestamp: new Date().toISOString() };
    
    context.logger.info(`Attempting to create document '${documentName}' in collection '${collectionName}'.`);
    
    // Using set() will create the document if it doesn't exist, or overwrite it if it does.
    await docRef.set(testData);

    const successMessage = `Successfully wrote to document '${documentName}' in collection '${collectionName}'.`;
    context.logger.info(successMessage);
    
    return {
      success: true,
      message: successMessage,
      path: docRef.path,
    };
  }
);
