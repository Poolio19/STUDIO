
'use server';
/**
 * @fileOverview A flow to import a week's results from a specific JSON file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import type { WeekResults } from '@/lib/types';


const ImportResultsFileInputSchema = z.object({
  filePath: z.string(),
});
export type ImportResultsFileInput = z.infer<typeof ImportResultsFileInputSchema>;

const ImportResultsFileOutputSchema = z.object({
  success: z.boolean(),
  week: z.number(),
  updatedCount: z.number(),
  message: z.string().optional(),
});
export type ImportResultsFileOutput = z.infer<typeof ImportResultsFileOutputSchema>;

/**
 * Gets a Firestore admin instance, initializing the app if needed.
 */
function getDb() {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  return admin.firestore();
}

export async function importResultsFile(input: ImportResultsFileInput): Promise<ImportResultsFileOutput> {
  return importResultsFileFlow(input);
}


const importResultsFileFlow = ai.defineFlow(
  {
    name: 'importResultsFileFlow',
    inputSchema: ImportResultsFileInputSchema,
    outputSchema: ImportResultsFileOutputSchema,
  },
  async (input, context) => {
    const { filePath } = input;
    const db = getDb();
    const matchesCollection = db.collection('matches');

    context.logger.info(`Starting import from file: ${filePath}`);

    try {
      // 1. Read and parse the JSON file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data: WeekResults = JSON.parse(fileContent);
      const { week, results } = data;

      if (!week || !results) {
        throw new Error('Invalid file format. "week" and "results" are required.');
      }
      
      context.logger.info(`File read successfully. Processing scores for Week ${week}.`);

      const batch = db.batch();
      let updatedCount = 0;

      for (const result of results) {
        if (!result.id) {
          context.logger.warn('Skipping result with no ID:', result);
          continue;
        }

        const docRef = matchesCollection.doc(result.id);
        batch.update(docRef, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
        updatedCount++;
      }

      await batch.commit();
      
      context.logger.info(`Successfully updated ${updatedCount} matches for Week ${week}.`);

      return {
        success: true,
        week,
        updatedCount,
        message: `Successfully updated ${updatedCount} matches from ${filePath}.`,
      };

    } catch (error: any) {
      context.logger.error(`Failed to import from file ${filePath}:`, error);
      throw new Error(`Flow failed during file import: ${error.message}`);
    }
  }
);
