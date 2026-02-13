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
import prevStandingsData from './previous-season-standings-24-25.json';
import historicalPlayersData from './historical-players.json';

/**
 * Recalculates all derived data based on strict competition ranking and prize rules.
 * Standard Competition Ranking (1, 2, 2, 4) is applied to all history.
 * Populates: standings, playerTeamScores, weeklyTeamStandings, teamRecentResults, userHistories.
 */
export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Starting data overhaul...");
  
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
      
      const historicalUserIds = new Set(historicalPlayersData.map(p => p.id));
      const activeUserIds = new Set(predictions.filter(p => p.rankings?.length === 20).map(p => p.userId || (p as any).id));
      const users = allUsers.filter(u => activeUserIds.has(u.id) && (historicalUserIds.has(u.id) || u.isPro));
      const prevStandingsRankMap = new Map(prevStandingsData.map(s => [s.teamId, s.rank]));

      progressCallback('Clearing existing derived tables...');
      const derivedCollections = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories'];
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
      users.forEach(u => allHistories[u.id] = { userId: u.id, weeklyScores: [] });

      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let bIdx = 0; let opCount = 0;
      const addOp = (op: (b: WriteBatch) => void) => {
          op(mainBatches[bIdx]); opCount++;
          if (opCount >= 499) { mainBatches.push(writeBatch(firestore)); bIdx++; opCount = 0; }
      };

      const playedWeeks = [0, ...new Set(allMatches.filter(m => m.homeScore > -1).map(m => m.week))].sort((a,b) => a-b);
      const latestWeek = playedWeeks[playedWeeks.length - 1];
      
      for (const week of playedWeeks) {
          progressCallback(`Processing Week ${week}...`);
          let tRanks = prevStandingsRankMap;
          const tStats: { [tId: string]: any } = {};
          teams.forEach(t => tStats[t.id] = { points: 0, gd: 0, gf: 0, ga: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });

          if (week > 0) {
              const weekMatches = allMatches.filter(m => m.week <= week && m.homeScore > -1);
              weekMatches.forEach(m => {
                  const h = tStats[m.homeTeamId]; const a = tStats[m.awayTeamId];
                  h.gf += m.homeScore; h.ga += m.awayScore; h.gd += (m.homeScore - m.awayScore); h.gamesPlayed++;
                  a.gf += m.awayScore; a.ga += m.homeScore; a.gd += (m.awayScore - m.homeScore); a.gamesPlayed++;
                  if (m.homeScore > m.awayScore) { h.points += 3; h.wins++; a.losses++; }
                  else if (m.homeScore < m.awayScore) { a.points += 3; a.wins++; h.losses++; }
                  else { h.points++; h.draws++; a.points++; a.draws++; }
              });
              const tRanked = Object.entries(tStats).map(([tId, s]) => ({ tId, ...s, name: teamMap.get(tId)?.name || '' }))
                  .sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
              tRanks = new Map(tRanked.map((s, i) => [s.tId, i + 1]));

              // Populate weekly standings for the graph
              tRanked.forEach((s, idx) => {
                  addOp(b => b.set(doc(firestore, 'weeklyTeamStandings', `wk${week}-${s.tId}`), { week, teamId: s.tId, rank: idx + 1 }));
              });

              // If this is the LATEST week, populate the main standings table
              if (week === latestWeek) {
                  tRanked.forEach((s, idx) => {
                      addOp(b => b.set(doc(firestore, 'standings', s.tId), { ...s, rank: idx + 1 }));
                      
                      // Recent Results (Last 6 matches)
                      const teamMatches = allMatches.filter(m => (m.homeTeamId === s.tId || m.awayTeamId === s.tId) && m.homeScore > -1)
                          .sort((a,b) => b.week - a.week).slice(0, 6);
                      const results = teamMatches.reverse().map(m => {
                          if (m.homeScore === m.awayScore) return 'D';
                          if (m.homeTeamId === s.tId) return m.homeScore > m.awayScore ? 'W' : 'L';
                          return m.awayScore > m.homeScore ? 'W' : 'L';
                      });
                      while (results.length < 6) results.unshift('-');
                      addOp(b => b.set(doc(firestore, 'teamRecentResults', s.tId), { teamId: s.tId, results }));
                  });
              }
          }

          const uScores: { [uId: string]: number } = {};
          users.forEach(u => {
              const pred = predictions.find(p => (p.userId || (p as any).id) === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = tRanks.get(tId);
                  if (actual) {
                      const points = (5 - Math.abs((idx + 1) - actual));
                      score += points;
                      // Only save breakdown for the latest week
                      if (week === latestWeek) {
                          addOp(b => b.set(doc(firestore, 'playerTeamScores', `${u.id}-${tId}`), { userId: u.id, teamId: tId, score: points }));
                      }
                  }
              });
              uScores[u.id] = score;
          });
          
          const uRanked = users.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  const aIsPro = a.isPro ? 1 : 0;
                  const bIsPro = b.isPro ? 1 : 0;
                  if (aIsPro !== bIsPro) return bIsPro - aIsPro; // Pros win ties
                  return (a.name || '').localeCompare(b.name || '');
              });
          
          const scoresOnly = uRanked.map(u => u.score);
          uRanked.forEach((u) => {
              const competitionRank = scoresOnly.indexOf(u.score) + 1;
              allHistories[u.id].weeklyScores.push({ week, score: u.score, rank: competitionRank });
          });
      }

      for (const u of users) {
          const hist = allHistories[u.id];
          const latest = hist.weeklyScores[hist.weeklyScores.length - 1];
          const prev = hist.weeklyScores[hist.weeklyScores.length - 2] || { score: 0, rank: 0 };
          const scores = hist.weeklyScores.map(s => s.score);
          const ranks = hist.weeklyScores.map(s => s.rank).filter(r => r > 0);
          
          addOp(b => b.set(doc(firestore, 'users', u.id), {
              score: latest.score, rank: latest.rank, previousScore: prev.score, previousRank: prev.rank,
              scoreChange: latest.score - prev.score, rankChange: prev.rank > 0 ? prev.rank - latest.rank : 0,
              maxScore: Math.max(...scores), minScore: Math.min(...scores),
              maxRank: Math.min(...ranks), minRank: Math.max(...ranks)
          }, { merge: true }));
          addOp(b => b.set(doc(firestore, 'userHistories', u.id), hist));
      }

      progressCallback("Committing updates to database...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Master Recalculation Complete.");
    } catch (e: any) { throw e; }
}
