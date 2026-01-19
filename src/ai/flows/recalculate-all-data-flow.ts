
'use server';
/**
 * @fileOverview A master flow to recalculate all derived data in the application.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import type { Team, Prediction, User as UserProfile, UserHistory, CurrentStanding, WeekResults, PreviousSeasonStanding, Match } from '@/lib/types';
import { allAwardPeriods } from '@/lib/award-periods';


const RecalculateOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type RecalculateOutput = z.infer<typeof RecalculateOutputSchema>;

/**
 * Gets a Firestore admin instance, initializing the app if needed.
 */
function getDb() {
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }
    return admin.firestore();
}

/**
 * Exported wrapper function to be called from the client.
 */
export async function recalculateAllData(): Promise<RecalculateOutput> {
  return recalculateAllDataFlow();
}


const recalculateAllDataFlow = ai.defineFlow(
  {
    name: 'recalculateAllDataFlow',
    inputSchema: z.void(),
    outputSchema: RecalculateOutputSchema,
  },
  async (input, context) => {
    const db = getDb();
    context.logger.info("Starting full data recalculation...");

    try {
        context.logger.info('Recalculation: Fetching base data...');
    
        // --- 1. Fetch all base data ---
        const [teamsSnap, matchesSnap, usersSnap, predictionsSnap, prevStandingsSnap] = await Promise.all([
          db.collection('teams').get(),
          db.collection('matches').get(),
          db.collection('users').get(),
          db.collection('predictions').get(),
          db.collection('previousSeasonStandings').get()
        ]);
    
        const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        const teamMap = new Map(teams.map(t => [t.id, t]));
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
        
  
        // --- 2. Calculate Week 0 scores based on a definitive final table from last season ---
        context.logger.info('Recalculation: Calculating Week 0 starting scores...');
        
        const teamNameToIdMap = new Map(teams.map(t => [t.name, t.id]));
        
        const week0RankOrder = [
          "Liverpool", "Arsenal", "Manchester City", "Chelsea", "Newcastle United", "Aston Villa", "Nottingham Forest", "Brighton & Hove Albion",
          "AFC Bournemouth", "Brentford", "Fulham", "Crystal Palace", "Everton", "West Ham United",
          "Manchester United", "Wolverhampton Wanderers", "Tottenham Hotspur", "Leeds United", "Burnley", "Sunderland"
        ];
        
        const week0RankMap = new Map<string, number>();
        week0RankOrder.forEach((teamName, index) => {
            const teamId = teamNameToIdMap.get(teamName);
            if (teamId) {
                week0RankMap.set(teamId, index + 1);
            } else {
                context.logger.warn(`Week 0 Rank Calc: Could not find team ID for "${teamName}".`);
            }
        });
  
  
        const userScoresForWeek0: { [userId: string]: number } = {};
        predictions.forEach(prediction => {
          if (!prediction.rankings) return;
          let totalScore = 0;
          prediction.rankings.forEach((teamId, index) => {
            const predictedRank = index + 1;
            const actualRank = week0RankMap.get(teamId);
            if (actualRank !== undefined) {
              totalScore += 5 - Math.abs(predictedRank - actualRank);
            }
          });
          userScoresForWeek0[prediction.userId] = totalScore;
        });
  
        const rankedUsersForWeek0 = users
          .map(user => ({ ...user, score: userScoresForWeek0[user.id] ?? 0 }))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
          
        const allUserHistories: { [userId: string]: UserHistory } = {};
        let currentRank_w0 = 0;
        let lastScore_w0 = Infinity;
        rankedUsersForWeek0.forEach((user, index) => {
          if (user.score < lastScore_w0) {
            currentRank_w0 = index + 1;
          } else if (index === 0) {
              currentRank_w0 = 1;
          }
          lastScore_w0 = user.score;
          allUserHistories[user.id] = { 
              userId: user.id, 
              weeklyScores: [{ week: 0, score: user.score, rank: currentRank_w0 }] 
          };
        });
  
        // --- 3. Clear all derived data collections ---
        context.logger.info('Recalculation: Clearing old derived data...');
        const collectionsToClear = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM', 'seasonMonths'];
        
        for (const collectionName of collectionsToClear) {
          const snapshot = await db.collection(collectionName).get();
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
        
        const mainBatch = db.batch();
        
        // --- 4. Populate Season Months for the Hall of Fame page ---
        context.logger.info('Recalculation: Setting up season months...');
        
        allAwardPeriods.forEach(period => {
            const docRef = db.collection('seasonMonths').doc(period.id);
            mainBatch.set(docRef, {
                id: period.id,
                month: period.month || '',
                year: period.year,
                special: period.special || '',
                abbreviation: period.abbreviation,
            });
        });
    
        // --- 5. Build history week by week from played matches ---
        const playedMatches = allMatches.filter(m => m.homeScore > -1 && m.awayScore > -1);
        const playedWeeks = [...new Set(playedMatches.map(m => m.week))].sort((a, b) => a - b);
    
        for (const week of playedWeeks) {
            context.logger.info(`Recalculation: Processing Week ${week}...`);
    
          // A. Calculate team standings up to the current week
          const matchesUpToWeek = allMatches.filter(m => m.week <= week && m.homeScore > -1 && m.awayScore > -1);
          const weeklyTeamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank' > } = {};
          teams.forEach(team => {
              weeklyTeamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
          });
          matchesUpToWeek.forEach(match => {
              const homeStats = weeklyTeamStats[match.homeTeamId];
              const awayStats = weeklyTeamStats[match.awayTeamId];
              if (!homeStats || !awayStats) return;
              
              homeStats.gamesPlayed++;
              awayStats.gamesPlayed++;
              homeStats.goalsFor += match.homeScore;
              awayStats.goalsFor += match.awayScore;
              homeStats.goalsAgainst += match.awayScore;
              awayStats.goalsAgainst += match.homeScore;
              
              if (match.homeScore > match.awayScore) { homeStats.points += 3; homeStats.wins++; awayStats.losses++; }
              else if (match.homeScore < match.awayScore) { awayStats.points += 3; awayStats.wins++; homeStats.losses++; }
              else { homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++; }
          });
          Object.keys(weeklyTeamStats).forEach(teamId => {
              weeklyTeamStats[teamId].goalDifference = weeklyTeamStats[teamId].goalsFor - weeklyTeamStats[teamId].goalsAgainst;
          });
          const weeklyStandingsRanked = Object.entries(weeklyTeamStats)
              .map(([teamId, stats]) => ({ teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown' }))
              .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
          
          const rankedTeamsForWeek: (typeof weeklyStandingsRanked[0] & { rank: number })[] = [];
          let currentTeamRank = 0;
          let lastTeamPoints = Infinity;
          let lastTeamGD = Infinity;
          let lastTeamGF = Infinity;
  
          weeklyStandingsRanked.forEach((standing, index) => {
              if (standing.points < lastTeamPoints || 
                  (standing.points === lastTeamPoints && standing.goalDifference < lastTeamGD) ||
                  (standing.points === lastTeamPoints && standing.goalDifference === lastTeamGD && standing.goalsFor < lastTeamGF)) {
                  currentTeamRank = index + 1;
              } else if (index === 0) {
                  currentTeamRank = 1;
              }
              rankedTeamsForWeek.push({ ...standing, rank: currentTeamRank });
              lastTeamPoints = standing.points;
              lastTeamGD = standing.goalDifference;
              lastTeamGF = standing.goalsFor;
          });
          
          const actualTeamRanksForWeek = new Map(rankedTeamsForWeek.map(s => [s.teamId, s.rank]));
  
          rankedTeamsForWeek.forEach(standing => {
            const docRef = db.collection('weeklyTeamStandings').doc(`${week}-${standing.teamId}`);
            mainBatch.set(docRef, {
                week: week,
                teamId: standing.teamId,
                rank: standing.rank
            });
          });
  
          // B. Calculate user scores for the week
          const userScoresForWeek: { [userId: string]: number } = {};
          predictions.forEach(prediction => {
            if (!prediction.rankings) return;
            let totalScore = 0;
            prediction.rankings.forEach((teamId, index) => {
              const predictedRank = index + 1;
              const actualRank = actualTeamRanksForWeek.get(teamId);
              if (actualRank !== undefined && actualRank > 0) {
                const score = 5 - Math.abs(predictedRank - actualRank);
                totalScore += score;
                if (week === playedWeeks[playedWeeks.length -1]) { // Only write final player scores
                  const docRef = db.collection('playerTeamScores').doc(`${prediction.userId}_${teamId}`);
                  mainBatch.set(docRef, { userId: prediction.userId, teamId, score });
                }
              }
            });
            userScoresForWeek[prediction.userId] = totalScore;
          });
    
          // C. Rank users for the week, handling ties correctly.
          const rankedUsersForWeek = users
              .map(user => ({ ...user, scoreForWeek: userScoresForWeek[user.id] ?? 0 }))
              .sort((a, b) => b.scoreForWeek - a.scoreForWeek || a.name.localeCompare(b.name));
              
          let currentRank = 0;
          let lastScore = Infinity;
          rankedUsersForWeek.forEach((user, index) => {
              if (user.scoreForWeek < lastScore) {
                  currentRank = index + 1;
              } else if (index === 0) {
                  currentRank = 1;
              }
              lastScore = user.scoreForWeek;
              allUserHistories[user.id].weeklyScores.push({ week: week, score: user.scoreForWeek, rank: currentRank });
          });
        }
    
        // --- 6. Process final user states and write histories ---
        context.logger.info('Recalculation: Finalizing user profiles...');
        for (const user of users) {
          const userHistory = allUserHistories[user.id];
          if (!userHistory || userHistory.weeklyScores.length === 0) continue;
    
          userHistory.weeklyScores.sort((a,b) => a.week - b.week);
          const latestWeekIndex = userHistory.weeklyScores.length - 1;
          const latestWeekData = userHistory.weeklyScores[latestWeekIndex];
          const previousWeekData = userHistory.weeklyScores[latestWeekIndex - 1];
  
          const allRanks = userHistory.weeklyScores.map(ws => ws.rank).filter(r => r > 0);
          const allScores = userHistory.weeklyScores.map(ws => ws.score);
          
          const finalUserData: Partial<UserProfile> = {
              score: latestWeekData.score,
              rank: latestWeekData.rank,
              previousScore: previousWeekData?.score ?? 0,
              previousRank: previousWeekData?.rank ?? 0,
              scoreChange: latestWeekData.score - (previousWeekData?.score ?? 0),
              rankChange: (previousWeekData?.rank ?? 0) > 0 ? (previousWeekData!.rank - latestWeekData.rank) : 0,
              maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
              minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
              minRank: allRanks.length > 0 ? Math.min(...allRanks) : 0, // Best rank
              maxRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,  // Worst rank
          };
          mainBatch.set(db.collection('users').doc(user.id), finalUserData, { merge: true });
          mainBatch.set(db.collection('userHistories').doc(user.id), userHistory);
        }
  
        // --- 7. Calculate and store Monthly MimoM awards ---
        context.logger.info('Recalculation: Calculating monthly awards...');
        const nonProUsers = users.filter(u => !u.isPro);
  
        for (const period of allAwardPeriods) {
          if (playedWeeks.includes(period.endWeek)) {
            const monthlyImprovements: { userId: string; improvement: number; endScore: number }[] = [];
            
            nonProUsers.forEach(user => {
              const userHistory = allUserHistories[user.id];
              if (userHistory) {
                const startWeekData = userHistory.weeklyScores.find(ws => ws.week === period.startWeek);
                const endWeekData = userHistory.weeklyScores.find(ws => ws.week === period.endWeek);
                
                if (startWeekData && endWeekData) {
                  const improvement = endWeekData.score - startWeekData.score;
                  monthlyImprovements.push({ userId: user.id, improvement, endScore: endWeekData.score });
                }
              }
            });
  
            if (monthlyImprovements.length > 0) {
              monthlyImprovements.sort((a, b) => b.improvement - a.improvement || b.endScore - a.endScore);
              
              const bestImprovement = monthlyImprovements[0].improvement;
              const winners = monthlyImprovements.filter(u => u.improvement === bestImprovement);
  
              winners.forEach(winner => {
                const awardId = `${period.id}-${winner.userId}`;
                mainBatch.set(db.collection('monthlyMimoM').doc(awardId), {
                  month: period.month || '',
                  year: period.year,
                  userId: winner.userId,
                  type: 'winner',
                  improvement: winner.improvement,
                  special: period.special || '',
                });
              });
  
              if (winners.length === 1 && !period.special) {
                const remainingPlayers = monthlyImprovements.filter(u => u.improvement < bestImprovement);
                if (remainingPlayers.length > 0) {
                  const secondBestImprovement = remainingPlayers[0].improvement;
                  const runnersUp = remainingPlayers.filter(u => u.improvement === secondBestImprovement);
                  runnersUp.forEach(runnerUp => {
                    const awardId = `${period.id}-ru-${runnerUp.userId}`;
                    mainBatch.set(db.collection('monthlyMimoM').doc(awardId), {
                      month: period.month || '',
                      year: period.year,
                      userId: runnerUp.userId,
                      type: 'runner-up',
                      improvement: runnerUp.improvement,
                      special: '',
                    });
                  });
                }
              }
            }
          }
        }
  
        // --- 8. Generate final league standings and recent results ---
        context.logger.info('Recalculation: Generating final standings...');
        const finalMatches = allMatches.filter(m => m.week <= (playedWeeks[playedWeeks.length -1] || 0) && m.homeScore > -1 && m.awayScore > -1);
        const finalTeamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
        teams.forEach(team => {
            finalTeamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        });
        finalMatches.forEach(match => {
            const homeStats = finalTeamStats[match.homeTeamId];
            const awayStats = finalTeamStats[match.awayTeamId];
            if (!homeStats || !awayStats) return;
            
            homeStats.gamesPlayed++; awayStats.gamesPlayed++;
            homeStats.goalsFor += match.homeScore; awayStats.goalsFor += match.awayScore;
            homeStats.goalsAgainst += match.awayScore; awayStats.goalsAgainst += match.homeScore;
  
            if (match.homeScore > match.awayScore) { homeStats.points += 3; homeStats.wins++; awayStats.losses++; }
            else if (match.homeScore < match.awayScore) { awayStats.points += 3; awayStats.wins++; homeStats.losses++; }
            else { homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++; }
        });
        Object.keys(finalTeamStats).forEach(teamId => {
            finalTeamStats[teamId].goalDifference = finalTeamStats[teamId].goalsFor - finalTeamStats[teamId].goalsAgainst;
        });
        const newStandings = Object.entries(finalTeamStats)
          .map(([teamId, stats]) => ({ teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown' }))
          .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
        
        let finalRank = 0;
        let lastPoints = Infinity;
        let lastGD = Infinity;
        let lastGF = Infinity;
        newStandings.forEach((s, index) => {
            if (s.points < lastPoints || (s.points === lastPoints && s.goalDifference < lastGD) || (s.points === lastPoints && s.goalDifference === lastGD && s.goalsFor < lastGF)) {
                finalRank = index + 1;
            } else if (index === 0) {
                finalRank = 1;
            }
            lastPoints = s.points;
            lastGD = s.goalDifference;
            lastGF = s.goalsFor;
  
            const { teamName, ...rest } = s;
            mainBatch.set(db.collection('standings').doc(s.teamId), { ...rest, rank: finalRank });
        });
  
        teams.forEach(team => {
          const teamMatches = playedMatches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id).sort((a,b) => b.week - a.week);
          const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
          teamMatches.slice(0, 6).forEach((match, i) => {
              if (i < 6) {
                  if (match.homeScore === match.awayScore) results[i] = 'D';
                  else if ((match.homeTeamId === team.id && match.homeScore > match.awayScore) || (match.awayTeamId === team.id && match.awayScore > match.homeScore)) results[i] = 'W';
                  else results[i] = 'L';
              }
          });
          mainBatch.set(db.collection('teamRecentResults').doc(team.id), { teamId: team.id, results: results.reverse() });
        });
  
        // --- 9. Commit all changes ---
        context.logger.info('Recalculation: Committing all updates...');
        await mainBatch.commit();
        context.logger.info('Full data recalculation completed successfully.');

        return {
            success: true,
            message: 'Full data recalculation completed successfully.'
        };
    
      } catch (error: any) {
          context.logger.error('Error during data recalculation:', error);
          throw new Error(`Flow failed during recalculation: ${error.message}`);
      }
  }
);
