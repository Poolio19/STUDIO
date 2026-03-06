'use client';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
  type WriteBatch,
} from 'firebase/firestore';
import type { Team, Prediction, User as UserProfile, UserHistory, Match } from '@/lib/types';
import historicalMimoAwardsData from './historical-mimo-awards.json';
import { allAwardPeriods } from './award-periods';
import localFixtures from './past-fixtures.json';

/**
 * Recalculates all derived data and seeds historical records.
 * Strictly capped at Week 29 to ignore rogue data.
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
      const dbMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
      
      const activeUserIds = new Set(
        predictions
          .filter(p => p.rankings && p.rankings.length === 20)
          .map(p => p.userId || (p as any).id)
      );
      
      const activeUsersForRankings = allUsers.filter(u => activeUserIds.has(u.id));

      progressCallback('Synchronizing match dates and clearing derived tables...');
      
      const matchSyncBatch = writeBatch(firestore);
      let matchSyncCount = 0;
      localFixtures.forEach((localMatch: any) => {
          const dbMatch = dbMatches.find(m => m.id === localMatch.id);
          const needsUpdate = !dbMatch || !dbMatch.matchDateOrig || !dbMatch.matchDatePlay;
          
          if (needsUpdate) {
              const dateToUse = localMatch.matchDateOrig || new Date().toISOString();
              matchSyncBatch.set(doc(firestore, 'matches', localMatch.id), {
                  ...localMatch,
                  matchDateOrig: localMatch.matchDateOrig || dateToUse,
                  matchDatePlay: dbMatch?.matchDatePlay || localMatch.matchDatePlay || dateToUse,
                  homeScore: Number(dbMatch?.homeScore ?? localMatch.homeScore),
                  awayScore: Number(dbMatch?.awayScore ?? localMatch.awayScore)
              }, { merge: true });
              matchSyncCount++;
          }
      });
      if (matchSyncCount > 0) await matchSyncBatch.commit();

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
      allUsers.forEach(u => allHistories[u.id] = { userId: u.id, weeklyScores: [] });

      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let bIdx = 0; let opCount = 0;
      const addOp = (op: (b: WriteBatch) => void) => {
          op(mainBatches[bIdx]); opCount++;
          if (opCount >= 499) { mainBatches.push(writeBatch(firestore)); bIdx++; opCount = 0; }
      };

      progressCallback('Seeding historical records...');
      const userByName = new Map();
      allUsers.forEach(u => { if (u.name) userByName.set(u.name.toLowerCase().trim(), u.id); });

      historicalMimoAwardsData.forEach((monthData: any) => {
          const year = parseInt(monthData.season.split('-')[0]);
          monthData.awards.forEach((award: any, idx: number) => {
              const uId = userByName.get((award.name || '').toLowerCase().trim());
              if (uId) {
                  let type: 'winner' | 'runner-up' = 'winner';
                  if (award.type.toLowerCase().includes('ru')) type = 'runner-up';
                  
                  const cleanMonth = monthData.month.toLowerCase().replace('auf', 'aug').replace('sep', 'sept');
                  const awardId = `hist-${uId}-${monthData.season}-${cleanMonth}-${idx}`.replace(/[^a-zA-Z0-9-]/g, '-');

                  const awardData: any = {
                      id: awardId, userId: uId, month: cleanMonth, year: year, type: type,
                      improvement: Number(award.improvement ?? 0)
                  };
                  if (award.type === 'XMAS NO1') awardData.special = 'Xmas No 1';
                  addOp(b => b.set(doc(firestore, 'monthlyMimoM', awardId), awardData));
              }
          });
      });

      const finalMatchesDocs = await getDocs(collection(firestore, 'matches'));
      const playedMatches = finalMatchesDocs.docs
          .map(d => d.data() as Match)
          // STRICT CAP: Filter played matches up to Week 29. Ignore rogue future data.
          .filter(m => Number(m.homeScore) > -1 && Number(m.awayScore) > -1 && m.week <= 29)
          .sort((a,b) => new Date(a.matchDatePlay || a.matchDateOrig || 0).getTime() - new Date(b.matchDatePlay || b.matchDateOrig || 0).getTime());
      
      const playedWeeks = [0, ...new Set(playedMatches.map(m => m.week))].sort((a,b) => a-b);
      const latestAbsoluteWeek = playedWeeks[playedWeeks.length - 1] || 0;
      const previousPlayedWeek = playedWeeks[playedWeeks.length - 2] ?? 0;

      const cumulativeTStats: { [tId: string]: any } = {};
      teams.forEach(t => cumulativeTStats[t.id] = { points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });

      for (let weekIdx = 0; weekIdx < playedWeeks.length; weekIdx++) {
          const currentWeekNum = playedWeeks[weekIdx];
          
          if (currentWeekNum > 0) {
              const weekMatches = playedMatches.filter(m => m.week === currentWeekNum);
              weekMatches.forEach(m => {
                  const h = cumulativeTStats[m.homeTeamId];
                  const a = cumulativeTStats[m.awayTeamId];
                  const hS = Number(m.homeScore);
                  const aS = Number(m.awayScore);
                  
                  h.goalsFor = Number(h.goalsFor) + hS;
                  h.goalsAgainst = Number(h.goalsAgainst) + aS;
                  h.gamesPlayed = Number(h.gamesPlayed) + 1;
                  
                  a.goalsFor = Number(a.goalsFor) + aS;
                  a.goalsAgainst = Number(a.goalsAgainst) + hS;
                  a.gamesPlayed = Number(a.gamesPlayed) + 1;
                  
                  if (hS > aS) { h.points = Number(h.points) + 3; h.wins = Number(h.wins) + 1; a.losses = Number(a.losses) + 1; }
                  else if (hS < aS) { a.points = Number(a.points) + 3; a.wins = Number(a.wins) + 1; h.losses = Number(h.losses) + 1; }
                  else { h.points = Number(h.points) + 1; h.draws = Number(h.draws) + 1; a.points = Number(a.points) + 1; a.draws = Number(a.draws) + 1; }
                  
                  h.goalDifference = Number(h.goalsFor) - Number(h.goalsAgainst);
                  a.goalDifference = Number(a.goalsFor) - Number(a.goalsAgainst);
              });
          }

          const tRanked = Object.entries(cumulativeTStats).map(([teamId, s]) => ({ teamId, ...s, name: teamMap.get(teamId)?.name || '' }))
              .sort((a,b) => Number(b.points) - Number(a.points) || Number(b.goalDifference) - Number(a.goalDifference) || Number(b.goalsFor) - Number(a.goalsFor) || a.name.localeCompare(b.name));
          
          const weekRanks = new Map(tRanked.map((s, i) => [s.teamId, i + 1]));

          tRanked.forEach((s, idx) => {
              addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${currentWeekNum}-${s.teamId}`), { week: currentWeekNum, teamId: s.teamId, rank: idx + 1 }));
          });

          if (currentWeekNum === latestAbsoluteWeek) {
              teams.forEach(t => {
                  const s = cumulativeTStats[t.id];
                  addOp(b => b.set(doc(firestore, 'standings', t.id), { teamId: t.id, rank: weekRanks.get(t.id) || 20, ...s }));
                  
                  const teamMatches = playedMatches.filter(m => (m.homeTeamId === t.id || m.awayTeamId === t.id))
                      .sort((a,b) => new Date(a.matchDatePlay || a.matchDateOrig).getTime() - new Date(b.matchDatePlay || b.matchDateOrig).getTime()).slice(-6);
                  
                  const results = teamMatches.map(m => {
                      const hS = Number(m.homeScore); const aS = Number(m.awayScore);
                      if (hS === aS) return 'D';
                      if (m.homeTeamId === t.id) return hS > aS ? 'W' : 'L';
                      return aS > hS ? 'W' : 'L';
                  });
                  while (results.length < 6) results.unshift('-');
                  addOp(b => b.set(doc(firestore, 'teamRecentResults', t.id), { teamId: t.id, results }));
              });
          }

          const uScores: { [uId: string]: number } = {};
          allUsers.forEach(u => {
              const pred = predictions.find(p => (p.userId || (p as any).id) === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = weekRanks.get(tId);
                  if (actual) {
                      const points = (5 - Math.abs((idx + 1) - actual));
                      score = Number(score) + Number(points);
                      if (currentWeekNum === latestAbsoluteWeek) {
                          addOp(b => b.set(doc(firestore, 'playerTeamScores', `${u.id}-${tId}`), { userId: u.id, teamId: tId, score: points }));
                      }
                  }
              });
              uScores[u.id] = score;
          });
          
          const uRanked = activeUsersForRankings.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => Number(b.score) - Number(a.score) || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
          
          const scoresOnly = uRanked.map(u => u.score);
          uRanked.forEach((u) => {
              const competitionRank = scoresOnly.indexOf(u.score) + 1;
              allHistories[u.id].weeklyScores.push({ week: currentWeekNum, score: u.score, rank: competitionRank });
          });

          allUsers.filter(u => !activeUserIds.has(u.id)).forEach(u => {
              allHistories[u.id].weeklyScores.push({ week: currentWeekNum, score: Number(uScores[u.id] || 0), rank: 0 });
          });
      }

      for (const u of allUsers) {
          const hist = allHistories[u.id];
          const latest = hist.weeklyScores.find(s => s.week === latestAbsoluteWeek) || hist.weeklyScores[hist.weeklyScores.length - 1];
          const prev = hist.weeklyScores.find(s => s.week === previousPlayedWeek) || { score: 0, rank: 0 };
          const relevantScores = hist.weeklyScores.filter(s => s.week > 0).map(s => s.score);
          const relevantRanks = hist.weeklyScores.filter(s => s.week > 0 && s.rank > 0).map(s => s.rank);
          
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: Number(latest?.score || 0), 
              rank: latest?.rank || 0, 
              previousScore: Number(prev.score), 
              previousRank: prev.rank,
              scoreChange: Number((latest?.score || 0) - prev.score), 
              rankChange: prev.rank > 0 && (latest?.rank || 0) > 0 ? prev.rank - latest.rank : 0,
              maxScore: relevantScores.length > 0 ? Math.max(...relevantScores) : Number(latest?.score || 0), 
              minScore: relevantScores.length > 0 ? Math.min(...relevantScores) : Number(latest?.score || 0),
              maxRank: relevantRanks.length > 0 ? Math.min(...relevantRanks) : (latest?.rank || 0),
              minRank: relevantRanks.length > 0 ? Math.max(...relevantRanks) : (latest?.rank || 0)
          }, { merge: true }));
          addOp(b => b.set(doc(firestore, 'userHistories', u.id), hist));
      }

      progressCallback("Finalizing Season Awards...");
      for (const period of allAwardPeriods) {
          if (latestAbsoluteWeek >= period.startWeek) {
              const periodScores: { uId: string, improvement: number, score: number }[] = [];
              activeUsersForRankings.filter(u => !u.isPro).forEach(u => {
                  const h = allHistories[u.id];
                  const sData = h.weeklyScores.find(ws => ws.week === period.startWeek);
                  const eData = h.weeklyScores.filter(ws => ws.week <= (latestAbsoluteWeek >= period.endWeek ? period.endWeek : latestAbsoluteWeek)).reverse()[0];
                  if (sData && eData) {
                      periodScores.push({ uId: u.id, improvement: Number(eData.score - sData.score), score: Number(eData.score) });
                  }
              });

              if (periodScores.length > 0) {
                  periodScores.sort((a,b) => b.improvement - a.improvement || b.score - a.score);
                  const topImp = periodScores[0].improvement;
                  const winners = period.id === 'xmas' ? [periodScores[0]] : periodScores.filter(s => s.improvement === topImp);

                  winners.forEach(w => {
                      const awardId = `2025-${period.id}-${w.uId}`;
                      const awardData: any = {
                          id: awardId, userId: w.uId, month: period.month || period.special || '', year: period.year, type: 'winner', improvement: Number(w.improvement)
                      };
                      if (period.id === 'xmas') awardData.special = 'Xmas No 1';
                      addOp(b => b.set(doc(firestore, 'monthlyMimoM', awardId), awardData));
                  });

                  if (period.id !== 'xmas' && winners.length === 1 && periodScores.length > 1) {
                      const runnerUpImp = periodScores.find(s => s.improvement < topImp)?.improvement;
                      if (runnerUpImp !== undefined) {
                          periodScores.filter(s => s.improvement === runnerUpImp).forEach(ru => {
                              const ruAwardId = `2025-${period.id}-ru-${ru.uId}`;
                              addOp(b => b.set(doc(firestore, 'monthlyMimoM', ruAwardId), {
                                  id: ruAwardId, userId: ru.uId, month: period.month || period.special || '', year: period.year, type: 'runner-up', improvement: Number(ru.improvement)
                              }));
                          });
                      }
                  }
              }
          }
      }

      progressCallback("Writing updates...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Sync Complete.");
    } catch (e: any) { throw e; }
}
