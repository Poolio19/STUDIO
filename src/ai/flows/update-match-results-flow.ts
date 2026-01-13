
'use server';
/**
 * @fileOverview A flow to update match results in the past-fixtures.json file.
 *
 * - updateMatchResults - a function that updates match scores in the JSON file.
 */

import { ai } from '@/ai/genkit';
import {
  UpdateMatchResultsInputSchema,
  UpdateMatchResultsOutputSchema,
  type UpdateMatchResultsInput,
  type UpdateMatchResultsOutput,
} from './update-match-results-flow-types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pastFixtures from '@/lib/past-fixtures.json';

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
  async (input, { logger }) => {
    const { results } = input;
    logger.info(`Received ${results.length} match results to update.`);

    if (results.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    try {
      // Deep copy the imported JSON to make it mutable.
      const updatedFixtures = JSON.parse(JSON.stringify(pastFixtures));
      let updatedCount = 0;

      results.forEach(newResult => {
        const index = updatedFixtures.findIndex((f: any) => f.id === newResult.id);
        if (index !== -1) {
          // Update the specific match with new scores
          updatedFixtures[index] = {
            ...updatedFixtures[index],
            homeScore: newResult.homeScore,
            awayScore: newResult.awayScore,
          };
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'past-fixtures.json');
        logger.info(`Writing ${updatedCount} updated fixtures to ${filePath}`);
        
        // Write the entire updated array back to the file.
        await fs.writeFile(filePath, JSON.stringify(updatedFixtures, null, 2));
      }

      logger.info(`Successfully updated ${updatedCount} match results in past-fixtures.json.`);
      return { success: true, updatedCount };

    } catch (error: any) {
        logger.error('Failed to update fixtures file:', error);
        throw new Error(`Flow failed during file write operation: ${error.message}`);
    }
  }
);
