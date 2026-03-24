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

// Official Week Start Dates provided by user
const weekStarts = [
    { week: 1, date: "2025-08-18T00:00:00Z" },
    { week: 2, date: "2025-08-25T00:00:00Z" },
    { week: 3, date: "2025-08-31T00:00:00Z" },
    { week: 4, date: "2025-09-14T00:00:00Z" },
    { week: 5, date: "2025-09-21T00:00:00Z" },
    { week: 6, date: "2025-09-29T00:00:00Z" },
    { week: 7, date: "2025-10-05T00:00:00Z" },
    { week: 8, date: "2025-10-20T00:00:00Z" },
    { week: 9, date: "2025-10-26T00:00:00Z" },
    { week: 10, date: "2025-11-03T00:00:00Z" },
    { week: 11, date: "2025-11-09T00:00:00Z" },
    { week: 12, date: "2025-11-24T00:00:00Z" },
    { week: 13, date: "2025-11-30T00:00:00Z" },
    { week: 14, date: "2025-12-04T00:00:00Z" },
    { week: 15, date: "2025-12-08T00:00:00Z" },
    { week: 16, date: "2025-12-15T00:00:00Z" },
    { week: 17, date: "2025-12-22T00:00:00Z" },
    { week: 18, date: "2025-12-28T00:00:00Z" },
    { week: 19, date: "2026-01-01T00:00:00Z" },
    { week: 20, date: "2026-01-04T00:00:00Z" },
    { week: 21, date: "2026-01-08T00:00:00Z" },
    { week: 22, date: "2026-01-19T00:00:00Z" },
    { week: 23, date: "2026-01-26T00:00:00Z" },
    { week: 24, date: "2026-02-02T00:00:00Z" },
    { week: 25, date: "2026-02-08T00:00:00Z" },
    { week: 26, date: "2026-02-12T00:00:00Z" },
    { week: 27, date: "2026-02-23T00:00:00Z" },
    { week: 28, date: "2026-03-01T00:00:00Z" },
    { week: 29, date: "2026-03-05T00:00:00Z" },
    { week: 30, date: "2026-03-16T00:00:00Z" },
    { week: 31, date: "2026-03-22T00:00:00Z" },
    { week: 32, date: "2026-04-13T00:00:00Z" },
    { week: 33, date: "2026-04-20T00:00:00Z" },
    { week: 34, date: "2026-04-27T00:00:00Z" },
    { week: 35, date: "2026-05-02T00:00:00Z" },
    { week: 36, date: "2026-05-09T00:00:00Z" },
    { week: 37, date: "2026-05-17T00:00:00Z" },
    { week: 38, date: "2026-05-24T00:00:00Z" },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function getPlayedWeek(dateStr: string): number {
    const d = new Date(dateStr).getTime();
    for (const w of weekStarts) {
        if (d >= new Date(w.date).getTime()) return w.week;
    }
    return 1;
}

export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Initializing sync engine...");
  
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

      progressCallback('Synchronizing fixtures from file...');
      const matchSyncBatch = writeBatch(firestore);
      const jsonMatchIds = new Set(localFixtures.map((m: any) => m.id));
      
      dbMatches.forEach(dbMatch => {
          if (!jsonMatchIds.has(dbMatch.id)) matchSyncBatch.delete(doc(firestore, 'matches', dbMatch.id));
      });

      localFixtures.forEach((localMatch: any) => {
          const dbMatch = dbMatches.find(m => m.id === localMatch.id);
          const dateOrig = localMatch.matchDateOrig || new Date().toISOString();
          const datePlay = localMatch.matchDatePlay || dbMatch?.matchDatePlay || dateOrig;
          const homeScore = Number(localMatch.homeScore !== undefined && localMatch.homeScore !== -1 ? localMatch.homeScore : (dbMatch?.homeScore ?? -1));
          const awayScore = Number(localMatch.awayScore !== undefined && localMatch.awayScore !== -1 ? localMatch.awayScore : (dbMatch?.awayScore ?? -1));

          matchSyncBatch.set(doc(firestore, 'matches', localMatch.id), {
              ...localMatch,
              week: Number(localMatch.week),
              matchDateOrig: dateOrig,
              matchDatePlay: datePlay,
              homeScore: homeScore,
              awayScore: awayScore
          }, { merge: true });
      });
      await matchSyncBatch.commit();

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

      progressCallback('Seeding history...');
      const userByName = new Map();
      allUsers.forEach(u => { if (u.name) userByName.set(u.name.toLowerCase().trim(), u.id); });

      historicalMimoAwardsData.forEach((monthData: any) => {
          const year = parseInt(monthData.season.split('-')[0]);
          monthData.awards.forEach((award: any, idx: number) => {
              const uId = userByName.get((award.name || '').toLowerCase().trim());
              if (uId) {
                  let type: 'winner' | 'runner-up' = 'winner';
                  if (award.type.toLowerCase().includes('ru')) type = 'runner-up';
                  const cleanMonth = monthData.month.toLowerCase();
                  const awardId = `hist-${uId}-${monthData.season}-${cleanMonth}-${idx}`.replace(/[^a-zA-Z0-9-]/g, '-');
                  addOp(b => b.set(doc(firestore, 'monthlyMimoM', awardId), {
                      id: awardId, userId: uId, month: cleanMonth, year: Number(year), type: type,
                      improvement: Number(award.improvement ?? 0), special: award.type === 'XMAS NO1' ? 'Xmas No 1' : undefined
                  }));
              }
          });
      });

      const finalMatchesDocs = await getDocs(collection(firestore, 'matches'));
      const allMatchesData = finalMatchesDocs.docs.map(d => d.data() as Match);
      
      const playedMatches = allMatchesData
          .filter(m => Number(m.homeScore) >= 0 && Number(m.awayScore) >= 0)
          .sort((a,b) => new Date(a.matchDatePlay).getTime() - new Date(b.matchDatePlay).getTime());
      
      const latestAbsoluteWeek = playedMatches.length > 0 ? Math.max(...playedMatches.map(m => getPlayedWeek(m.matchDatePlay))) : 0;
      const previousPlayedWeek = latestAbsoluteWeek > 1 ? latestAbsoluteWeek - 1 : 0;

      const cumulativeTStats: { [tId: string]: any } = {};
      teams.forEach(t => cumulativeTStats[t.id] = { points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });

      for (let w = 0; w <= latestAbsoluteWeek; w++) {
          if (w > 0) {
              const weekMatches = playedMatches.filter(m => getPlayedWeek(m.matchDatePlay) === w);
              weekMatches.forEach(m => {
                  const h = cumulativeTStats[m.homeTeamId]; const a = cumulativeTStats[m.awayTeamId];
                  const hS = Number(m.homeScore); const aS = Number(m.awayScore);
                  h.goalsFor = Number(h.goalsFor) + hS; h.goalsAgainst = Number(h.goalsAgainst) + aS; h.gamesPlayed = Number(h.gamesPlayed) + 1;
                  a.goalsFor = Number(a.goalsFor) + aS; a.goalsAgainst = Number(a.goalsAgainst) + hS; a.gamesPlayed = Number(a.gamesPlayed) + 1;
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
          tRanked.forEach((s, idx) => addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${w}-${s.teamId}`), { week: Number(w), teamId: s.teamId, rank: idx + 1 })));

          if (w === latestAbsoluteWeek) {
              teams.forEach(t => {
                  addOp(b => b.set(doc(firestore, 'standings', t.id), { teamId: t.id, rank: weekRanks.get(t.id) || 20, ...cumulativeTStats[t.id] }));
                  const tMs = playedMatches.filter(m => (m.homeTeamId === t.id || m.awayTeamId === t.id)).slice(-10); // Get more to be safe for NG logic
                  const form: string[] = [];
                  for (let i = latestAbsoluteWeek; i > Math.max(0, latestAbsoluteWeek - 6); i--) {
                      const weekGames = playedMatches.filter(m => getPlayedWeek(m.matchDatePlay) === i && (m.homeTeamId === t.id || m.awayTeamId === t.id));
                      if (weekGames.length === 0) form.unshift('NG');
                      else {
                          let res = '';
                          weekGames.forEach(m => {
                              const hS = Number(m.homeScore); const aS = Number(m.awayScore);
                              if (hS === aS) res += 'D';
                              else if (m.homeTeamId === t.id) res += hS > aS ? 'W' : 'L';
                              else res += aS > hS ? 'W' : 'L';
                          });
                          form.unshift(res);
                      }
                  }
                  addOp(b => b.set(doc(firestore, 'teamRecentResults', t.id), { teamId: t.id, results: form }));
              });
          }

          const uScores: { [uId: string]: number } = {};
          allUsers.forEach(u => {
              const pred = predictions.find(p => (p.userId || (p as any).id) === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = weekRanks.get(tId);
                  if (actual) score = Number(score) + (5 - Math.abs((idx + 1) - actual));
              });
              uScores[u.id] = score;
              if (w === latestAbsoluteWeek) {
                  pred?.rankings.forEach((tId, idx) => {
                      const actual = weekRanks.get(tId);
                      addOp(b => b.set(doc(firestore, 'playerTeamScores', `${u.id}-${tId}`), { userId: u.id, teamId: tId, score: actual ? (5 - Math.abs((idx + 1) - actual)) : 0 }));
                  });
              }
          });
          
          const uRanked = activeUsersForRankings.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => Number(b.score) - Number(a.score) || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
          
          const scoresOnly = uRanked.map(u => u.score);
          uRanked.forEach((u) => allHistories[u.id].weeklyScores.push({ week: Number(w), score: Number(u.score), rank: scoresOnly.indexOf(u.score) + 1 }));
          allUsers.filter(u => !activeUserIds.has(u.id)).forEach(u => allHistories[u.id].weeklyScores.push({ week: Number(w), score: Number(uScores[u.id] || 0), rank: 0 }));
      }

      allUsers.forEach(u => {
          const hist = allHistories[u.id];
          const latest = hist.weeklyScores.find(s => Number(s.week) === latestAbsoluteWeek);
          const prev = hist.weeklyScores.find(s => Number(s.week) === previousPlayedWeek) || { score: 0, rank: 0 };
          const rScores = hist.weeklyScores.filter(s => s.week > 0).map(s => s.score);
          const rRanks = hist.weeklyScores.filter(s => s.week > 0 && s.rank > 0).map(s => s.rank);
          
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: Number(latest?.score || 0), rank: latest?.rank || 0, previousScore: Number(prev.score), previousRank: prev.rank,
              scoreChange: Number((latest?.score || 0) - prev.score), rankChange: prev.rank > 0 && latest?.rank ? prev.rank - latest.rank : 0,
              maxScore: rScores.length ? Math.max(...rScores) : 0, minScore: rScores.length ? Math.min(...rScores) : 0,
              maxRank: rRanks.length ? Math.min(...rRanks) : 0, minRank: rRanks.length ? Math.max(...rRanks) : 0
          }, { merge: true }));
          addOp(b => b.set(doc(firestore, 'userHistories', u.id), hist));
      });

      progressCallback("Finalizing Awards...");
      allAwardPeriods.forEach(period => {
          if (latestAbsoluteWeek >= period.startWeek) {
              const pScores: { uId: string, improvement: number, score: number }[] = [];
              activeUsersForRankings.filter(u => !u.isPro).forEach(u => {
                  const h = allHistories[u.id];
                  const sD = h.weeklyScores.find(ws => Number(ws.week) === period.startWeek);
                  const eD = h.weeklyScores.filter(ws => Number(ws.week) <= (latestAbsoluteWeek >= period.endWeek ? period.endWeek : latestAbsoluteWeek)).reverse()[0];
                  if (sD && eD) pScores.push({ uId: u.id, improvement: Number(eD.score - sD.score), score: Number(eD.score) });
              });

              if (pScores.length > 0) {
                  pScores.sort((a,b) => b.improvement - a.improvement || b.score - a.score);
                  const winners = period.id === 'xmas' ? [pScores[0]] : pScores.filter(s => s.improvement === pScores[0].improvement);
                  winners.forEach(w => {
                      const id = `${period.year}-${period.id}-${w.uId}`;
                      addOp(b => b.set(doc(firestore, 'monthlyMimoM', id), { id, userId: w.uId, month: period.month || period.special || '', year: Number(period.year), type: 'winner', improvement: Number(w.improvement), special: period.id === 'xmas' ? 'Xmas No 1' : undefined }));
                  });
                  if (period.id !== 'xmas' && winners.length === 1 && pScores.length > 1) {
                      const ruImp = pScores.find(s => s.improvement < pScores[0].improvement)?.improvement;
                      if (ruImp !== undefined) pScores.filter(s => s.improvement === ruImp).forEach(ru => {
                          const id = `${period.year}-${period.id}-ru-${ru.uId}`;
                          addOp(b => b.set(doc(firestore, 'monthlyMimoM', id), { id, userId: ru.uId, month: period.month || period.special || '', year: Number(period.year), type: 'runner-up', improvement: Number(ru.improvement) }));
                      });
                  }
              }
          }
      });

      progressCallback("Writing final database updates...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Recalculation Complete.");
    } catch (e: any) { throw e; }
}