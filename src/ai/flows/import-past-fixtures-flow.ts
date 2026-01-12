
'use server';
/**
 * @fileOverview A flow to import definitive past fixture results from a JSON backup file.
 */

import { ai } from '@/ai/genkit';
import { getFirestoreAdmin } from '@/ai/admin';
import { z } from 'zod';
import pastFixtures from '@/lib/past-fixtures.json';

const ImportPastFixturesOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number().int(),
  importedCount: z.number().int(),
  message: z.string().optional(),
});
export type ImportPastFixturesOutput = z.infer<typeof ImportPastFixturesOutputSchema>;

export async function importPastFixtures(): Promise<ImportPastFixturesOutput> {
  return importPastFixturesFlow();
}

const importPastFixturesFlow = ai.defineFlow(
  {
    name: 'importPastFixturesFlow',
    inputSchema: z.undefined(),
    outputSchema: ImportPastFixturesOutputSchema,
  },
  async (_, { logger }) => {
    const db = await getFirestoreAdmin();
    const matchesCollection = db.collection('matches');

    logger.info('Starting import of past fixtures from JSON backup.');

    try {
      const batch = db.batch();

      // 1. Delete all existing matches
      const snapshot = await matchesCollection.get();
      const deletedCount = snapshot.size;
      if (deletedCount > 0) {
        logger.info(`Found ${deletedCount} existing matches. Deleting...`);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      // 2. Import new fixtures from the JSON file
      const importedCount = pastFixtures.length;
      logger.info(`Importing ${importedCount} new fixtures from past-fixtures.json.`);
      pastFixtures.forEach(fixture => {
        const { id, ...fixtureData } = fixture;
        if (!id) {
            logger.warn('Skipping fixture with no ID:', fixture);
            return;
        }
        const docRef = matchesCollection.doc(id);
        batch.set(docRef, fixtureData);
      });

      // 3. Commit the batch
      await batch.commit();
      logger.info(`Successfully committed import. Deleted: ${deletedCount}, Imported: ${importedCount}.`);

      return {
        success: true,
        deletedCount,
        importedCount,
        message: 'Successfully imported past fixtures.',
      };
    } catch (error: any) {
        logger.error('Past Fixtures Import: FAILED!', error);
        throw new Error(`Flow failed during import: ${error.message}`);
    }
  }
);
