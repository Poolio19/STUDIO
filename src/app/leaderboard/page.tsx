
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
    const activeUserIds = new Set(predictionsData.filter(p => p.rankings?.length === 20).map(p => p.userId || (p as any).id));
    
    return [...usersData]
        .filter(u => u.name && (historicalUserIds.has(u.id) || u.isPro) && activeUserIds.has(u.id))
        .sort((a, b) => b.score - a.score || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));
  }, [usersData, predictionsData]);

  const winningsMap = useMemo(() => {
    if (!sortedUsers.length || !monthlyMimoM) return new Map();
    const breakdown = new Map<string, { total: number, seasonal: number, monthly: number, proBounty: number }>();

    sortedUsers.forEach(u => breakdown.set(u.id, { total: 0, seasonal: 0, monthly: 0, proBounty: 0 }));

    // 1. Monthly Awards (CURRENT SEASON 2025-26 ONLY)
    const awardsMap: Record<string, { winners: string[], runnersUp: string[] }> = {};
    monthlyMimoM.filter(m => m.year === 2025).forEach(m => {
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
            const runnerUpPrize = 5 / (award.runnersUp.length || 1);
            award.runnersUp.forEach(id => {
                const b = breakdown.get(id);
                if (b) { b.total += runnerUpPrize; b.monthly += runnerUpPrize; }
            });
        }
    });

    const scoresOnlyArr = sortedUsers.map(u => u.score);
    const getCompRank = (score: number) => scoresOnlyArr.indexOf(score) + 1;

    let highestProScore = -1;
    sortedUsers.forEach(u => { if (u.isPro && u.score > highestProScore) highestProScore = u.score; });

    // Initial pass to identify players strictly outperforming Pros but not in prize slots
    const tempSlayers = sortedUsers.filter((p, idx) => {
        const rank = getCompRank(p.score);
        return !p.isPro && p.score > highestProScore && rank > 10;
    });
    
    const slayerPoolTotal = Math.min(tempSlayers.length * 5, 55);
    const netSeasonalFund = 530 - 150 - 10 - slayerPoolTotal;
    
    let prizes: number[] = [netSeasonalFund / 33.2529];
    for (let i = 0; i < 9; i++) prizes.push(prizes[i] * 1.25);
    const finalSeasonalPrizes = prizes.reverse();

    const rankGroups: Record<number, number[]> = {};
    sortedUsers.forEach((u, i) => {
        const r = getCompRank(u.score);
        if (!rankGroups[r]) rankGroups[r] = [];
        rankGroups[r].push(i);
    });

    Object.entries(rankGroups).forEach(([rankStr, indices]) => {
        const rank = parseInt(rankStr);
        const regulars = indices.filter(i => !sortedUsers[i].isPro);
        if (regulars.length === 0) return;

        let totalPrizeForGroup = 0;
        indices.forEach(idx => {
            const ord = idx + 1; 
            if (ord <= 10) { // Contributes if ordinal is in top 10 prize slots
                totalPrizeForGroup += finalSeasonalPrizes[ord - 1] || 0;
            }
        });

        const prizePerRegular = totalPrizeForGroup / regulars.length;
        regulars.forEach(idx => {
            const player = sortedUsers[idx];
            const b = breakdown.get(player.id);
            if (b && prizePerRegular > 0) {
                b.total += prizePerRegular;
                b.seasonal = prizePerRegular;
            }
        });
    });

    // Final Slayers: beating Pros, rank > 10, AND not receiving any share of the top 10 fund
    const finalSlayers = sortedUsers.filter(p => {
        const b = breakdown.get(p.id);
        const rank = getCompRank(p.score);
        return !p.isPro && p.score > highestProScore && rank > 10 && (!b || b.seasonal <= 0);
    });
    
    const individualBounty = finalSlayers.length > 0 ? slayerPoolTotal / finalSlayers.length : 0;
    finalSlayers.forEach(p => {
        const b = breakdown.get(p.id);
        if (b) { b.total += individualBounty; b.proBounty = individualBounty; }
    });

    return breakdown;
  }, [sortedUsers, monthlyMimoM]);

  const prevScoresOnlyArr = useMemo(() => sortedUsers.map(u => u.previousScore).sort((a,b) => b - a), [sortedUsers]);
  
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
               <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-200/50 dark:bg-blue-800/30 py-2">PremPred Standings</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-green-200/50 dark:bg-green-800/30 py-2">Change In The Past Week</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground bg-purple-200/50 dark:bg-purple-800/30 py-2">Season Highs And Lows</TableHead>
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
                  
                  const isCurrentUser = user.id === resolvedUserId;
                  const competitionRank = sortedUsers.findIndex(u => u.score === user.score) + 1;
                  const competitionWasRank = prevScoresOnlyArr.indexOf(user.previousScore) + 1;
                  const competitionRankChange = (competitionWasRank > 0 && competitionRank > 0) ? competitionWasRank - competitionRank : 0;
                  const RankIcon = getRankChangeIcon(competitionRankChange);

                  const isMimoMWinner = monthlyMimoM?.some(a => a.userId === user.id && a.year === 2025);

                  const getRowStatusClasses = () => {
                    // PROS ARE GREY
                    if (user.isPro) return 'bg-slate-200 dark:bg-slate-800 text-muted-foreground font-medium';

                    const userScore = user.score;
                    const topOfGroup = sortedUsers.find(u => u.score === userScore);
                    const highestOrdinal = sortedUsers.indexOf(topOfGroup!) + 1;

                    // STATUS COLOURS FOR PRIZE WINNERS
                    if (b.seasonal > 0) {
                        if (highestOrdinal === 1) return 'bg-red-800 text-yellow-300 font-black';
                        if (highestOrdinal <= 2) return 'bg-red-600 text-white font-bold';
                        if (highestOrdinal <= 3) return 'bg-orange-700 text-white font-bold';
                        if (highestOrdinal <= 4) return 'bg-orange-500 text-white font-bold';
                        if (highestOrdinal <= 5) return 'bg-orange-300 text-orange-900 font-bold';
                        if (highestOrdinal <= 6) return 'bg-yellow-200 text-yellow-900 font-bold';
                        if (highestOrdinal <= 7) return 'bg-green-200 text-green-900 font-bold';
                        if (highestOrdinal <= 8) return 'bg-cyan-200 text-cyan-900 font-bold';
                        if (highestOrdinal <= 9) return 'bg-cyan-400 text-cyan-900 font-bold';
                        return 'bg-teal-400 text-teal-900 font-bold';
                    }
                    if (b.proBounty > 0) return 'bg-blue-300 text-blue-900 font-bold';
                    if (isMimoMWinner) return 'bg-accent/20 font-bold';
                    return '';
                  };

                  const rowClasses = getRowStatusClasses();

                  return (
                      <TableRow 
                        key={user.id} 
                        className={cn(
                            "transition-colors",
                            rowClasses,
                            isCurrentUser && 'ring-2 ring-inset ring-primary z-10 relative bg-primary/10 shadow-[0_0_25px_hsl(var(--primary)/0.4)]'
                        )}
                      >
                          <TableCell className={cn("text-center py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                            {competitionRank}
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-3">
                                <Avatar className={cn("transition-transform", isCurrentUser ? "h-10 w-10 border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "h-8 w-8")}>
                                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={cn("flex items-center gap-2 transition-all", isCurrentUser && "text-[1.1rem] font-extrabold drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                                    {user.isPro ? (user.name || '').toUpperCase() : user.name}
                                    {b.proBounty > 0 && <TooltipProvider><Tooltip><TooltipTrigger asChild><Swords className="size-4 text-primary animate-pulse cursor-help" /></TooltipTrigger><TooltipContent><p>Pro Slayer!</p></TooltipContent></Tooltip></TooltipProvider>}
                                </span>
                            </div>
                          </TableCell>
                          <TableCell className={cn("text-center py-1", isCurrentUser ? "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]" : "text-lg font-bold")}>{user.score}</TableCell>
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
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{competitionWasRank || '-'}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(competitionRankChange))}>
                              <div className={cn("flex items-center justify-center gap-2", isCurrentUser && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                                  <span className={isCurrentUser ? "text-[1.1rem] font-black" : ""}>{competitionWasRank > 0 ? Math.abs(competitionRankChange) : '-'}</span>
                                  {competitionWasRank > 0 && <RankIcon className="size-5" />}
                              </div>
                          </TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.previousScore}</TableCell>
                          <TableCell className={cn("font-bold text-center border-r py-1", getRankChangeColour(user.scoreChange))}>
                              <div className={cn("flex items-center justify-center gap-2", isCurrentUser && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                                  <span className={isCurrentUser ? "text-[1.1rem] font-black" : ""}>{formatPointsChange(user.scoreChange)}</span>
                                  <ScoreIcon className="size-5" />
                              </div>
                          </TableCell>
                          <TableCell className={cn("text-center font-medium py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.minRank || '-'}</TableCell>
                          <TableCell className={cn("text-center font-medium border-r py-1", isCurrentUser && "text-[1.1rem] font-black drop-shadow-[0_0_8px_hsl(var(--primary))]")}>{user.maxRank || '-'}</TableCell>
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
