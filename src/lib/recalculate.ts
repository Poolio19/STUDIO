'use client';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
  type WriteBatch,
} from 'firebase/firestore';
import type { Team, Prediction, User as UserProfile, UserHistory } from '@/lib/types';
import localFixtures from './past-fixtures.json';
import prevSeasonData from './previous-season-standings-24-25.json';

/**
 * The Master Recalculation Engine
 * Generates full weekly history and strictly reconciles database matches with the JSON blueprint.
 */
export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Initializing Master Overhaul...");
  
      const [teamsSnap, usersSnap, predictionsSnap, existingMatchesSnap] = await Promise.all([
        getDocs(collection(firestore, 'teams')),
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'predictions')),
        getDocs(collection(firestore, 'matches'))
      ]);
  
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      const teamMap = new Map(teams.map(t => [t.id, t]));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
      const dbMatchesMap = new Map(existingMatchesSnap.docs.map(d => [d.id, d.data()]));
      
      const activeUserIds = new Set(predictions.filter(p => p.rankings && p.rankings.length === 20).map(p => p.userId || (p as any).id));
      const activeUsersForRankings = allUsers.filter(u => activeUserIds.has(u.id));

      progressCallback('Reconciling Master Fixtures...');
      const matchSyncBatch = writeBatch(firestore);
      const finalPlayedMatches: any[] = [];
      const jsonMatchIds = new Set(localFixtures.map(m => m.id));

      // 1. Sync and Identify played matches
      localFixtures.forEach((localMatch: any) => {
          const dbMatch: any = dbMatchesMap.get(localMatch.id);
          let hS = Number(localMatch.homeScore ?? -1);
          let aS = Number(localMatch.awayScore ?? -1);

          // Priority: If JSON says unplayed (-1) but DB has a score, KEEP the score
          if (hS === -1 && dbMatch && Number(dbMatch.homeScore) >= 0) {
              hS = Number(dbMatch.homeScore);
              aS = Number(dbMatch.awayScore);
          }

          const finalMatch = {
              ...localMatch,
              homeScore: hS,
              awayScore: aS,
              matchDatePlay: localMatch.matchDatePlay || localMatch.matchDateOrig
          };

          matchSyncBatch.set(doc(firestore, 'matches', localMatch.id), finalMatch, { merge: true });
          if (hS >= 0 && aS >= 0) finalPlayedMatches.push(finalMatch);
      });

      // 2. Delete Orphan Matches (Fixes "extra game" bugs)
      existingMatchesSnap.docs.forEach(d => {
          if (!jsonMatchIds.has(d.id)) {
              matchSyncBatch.delete(d.ref);
          }
      });
      await matchSyncBatch.commit();

      progressCallback('Clearing derived tables...');
      const derivedCollections = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories'];
      for (const colName of derivedCollections) {
          const snap = await getDocs(collection(firestore, colName));
          let b = writeBatch(firestore); let c = 0;
          for (const d of snap.docs) {
              b.delete(d.ref); c++;
              if (c === 499) { await b.commit(); b = writeBatch(firestore); c = 0; }
          }
          if (c > 0) await b.commit();
      }
      
      const allHistories: { [uId: string]: UserHistory } = {};
      allUsers.forEach(u => allHistories[u.id] = { userId: u.id, weeklyScores: [] });

      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let bIdx = 0; let opCount = 0;
      const addOp = (op: (b: WriteBatch) => void) => {
          op(mainBatches[bIdx]); opCount++;
          if (opCount >= 499) { mainBatches.push(writeBatch(firestore)); bIdx++; opCount = 0; }
      };

      const sortedPlayed = [...finalPlayedMatches].sort((a,b) => Number(a.week) - Number(b.week));
      const latestAbsoluteWeek = sortedPlayed.length > 0 ? Math.max(...sortedPlayed.map(m => Number(m.week))) : 0;

      const prevSeasonRankMap = new Map(prevSeasonData.map(s => [s.teamId, Number(s.rank)]));
      const cumulativeTStats: { [tId: string]: any } = {};
      teams.forEach(t => cumulativeTStats[t.id] = { 
          points: 0, 
          goalDifference: 0, 
          goalsFor: 0, 
          goalsAgainst: 0, 
          wins: 0, 
          draws: 0, 
          losses: 0, 
          gamesPlayed: 0 
      });

      const weekResultsByTeamAndWeek = new Map<string, string>();

      // 3. Full Week-by-Week Standings & History Engine
      for (let w = 0; w <= 38; w++) {
          let weekRanks = new Map<string, number>();

          if (w === 0) {
              weekRanks = prevSeasonRankMap;
              teams.forEach(t => {
                  const r = prevSeasonRankMap.get(t.id) || 20;
                  addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk0-${t.id}`), { week: 0, teamId: t.id, rank: r }));
              });
          } else {
              const weekMatches = sortedPlayed.filter(m => Number(m.week) === w);
              
              weekMatches.forEach(m => {
                  const h = cumulativeTStats[m.homeTeamId]; const a = cumulativeTStats[m.awayTeamId];
                  const hS = Number(m.homeScore); const aS = Number(m.awayScore);
                  
                  h.goalsFor = Number(h.goalsFor) + hS; 
                  h.goalsAgainst = Number(h.goalsAgainst) + aS; 
                  h.gamesPlayed = Number(h.gamesPlayed) + 1;

                  a.goalsFor = Number(a.goalsFor) + aS; 
                  a.goalsAgainst = Number(a.goalsAgainst) + hS; 
                  a.gamesPlayed = Number(a.gamesPlayed) + 1;
                  
                  let hRes = 'D'; let aRes = 'D';
                  if (hS > aS) { h.points += 3; h.wins += 1; a.losses += 1; hRes = 'W'; aRes = 'L'; }
                  else if (hS < aS) { a.points += 3; a.wins += 1; h.losses += 1; hRes = 'L'; aRes = 'W'; }
                  else { h.points += 1; h.draws += 1; a.points += 1; a.draws += 1; }
                  
                  h.goalDifference = Number(h.goalsFor) - Number(h.goalsAgainst);
                  a.goalDifference = Number(a.goalsFor) - Number(a.goalsAgainst);

                  const hKey = `${w}-${m.homeTeamId}`; const aKey = `${w}-${m.awayTeamId}`;
                  weekResultsByTeamAndWeek.set(hKey, (weekResultsByTeamAndWeek.get(hKey) || '') + hRes);
                  weekResultsByTeamAndWeek.set(aKey, (weekResultsByTeamAndWeek.get(aKey) || '') + aRes);
              });

              const tRanked = Object.entries(cumulativeTStats).map(([teamId, s]) => ({ teamId, ...s, name: teamMap.get(teamId)?.name || '' }))
                  .sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));
              
              weekRanks = new Map(tRanked.map((s, i) => [s.teamId, i + 1]));
              tRanked.forEach((s, idx) => addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${w}-${s.teamId}`), { week: Number(w), teamId: s.teamId, rank: idx + 1 })));

              if (w === latestAbsoluteWeek) {
                  teams.forEach(t => {
                      addOp(b => b.set(doc(firestore, 'standings', t.id), { 
                          teamId: t.id, 
                          rank: Number(weekRanks.get(t.id) || 20), 
                          points: Number(cumulativeTStats[t.id].points),
                          goalDifference: Number(cumulativeTStats[t.id].goalDifference),
                          goalsFor: Number(cumulativeTStats[t.id].goalsFor),
                          goalsAgainst: Number(cumulativeTStats[t.id].goalsAgainst),
                          wins: Number(cumulativeTStats[t.id].wins),
                          draws: Number(cumulativeTStats[t.id].draws),
                          losses: Number(cumulativeTStats[t.id].losses),
                          gamesPlayed: Number(cumulativeTStats[t.id].gamesPlayed),
                      }));
                      const form: string[] = [];
                      for (let i = latestAbsoluteWeek; i > Math.max(-1, latestAbsoluteWeek - 6); i--) {
                          const res = weekResultsByTeamAndWeek.get(`${i}-${t.id}`) || 'NG';
                          form.unshift(res);
                      }
                      addOp(b => b.set(doc(firestore, 'teamRecentResults', t.id), { teamId: t.id, results: form }));
                  });
              }
          }

          const uScores: { [uId: string]: number } = {};
          activeUsersForRankings.forEach(u => {
              const pred = predictions.find(p => (p.userId || p.id) === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = weekRanks.get(tId);
                  if (actual) score += (5 - Math.abs((idx + 1) - actual));
              });
              uScores[u.id] = score;
              
              if (w === latestAbsoluteWeek && w > 0) {
                  pred?.rankings.forEach((tId, idx) => {
                      const actual = weekRanks.get(tId);
                      addOp(b => b.set(doc(firestore, 'playerTeamScores', `${u.id}-${tId}`), { userId: u.id, teamId: tId, score: actual ? (5 - Math.abs((idx + 1) - actual)) : 0 }));
                  });
              }
          });
          
          const uRanked = activeUsersForRankings.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => b.score - a.score || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
          
          uRanked.forEach((u, idx) => {
              if (allHistories[u.id]) {
                  allHistories[u.id].weeklyScores.push({ 
                    week: Number(w), 
                    score: Number(u.score), 
                    rank: idx + 1
                  });
              }
          });
      }

      allUsers.forEach(u => {
          const h = allHistories[u.id];
          const latest = h?.weeklyScores.find(s => Number(s.week) === latestAbsoluteWeek) || { score: 0, rank: 0 };
          const prev = h?.weeklyScores.find(s => Number(s.week) === latestAbsoluteWeek - 1) || { score: 0, rank: 0 };
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: Number(latest.score), rank: latest.rank, previousScore: Number(prev.score), previousRank: prev.rank,
              scoreChange: Number(latest.score - prev.score), rankChange: (prev.rank > 0 && latest.rank > 0) ? prev.rank - latest.rank : 0
          }, { merge: true }));
          if (h) addOp(b => b.set(doc(firestore, 'userHistories', u.id), h));
      });

      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Recalculation Complete.");
    } catch (e: any) { throw e; }
}
