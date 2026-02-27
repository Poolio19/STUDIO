'use client';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
  type WriteBatch,
} from 'firebase/firestore';
import type { Team, Prediction, User as UserProfile, UserHistory, Match, MonthlyMimoM } from '@/lib/types';
import prevStandingsData from './previous-season-standings-24-25.json';
import historicalPlayersData from './historical-players.json';
import historicalMimoAwardsData from './historical-mimo-awards.json';
import { allAwardPeriods } from './award-periods';

/**
 * Recalculates all derived data and seeds historical records.
 */
export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Starting global data synchronization...");
  
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
      
      const historicalUserIds = new Set(historicalPlayersData.map(p => p.id.trim()));
      
      // STRICT Ranking Pool: Only people who have a complete 20-team prediction
      const activeUserIds = new Set(
        predictions
          .filter(p => p.rankings && p.rankings.length === 20)
          .map(p => p.userId || (p as any).id)
      );
      
      const leaderboardCriteria = (u: UserProfile) => 
        (historicalUserIds.has(u.id) || u.isPro) && activeUserIds.has(u.id);

      const usersToProcess = allUsers.filter(u => historicalUserIds.has(u.id) || u.isPro || activeUserIds.has(u.id));
      const prevStandingsRankMap = new Map(prevStandingsData.map(s => [s.teamId, s.rank]));

      progressCallback('Clearing derived database tables...');
      const derivedCollections = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM'];
      for (const colName of derivedCollections) {
          const snap = await getDocs(collection(firestore, colName));
          let batch = writeBatch(firestore); let count = 0;
          for (const d of snap.docs) {
              batch.delete(d.ref); count++;
              if (count === 499) { await batch.commit(); batch = writeBatch(firestore); count = 0; }
          }
          if (count > 0) await batch.commit();
      }
      
      const allHistories: { [uId: string]: UserHistory } = {};
      usersToProcess.forEach(u => allHistories[u.id] = { userId: u.id, weeklyScores: [] });

      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let bIdx = 0; let opCount = 0;
      const addOp = (op: (b: WriteBatch) => void) => {
          op(mainBatches[bIdx]); opCount++;
          if (opCount >= 499) { mainBatches.push(writeBatch(firestore)); bIdx++; opCount = 0; }
      };

      // --- Seed Historical Certificates ---
      progressCallback('Seeding historical award records...');
      const userByName = new Map();
      allUsers.forEach(u => {
          if (u.name) userByName.set(u.name.toLowerCase().trim(), u.id);
      });

      historicalMimoAwardsData.forEach((monthData: any) => {
          const year = parseInt(monthData.season.split('-')[0]);
          monthData.awards.forEach((award: any, idx: number) => {
              const uId = userByName.get((award.name || '').toLowerCase().trim());
              if (uId) {
                  let type: 'winner' | 'runner-up' = 'winner';
                  if (award.type.toLowerCase().includes('ru')) type = 'runner-up';
                  
                  const isHistoricalXmas = award.type === 'XMAS NO1';
                  const awardId = `hist-${uId}-${monthData.season}-${monthData.month}-${idx}`.replace(/\s+/g, '-');
                  
                  addOp(b => b.set(doc(firestore, 'monthlyMimoM', awardId), {
                      id: awardId,
                      userId: uId,
                      month: monthData.month,
                      year: year,
                      type: type,
                      ...(isHistoricalXmas ? { special: 'Xmas No 1' } : {}),
                      improvement: award.improvement ?? 0
                  }));
              }
          });
      });

      const playedMatches = allMatches.filter(m => m.homeScore > -1 && m.awayScore > -1);
      const playedWeeks = [0, ...new Set(playedMatches.map(m => m.week))].sort((a,b) => a-b);
      const latestAbsoluteWeek = Math.max(0, ...playedWeeks);

      let chronologicalWeek = 0;
      const playedWeeksSet = new Set(playedWeeks);
      for (let i = 1; i <= 38; i++) {
          if (playedWeeksSet.has(i)) chronologicalWeek = i;
          else break;
      }
      
      for (const week of playedWeeks) {
          progressCallback(`Processing History: Week ${week}...`);
          let tRanks = prevStandingsRankMap;
          const tStats: { [tId: string]: any } = {};
          teams.forEach(t => tStats[t.id] = { points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });

          if (week > 0) {
              const weekMatches = playedMatches.filter(m => m.week <= week);
              weekMatches.forEach(m => {
                  const h = tStats[m.homeTeamId]; const a = tStats[m.awayTeamId];
                  h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore; h.goalDifference += (m.homeScore - m.awayScore); h.gamesPlayed++;
                  a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore; a.goalDifference += (a.goalsFor - a.goalsAgainst); a.gamesPlayed++;
                  if (m.homeScore > m.awayScore) { h.points += 3; h.wins++; a.losses++; }
                  else if (m.homeScore < m.awayScore) { a.points += 3; a.wins++; h.losses++; }
                  else { h.points++; h.draws++; a.points++; a.draws++; }
              });
              const tRanked = Object.entries(tStats).map(([teamId, s]) => ({ teamId, ...s, name: teamMap.get(teamId)?.name || '' }))
                  .sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));
              tRanks = new Map(tRanked.map((s, i) => [s.teamId, i + 1]));

              if (week === latestAbsoluteWeek) {
                  tRanked.forEach((s, idx) => {
                      addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${week}-${s.teamId}`), { week, teamId: s.teamId, rank: idx + 1 }));
                  });
              }
          }

          if (week === latestAbsoluteWeek) {
              teams.forEach(t => {
                  const s = tStats[t.id];
                  const rank = tRanks.get(t.id) || 20;
                  addOp(b => b.set(doc(firestore, 'standings', t.id), { teamId: t.id, rank, ...s }));
                  
                  const teamMatches = allMatches.filter(m => (m.homeTeamId === t.id || m.awayTeamId === t.id) && m.homeScore > -1)
                      .sort((a,b) => b.week - a.week).slice(0, 6);
                  const results = teamMatches.reverse().map(m => {
                      if (m.homeScore === m.awayScore) return 'D';
                      if (m.homeTeamId === t.id) return m.homeScore > m.awayScore ? 'W' : 'L';
                      return m.awayScore > m.homeScore ? 'W' : 'L';
                  });
                  while (results.length < 6) results.unshift('-');
                  addOp(b => b.set(doc(firestore, 'teamRecentResults', t.id), { teamId: t.id, results }));
              });
          }

          const uScores: { [uId: string]: number } = {};
          usersToProcess.forEach(u => {
              const pred = predictions.find(p => (p.userId || (p as any).id) === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = tRanks.get(tId);
                  if (actual) {
                      const points = (5 - Math.abs((idx + 1) - actual));
                      score += points;
                      if (week === latestAbsoluteWeek) {
                          addOp(b => b.set(doc(firestore, 'playerTeamScores', `${u.id}-${tId}`), { userId: u.id, teamId: tId, score: points }));
                      }
                  }
              });
              uScores[u.id] = score;
          });
          
          const uRanked = usersToProcess.filter(leaderboardCriteria).map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => b.score - a.score || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
          
          const scoresOnly = uRanked.map(u => u.score);
          uRanked.forEach((u) => {
              const competitionRank = scoresOnly.indexOf(u.score) + 1;
              allHistories[u.id].weeklyScores.push({ week, score: u.score, rank: competitionRank });
          });

          usersToProcess.filter(u => !leaderboardCriteria(u)).forEach(u => {
              allHistories[u.id].weeklyScores.push({ week, score: uScores[u.id] || 0, rank: 0 });
          });
      }

      const latestWk = latestAbsoluteWeek;
      const prevWk = Math.max(0, chronologicalWeek - 1);

      for (const u of usersToProcess) {
          const hist = allHistories[u.id];
          const latest = hist.weeklyScores.find(s => s.week === latestWk) || hist.weeklyScores[hist.weeklyScores.length - 1];
          const prev = hist.weeklyScores.find(s => s.week === prevWk) || { score: 0, rank: 0 };
          
          const relevantScores = hist.weeklyScores.filter(s => s.week > 0).map(s => s.score);
          const relevantRanks = hist.weeklyScores.filter(s => s.week > 0 && s.rank > 0).map(s => s.rank);
          
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: latest.score, 
              rank: latest.rank, 
              previousScore: prev.score, 
              previousRank: prev.rank,
              scoreChange: latest.score - prev.score, 
              rankChange: prev.rank > 0 && latest.rank > 0 ? prev.rank - latest.rank : 0,
              maxScore: relevantScores.length > 0 ? Math.max(...relevantScores) : latest.score, 
              minScore: relevantScores.length > 0 ? Math.min(...relevantScores) : latest.score,
              maxRank: relevantRanks.length > 0 ? Math.min(...relevantRanks) : latest.rank,
              minRank: relevantRanks.length > 0 ? Math.max(...relevantRanks) : latest.rank
          }, { merge: true }));
          addOp(b => b.set(doc(firestore, 'userHistories', u.id), hist));
      }

      progressCallback("Locking in 2025-26 Award Winners...");
      for (const period of allAwardPeriods) {
          if (latestAbsoluteWeek < period.endWeek) continue;

          const periodScores: { uId: string, improvement: number, score: number }[] = [];
          usersToProcess.filter(u => !u.isPro && activeUserIds.has(u.id)).forEach(u => {
              const h = allHistories[u.id];
              const sData = h.weeklyScores.find(ws => ws.week === period.startWeek);
              const eData = h.weeklyScores.find(ws => ws.week === period.endWeek);
              if (sData && eData) {
                  periodScores.push({ uId: u.id, improvement: eData.score - sData.score, score: eData.score });
              }
          });

          if (periodScores.length > 0 && periodScores.some(s => s.improvement !== 0)) {
              const isXmas = period.id === 'xmas';
              periodScores.sort((a,b) => b.improvement - a.improvement || b.score - a.score);
              
              const topImp = periodScores[0].improvement;
              const winners = isXmas ? [periodScores[0]] : periodScores.filter(s => s.improvement === topImp);

              winners.forEach(w => {
                  const awardId = `2025-${period.id}-${w.uId}`;
                  const awardData: any = {
                      id: awardId,
                      userId: w.uId,
                      month: period.id,
                      year: 2025,
                      type: 'winner',
                      improvement: w.improvement ?? 0
                  };
                  if (isXmas) awardData.special = 'Xmas No 1';
                  addOp(b => b.set(doc(firestore, 'monthlyMimoM', awardId), awardData));
              });

              if (!isXmas && winners.length === 1 && periodScores.length > 1) {
                  const runnerUpImp = periodScores.find(s => s.improvement < topImp)?.improvement;
                  if (runnerUpImp !== undefined && runnerUpImp !== 0) {
                      const runnersUp = periodScores.filter(s => s.improvement === runnerUpImp);
                      runnersUp.forEach(ru => {
                          const ruAwardId = `2025-${period.id}-ru-${ru.uId}`;
                          addOp(b => b.set(doc(firestore, 'monthlyMimoM', ruAwardId), {
                              id: ruAwardId,
                              userId: ru.uId,
                              month: period.id,
                              year: 2025,
                              type: 'runner-up',
                              improvement: ru.improvement ?? 0
                          }));
                      });
                  }
              }
          }
      }

      progressCallback("Writing final updates to database...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Synchronization Complete.");
    } catch (e: any) { throw e; }
}
