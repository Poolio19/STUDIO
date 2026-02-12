
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
 * Logic:
 * 1. Pros win ties (Ordinal sorting: Score DESC, isPro DESC, Name ASC).
 * 2. Visual competition rank stored in history (1, 2, 2, 4...).
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
      const activeUserIds = new Set(predictions.filter(p => p.rankings?.length === 20).map(p => p.userId));
      const users = allUsers.filter(u => activeUserIds.has(u.id) && (historicalUserIds.has(u.id) || u.isPro));
      const prevStandingsRankMap = new Map(prevStandingsData.map(s => [s.teamId, s.rank]));

      progressCallback('Clearing tables...');
      const collections = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM', 'seasonMonths'];
      for (const colName of collections) {
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
      
      for (const week of playedWeeks) {
          progressCallback(`Week ${week}...`);
          let tRanks = prevStandingsRankMap;
          if (week > 0) {
              const matches = allMatches.filter(m => m.week <= week && m.homeScore > -1);
              const tStats: { [tId: string]: any } = {};
              teams.forEach(t => tStats[t.id] = { points: 0, gd: 0, gf: 0 });
              matches.forEach(m => {
                  const h = tStats[m.homeTeamId]; const a = tStats[m.awayTeamId];
                  h.gf += m.homeScore; h.gd += (m.homeScore - m.awayScore);
                  a.gf += m.awayScore; a.gd += (m.awayScore - m.homeScore);
                  if (m.homeScore > m.awayScore) h.points += 3;
                  else if (m.homeScore < m.awayScore) a.points += 3;
                  else { h.points++; a.points++; }
              });
              const tRanked = Object.entries(tStats).map(([tId, s]) => ({ tId, ...s, name: teamMap.get(tId)?.name || '' }))
                  .sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
              tRanks = new Map(tRanked.map((s, i) => [s.tId, i + 1]));
          }

          const uScores: { [uId: string]: number } = {};
          users.forEach(u => {
              const pred = predictions.find(p => p.userId === u.id);
              let score = 0;
              pred?.rankings.forEach((tId, idx) => {
                  const actual = tRanks.get(tId);
                  if (actual) score += (5 - Math.abs((idx + 1) - actual));
              });
              uScores[u.id] = score;
          });
          
          // CRITICAL: Sort for ordinal: Score (Desc), Pros (Desc), Name (Asc)
          const uRanked = users.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  const aIsPro = a.isPro ? 1 : 0;
                  const bIsPro = b.isPro ? 1 : 0;
                  if (aIsPro !== bIsPro) return bIsPro - aIsPro; // Pros always win ties
                  return a.name.localeCompare(b.name);
              });
          
          const scoresOnly = uRanked.map(u => u.score);
          uRanked.forEach((u) => {
              // Visual rank uses competition ranking (1, 2, 2, 4)
              const visualRank = scoresOnly.indexOf(u.score) + 1;
              allHistories[u.id].weeklyScores.push({ week, score: u.score, rank: visualRank });
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

      progressCallback("Saving...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Complete.");
    } catch (e: any) { throw e; }
}
