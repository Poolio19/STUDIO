
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User, MonthlyMimoM, Match, Prediction } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Loader2, Swords, Info } from 'lucide-react';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import historicalPlayersData from '@/lib/historical-players.json';


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

const prizeTiers = [50, 41, 33, 26, 20, 18, 16, 14, 12, 10];

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
    
    const historicalUserIds = new Set(historicalPlayersData.map(p => p.id));
    const activeUserIds = new Set(
      predictionsData
        .filter(p => p.rankings && p.rankings.length === 20)
        .map(p => p.userId || p.id)
    );

    return [...usersData]
        .filter(u => u.name && historicalUserIds.has(u.id) && activeUserIds.has(u.id))
        .sort((a, b) => a.rank - b.rank);
  }, [usersData, predictionsData]);
  
  const proPlayers = useMemo(() => sortedUsers.filter(u => u.isPro), [sortedUsers]);
  const regularPlayers = useMemo(() => sortedUsers.filter(u => !u.isPro), [sortedUsers]);

  const bestProRank = useMemo(() => {
    if (proPlayers.length === 0) return Infinity;
    return Math.min(...proPlayers.map(p => p.rank));
  }, [proPlayers]);

  const winningsBreakdownMap = useMemo(() => {
    if (!usersData || !monthlyMimoM) return new Map();
    const breakdown = new Map<string, { total: number, seasonal: number, monthly: number, proBounty: number }>();
    const userMap = new Map(usersData.map(u => [u.id, u]));
    
    sortedUsers.forEach(u => breakdown.set(u.id, { total: 0, seasonal: 0, monthly: 0, proBounty: 0 }));

    const monthlyAwards: { [key: string]: { winners: string[], runnersUp: string[] } } = {};
    monthlyMimoM.forEach(m => {
        if (m.type !== 'winner' && m.type !== 'runner-up') return;
        const key = m.special ? m.special : `${m.month}-${m.year}`;
        if (!monthlyAwards[key]) monthlyAwards[key] = { winners: [], runnersUp: [] };
        if (m.type === 'winner') monthlyAwards[key].winners.push(m.userId);
        else if (m.type === 'runner-up') monthlyAwards[key].runnersUp.push(m.userId);
    });

    Object.values(monthlyAwards).forEach(award => {
        const winnerPrize = 10 / (award.winners.length || 1);
        award.winners.forEach(userId => {
            const current = breakdown.get(userId) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
            breakdown.set(userId, { ...current, total: current.total + winnerPrize, monthly: current.monthly + winnerPrize });
        });
        if (award.winners.length === 1 && award.runnersUp.length > 0) {
            const runnerUpPrize = 5 / award.runnersUp.length;
            award.runnersUp.forEach(userId => {
                const current = breakdown.get(userId) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
                breakdown.set(userId, { ...current, total: current.total + runnerUpPrize, monthly: current.monthly + runnerUpPrize });
            });
        }
    });
    
    const pointsGroups = new Map<number, string[]>();
    sortedUsers.forEach(u => {
        const group = pointsGroups.get(u.score) || [];
        group.push(u.id);
        pointsGroups.set(u.score, group);
    });

    let currentGlobalIndex = 0;
    const processedScores = new Set<number>();

    sortedUsers.forEach((user) => {
        if (processedScores.has(user.score)) return;
        processedScores.add(user.score);

        const groupUserIds = pointsGroups.get(user.score) || [];
        const groupSize = groupUserIds.length;
        const hasProInGroup = groupUserIds.some(id => userMap.get(id)?.isPro);
        const regularPlayersInGroup = groupUserIds.filter(id => !userMap.get(id)?.isPro);
        
        if (regularPlayersInGroup.length > 0) {
            let individualShare = 0;
            if (!hasProInGroup) {
                const poolPrize = groupUserIds.reduce((sum, id, indexWithinGroup) => {
                    const globalRankIndex = currentGlobalIndex + indexWithinGroup;
                    const isPro = userMap.get(id)?.isPro;
                    if (!isPro && globalRankIndex < prizeTiers.length) {
                        return sum + prizeTiers[globalRankIndex];
                    }
                    return sum;
                }, 0);

                individualShare = poolPrize / regularPlayersInGroup.length;
            }
            
            regularPlayersInGroup.forEach(userId => {
                const current = breakdown.get(userId) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
                breakdown.set(userId, { ...current, total: current.total + individualShare, seasonal: current.seasonal + individualShare });
            });
        }

        currentGlobalIndex += groupSize;
    });

    const totalRegularPlayers = regularPlayers.length;
    const bountyCapCount = Math.ceil(totalRegularPlayers * 0.1); 
    const totalBountyPool = bountyCapCount * 5; 
    
    const proSlayers = regularPlayers.filter(player => player.rank > 10 && player.rank < bestProRank);
    const individualBounty = proSlayers.length > 0 ? (totalBountyPool / proSlayers.length) : 0;

    if (proPlayers.length > 0) {
      proSlayers.forEach(player => {
          const current = breakdown.get(player.id) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
          breakdown.set(player.id, { 
              ...current, 
              total: current.total + individualBounty, 
              proBounty: current.proBounty + individualBounty 
          });
      });
    }

    return breakdown;
  }, [regularPlayers, proPlayers, usersData, monthlyMimoM, bestProRank, sortedUsers]);

  const getRankColour = (user: User) => {
    if (user.isPro) {
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80';
    }

    const breakdown = winningsBreakdownMap.get(user.id);
    
    if (breakdown && breakdown.seasonal > 0) {
        const groupBestRank = sortedUsers.find(u => u.score === user.score)?.rank || user.rank;
        const effectiveRank = Math.min(groupBestRank, 10);
        
        switch (effectiveRank) {
            case 1: return 'bg-red-800 text-yellow-300 hover:bg-red-800/90 dark:bg-red-900 dark:text-yellow-300 dark:hover:bg-red-900/90';
            case 2: return 'bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-700 dark:text-white dark:hover:bg-red-700/90';
            case 3: return 'bg-orange-700 text-white hover:bg-orange-700/90 dark:bg-orange-800 dark:text-white dark:hover:bg-orange-800/90';
            case 4: return 'bg-orange-500 text-white hover:bg-orange-500/90 dark:bg-orange-600 dark:text-white dark:hover:bg-orange-600/90';
            case 5: return 'bg-orange-300 text-orange-900 hover:bg-orange-300/90 dark:bg-orange-500/50 dark:text-white';
            case 6: return 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/90 dark:bg-yellow-800/30 dark:text-yellow-200';
            case 7: return 'bg-green-200 text-green-900 hover:bg-green-200/90 dark:bg-green-800/30 dark:text-green-200';
            case 8: return 'bg-cyan-200 text-cyan-900 hover:bg-cyan-200/90 dark:bg-cyan-800/30 dark:text-cyan-200';
            case 9: return 'bg-cyan-400 text-cyan-900 hover:bg-cyan-400/90 dark:bg-cyan-500/50 dark:text-white';
            case 10: return 'bg-teal-400 text-teal-900 hover:bg-teal-400/90 dark:bg-teal-600/50 dark:text-white';
        }
    }

    if (breakdown && breakdown.proBounty > 0) {
        return 'bg-blue-300 text-blue-900 hover:bg-blue-300/90 dark:bg-blue-800/40 dark:text-blue-200';
    }
    
    if (breakdown && breakdown.total > 0) {
        return 'bg-blue-100 text-blue-900 hover:bg-blue-100/90 dark:bg-blue-900/30 dark:text-blue-300';
    }

    return '';
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
                <TableHead className="text-center border-r bg-blue-50/50 dark:bg-blue-900/10 py-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center justify-center gap-1 w-full font-bold">
                                Winnings <Info className="size-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Potential seasonal winnings including shared rank prizes, monthly awards, and Shared Pro Bounties.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10 py-2">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10 py-2">Move</TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10 py-2">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10 py-2">Change</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">High</TableHead>
                <TableHead className="text-center border-r bg-purple-50/50 dark:bg-purple-900/10 py-2">Low</TableHead>
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
                sortedUsers.map((user, index) => {
                  const RankIcon = getRankChangeIcon(user.rankChange);
                  const ScoreIcon = getRankChangeIcon(user.scoreChange);
                  const breakdown = winningsBreakdownMap.get(user.id) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
                  const isCurrentUser = user.id === resolvedUserId;
                  const isBountyWinner = breakdown.proBounty > 0;
                  const displayRank = sortedUsers.find(u => u.score === user.score)?.rank || user.rank;

                  return (
                      <TableRow key={user.id} className={cn(getRankColour(user), { 'font-bold ring-2 ring-inset ring-primary z-10 relative': isCurrentUser })}>
                          <TableCell className="font-medium text-center py-1">{displayRank}</TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name || 'User'} data-ai-hint="person" />
                                <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="flex items-center gap-2">
                                    {user.isPro ? (user.name || '').toUpperCase() : user.name}
                                    {isBountyWinner && !user.isPro && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Swords className="size-4 text-primary animate-pulse" /></TooltipTrigger>
                                                <TooltipContent><p>Pro Slayer Bounty Winner!</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg py-1">{user.score}</TableCell>
                          <TableCell className="text-center font-medium border-r py-1">
                            {user.isPro ? '-' : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4">
                                            {breakdown.total > 0 ? `£${breakdown.total.toFixed(2)}` : '£0.00'}
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="space-y-1">
                                            <p className="font-bold border-b pb-1 mb-1 text-xs">Prize Breakdown</p>
                                            <div className="grid grid-cols-2 gap-x-4 text-xs">
                                                <span>Seasonal Rank:</span><span className="text-right">£{breakdown.seasonal.toFixed(2)}</span>
                                                <span>Monthly Awards:</span><span className="text-right">£{breakdown.monthly.toFixed(2)}</span>
                                                <span className="font-bold text-primary">Pro Bounty:</span><span className="text-right font-bold text-primary">£{breakdown.proBounty.toFixed(2)}</span>
                                            </div>
                                            {isBountyWinner && (
                                                <p className="text-[10px] text-muted-foreground pt-1 italic">
                                                    * Bounty is your share of the shared Pro-Slayer pool.
                                                </p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
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
