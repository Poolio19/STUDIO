
'use server';
/**
 * @fileOverview A flow to update match results in the past-fixtures.json file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pastFixtures from '@/lib/past-fixtures.json';

const UpdateMatchResultInputSchema = z.object({
  id: z.string(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
});

const UpdateMatchResultsInputSchema = z.object({
  results: z.array(UpdateMatchResultInputSchema),
});

const UpdateMatchResultsOutputSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number().int(),
  message: z.string().optional(),
});

export type UpdateMatchResultsInput = z.infer<typeof UpdateMatchResultsInputSchema>;
export type UpdateMatchResultsOutput = z.infer<typeof UpdateMatchResultsOutputSchema>;

export async function updateMatchResults(
  input: UpdateMatchResultsInput
): Promise<UpdateMatchResultsOutput> {
  return updateMatchResultsFlow(input);
}

const updateMatchResultsFlow = ai.defineFlow(
  {
    name: 'updateMatchResultsFlow',
    inputSchema: UpdateMatchResultsInputSchema,
    outputSchema: UpdateMatchResultsOutputSchema,
  },
  async ({ results }, { logger }) => {
    logger.info(`Starting update of ${results.length} match results in fixture file.`);

    try {
      // Create a deep, mutable copy of the imported fixtures.
      // This is crucial because imported JSON modules can be read-only.
      const updatedFixtures = JSON.parse(JSON.stringify(pastFixtures));
      let updatedCount = 0;

      // Create a map for efficient lookups
      const resultsMap = new Map(results.map(r => [r.id, r]));

      // Iterate over the copied fixtures and update scores
      for (const fixture of updatedFixtures) {
        if (resultsMap.has(fixture.id)) {
          const result = resultsMap.get(fixture.id)!;
          fixture.homeScore = result.homeScore;
          fixture.awayScore = result.awayScore;
          updatedCount++;
        }
      }

      if (updatedCount !== results.length) {
        logger.warn(`Mismatch in update count. Expected: ${results.length}, Actual: ${updatedCount}.`);
      }
      
      if (updatedCount === 0) {
         return {
          success: false,
          updatedCount: 0,
          message: 'No matching fixtures found to update.',
        };
      }

      // Define the path to the JSON file using an absolute path
      const filePath = path.join(process.cwd(), 'src', 'lib', 'past-fixtures.json');
      logger.info(`Writing ${updatedFixtures.length} fixtures back to ${filePath}`);

      // Write the entire updated array back to the file
      await fs.writeFile(filePath, JSON.stringify(updatedFixtures, null, 2), 'utf-8');

      logger.info(`Successfully updated ${updatedCount} matches.`);
      return {
        success: true,
        updatedCount,
        message: 'Successfully updated fixture file.',
      };

    } catch (error: any) {
      logger.error('Fixture File Update FAILED!', error);
      // Re-throw a more user-friendly error
      throw new Error(`Flow failed during file write: ${error.message}`);
    }
  }
);
