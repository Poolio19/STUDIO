
'use server';
/**
 * @fileOverview A flow to create a JSON file with a week's match results.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { WeekResults } from '@/lib/types';


const CreateResultsFileInputSchema = z.object({
  week: z.number(),
  results: z.array(z.object({
    id: z.string(),
    homeScore: z.number(),
    awayScore: z.number(),
  })),
});
export type CreateResultsFileInput = z.infer<typeof CreateResultsFileInputSchema>;

const CreateResultsFileOutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string().optional(),
  message: z.string().optional(),
});
export type CreateResultsFileOutput = z.infer<typeof CreateResultsFileOutputSchema>;


export async function createResultsFile(input: CreateResultsFileInput): Promise<CreateResultsFileOutput> {
  return createResultsFileFlow(input);
}


const createResultsFileFlow = ai.defineFlow(
  {
    name: 'createResultsFileFlow',
    inputSchema: CreateResultsFileInputSchema,
    outputSchema: CreateResultsFileOutputSchema,
  },
  async (input) => {
    const { week, results } = input;
    const fileName = `wk-${week}-results.json`;
    // IMPORTANT: In a sandboxed cloud environment, we can only write to os.tmpdir()
    const filePath = path.join(os.tmpdir(), fileName);
    
    const fileContent: WeekResults = { week, results };

    try {
      await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2));
      
      return {
        success: true,
        filePath: filePath,
        message: `Successfully created ${fileName}`,
      };

    } catch (error: any) {
      console.error(`Failed to create file for Week ${week}:`, error);
      // It's important to throw an error that the client can handle.
      throw new Error(`Flow failed during file creation: ${error.message}`);
    }
  }
);
