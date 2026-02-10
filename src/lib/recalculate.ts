
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
 * Recalculates all derived data based on raw matches and predictions.
 * Strictly enforces:
 * 1. Pros always win ties (Sorted higher in ordinal ranks).
 * 2. Standard Competition Ranking for visuals (1, 2, 2, 4...).
 */
export async function recalculateAllDataClientSide(
  firestore: Firestore,
  progressCallback: (message: string) => void
) {
    try {
      progressCallback("Starting full data recalculation...");
  
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
      const activeUserIds = new Set(
        predictions
          .filter(p => p.rankings && p.rankings.length === 20)
          .map(p => p.userId)
      );
      
      const users = allUsers.filter(u => activeUserIds.has(u.id) && (historicalUserIds.has(u.id) || u.isPro));
      const prevStandingsRankMap = new Map(prevStandingsData.map(s => [s.teamId, s.rank]));

      // Clear derived data
      progressCallback('Clearing derived data...');
      const collectionsToClear = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM', 'seasonMonths'];
      for (const collectionName of collectionsToClear) {
          const snapshot = await getDocs(collection(firestore, collectionName));
          if (snapshot.empty) continue;
          let deleteBatch = writeBatch(firestore);
          let deleteCount = 0;
          for (const docSnapshot of snapshot.docs) {
              deleteBatch.delete(docSnapshot.ref);
              deleteCount++;
              if (deleteCount === 499) { await deleteBatch.commit(); deleteBatch = writeBatch(firestore); deleteCount = 0; }
          }
          if (deleteCount > 0) await deleteBatch.commit();
      }
      
      const allUserHistories: { [userId: string]: UserHistory } = {};
      users.forEach(u => allUserHistories[u.id] = { userId: u.id, weeklyScores: [] });

      let mainBatches: WriteBatch[] = [writeBatch(firestore)];
      let currentBatchIndex = 0;
      let operationCount = 0;
      const addOperation = (op: (b: WriteBatch) => void) => {
          op(mainBatches[currentBatchIndex]);
          operationCount++;
          if (operationCount >= 499) { mainBatches.push(writeBatch(firestore)); currentBatchIndex++; operationCount = 0; }
      };

      // Week 0: Reference Week
      const userScores0: { [uId: string]: number } = {};
      users.forEach(u => {
          const pred = predictions.find(p => p.userId === u.id);
          let score = 0;
          pred?.rankings.forEach((tId, idx) => {
              const actual = prevStandingsRankMap.get(tId);
              if (actual) score += (5 - Math.abs((idx + 1) - actual));
          });
          userScores0[u.id] = score;
      });
      
      // Sort: Score DESC, Pros first DESC, Name ASC
      const ranked0 = users.map(u => ({...u, score: userScores0[u.id]}))
          .sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              if (a.isPro && !b.isPro) return -1;
              if (!a.isPro && b.isPro) return 1;
              return a.name.localeCompare(b.name);
          });
      ranked0.forEach((u, i) => allUserHistories[u.id].weeklyScores.push({ week: 0, score: u.score, rank: i + 1 }));

      const playedWeeks = [...new Set(allMatches.filter(m => m.homeScore > -1).map(m => m.week))].sort((a,b) => a-b);
      for (const week of playedWeeks) {
          progressCallback(`Processing Week ${week}...`);
          const matches = allMatches.filter(m => m.week <= week && m.homeScore > -1);
          const tStats: { [tId: string]: any } = {};
          teams.forEach(t => tStats[t.id] = { points: 0, gd: 0, gf: 0, wins: 0, draws: 0, losses: 0, played: 0 });
          matches.forEach(m => {
              const h = tStats[m.homeTeamId]; const a = tStats[m.awayTeamId];
              h.played++; a.played++; h.gf += m.homeScore; h.gd += (m.homeScore - m.awayScore);
              a.gf += m.awayScore; a.gd += (m.awayScore - m.homeScore);
              if (m.homeScore > m.awayScore) { h.points += 3; h.wins++; a.losses++; }
              else if (m.homeScore < m.awayScore) { a.points += 3; a.wins++; h.losses++; }
              else { h.points++; a.points++; h.draws++; a.draws++; }
          });
          const tRanked = Object.entries(tStats).map(([tId, s]) => ({ tId, ...s, name: teamMap.get(tId)?.name || '' }))
              .sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
          const tRanks = new Map(tRanked.map((s, i) => [s.tId, i + 1]));

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
          
          const uRanked = users.map(u => ({...u, score: uScores[u.id]}))
              .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  if (a.isPro && !b.isPro) return -1;
                  if (!a.isPro && b.isPro) return 1;
                  return a.name.localeCompare(b.name);
              });
          uRanked.forEach((u, i) => allUserHistories[u.id].weeklyScores.push({ week, score: u.score, rank: i + 1 }));
      }

      // Save Final States
      for (const u of users) {
          const hist = allUserHistories[u.id];
          const latest = hist.weeklyScores[hist.weeklyScores.length - 1];
          const prev = hist.weeklyScores[hist.weeklyScores.length - 2] || { score: 0, rank: 0 };
          const scores = hist.weeklyScores.map(s => s.score);
          const ranks = hist.weeklyScores.map(s => s.rank).filter(r => r > 0);
          
          addOperation(b => b.set(doc(firestore, 'users', u.id), {
              score: latest.score, rank: latest.rank, previousScore: prev.score, previousRank: prev.rank,
              scoreChange: latest.score - prev.score, rankChange: prev.rank > 0 ? prev.rank - latest.rank : 0,
              maxScore: Math.max(...scores), minScore: Math.min(...scores),
              maxRank: Math.max(...ranks), minRank: Math.min(...ranks)
          }, { merge: true }));
          addOperation(b => b.set(doc(firestore, 'userHistories', u.id), hist));
      }

      progressCallback("Committing data...");
      await Promise.all(mainBatches.map(b => b.commit()));
      progressCallback("Complete.");
    } catch (e: any) { progressCallback("Error: " + e.message); throw e; }
}
