
'use server';
/**
 * @fileOverview A one-time test flow to prove database write capability by creating a specific document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import type { firestore as adminFirestore } from 'firebase-admin';

// Initialize Firebase Admin SDK within this module's scope
let db: adminFirestore.Firestore;
if (!admin.apps.length) {
  admin.initializeApp();
}
db = admin.firestore();


const TestWriteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  path: z.string(),
});
export type TestDbWriteOutput = z.infer<typeof TestWriteOutputSchema>;


export const testDbWriteFlow = ai.defineFlow(
  {
    name: 'testDbWriteFlow',
    inputSchema: z.void(),
    outputSchema: TestWriteOutputSchema,
  },
  async (input, context) => {
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
