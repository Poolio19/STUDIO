
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
  userRankings: z.string().describe('The user-predicted rankings for the teams, provided as a string with each user\'s predictions on a new line. Each line should be in the format: "userId,teamId1,teamId2,..."'),
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
  The game involves predicting the final league standings of all 20 teams in a season.

  Scoring works as follows for each of the 20 teams:
  - A player receives 5 points for correctly predicting a team's exact final position.
  - For each position the prediction is away from the actual final position, 1 point is subtracted from the 5 points.
  - This means the formula for a single team is: points = 5 - abs(predicted_position - actual_position).
  - For example, if a team's actual final position is 1st, and the user predicted 1st, they get 5 points. If they predicted 2nd, they get 4 points (5 - 1). If they predicted 6th, they get 0 points (5 - 5). If they predicted 10th, they get -4 points (5 - 9).

  The total score for a user is the sum of the points for all 20 teams.

  Given the following actual final standings:
  {{actualFinalStandings}}

  And the following user-predicted rankings:
  {{userRankings}}

  Calculate the total scores for each user based on their predicted rankings against the actual final standings.
  Provide a summary of the scoring process. Return the scores as a record of user IDs to their calculated scores and the summary.
  Make sure the outputted scores are only numerical values.
  Follow the schema description for the scores field precisely to ensure correct data formatting. The keys for the scores record MUST be the user IDs provided in the userRankings input.
  `,
});

const calculatePredictionScoresFlow = ai.defineFlow(
  {
    name: 'calculatePredictionScoresFlow',
    inputSchema: CalculatePredictionScoresInputSchema,
    outputSchema: CalculatePredictionScoresOutputSchema,
  },
  async (input, { logger }) => {
    logger.info('Starting score calculation with AI prompt.');
    const {output} = await calculatePredictionScoresPrompt(input);
    logger.info('Score calculation complete.');
    return output!;
  }
);

    