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
  actualFinalStandings: z.string().describe('The actual final standings of the teams at the end of the season, as a comma-separated list of team IDs.'),
  userRankings: z.string().describe('The user-predicted rankings for the teams, provided as a string with each user\'s predictions on a new line.'),
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
  prompt: `You are an expert in calculating scores for a football prediction game.
  The game involves predicting the final league standings of all teams in a season.

  Scoring works as follows:
  - 5 points for each team placed in the correct final position.
  - 2 points for each team placed one position away from their final position.
  - 0 points otherwise.

  Given the following actual final standings:
  {{actualFinalStandings}}

  And the following user-predicted rankings:
  {{userRankings}}

  Calculate the total scores for each user based on their predicted rankings against the actual final standings.
  Provide a summary of the scoring process. Return the scores as a record of user IDs to their calculated scores and the summary.
  Make sure the outputted scores are only numerical values.
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
