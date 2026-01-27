'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User, CurrentStanding, MonthlyMimoM, Match, Prediction } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';


const getRankChangeIcon = (change: number) => {
  if (change > 0) return ArrowUp;
  if (change < 0) return ArrowDown;
  return Minus;
};

const getRankChangeColour = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
}

const formatPointsChange = (change: number) => {
    if (change > 0) return `+${change}`;
    return change;
}

const prizeTiers = [50, 41, 33, 26, 20];

const totalWinningsMap = new Map<string, number>();

export default function LeaderboardPage() {
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('rank', 'asc')) : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'matches')) : null, [firestore]);
  const mimoMQuery = useMemoFirebase(() => firestore ? collection(firestore, 'monthlyMimoM') : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);

  const { data: usersData, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: monthlyMimoM, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);
  const { data: predictionsData, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);

  const isLoading = usersLoading || matchesLoading || mimoMLoading || predictionsLoading;
  
  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
      return Math.max(...playedMatches.map(m => m.week), 0);
    }
    return 0;
  }, [matchesData]);

  const sortedUsers = useMemo(() => {
    if (!usersData || !predictionsData) return [];
    const activeUserIds = new Set(predictionsData.map(p => p.userId));
    return [...usersData]
        .filter(u => u.name && activeUserIds.has(u.id))
        .sort((a, b) => a.rank - b.rank);
  }, [usersData, predictionsData]);
  
  const proPlayers = useMemo(() => sortedUsers.filter(u => u.isPro), [sortedUsers]);
  const regularPlayers = useMemo(() => sortedUsers.filter(u => !u.isPro), [sortedUsers]);

  const bestProRank = useMemo(() => {
    if (proPlayers.length === 0) return Infinity; // No pros, so no one can beat them.
    return Math.min(...proPlayers.map(p => p.rank));
  }, [proPlayers]);

  const localTotalWinningsMap = useMemo(() => {
    if (!usersData || !monthlyMimoM) return new Map();
    const mimoMWinnings = new Map<string, number>();
    const monthlyAwards: { [key: string]: { winners: string[], runnersUp: string[] } } = {};

    monthlyMimoM.forEach(m => {
        if (m.type !== 'winner' && m.type !== 'runner-up') return;

        const key = m.special ? m.special : `${m.month}-${m.year}`;
        if (!monthlyAwards[key]) {
            monthlyAwards[key] = { winners: [], runnersUp: [] };
        }
        if (m.type === 'winner') {
            monthlyAwards[key].winners.push(m.userId);
        } else if (m.type === 'runner-up') {
            monthlyAwards[key].runnersUp.push(m.userId);
        }
    });

    Object.values(monthlyAwards).forEach(award => {
        const winnerPrize = 10 / (award.winners.length || 1);
        award.winners.forEach(userId => {
            mimoMWinnings.set(userId, (mimoMWinnings.get(userId) || 0) + winnerPrize);
        });

        if (award.winners.length === 1 && award.runnersUp.length > 0) {
            const runnerUpPrize = 5 / award.runnersUp.length;
            award.runnersUp.forEach(userId => {
                mimoMWinnings.set(userId, (mimoMWinnings.get(userId) || 0) + runnerUpPrize);
            });
        }
    });
    
    const leaderboardWinnings = new Map<string, number>();
    
    let playerIndex = 0;
    while(playerIndex < regularPlayers.length) {
        const player = regularPlayers[playerIndex];
        const playersAtSameRank = regularPlayers.filter(p => p.rank === player.rank);
        
        const prizePoolRanks = Array.from({ length: playersAtSameRank.length }, (_, i) => playerIndex + i);
        
        const prizePool = prizePoolRanks.reduce((sum, rankIndex) => {
            return sum + (prizeTiers[rankIndex] || 0);
        }, 0);

        const individualWinnings = prizePool > 0 ? prizePool / playersAtSameRank.length : 0;

        playersAtSameRank.forEach(tiedPlayer => {
            leaderboardWinnings.set(tiedPlayer.id, individualWinnings);
        });

        playerIndex += playersAtSameRank.length;
    }

    const proWinnings = new Map<string, number>();
    if (proPlayers.length > 0) {
      const bestPro = Math.min(...proPlayers.map(p => p.rank));
      regularPlayers.forEach(player => {
          if (player.rank > 0 && player.rank < bestPro) {
              proWinnings.set(player.id, 5);
          }
      });
    }

    const calculatedTotalWinnings = new Map<string, number>();
    [...regularPlayers, ...proPlayers].forEach(user => {
      if (user.isPro) {
        calculatedTotalWinnings.set(user.id, 0);
      } else {
        const lbWinnings = leaderboardWinnings.get(user.id) || 0;
        const mmWinnings = mimoMWinnings.get(user.id) || 0;
        const pWinnings = proWinnings.get(user.id) || 0;
        calculatedTotalWinnings.set(user.id, lbWinnings + mmWinnings + pWinnings);
      }
    });
    
    // Update global map
    calculatedTotalWinnings.forEach((value, key) => {
        totalWinningsMap.set(key, value);
    });

    return calculatedTotalWinnings;
  }, [regularPlayers, proPlayers, usersData, monthlyMimoM]);

    const getRankColour = (user: User) => {
    // Pro players have a distinct style and are not part of the main prize ranking
    if (user.isPro) {
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80';
    }

    // Rank-based colors take precedence for non-pro players
    // This now correctly uses the rank property which handles ties after recalculation
    switch (user.rank) {
        case 1: return 'bg-red-800 text-yellow-300 hover:bg-red-800/90 dark:bg-red-900 dark:text-yellow-300 dark:hover:bg-red-900/90'; // Crimson with yellow font
        case 2: return 'bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-700 dark:hover:bg-red-700/90'; // Red
        case 3: return 'bg-orange-700 text-white hover:bg-orange-700/90 dark:bg-orange-800 dark:hover:bg-orange-800/90'; // Dark Orange
        case 4: return 'bg-orange-500 text-white hover:bg-orange-500/90 dark:bg-orange-600 dark:hover:bg-orange-600/90'; // Mid Orange
        case 5: return 'bg-orange-300 text-orange-900 hover:bg-orange-300/90 dark:bg-orange-500/50 dark:text-white'; // Light orange / peach
        case 6: return 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/90 dark:bg-yellow-800/30 dark:text-yellow-200'; // Pale Yellow
        case 7: return 'bg-green-200 text-green-900 hover:bg-green-200/90 dark:bg-green-800/30 dark:text-green-200'; // Pale Green
        case 8: return 'bg-cyan-200 text-cyan-900 hover:bg-cyan-200/90 dark:bg-cyan-800/30 dark:text-cyan-200'; // Pale Cyan
        case 9: return 'bg-cyan-400 text-cyan-900 hover:bg-cyan-400/90 dark:bg-cyan-500/50 dark:text-white'; // Cyan
        case 10: return 'bg-teal-400 text-teal-900 hover:bg-teal-400/90 dark:bg-teal-600/50 dark:text-white'; // Deep cyan/teal
        default:
            // Fall through if not in top 10
            break;
    }

    // "Beating The Pros" condition
    // This includes players who are tied with the best pro player
    if (user.rank <= bestProRank) {
        return 'bg-blue-300 text-blue-900 hover:bg-blue-300/90 dark:bg-blue-800/40 dark:text-blue-200'; // Light Blue
    }
    
    // Winnings condition (for players outside the top 10 and not beating pros)
    const totalWinnings = localTotalWinningsMap.get(user.id) || 0;
    if (totalWinnings > 0) {
        return 'bg-blue-100 text-blue-900 hover:bg-blue-100/90 dark:bg-blue-900/30 dark:text-blue-300'; // Very Pale Blue
    }

    // Default for everyone else
    return ''; // white/transparent
};

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
               <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-200/50 dark:bg-blue-800/30 py-2">PremPred Standings</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-green-200/50 dark:bg-green-800/30 py-2">Changes In The Past Week</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground bg-purple-200/50 dark:bg-purple-800/30 py-2">Seasons Highs And Lows</TableHead>
              </TableRow>
              <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-100/50 dark:bg-blue-900/20 py-2">Week {currentWeek}, Current Standings</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-green-900/20 py-2">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-green-900/20 py-2">Points</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-purple-100/50 dark:bg-purple-900/20 py-2">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground bg-purple-100/50 dark:bg-purple-900/20 py-2">Points</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[80px] bg-blue-50/50 dark:bg-blue-900/10 py-2">Position</TableHead>
                <TableHead className="bg-blue-50/50 dark:bg-blue-900/10 py-2">Player</TableHead>
                <TableHead className="text-center bg-blue-50/50 dark:bg-blue-900/10 py-2">Points</TableHead>
                <TableHead className="text-center border-r bg-blue-50/50 dark:bg-blue-900/10 py-2">Winnings</TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10 py-2">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10 py-2">Move</TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10 py-2">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10 py-2">Change</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">High</TableHead>
                <TableHead className="text-center border-r bg-purple-5-50/50 dark:bg-purple-900/10 py-2">Low</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">High</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">Low</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center h-48">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-5 animate-spin" />
                      <span>Loading leaderboard...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => {
                  const RankIcon = getRankChangeIcon(user.rankChange);
                  const ScoreIcon = getRankChangeIcon(user.scoreChange);
                  const userWinnings = localTotalWinningsMap.get(user.id) || 0;
                  const isCurrentUser = user.id === resolvedUserId;
                  
                  return (
                      <TableRow key={user.id} className={cn(getRankColour(user), { 'font-bold ring-2 ring-inset ring-primary z-10 relative': isCurrentUser })}>
                          <TableCell className="font-medium text-center py-1">{user.rank}</TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name || 'User'} data-ai-hint="person" />
                                <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.isPro ? (user.name || '').toUpperCase() : user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg py-1">{user.score}</TableCell>
                          <TableCell className="text-center font-medium border-r py-1">
                            {user.isPro ? '-' : (userWinnings > 0 ? `£${userWinnings.toFixed(2)}` : '£0.00')}
                          </TableCell>
                          <TableCell className="text-center font-medium py-1">{user.previousRank}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(user.rankChange))}>
                              <div className="flex items-center justify-center gap-2">
                                  <span>{Math.abs(user.rankChange)}</span>
                                  <RankIcon className="size-5" />
                              </div>
                          </TableCell>
                          <TableCell className="text-center font-medium py-1">{user.previousScore}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(user.scoreChange))}>
                              <div className="flex items-center justify-center gap-2">
                                  <span>{formatPointsChange(user.scoreChange)}</span>
                                  <ScoreIcon className="size-5" />
                              </div>
                          </TableCell>
                          <TableCell className="text-center font-medium py-1">{user.minRank}</TableCell>
                          <TableCell className="text-center font-medium border-r py-1">{user.maxRank}</TableCell>
                          <TableCell className="text-center font-medium py-1">{user.maxScore}</TableCell>
                          <TableCell className="text-center font-medium py-1">{user.minScore}</TableCell>
                      </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
