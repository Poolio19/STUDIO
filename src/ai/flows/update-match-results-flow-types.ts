
/**
 * @fileOverview Types and schemas for the update-match-results-flow.
 */
import { z } from 'zod';

const MatchResultSchema = z.object({
    matchId: z.string(),
    homeScore: z.number().int(),
    awayScore: z.number().int(),
});

export const UpdateMatchResultsInputSchema = z.object({
  week: z.number().int(),
  results: z.array(MatchResultSchema),
});
export type UpdateMatchResultsInput = z.infer<
  typeof UpdateMatchResultsInputSchema
>;

export const UpdateMatchResultsOutputSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number().int(),
});
export type UpdateMatchResultsOutput = z.infer<
  typeof UpdateMatchResultsOutputSchema
>;
