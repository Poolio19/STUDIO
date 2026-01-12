'use server';
/**
 * @fileOverview A flow to delete and re-import fixtures for a given week.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFlow } from 'genkit';
import { getFirestoreAdmin } from '@/ai/admin';

export const ReimportFixturesInputSchema = z.object({
  week: z.number().int(),
  fixtures: z.array(z.object({
    id: z.string(),
    week: z.number().int(),
    homeTeamId: z.string(),
    awayTeamId: z.string(),
    homeScore: z.number().int(),
    awayScore: z.number().int(),
    matchDate: z.string(),
  })),
});
export type ReimportFixturesInput = z.infer<typeof ReimportFixturesInputSchema>;

export const ReimportFixturesOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number().int(),
  importedCount: z.number().int(),
});
export type ReimportFixturesOutput = z.infer<typeof ReimportFixturesOutputSchema>;


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
  async ({ week, fixtures }) => {
    const { logger } = getFlow().state();
    const db = await getFirestoreAdmin();

    try {
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
    } catch (error: any) {
      logger.error(`Error in reimportFixturesFlow for Week ${week}:`, error);
      throw new Error(`Flow failed for Week ${week}. Reason: ${error.message}`);
    }
  }
);
