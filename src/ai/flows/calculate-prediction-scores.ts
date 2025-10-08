'use server';

/**
 * @fileOverview An AI agent to calculate prediction scores.
 *
 * - calculatePredictionScores - A function that calculates prediction scores based on the actual results and user predictions.
 * - CalculatePredictionScoresInput - The input type for the calculatePredictionScores function.
 * - CalculatePredictionScoresOutput - The return type for the calculatePredictionScores function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculatePredictionScoresInputSchema = z.object({
  actualResults: z.string().describe('The actual results of the events or games.'),
  userPredictions: z.string().describe('The user predictions for the events or games.'),
});
export type CalculatePredictionScoresInput = z.infer<
  typeof CalculatePredictionScoresInputSchema
>;

const CalculatePredictionScoresOutputSchema = z.object({
  scores: z
    .record(z.number())
    .describe('A record of user IDs to their calculated scores.'),
  summary: z.string().describe('A summary of the scoring process and results.'),
});
export type CalculatePredictionScoresOutput = z.infer<
  typeof CalculatePredictionScoresOutputSchema
>;

export async function calculatePredictionScores(
  input: CalculatePredictionScoresInput
): Promise<CalculatePredictionScoresOutput> {
  return calculatePredictionScoresFlow(input);
}

const calculatePredictionScoresPrompt = ai.definePrompt({
  name: 'calculatePredictionScoresPrompt',
  input: {schema: CalculatePredictionScoresInputSchema},
  output: {schema: CalculatePredictionScoresOutputSchema},
  prompt: `You are an expert in calculating prediction scores based on actual results and user predictions.

  Given the following actual results:
  {{actualResults}}

  And the following user predictions:
  {{userPredictions}}

  Calculate the scores for each user based on the accuracy of their predictions.
  Provide a summary of the scoring process and the overall results. Return the scores as a record of user IDs to their calculated scores and the summary.
  Make sure the outputted scores are only numerical values, do not include any description in the score values.
  Follow the schema description for the scores field precisely to ensure correct data formatting.
  `,
});

const calculatePredictionScoresFlow = ai.defineFlow(
  {
    name: 'calculatePredictionScoresFlow',
    inputSchema: CalculatePredictionScoresInputSchema,
    outputSchema: CalculatePredictionScoresOutputSchema,
  },
  async input => {
    const {output} = await calculatePredictionScoresPrompt(input);
    return output!;
  }
);
