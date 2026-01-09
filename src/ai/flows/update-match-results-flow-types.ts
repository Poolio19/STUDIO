/**
 * @fileOverview Types and schemas for the update-match-results-flow.
 */
import { z } from 'zod';

// This schema now represents a single match result object as it is sent from the client.
// The `id` is the intended document ID in Firestore.
const MatchResultSchema = z.object({
    id: z.string(), // e.g., "1-team_12-team_03"
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
