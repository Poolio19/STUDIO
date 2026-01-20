
'use server';
/**
 * @fileOverview A flow to import the definitive previous season standings from a JSON backup file.
 * This will clear the existing previousSeasonStandings collection and repopulate it based on the
 * 24-25 final table, assigning ranks 18, 19, 20 to the three promoted teams for the 25-26 season.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import previousSeasonData from '@/lib/previous-season-standings-24-25.json';

const ImportPreviousStandingsOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number().int(),
  importedCount: z.number().int(),
  message: z.string().optional(),
});
export type ImportPreviousStandingsOutput = z.infer<typeof ImportPreviousStandingsOutputSchema>;

export async function importPreviousStandings(): Promise<ImportPreviousStandingsOutput> {
  return importPreviousStandingsFlow();
}

function getDb() {
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }
    return admin.firestore();
}

// A mapping to handle name inconsistencies between user's list and database
const nameMapping: { [key: string]: string } = {
  "Man City": "Manchester City",
  "Notts Forest": "Nottingham Forest",
  "Man United": "Manchester United"
};

const importPreviousStandingsFlow = ai.defineFlow(
  {
    name: 'importPreviousStandingsFlow',
    inputSchema: z.void(),
    outputSchema: ImportPreviousStandingsOutputSchema,
  },
  async (input, context) => {
    const db = getDb();
    const standingsCollection = db.collection('previousSeasonStandings');
    const teamsCollection = db.collection('teams');

    context.logger.info('Starting import of previous season standings.');

    try {
      const batch = db.batch();

      // 1. Fetch all teams for the current (25-26) season to map names to IDs
      const teamsSnap = await teamsCollection.get();
      const allCurrentTeams = teamsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
      const teamNameToIdMap = new Map(allCurrentTeams.map(t => [t.name, t.id]));
      
      const standingsTeamNames = new Set(previousSeasonData.map(s => nameMapping[s.name] || s.name));

      // 2. Identify promoted teams (those in /teams but not in the 24-25 standings file)
      const promotedTeams = allCurrentTeams
        .filter(t => !standingsTeamNames.has(t.name))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically for consistent ranking

      if (promotedTeams.length !== 3) {
        context.logger.warn(`Expected 3 promoted teams, but found ${promotedTeams.length}. Please check team names.`);
      }

      // 3. Delete all existing previous season standings
      const snapshot = await standingsCollection.get();
      const deletedCount = snapshot.size;
      if (deletedCount > 0) {
        context.logger.info(`Found ${deletedCount} existing standings. Deleting...`);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }
      
      let importedCount = 0;

      // 4. Import the 17 teams from the JSON file
      previousSeasonData.forEach(standing => {
        const teamName = nameMapping[standing.name] || standing.name;
        const teamId = teamNameToIdMap.get(teamName);
        if (teamId) {
          const docRef = standingsCollection.doc(teamId);
          batch.set(docRef, {
            teamId: teamId,
            rank: standing.rank,
            points: standing.points,
            goalDifference: standing.goalDifference
          });
          importedCount++;
        } else {
          context.logger.warn(`Could not find team ID for "${teamName}"`);
        }
      });
      
      // 5. Add the 3 promoted teams with ranks 18, 19, 20
      promotedTeams.forEach((team, index) => {
        const docRef = standingsCollection.doc(team.id);
        batch.set(docRef, {
            teamId: team.id,
            rank: 18 + index, // Assign ranks 18, 19, 20
            points: 0,
            goalDifference: 0
          });
          importedCount++;
      });

      // 6. Commit the batch
      await batch.commit();
      context.logger.info(`Successfully committed import. Deleted: ${deletedCount}, Imported: ${importedCount}.`);

      return {
        success: true,
        deletedCount,
        importedCount,
        message: `Successfully imported ${importedCount} previous season standings.`,
      };
    } catch (error: any) {
        context.logger.error('Previous Standings Import: FAILED!', error);
        throw new Error(`Flow failed during import: ${error.message}`);
    }
  }
);
