
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
import localFixtures from './past-fixtures.json';

const weekStarts = [
    { week: 1, date: "2025-08-11T00:00:00Z" },
    { week: 2, date: "2025-08-18T00:00:00Z" },
    { week: 3, date: "2025-08-25T00:00:00Z" },
    { week: 4, date: "2025-09-08T00:00:00Z" },
    { week: 5, date: "2025-09-15T00:00:00Z" },
    { week: 6, date: "2025-09-22T00:00:00Z" },
    { week: 7, date: "2025-09-29T00:00:00Z" },
    { week: 8, date: "2025-10-13T00:00:00Z" },
    { week: 9, date: "2025-10-20T00:00:00Z" },
    { week: 10, date: "2025-10-27T00:00:00Z" },
    { week: 11, date: "2025-11-03T00:00:00Z" },
    { week: 12, date: "2025-11-17T00:00:00Z" },
    { week: 13, date: "2025-11-24T00:00:00Z" },
    { week: 14, date: "2025-12-01T00:00:00Z" },
    { week: 15, date: "2025-12-05T00:00:00Z" },
    { week: 16, date: "2025-12-08T00:00:00Z" },
    { week: 17, date: "2025-12-15T00:00:00Z" },
    { week: 18, date: "2025-12-22T00:00:00Z" },
    { week: 19, date: "2025-12-29T00:00:00Z" },
    { week: 20, date: "2026-01-01T00:00:00Z" },
    { week: 21, date: "2026-01-05T00:00:00Z" },
    { week: 22, date: "2026-01-12T00:00:00Z" },
    { week: 23, date: "2026-01-19T00:00:00Z" },
    { week: 24, date: "2026-01-26T00:00:00Z" },
    { week: 25, date: "2026-02-02T00:00:00Z" },
    { week: 26, date: "2026-02-09T00:00:00Z" },
    { week: 27, date: "2026-02-16T00:00:00Z" },
    { week: 28, date: "2026-02-23T00:00:00Z" },
    { week: 29, date: "2026-03-02T00:00:00Z" },
    { week: 30, date: "2026-03-09T00:00:00Z" },
    { week: 31, date: "2026-03-16T00:00:00Z" },
    { week: 32, date: "2026-04-06T00:00:00Z" },
    { week: 33, date: "2026-04-13T00:00:00Z" },
    { week: 34, date: "2026-04-20T00:00:00Z" },
    { week: 35, date: "2026-04-27T00:00:00Z" },
    { week: 36, date: "2026-05-04T00:00:00Z" },
    { week: 37, date: "2026-05-11T00:00:00Z" },
    { week: 38, date: "2026-05-18T00:00:00Z" },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function getCompetitionWeek(dateStr: string): number {
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
  
      const [teamsSnap, usersSnap, predictionsSnap, currentMatchesSnap] = await Promise.all([
        getDocs(collection(firestore, 'teams')),
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'predictions')),
        getDocs(collection(firestore, 'matches'))
      ]);
  
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      const teamMap = new Map(teams.map(t => [t.id, t]));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
      const dbMatches = currentMatchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      
      const activeUserIds = new Set(predictions.filter(p => p.rankings && p.rankings.length === 20).map(p => p.userId || (p as any).id));
      const activeUsersForRankings = allUsers.filter(u => activeUserIds.has(u.id));

      progressCallback('Synchronizing fixtures...');
      const matchSyncBatch = writeBatch(firestore);
      localFixtures.forEach((localMatch: any) => {
          const dbMatch = dbMatches.find(m => m.id === localMatch.id);
          
          // PRESERVE FIRESTORE SCORES
          const finalHomeScore = (dbMatch && dbMatch.homeScore !== -1) ? Number(dbMatch.homeScore) : Number(localMatch.homeScore ?? -1);
          const finalAwayScore = (dbMatch && dbMatch.awayScore !== -1) ? Number(dbMatch.awayScore) : Number(localMatch.awayScore ?? -1);
          const datePlay = localMatch.matchDatePlay || dbMatch?.matchDatePlay || localMatch.matchDateOrig;

          matchSyncBatch.set(doc(firestore, 'matches', localMatch.id), {
              ...localMatch,
              homeScore: finalHomeScore,
              awayScore: finalAwayScore,
              matchDatePlay: datePlay
          }, { merge: true });
      });
      await matchSyncBatch.commit();

      // Clear derived collections
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

      const finalMatchesSnap = await getDocs(collection(firestore, 'matches'));
      const playedMatches = finalMatchesSnap.docs.map(d => d.data() as Match)
          .filter(m => Number(m.homeScore) >= 0 && Number(m.awayScore) >= 0)
          .sort((a,b) => new Date(a.matchDatePlay).getTime() - new Date(b.matchDatePlay).getTime());
      
      const latestAbsoluteWeek = playedMatches.length > 0 ? Math.max(...playedMatches.map(m => getCompetitionWeek(m.matchDatePlay))) : 0;

      const cumulativeTStats: { [tId: string]: any } = {};
      teams.forEach(t => cumulativeTStats[t.id] = { points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });

      const weekResultsByTeamAndWeek = new Map<string, string>();

      for (let w = 0; w <= latestAbsoluteWeek; w++) {
          const weekMatches = playedMatches.filter(m => getCompetitionWeek(m.matchDatePlay) === w);
          
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
              if (hS > aS) { h.points = Number(h.points) + 3; h.wins = Number(h.wins) + 1; a.losses = Number(a.losses) + 1; hRes = 'W'; aRes = 'L'; }
              else if (hS < aS) { a.points = Number(a.points) + 3; a.wins = Number(a.wins) + 1; h.losses = Number(h.losses) + 1; hRes = 'L'; aRes = 'W'; }
              else { h.points = Number(h.points) + 1; h.draws = Number(h.draws) + 1; a.points = Number(a.points) + 1; a.draws = Number(a.draws) + 1; }
              
              h.goalDifference = Number(h.goalsFor) - Number(h.goalsAgainst);
              a.goalDifference = Number(a.goalsFor) - Number(a.goalsAgainst);

              const hKey = `${w}-${m.homeTeamId}`; const aKey = `${w}-${m.awayTeamId}`;
              weekResultsByTeamAndWeek.set(hKey, (weekResultsByTeamAndWeek.get(hKey) || '') + hRes);
              weekResultsByTeamAndWeek.set(aKey, (weekResultsByTeamAndWeek.get(aKey) || '') + aRes);
          });

          const tRanked = Object.entries(cumulativeTStats).map(([teamId, s]) => ({ teamId, ...s, name: teamMap.get(teamId)?.name || '' }))
              .sort((a,b) => Number(b.points) - Number(a.points) || Number(b.goalDifference) - Number(a.goalDifference) || Number(b.goalsFor) - Number(a.goalsFor) || a.name.localeCompare(b.name));
          
          const weekRanks = new Map(tRanked.map((s, i) => [s.teamId, i + 1]));
          tRanked.forEach((s, idx) => addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${w}-${s.teamId}`), { week: Number(w), teamId: s.teamId, rank: idx + 1 })));

          if (w === latestAbsoluteWeek) {
              teams.forEach(t => {
                  addOp(b => b.set(doc(firestore, 'standings', t.id), { teamId: t.id, rank: weekRanks.get(t.id) || 20, ...cumulativeTStats[t.id] }));
                  const form: string[] = [];
                  for (let i = latestAbsoluteWeek; i > Math.max(-1, latestAbsoluteWeek - 6); i--) {
                      const res = weekResultsByTeamAndWeek.get(`${i}-${t.id}`) || 'NG';
                      form.unshift(res);
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
                  if (actual) score += (5 - Math.abs((idx + 1) - actual));
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
          uRanked.forEach((u) => {
              if (allHistories[u.id]) {
                  allHistories[u.id].weeklyScores.push({ week: Number(w), score: Number(u.score), rank: scoresOnly.indexOf(u.score) + 1 });
              }
          });
      }

      allUsers.forEach(u => {
          const h = allHistories[u.id];
          const latest = h.weeklyScores.find(s => Number(s.week) === latestAbsoluteWeek) || { score: 0, rank: 0 };
          const prev = h.weeklyScores.find(s => Number(s.week) === latestAbsoluteWeek - 1) || { score: 0, rank: 0 };
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: Number(latest.score), rank: latest.rank, previousScore: Number(prev.score), previousRank: prev.rank,
              scoreChange: Number(latest.score - prev.score), rankChange: prev.rank > 0 && latest.rank ? prev.rank - latest.rank : 0
          }, { merge: true }));
          addOp(b => b.set(doc(firestore, 'userHistories', u.id), h));
      });

      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Recalculation Complete.");
    } catch (e: any) { throw e; }
}
