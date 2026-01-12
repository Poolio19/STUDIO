'use server';
/**
 * @fileOverview A flow to delete and re-import fixtures for a given week.
 */

import { ai } from '@/ai/genkit';
import { getFirestoreAdmin } from '@/ai/admin';
import {
  ReimportFixturesInputSchema,
  ReimportFixturesOutputSchema,
  type ReimportFixturesInput,
  type ReimportFixturesOutput
} from './reimport-fixtures-flow-types';


export async function reimportFixtures(
  input: ReimportFixturesInput
): Promise<ReimportFixturesOutput> {
  return reimportFixturesFlow(input);
}

const reimportFixturesFlow = ai.defineFlow(
  {
    name: 'reimportFixturesFlow',
    inputSchema: ReimportFixturesInputSchema,
    outputSchema: ReimportFixturesOutputSchema,
  },
  async (input, { logger }) => {
    const { week, fixtures } = input;
    const db = await getFirestoreAdmin();

    logger.info(`Starting re-import for Week ${week}.`);

    // 1. Find all existing matches for the given week
    const matchesCollection = db.collection('matches');
    const querySnapshot = await matchesCollection.where('week', '==', week).get();
    const existingDocs = querySnapshot.docs;
    const deletedCount = existingDocs.length;

    const batch = db.batch();

    // 2. Delete all existing matches for that week
    if (deletedCount > 0) {
      logger.info(`Found ${deletedCount} existing matches for Week ${week}. Deleting...`);
      existingDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // 3. Add the new, correct fixtures for that week
    const importedCount = fixtures.length;
    logger.info(`Importing ${importedCount} new fixtures for Week ${week}.`);
    fixtures.forEach(fixture => {
      const { id, ...fixtureData } = fixture;
      const docRef = matchesCollection.doc(id);
      batch.set(docRef, fixtureData);
    });

    // 4. Commit the batch
    await batch.commit();
    logger.info(`Successfully committed re-import for Week ${week}. Deleted: ${deletedCount}, Imported: ${importedCount}.`);

    return { success: true, deletedCount, importedCount };
  }
);
