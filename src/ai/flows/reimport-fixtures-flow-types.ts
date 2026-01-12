
/**
 * @fileOverview Types and schemas for the reimport-fixtures-flow.
 */
import { z } from 'zod';

export const ReimportFixturesInputSchema = z.object({
  week: z.number().int(),
  fixtures: z.array(z.object({
    id: z.string(),
    week: z.number().int(),
    homeTeamId: z.string(),
    awayTeamId: z.string(),
    homeScore: z.number().int(),
    awayScore: z.number().int(),
    matchDate: z.string(),
  })),
});
export type ReimportFixturesInput = z.infer<typeof ReimportFixturesInputSchema>;

export const ReimportFixturesOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number().int(),
  importedCount: z.number().int(),
});
export type ReimportFixturesOutput = z.infer<typeof ReimportFixturesOutputSchema>;
