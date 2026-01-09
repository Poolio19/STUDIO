/**
 * @fileOverview Types and schemas for the update-match-results-flow.
 */
import { z } from 'zod';

// The ID is now correctly identified as the document ID, not part of the data.
const MatchResultSchema = z.object({
    id: z.string(),
    week: z.number().int(),
    homeTeamId: z.string(),
    awayTeamId: z.string(),
    homeScore: z.number().int(),
    awayScore: z.number().int(),
    matchDate: z.string(),
});

export const UpdateMatchResultsInputSchema = z.object({
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
