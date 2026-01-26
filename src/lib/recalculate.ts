
'use client';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
  type WriteBatch,
} from 'firebase/firestore';
import type { Team, Prediction, User as UserProfile, UserHistory, CurrentStanding, PreviousSeasonStanding, Match } from '@/lib/types';
import { allAwardPeriods } from '@/lib/award-periods';
import prevStandingsData from './previous-season-standings-24-25.json';


export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Starting full data recalculation...");
  
      // --- 1. Fetch all base data ---
      progressCallback('Fetching base data...');
      const [teamsSnap, matchesSnap, usersSnap, predictionsSnap] = await Promise.all([
        getDocs(collection(firestore, 'teams')),
        getDocs(collection(firestore, 'matches')),
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'predictions')),
      ]);
  
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      const teamMap = new Map(teams.map(t => [t.id, t]));
      const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
      
      // Filter for active users who have made a prediction this season
      const activeUserIds = new Set(predictions.map(p => p.userId));
      const users = allUsers.filter(u => activeUserIds.has(u.id));

      const prevStandings: PreviousSeasonStanding[] = prevStandingsData.map(d => ({...d, teamId: d.teamId || ''}));
      const prevStandingsRankMap = new Map(prevStandings.map(s => [s.teamId, s.rank]));

      // --- 2. Calculate definitive Week 0 user scores from DEFINITIVE previous season standings ---
      progressCallback('Calculating definitive Week 0 scores...');
      const userScoresForWeek0: { [userId: string]: number } = {};
      predictions.forEach(prediction => {
          if (!prediction.rankings) {
              userScoresForWeek0[prediction.userId] = 0;
              return;
          }
          let totalScore = 0;
          prediction.rankings.forEach((teamId, index) => {
              const predictedRank = index + 1;
              const actualRank = prevStandingsRankMap.get(teamId);

              if (actualRank !== undefined) {
                  const score = 5 - Math.abs(predictedRank - actualRank);
                  totalScore += score;
              }
          });
          userScoresForWeek0[prediction.userId] = totalScore;
      });
  
      const rankedUsersForWeek0 = users
        .map(user => ({ ...user, score: userScoresForWeek0[user.id] ?? 0 }))
        .sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || ''));
          
      const allUserHistories: { [userId: string]: UserHistory } = {};

      let rankForWeek0 = 0;
      let lastScoreForWeek0 = Infinity;
      rankedUsersForWeek0.forEach((user, index) => {
          if (user.score < lastScoreForWeek0) {
              rankForWeek0 = index + 1;
          }
          lastScoreForWeek0 = user.score;
          allUserHistories[user.id] = { 
              userId: user.id, 
              weeklyScores: [{ week: 0, score: user.score, rank: rankForWeek0 }] 
          };
      });
  
      // --- 3. Clear all derived data collections ---
      progressCallback('Clearing old derived data...');
      const collectionsToClear = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM', 'seasonMonths'];
      
      for (const collectionName of collectionsToClear) {
          progressCallback(`Clearing ${collectionName}...`);
          const snapshot = await getDocs(collection(firestore, collectionName));
          if (snapshot.empty) continue;
          
          let deleteBatch = writeBatch(firestore);
          let deleteCount = 0;
          for (const docSnapshot of snapshot.docs) {
              deleteBatch.delete(docSnapshot.ref);
              deleteCount++;
              if (deleteCount === 499) {
                  await deleteBatch.commit();
                  deleteBatch = writeBatch(firestore);
                  deleteCount = 0;
              }
          }
          if (deleteCount > 0) {
              await deleteBatch.commit();
          }
      }
      
      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let currentBatchIndex = 0;
      let operationCount = 0;
      const addOperation = (op: (b: WriteBatch) => void) => {
          op(mainBatches[currentBatchIndex]);
          operationCount++;
          if (operationCount >= 499) {
              mainBatches.push(writeBatch(firestore));
              currentBatchIndex++;
              operationCount = 0;
          }
      };
      
      // --- 4. Populate Season Months for the Hall of Fame page ---
      progressCallback('Setting up season months...');
      allAwardPeriods.forEach(period => {
          const docRef = doc(firestore, 'seasonMonths', period.id);
          addOperation(b => b.set(docRef, {
              id: period.id,
              month: period.month || '',
              year: period.year,
              special: period.special || '',
              abbreviation: period.abbreviation,
          }));
      });

      // --- 5. Write Week 0 Team Standings from definitive source ---
      progressCallback('Writing definitive Week 0 team standings...');
      prevStandings.forEach(standing => {
        if (!standing.teamId) return;
        const docRef = doc(firestore, 'weeklyTeamStandings', `0-${standing.teamId}`);
        addOperation(b => b.set(docRef, {
            week: 0,
            teamId: standing.teamId,
            rank: standing.rank
        }));
      });
  
      // --- 6. Build history week by week from played matches ---
      const playedMatches = allMatches.filter(m => m.homeScore > -1 && m.awayScore > -1);
      const playedWeeks = [...new Set(playedMatches.map(m => m.week))].sort((a, b) => a - b);
  
      for (const week of playedWeeks) {
          progressCallback(`Processing Week ${week}...`);
  
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

        const weeklyStandingsSorted = Object.entries(weeklyTeamStats)
            .map(([teamId, stats]) => ({ teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown' }))
            .sort((a, b) => 
                b.points - a.points || 
                b.goalDifference - a.goalDifference || 
                b.goalsFor - a.goalsFor || 
                (a.teamName || '').localeCompare(b.teamName || '')
            );
        
        const rankedTeamsForWeek = weeklyStandingsSorted.map((standing, index) => ({
            ...standing,
            rank: index + 1
        }));
        
        const actualTeamRanksForWeek = new Map(rankedTeamsForWeek.map(s => [s.teamId, s.rank]));

        rankedTeamsForWeek.forEach(standing => {
          const docRef = doc(firestore, 'weeklyTeamStandings', `${week}-${standing.teamId}`);
          addOperation(b => b.set(docRef, {
              week: week,
              teamId: standing.teamId,
              rank: standing.rank
          }));
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
                const docRef = doc(firestore, 'playerTeamScores', `${prediction.userId}_${teamId}`);
                addOperation(b => b.set(docRef, { userId: prediction.userId, teamId, score }));
              }
            }
          });
          userScoresForWeek[prediction.userId] = totalScore;
        });
  
        // C. Rank users for the week, handling ties correctly.
        const rankedUsersForWeek = users
            .map(user => ({ ...user, scoreForWeek: userScoresForWeek[user.id] ?? 0 }))
            .sort((a, b) => b.scoreForWeek - a.scoreForWeek || (a.name || '').localeCompare(b.name || ''));
            
        let rankForWeek = 0;
        let lastScoreForWeek = Infinity;
        rankedUsersForWeek.forEach((user, index) => {
            if (user.scoreForWeek < lastScoreForWeek) {
                rankForWeek = index + 1;
            }
            lastScoreForWeek = user.scoreForWeek;
            allUserHistories[user.id].weeklyScores.push({ week: week, score: user.scoreForWeek, rank: rankForWeek });
        });
      }
  
      // --- 7. Process final user states and write histories ---
      progressCallback('Finalizing user profiles...');
      for (const user of users) {
        const userHistory = allUserHistories[user.id];
        if (!userHistory || userHistory.weeklyScores.length === 0) continue;
  
        userHistory.weeklyScores.sort((a,b) => a.week - a.week);
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
        const userDocRef = doc(firestore, 'users', user.id);
        addOperation(b => b.set(userDocRef, finalUserData, { merge: true }));
        
        const historyDocRef = doc(firestore, 'userHistories', user.id);
        addOperation(b => b.set(historyDocRef, userHistory));
      }

      // --- 8. Calculate and store Monthly MimoM awards ---
      progressCallback('Calculating monthly awards...');
      const nonProUsers = allUsers.filter(u => !u.isPro);

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
              const awardDocRef = doc(firestore, 'monthlyMimoM', awardId);
              addOperation(b => b.set(awardDocRef, {
                month: period.month || '',
                year: period.year,
                userId: winner.userId,
                type: 'winner',
                improvement: winner.improvement,
                special: period.special || '',
              }));
            });

            if (winners.length === 1 && !period.special) {
              const remainingPlayers = monthlyImprovements.filter(u => u.improvement < bestImprovement);
              if (remainingPlayers.length > 0) {
                const secondBestImprovement = remainingPlayers[0].improvement;
                const runnersUp = remainingPlayers.filter(u => u.improvement === secondBestImprovement);
                runnersUp.forEach(runnerUp => {
                  const awardId = `${period.id}-ru-${runnerUp.userId}`;
                  const awardDocRef = doc(firestore, 'monthlyMimoM', awardId);
                  addOperation(b => b.set(awardDocRef, {
                    month: period.month || '',
                    year: period.year,
                    userId: runnerUp.userId,
                    type: 'runner-up',
                    improvement: runnerUp.improvement,
                    special: '',
                  }));
                });
              }
            }
          }
        }
      }

      // --- 9. Generate final league standings and recent results ---
      progressCallback('Generating final standings...');
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
      
      newStandings.forEach((s, index) => {
          const finalRank = index + 1;
          const { teamName, ...rest } = s;
          const standingDocRef = doc(firestore, 'standings', s.teamId);
          addOperation(b => b.set(standingDocRef, { ...rest, rank: finalRank }));
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
        const recentResultDocRef = doc(firestore, 'teamRecentResults', team.id);
        addOperation(b => b.set(recentResultDocRef, { teamId: team.id, results: results.reverse() }));
      });

      // --- 10. Commit all changes ---
      progressCallback(`Committing ${mainBatches.length} batch(es) of updates...`);
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback('Full data recalculation completed successfully.');
  
    } catch (error) {
        console.error("Full data recalculation failed:", error);
        if (error instanceof Error) {
            progressCallback(`Error: ${error.message}`);
        } else {
            progressCallback('An unknown error occurred during recalculation.');
        }
        throw error;
    }
}
