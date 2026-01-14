
'use server';
/**
 * @fileOverview A flow to delete and re-import fixtures for a given week.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

const MatchSchema = z.object({
  id: z.string(),
  week: z.number(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeScore: z.number(),
  awayScore: z.number(),
  matchDate: z.string(),
});

const ReimportFixturesInputSchema = z.object({
  week: z.number(),
  fixtures: z.array(MatchSchema),
});
export type ReimportFixturesInput = z.infer<typeof ReimportFixturesInputSchema>;

const ReimportFixturesOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
  importedCount: z.number(),
});
export type ReimportFixturesOutput = z.infer<
  typeof ReimportFixturesOutputSchema
>;

/**
 * Gets a Firestore admin instance, initializing the app if needed.
 */
function getDb() {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  return admin.firestore();
}

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
  async (input, context) => {
    const { week, fixtures } = input;
    const db = getDb();

    context.logger.info(`Starting re-import for Week ${week}.`);

    const matchesCollection = db.collection('matches');
    const querySnapshot = await matchesCollection.where('week', '==', week).get();
    const existingDocs = querySnapshot.docs;
    const deletedCount = existingDocs.length;

    const batch = db.batch();

    if (deletedCount > 0) {
      context.logger.info(`Found ${deletedCount} existing matches for Week ${week}. Deleting...`);
      existingDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    const importedCount = fixtures.length;
    context.logger.info(`Importing ${importedCount} new fixtures for Week ${week}.`);
    fixtures.forEach(fixture => {
      const { id, ...fixtureData } = fixture;
      const docRef = matchesCollection.doc(id);
      batch.set(docRef, fixtureData);
    });

    await batch.commit();
    context.logger.info(`Successfully committed re-import for Week ${week}. Deleted: ${deletedCount}, Imported: ${importedCount}.`);

    return { success: true, deletedCount, importedCount };
  }
);
