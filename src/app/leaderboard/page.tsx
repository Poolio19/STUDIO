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

    // Filter for active entries and sort by Rank (ordinal rank set by engine)
    return [...usersData]
        .filter(u => u.name && (historicalUserIds.has(u.id) || u.isPro) && activeUserIds.has(u.id))
        .sort((a, b) => a.rank - b.rank);
  }, [usersData, predictionsData]);

  const winningsBreakdownMap = useMemo(() => {
    if (!usersData || !monthlyMimoM || sortedUsers.length === 0) return new Map();
    
    const breakdown = new Map<string, { total: number, seasonal: number, monthly: number, proBounty: number, visualRankId: number }>();
    sortedUsers.forEach(u => breakdown.set(u.id, { total: 0, seasonal: 0, monthly: 0, proBounty: 0, visualRankId: 0 }));

    // --- 1. Monthly Awards (£15 per month pool) ---
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
            const current = breakdown.get(userId)!;
            current.total += winnerPrize;
            current.monthly += winnerPrize;
        });
        if (award.winners.length === 1 && award.runnersUp.length > 0) {
            const runnerUpPrize = 5 / award.runnersUp.length;
            award.runnersUp.forEach(userId => {
                const current = breakdown.get(userId)!;
                current.total += runnerUpPrize;
                current.monthly += runnerUpPrize;
            });
        }
    });

    // --- 2. Calculate Pro-Slayer Bounty Variance ---
    // A regular player is a slayer if they strictly outrank ALL pros and are NOT in Top 10 (ordinal rank > 10)
    const proRanks = sortedUsers.filter(u => u.isPro).map(u => u.rank);
    const bestProRank = proRanks.length > 0 ? Math.min(...proRanks) : Infinity;
    
    const slayers = sortedUsers.filter(u => !u.isPro && u.rank < bestProRank && u.rank > 10);
    const totalBountyReduction = slayers.length * 5;

    // --- 3. Calculate Seasonal Prize Tiers ---
    const totalPot = 530.00; // 106 players * £5
    const fixedReductions = 150.00 + 10.00; // MiMoM (£150) + Xmas (£10)
    const netSeasonalFund = totalPot - fixedReductions - totalBountyReduction;

    const p10 = netSeasonalFund * 0.030073;
    const tierPrizes: number[] = [p10];
    for (let i = 0; i < 9; i++) {
        tierPrizes.push(tierPrizes[i] * 1.25);
    }
    const seasonalPrizes = tierPrizes.reverse(); // [p1, p2, ..., p10]

    // --- 4. Allocate Seasonal Rank Prizes (Pro Consumption) ---
    const pointsGroups = new Map<number, User[]>();
    sortedUsers.forEach(u => {
        const group = pointsGroups.get(u.score) || [];
        group.push(u);
        pointsGroups.set(u.score, group);
    });

    pointsGroups.forEach((groupUsers) => {
        const regularPlayersInGroup = groupUsers.filter(u => !u.isPro);
        if (regularPlayersInGroup.length === 0) return;

        // Group members sharing a prize will share the highest rank's color
        const topOrdinalRankInGroup = Math.min(...groupUsers.map(u => u.rank));
        
        // Sum prizes for the specific ordinal ranks occupied by REGULAR players
        const sharedPool = regularPlayersInGroup.reduce((sum, u) => {
            if (u.rank <= 10) return sum + seasonalPrizes[u.rank - 1];
            return sum;
        }, 0);

        if (sharedPool > 0) {
            const individualShare = sharedPool / regularPlayersInGroup.length;
            regularPlayersInGroup.forEach(u => {
                const current = breakdown.get(u.id)!;
                current.total += individualShare;
                current.seasonal += individualShare;
                // Assign visualRankId based on the highest rank in the SHARED PRIZE group
                current.visualRankId = topOrdinalRankInGroup;
            });
        }
    });

    // --- 5. Apply Pro-Slayer Bounties ---
    slayers.forEach(u => {
        const current = breakdown.get(u.id)!;
        current.total += 5.00;
        current.proBounty += 5.00;
    });

    return breakdown;
  }, [sortedUsers, monthlyMimoM]);

  const getRankColour = (user: User) => {
    if (user.isPro) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    const breakdown = winningsBreakdownMap.get(user.id);
    if (!breakdown || breakdown.visualRankId === 0) {
        if (breakdown?.proBounty && breakdown.proBounty > 0) return 'bg-blue-300 text-blue-900';
        return '';
    }

    // Color based on the highest rank in the shared points group
    switch (breakdown.visualRankId) {
        case 1: return 'bg-red-800 text-yellow-300 hover:bg-red-800/90';
        case 2: return 'bg-red-600 text-white hover:bg-red-600/90';
        case 3: return 'bg-orange-700 text-white hover:bg-orange-700/90';
        case 4: return 'bg-orange-500 text-white hover:bg-orange-500/90';
        case 5: return 'bg-orange-300 text-orange-900 hover:bg-orange-300/90';
        case 6: return 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/90';
        case 7: return 'bg-green-200 text-green-900 hover:bg-green-200/90';
        case 8: return 'bg-cyan-200 text-cyan-900 hover:bg-cyan-200/90';
        case 9: return 'bg-cyan-400 text-cyan-900 hover:bg-cyan-400/90';
        case 10: return 'bg-teal-400 text-teal-900 hover:bg-teal-400/90';
        default: return '';
    }
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
                <TableHead className="text-center border-r bg-purple-50/50 dark:bg-purple-900/10 py-2">Low</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">High</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10 py-2">Low</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={12} className="text-center h-48"><div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" /><span>Loading leaderboard...</span></div></TableCell></TableRow>
              ) : (
                sortedUsers.map((user) => {
                  const breakdown = winningsBreakdownMap.get(user.id) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
                  const RankIcon = getRankChangeIcon(user.rankChange);
                  const ScoreIcon = getRankChangeIcon(user.scoreChange);
                  const isCurrentUser = user.id === resolvedUserId;
                  
                  // Visual Display Rank: Highest ordinal rank in the points group
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
                                    {breakdown.proBounty > 0 && <TooltipProvider><Tooltip><TooltipTrigger><Swords className="size-4 text-primary animate-pulse" /></TooltipTrigger><TooltipContent><p>Pro Slayer!</p></TooltipContent></Tooltip></TooltipProvider>}
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
                                            <p className="font-bold border-b pb-1 mb-1 text-xs">Breakdown</p>
                                            <div className="grid grid-cols-2 gap-x-4 text-xs">
                                                <span>Seasonal:</span><span className="text-right">£{breakdown.seasonal.toFixed(2)}</span>
                                                <span>Monthly:</span><span className="text-right">£{breakdown.monthly.toFixed(2)}</span>
                                                <span>Bounty:</span><span className="text-right">£{breakdown.proBounty.toFixed(2)}</span>
                                            </div>
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
