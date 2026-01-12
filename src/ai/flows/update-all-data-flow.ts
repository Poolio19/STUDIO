
'use server';
/**
 * @fileOverview A master flow to update all application data based on match results.
 */

import { ai } from '@/ai/genkit';
import { getFlow } from 'genkit';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/ai/admin';
import { calculatePredictionScores } from './calculate-prediction-scores';
import type { Team, Match, User, Prediction, PlayerTeamScore, WeeklyTeamStanding, UserHistory, CurrentStanding } from '@/lib/types';

const UpdateAllDataOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type UpdateAllDataOutput = z.infer<typeof UpdateAllDataOutputSchema>;

export async function updateAllData(): Promise<UpdateAllDataOutput> {
    return updateAllDataFlow();
}

const updateAllDataFlow = ai.defineFlow(
  {
    name: 'updateAllDataFlow',
    outputSchema: UpdateAllDataOutputSchema,
  },
  async () => {
    const { logger } = getFlow().state();
    const db = await getFirestoreAdmin();
    const batch = db.batch();

    try {
        logger.info('Master Data Update: Started.');

        // 1. Fetch all necessary data
        logger.info('Master Data Update: Fetching all required data from Firestore...');
        const teamsSnap = await db.collection('teams').get();
        const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        const teamMap = new Map(teams.map(t => [t.id, t]));

        const matchesSnap = await db.collection('matches').get();
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const playedMatches = allMatches.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        
        const usersSnap = await db.collection('users').get();
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

        const predictionsSnap = await db.collection('predictions').get();
        const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));

        logger.info(`Master Data Update: Fetched ${teams.length} teams, ${playedMatches.length} played matches, ${users.length} users, and ${predictions.length} predictions.`);

        // 2. Calculate new standings from scratch
        logger.info('Master Data Update: Calculating new league standings from scratch...');
        const teamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
        teams.forEach(team => {
            teamStats[team.id] = {
                points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0
            };
        });

        playedMatches.forEach(match => {
            const homeStats = teamStats[match.homeTeamId];
            const awayStats = teamStats[match.awayTeamId];

            homeStats.gamesPlayed++;
            awayStats.gamesPlayed++;
            homeStats.goalsFor += match.homeScore;
            awayStats.goalsFor += match.awayScore;
            homeStats.goalsAgainst += match.awayScore;
            awayStats.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
                homeStats.points += 3;
                homeStats.wins++;
                awayStats.losses++;
            } else if (match.homeScore < match.awayScore) {
                awayStats.points += 3;
                awayStats.wins++;
                homeStats.losses++;
            } else {
                homeStats.points++;
                awayStats.points++;
                homeStats.draws++;
                awayStats.draws++;
            }
        });

        Object.keys(teamStats).forEach(teamId => {
            teamStats[teamId].goalDifference = teamStats[teamId].goalsFor - teamStats[teamId].goalsAgainst;
        });

        const newStandings: (Omit<CurrentStanding, 'rank'> & { teamName: string; teamId: string })[] = Object.entries(teamStats).map(([teamId, stats]) => ({
            teamId,
            ...stats,
            teamName: teamMap.get(teamId)?.name || 'Unknown',
        }));
        
        newStandings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return a.teamName.localeCompare(b.teamName);
        });

        const finalStandings: CurrentStanding[] = newStandings.map((s, index) => {
            const { teamName, ...rest } = s;
            return { ...rest, rank: index + 1 };
        });
        logger.info('Master Data Update: League standings calculation complete.');

        // 3. Update standings collection
        finalStandings.forEach(standing => {
            const standingRef = db.collection('standings').doc(standing.teamId);
            batch.set(standingRef, standing);
        });
        logger.info(`Master Data Update: Batched ${finalStandings.length} standings updates.`);
        
        // 4. Calculate new user scores
        logger.info('Master Data Update: Recalculating user scores with AI flow...');
        const actualFinalStandingsString = finalStandings.map(s => s.teamId).join(',');
        const userRankingsString = predictions.map(p => `${p.userId},${p.rankings.join(',')}`).join('\n');
        
        const { scores: userScores, summary } = await calculatePredictionScores({
            actualFinalStandings: actualFinalStandingsString,
            userRankings: userRankingsString
        });
        logger.info(`Master Data Update: AI scoring complete. Summary: ${summary}`);

        // 5. Update user-related collections
        logger.info('Master Data Update: Calculating and batching user profile and history updates...');
        const userUpdates = users.map(user => {
            const newScore = userScores[user.id] || 0;
            return {
                ...user,
                previousScore: user.score,
                previousRank: user.rank,
                score: newScore,
                scoreChange: newScore - (user.score || 0)
            };
        });

        userUpdates.sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
        
        const maxWeeksPlayed = playedMatches.length > 0 ? Math.max(0, ...playedMatches.map(m => m.week)) : 0;

        for (let i = 0; i < userUpdates.length; i++) {
            const user = userUpdates[i];
            const newRank = i + 1;
            user.rankChange = (user.previousRank || 0) > 0 ? (user.previousRank || newRank) - newRank : 0;
            user.rank = newRank;

            user.maxRank = Math.max(user.maxRank || 0, user.rank);
            user.minRank = Math.min(user.minRank || 99, user.rank);
            user.maxScore = Math.max(user.maxScore || -Infinity, user.score);
            user.minScore = Math.min(user.minScore || Infinity, user.score);
            
            const userRef = db.collection('users').doc(user.id);
            const { id, ...userData } = user;
            batch.set(userRef, userData, { merge: true });
            
            // Update UserHistory
            const userHistoryRef = db.collection('userHistories').doc(user.id);
            const historySnap = await userHistoryRef.get();
            const historyData = (historySnap.exists ? historySnap.data() : { weeklyScores: [] }) as UserHistory;
            
            const weekHistoryIndex = historyData.weeklyScores.findIndex(ws => ws.week === maxWeeksPlayed);
            if (weekHistoryIndex > -1) {
                historyData.weeklyScores[weekHistoryIndex] = { week: maxWeeksPlayed, score: user.score, rank: user.rank };
            } else {
                historyData.weeklyScores.push({ week: maxWeeksPlayed, score: user.score, rank: user.rank });
            }
            batch.set(userHistoryRef, { weeklyScores: historyData.weeklyScores });
        }
        logger.info(`Master Data Update: Batched ${userUpdates.length} user profile and history updates.`);

        // 6. Update WeeklyTeamStandings
        if (maxWeeksPlayed > 0) {
            logger.info(`Master Data Update: Batching weekly team standings for week ${maxWeeksPlayed}.`);
            finalStandings.forEach(standing => {
                const weeklyStandingId = `${maxWeeksPlayed}-${standing.teamId}`;
                const weeklyStandingRef = db.collection('weeklyTeamStandings').doc(weeklyStandingId);
                batch.set(weeklyStandingRef, {
                    week: maxWeeksPlayed,
                    teamId: standing.teamId,
                    rank: standing.rank,
                });
            });
            logger.info(`Master Data Update: Batched ${finalStandings.length} weekly team standings.`);
        }
        
        // 7. Update TeamRecentResults
        logger.info('Master Data Update: Batching team recent results updates...');
        teams.forEach(team => {
            const teamMatches = playedMatches
                .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
                .sort((a,b) => b.week - a.week)
                .slice(0, 6);

            const results = Array(6).fill('-') as ('W' | 'D' | 'L' | '-')[];
            teamMatches.reverse().forEach((match, i) => { // reverse to fill from the left
                if (i < 6) {
                    if (match.homeScore === match.awayScore) {
                        results[i] = 'D';
                    } else if ((match.homeTeamId === team.id && match.homeScore > match.awayScore) || (match.awayTeamId === team.id && match.awayScore > match.homeScore)) {
                        results[i] = 'W';
                    } else {
                        results[i] = 'L';
                    }
                }
            });
            
            const recentResultRef = db.collection('teamRecentResults').doc(team.id);
            batch.set(recentResultRef, { teamId: team.id, results: results.reverse() });
        });
        logger.info(`Master Data Update: Batched ${teams.length} team recent results updates.`);

        // Commit all batched writes
        logger.info('Master Data Update: Committing all batched writes to Firestore...');
        await batch.commit();
        logger.info('Master Data Update: SUCCESS! All data committed to Firestore.');
        
        return { success: true, message: 'All data updated successfully.' };
    } catch (error: any) {
        logger.error('Master Data Update: FAILED!', error);
        return { success: false, message: `Flow failed: ${error.message}` };
    }
  }
);

    