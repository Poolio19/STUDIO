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
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { User, MonthlyMimoM, Match, Prediction } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Loader2, Swords } from 'lucide-react';
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
    const activeUserIds = new Set(predictionsData.map(p => p.userId || p.id));
    
    return [...usersData]
        .filter(u => u.name && (historicalUserIds.has(u.id) || u.isPro) && activeUserIds.has(u.id))
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const aIsPro = a.isPro ? 1 : 0;
            const bIsPro = b.isPro ? 1 : 0;
            if (aIsPro !== bIsPro) return bIsPro - aIsPro;
            return a.name.localeCompare(b.name);
        });
  }, [usersData, predictionsData]);

  const winningsMap = useMemo(() => {
    if (!sortedUsers.length || !monthlyMimoM) return new Map();
    const breakdown = new Map<string, { total: number, seasonal: number, monthly: number, proBounty: number }>();

    sortedUsers.forEach(u => breakdown.set(u.id, { total: 0, seasonal: 0, monthly: 0, proBounty: 0 }));

    const awardsMap: Record<string, { winners: string[], runnersUp: string[] }> = {};
    monthlyMimoM.forEach(m => {
        const key = m.special || `${m.month}-${m.year}`;
        if (!awardsMap[key]) awardsMap[key] = { winners: [], runnersUp: [] };
        if (m.type === 'winner') awardsMap[key].winners.push(m.userId);
        else if (m.type === 'runner-up') awardsMap[key].runnersUp.push(m.userId);
    });

    Object.values(awardsMap).forEach(award => {
        const winnerPrize = 10 / (award.winners.length || 1);
        award.winners.forEach(id => {
            const b = breakdown.get(id);
            if (b) { b.total += winnerPrize; b.monthly += winnerPrize; }
        });
        if (award.winners.length === 1 && award.runnersUp.length > 0) {
            const runnerUpPrize = 5 / award.runnersUp.length;
            award.runnersUp.forEach(id => {
                const b = breakdown.get(id);
                if (b) { b.total += runnerUpPrize; b.monthly += runnerUpPrize; }
            });
        }
    });

    let highestProScore = -1;
    sortedUsers.forEach(u => { if (u.isPro && u.score > highestProScore) highestProScore = u.score; });

    const pointsGroups: { score: number, players: User[], startOrdinal: number }[] = [];
    let currentOrdinal = 1;
    sortedUsers.forEach((u, i) => {
        if (i === 0 || u.score !== sortedUsers[i-1].score) {
            pointsGroups.push({ score: u.score, players: [u], startOrdinal: currentOrdinal });
        } else {
            pointsGroups[pointsGroups.length - 1].players.push(u);
        }
        currentOrdinal++;
    });

    const calculateTopTenPrizes = (sPool: number) => {
        const netSeasonalFund = 530 - 150 - 10 - sPool;
        const p10 = netSeasonalFund * 0.030073;
        let prizes: number[] = [p10];
        for (let i = 0; i < 9; i++) prizes.push(prizes[i] * 1.25);
        return prizes.reverse();
    };

    const tempSlayerList: string[] = [];
    pointsGroups.forEach(group => {
        const groupHasTopTenPrizes = group.players.some((pp, pIdx) => {
            const ord = group.startOrdinal + pIdx;
            return ord <= 10;
        });

        group.players.forEach((p, idx) => {
            const ord = group.startOrdinal + idx;
            if (!p.isPro && p.score > highestProScore && !groupHasTopTenPrizes && ord > 10) {
                tempSlayerList.push(p.id);
            }
        });
    });

    const slayerPoolTotal = Math.min(tempSlayerList.length * 5, 55);
    const individualBounty = tempSlayerList.length > 0 ? slayerPoolTotal / tempSlayerList.length : 0;
    const finalSeasonalPrizes = calculateTopTenPrizes(slayerPoolTotal);

    pointsGroups.forEach(group => {
        const regulars = group.players.filter(p => !p.isPro);
        if (regulars.length === 0) return;
        
        let groupRegPrizeTotal = 0;
        group.players.forEach((p, idx) => {
            const ord = group.startOrdinal + idx;
            if (!p.isPro && ord <= 10) {
                groupRegPrizeTotal += (finalSeasonalPrizes[ord-1] || 0);
            }
        });

        if (groupRegPrizeTotal > 0) {
            regulars.forEach(r => {
                const b = breakdown.get(r.id);
                if (b) { 
                    const share = groupRegPrizeTotal / regulars.length;
                    b.total += share; b.seasonal = share; 
                }
            });
        }
    });

    tempSlayerList.forEach(id => {
        const b = breakdown.get(id);
        if (b) { b.total += individualBounty; b.proBounty = individualBounty; }
    });

    return breakdown;
  }, [sortedUsers, monthlyMimoM]);

  const getRankColour = (user: User) => {
    if (user.isPro) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    const b = winningsMap.get(user.id);
    if (!b) return '';
    if (b.seasonal > 0) {
        const topOfGroup = sortedUsers.find(u => u.score === user.score);
        const compRank = sortedUsers.indexOf(topOfGroup!) + 1;
        if (compRank === 1) return 'bg-red-800 text-yellow-300';
        if (compRank <= 2) return 'bg-red-600 text-white';
        if (compRank <= 3) return 'bg-orange-700 text-white';
        if (compRank <= 4) return 'bg-orange-500 text-white';
        if (compRank <= 5) return 'bg-orange-300 text-orange-900';
        if (compRank <= 6) return 'bg-yellow-200 text-yellow-900';
        if (compRank <= 7) return 'bg-green-200 text-green-900';
        if (compRank <= 8) return 'bg-cyan-200 text-cyan-900';
        if (compRank <= 9) return 'bg-cyan-400 text-cyan-900';
        return 'bg-teal-400 text-teal-900';
    }
    if (b.proBounty > 0) return 'bg-blue-300 text-blue-900';
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
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-green-200/50 dark:bg-green-800/30 py-2">Change In The Past Week</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground bg-purple-200/50 dark:bg-purple-800/30 py-2">Seasons Highs And Lows</TableHead>
              </TableRow>
              <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-100/50 dark:bg-blue-900/20 py-2">Week {currentWeek}, Current Standings</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-blue-900/20 py-2">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-blue-900/20 py-2">Points</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-purple-100/50 dark:bg-blue-900/20 py-2">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground bg-purple-100/50 dark:bg-blue-900/20 py-2">Points</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[80px] bg-blue-50/50 dark:bg-blue-900/10 py-2 text-center">Pos</TableHead>
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
                  const b = winningsMap.get(user.id) || { total: 0, seasonal: 0, monthly: 0, proBounty: 0 };
                  const ScoreIcon = getRankChangeIcon(user.scoreChange);
                  const RankIcon = getRankChangeIcon(user.rankChange);
                  const isCurrentUser = user.id === resolvedUserId;

                  const topOfGroup = sortedUsers.find(u => u.score === user.score);
                  const competitionRank = sortedUsers.indexOf(topOfGroup!) + 1;

                  return (
                      <TableRow key={user.id} className={cn(getRankColour(user), { 'ring-2 ring-inset ring-primary z-10 relative bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.2)]': isCurrentUser })}>
                          <TableCell className={cn("font-medium text-center py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                            {competitionRank}
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-3">
                                <Avatar className={cn("transition-transform", isCurrentUser ? "h-10 w-10 border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "h-8 w-8")}>
                                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={cn("flex items-center gap-2 transition-all", isCurrentUser && "text-[1.1rem] font-extrabold drop-shadow-[0_0_10px_hsl(var(--primary))]")}>
                                    {user.isPro ? (user.name || '').toUpperCase() : user.name}
                                    {b.proBounty > 0 && <TooltipProvider><Tooltip><TooltipTrigger asChild><Swords className="size-4 text-primary animate-pulse cursor-help" /></TooltipTrigger><TooltipContent><p>Pro Slayer!</p></TooltipContent></Tooltip></TooltipProvider>}
                                </span>
                            </div>
                          </TableCell>
                          <TableCell className={cn("text-center font-bold py-1", isCurrentUser ? "text-xl font-black drop-shadow-[0_0_10px_hsl(var(--primary))]" : "text-lg")}>{user.score}</TableCell>
                          <TableCell className={cn("text-center font-medium border-r py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                            {user.isPro ? '-' : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4">
                                            {b.total > 0 ? `£${b.total.toFixed(2)}` : '£0.00'}
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="space-y-1">
                                            <p className="font-bold border-b pb-1 mb-1 text-xs">Breakdown</p>
                                            <div className="grid grid-cols-2 gap-x-4 text-xs">
                                                <span>Seasonal:</span><span className="text-right">£{b.seasonal.toFixed(2)}</span>
                                                <span>Monthly:</span><span className="text-right">£{b.monthly.toFixed(2)}</span>
                                                <span>Bounty:</span><span className="text-right">£{b.proBounty.toFixed(2)}</span>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.previousRank}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(user.rankChange))}>
                              <div className={cn("flex items-center justify-center gap-2", isCurrentUser && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                                  <span className={isCurrentUser ? "text-[1.1rem] font-black" : ""}>{Math.abs(user.rankChange)}</span>
                                  <RankIcon className="size-5" />
                              </div>
                          </TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow(0 0 8px hsl(var(--primary)))")}>{user.previousScore}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(user.scoreChange))}>
                              <div className={cn("flex items-center justify-center gap-2", isCurrentUser && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                                  <span className={isCurrentUser ? "text-[1.1rem] font-black" : ""}>{formatPointsChange(user.scoreChange)}</span>
                                  <ScoreIcon className="size-5" />
                              </div>
                          </TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.minRank}</TableCell>
                          <TableCell className={cn("text-center font-medium border-r py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.maxRank}</TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.maxScore}</TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.minScore}</TableCell>
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
