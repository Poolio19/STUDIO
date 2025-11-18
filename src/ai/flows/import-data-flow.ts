'use server';
/**
 * @fileOverview A flow to simulate fetching live data for the application.
 *
 * - importData - A function that returns a structured object of all necessary game data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  users,
  teams,
  predictions,
  previousSeasonStandings,
  currentStandings,
  monthlyMimoM,
  seasonMonths,
  playerTeamScores,
  userHistories,
  weeklyTeamStandings,
  teamRecentResults
} from '@/lib/data';

// Note: We don't define a Zod schema for the output because the data types
// are already defined in `src/lib/data.ts` and are quite complex.
// The output of this flow is trusted and used directly by the client.

export async function importData(): Promise<any> {
  return importDataFlow();
}

const importDataFlow = ai.defineFlow(
  {
    name: 'importDataFlow',
  },
  async () => {
    // In a real-world scenario, this is where you would make API calls
    // to a live sports data provider.
    // For now, we are just reading from our static data files.

    return {
      users,
      teams,
      predictions,
      previousSeasonStandings,
      currentStandings,
      monthlyMimoM,
      seasonMonths,
      playerTeamScores,
      userHistories,
      weeklyTeamStandings,
      teamRecentResults
    };
  }
);
