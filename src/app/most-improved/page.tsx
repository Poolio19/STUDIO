'use client';

import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User, UserHistory, Match, MonthlyMimoM, Prediction } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { allAwardPeriods } from '@/lib/award-periods';

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
    if (change > 0) return <span className="text-green-500">+{change}</span>;
    if (change < 0) return <span className="text-red-500">{change}</span>;
    return <span>{change}</span>;
}

const formatImprovementText = (val: number) => {
    const prefix = val >= 0 ? '+' : '';
    return `${prefix}${val}PTS`;
}

const formatPrizeMoney = (val: number) => {
    if (val <= 0) return '£0.00';
    const rounded = Math.round(val * 100) / 100;
    return `£${rounded.toFixed(2)}`;
}

const Holly = () => (
    <svg className="absolute top-1 right-1 size-6 text-red-500 opacity-80 z-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c2-2 5-2 7-2s2 5 2 7-5 2-7 2-2-5-2-7Z" fill="#065f46" stroke="#064e3b" />
        <path d="M12 12c-2-2-5-2-7-2s-2 5-2 7 5 2 7 2 2-5 2-7Z" fill="#065f46" stroke="#064e3b" />
        <circle cx="12" cy="10" r="2" fill="#ef4444" stroke="#b91c1c" />
        <circle cx="10" cy="13" r="2" fill="#ef4444" stroke="#b91c1c" />
        <circle cx="14" cy="13" r="2" fill="#ef4444" stroke="#b91c1c" />
    </svg>
)

export default function MostImprovedPage() {
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  const userHistoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);
  const mimoMQuery = useMemoFirebase(() => firestore ? collection(firestore, 'monthlyMimoM') : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(userHistoriesQuery);
  const { data: monthlyMimoMAwards, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);

  const isLoading = usersLoading || matchesLoading || historiesLoading || mimoMLoading || predictionsLoading;

  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
      const playedWeeks = playedMatches.map(m => m.week);
      return playedWeeks.length > 0 ? Math.max(...playedWeeks) : 0;
    }
    return 0;
  }, [matchesData]);

  const currentAwardPeriod = useMemo(() => {
    // Specifically force February context for weeks 19 through 28 to resolve the "March" jump issue
    const feb = allAwardPeriods.find(p => p.id === 'feb');
    if (currentWeek >= 19 && currentWeek < 28) return feb;
    
    const period = allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek);
    return period || allAwardPeriods[allAwardPeriods.length - 1];
  }, [currentWeek]);
  
  const currentMonthName = currentAwardPeriod?.month || currentAwardPeriod?.special || '';

  const ladderData = useMemo(() => {
    if (!users || !userHistories || !currentAwardPeriod || !predictions) {
      return { ladderWithRanks: [], firstPlaceImprovement: undefined, secondPlaceImprovement: undefined };
    }

    // Strictly filter for active 2025-26 players only (those with a prediction)
    const activeUserIds = new Set(
      predictions
        .filter(p => p.rankings && p.rankings.length === 20)
        .map(p => p.userId || (p as any).id)
    );

    const startWeek = currentAwardPeriod.startWeek;
    const monthlyImprovements: (User & { improvement: number, rankChangeInMonth: number })[] = [];

    const activePlayersOnly = users.filter(u => !u.isPro && u.name && activeUserIds.has(u.id));
    
    activePlayersOnly.forEach(user => {
        const history = userHistories.find(h => h.userId === user.id);
        if (history && history.weeklyScores) {
            const availableScores = [...history.weeklyScores].sort((a,b) => a.week - b.week);
            // Get score at the start of the month
            const startWeekData = availableScores.filter(ws => ws.week <= startWeek).reverse()[0];
            // Get score at the latest available week
            const endWeekData = availableScores.filter(ws => ws.week >= startWeek && ws.week <= currentWeek).reverse()[0];

            if (startWeekData && endWeekData) {
                const improvement = endWeekData.score - startWeekData.score;
                const rankChangeInMonth = (startWeekData.rank > 0 && endWeekData.rank > 0) ? startWeekData.rank - endWeekData.rank : 0;
                monthlyImprovements.push({ ...user, improvement, rankChangeInMonth, score: endWeekData.score, rank: endWeekData.rank });
            }
        }
    });

    if (monthlyImprovements.length === 0) {
      return { ladderWithRanks: [], firstPlaceImprovement: undefined, secondPlaceImprovement: undefined };
    }

    monthlyImprovements.sort((a, b) => b.improvement - a.improvement || b.score - a.score);
    
    let rank = 0;
    let lastImprovement = Infinity;
    const ladderWithRanks = monthlyImprovements.map((user, index) => {
      if (user.improvement < lastImprovement) {
        rank = index + 1;
      } else if (index === 0) {
        rank = 1;
      }
      lastImprovement = user.improvement;
      return { ...user, displayRank: rank };
    });

    const allImprovements = [...new Set(ladderWithRanks.map(u => u.improvement))].sort((a, b) => b - a);
    const firstPlaceImprovement = allImprovements.length > 0 ? allImprovements[0] : undefined;
    const secondPlaceImprovement = allImprovements.length > 1 ? allImprovements[1] : undefined;

    return { ladderWithRanks, firstPlaceImprovement, secondPlaceImprovement };
  }, [users, userHistories, currentAwardPeriod, currentWeek, predictions]);
  
  const userMap = useMemo(() => {
    if (!users) return new Map<string, User>();
    return new Map(users.map(u => [u.id, u]));
  }, [users]);
  
  const hallOfFameData = useMemo(() => {
    if (!userMap.size || !monthlyMimoMAwards) return [];

    return allAwardPeriods.map(period => {
        const isCurrentPeriod = currentAwardPeriod?.id === period.id;
        const isPastPeriod = period.endWeek <= currentWeek;
        const isFuture = !isPastPeriod && !isCurrentPeriod;

        let winners: (User & { improvement: number, special?: string, prize?: number })[] = [];
        let runnersUp: (User & { improvement: number, prize?: number })[] = [];
        
        if (isPastPeriod) {
            const periodAwards = monthlyMimoMAwards.filter(a => 
                a.year === period.year && 
                (a.month.toLowerCase() === period.id.toLowerCase() || (a.special === 'Xmas No 1' && period.id === 'xmas'))
            );
            
            const rawWinners = periodAwards.filter(a => a.type === 'winner').map(a => {
                const u = userMap.get(a.userId);
                return u ? { ...u, improvement: a.improvement ?? 0, special: a.special } : null;
            }).filter((u): u is User & { improvement: number, special?: string } => !!u);

            const rawRunnersUp = periodAwards.filter(a => a.type === 'runner-up').map(a => {
                const u = userMap.get(a.userId);
                return u ? { ...u, improvement: a.improvement ?? 0 } : null;
            }).filter((u): u is User & { improvement: number } => !!u);

            const winPrize = period.id === 'xmas' ? 10 : (10 / (rawWinners.length || 1));
            const ruPrize = (rawWinners.length === 1 && rawRunnersUp.length > 0) ? (5 / rawRunnersUp.length) : 0;

            winners = rawWinners.map(w => ({ ...w, prize: winPrize }));
            runnersUp = rawRunnersUp.map(r => ({ ...r, prize: ruPrize }));

        } else if (isCurrentPeriod) {
            if (ladderData.firstPlaceImprovement !== undefined && ladderData.firstPlaceImprovement !== 0) {
                const candidates = ladderData.ladderWithRanks.filter(u => u.improvement === ladderData.firstPlaceImprovement);
                const winPool = period.id === 'xmas' ? [candidates[0]] : candidates;
                const winPrize = period.id === 'xmas' ? 10 : (10 / winPool.length);
                winners = winPool.map(w => ({ ...w, prize: winPrize })) as any;
            }
            if (period.id !== 'xmas' && ladderData.secondPlaceImprovement !== undefined && ladderData.secondPlaceImprovement !== 0 && winners.length === 1) {
                const candidates = ladderData.ladderWithRanks.filter(u => u.improvement === ladderData.secondPlaceImprovement);
                const ruPrize = 5 / candidates.length;
                runnersUp = candidates.map(r => ({ ...r, prize: ruPrize })) as any;
            }
        }
        
        return {
            id: period.id,
            abbreviation: period.id === 'xmas' ? 'Xmas No. 1' : period.abbreviation,
            isCurrentMonth: isCurrentPeriod,
            isFuture,
            winners,
            runnersUp,
        };
    });
  }, [userMap, monthlyMimoMAwards, currentWeek, currentAwardPeriod, ladderData]);

  const getDilutedBackground = (baseColor: 'yellow' | 'slate', count: number) => {
      const colors = { yellow: 'rgba(250, 204, 21, ', slate: 'rgba(148, 163, 184, ' };
      let opacity = 1.0;
      if (count === 2) opacity = 0.65;
      if (count === 3) opacity = 0.45;
      if (count >= 4) opacity = 0.25;
      return { backgroundColor: colors[baseColor] + opacity + ')' };
  };

  const getLadderRankColour = (user: (typeof ladderData.ladderWithRanks)[0]) => {
    if (ladderData.firstPlaceImprovement !== undefined && user.improvement === ladderData.firstPlaceImprovement) return 'bg-yellow-400/20';
    if (currentAwardPeriod?.id !== 'xmas' && ladderData.secondPlaceImprovement !== undefined && user.improvement === ladderData.secondPlaceImprovement) return 'bg-slate-400/20';
    return '';
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin mr-2" /> Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="flex flex-col gap-8 lg:col-span-2">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                    <CardTitle>In-Month MiMoM Standings</CardTitle>
                    <CardDescription>Current standings for {currentMonthName}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                <TableHead className="text-center">PTS Change</TableHead>
                                <TableHead className="text-center">Pos Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ladderData.ladderWithRanks.length > 0 ? ladderData.ladderWithRanks.map((user) => {
                            const PositionChangeIcon = getRankChangeIcon(user.rankChangeInMonth);
                            const rankColour = getLadderRankColour(user);
                            return (
                                <TableRow key={user.id} className={cn(rankColour)}>
                                    <TableCell className="p-2 font-black text-center">{user.displayRank}</TableCell>
                                    <TableCell className="p-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 rounded-none"><AvatarImage src={getAvatarUrl(user.avatar)} data-ai-hint="person" className="object-cover h-full w-full" /><AvatarFallback className="rounded-none">{user.name.charAt(0)}</AvatarFallback></Avatar>
                                            <span className="font-bold">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 text-center font-black">{formatPointsChange(user.improvement)}</TableCell>
                                    <TableCell className={cn("p-2 text-center font-black", getRankChangeColour(user.rankChangeInMonth))}>
                                        <div className="flex items-center justify-center gap-1"><PositionChangeIcon className="size-4" />{Math.abs(user.rankChangeInMonth)}</div>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">No active standings for this period.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                        <CardTitle>MiMoM Hall of Fame</CardTitle>
                        <CardDescription>Season winners and runners-up across 2025-26.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                        {hallOfFameData.map((monthlyAward) => {
                            const isFuture = monthlyAward.isFuture;
                            const isCurrent = monthlyAward.isCurrentMonth;
                            const isXmas = monthlyAward.id === 'xmas';

                            return (
                            <div key={monthlyAward.id} className={cn("p-2 border rounded-lg flex flex-col items-center min-h-[240px]", { 'opacity-50': isFuture, 'opacity-70 grayscale-[30%]': isCurrent })}>
                                <p className="font-black mb-3 text-[11px] border-b w-full pb-1 uppercase tracking-widest text-muted-foreground/80">{monthlyAward.abbreviation}</p>
                                
                                {isFuture || (isCurrent && monthlyAward.winners.length === 0) ? (
                                     <div className="w-full space-y-2">
                                        <div className="bg-muted/30 py-1.5 px-2 rounded-md flex items-center justify-center h-[100px]"><p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">TBC</p></div>
                                        {!isXmas && <div className="bg-muted/20 py-1.5 px-2 rounded-md flex items-center justify-center h-[100px]"><p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-widest">TBC</p></div>}
                                    </div>
                                ) : (
                                    <div className="w-full space-y-2">
                                        {monthlyAward.winners?.map(winner => {
                                            const isTie = monthlyAward.winners.length > 1;
                                            const rawTitle = isXmas ? 'Xmas No 1' : (isTie ? 'JoMiMoM' : 'MiMoM');
                                            const displayTitle = isCurrent ? `Current ${rawTitle}` : rawTitle;
                                            const style = isXmas ? { backgroundColor: '#064e3b', borderColor: '#dc2626', color: '#fff' } : getDilutedBackground('yellow', monthlyAward.winners.length);
                                            
                                            return (
                                                <div key={winner.id} style={style} className={cn("rounded-md flex items-stretch h-[100px] overflow-hidden shadow-sm border relative", isXmas && "border-2")}>
                                                    {isXmas && <Holly />}
                                                    <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r"><AvatarImage src={getAvatarUrl(winner.avatar)} className="object-cover h-full" /><AvatarFallback className="rounded-none">{winner.name?.charAt(0)}</AvatarFallback></Avatar>
                                                    <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                        <p className={cn("text-[13px] font-bold tracking-tight", isXmas ? "text-white" : "text-yellow-950")}>{displayTitle}</p>
                                                        <p className="text-[12px] font-bold truncate leading-tight my-0.5">{winner.name}</p>
                                                        <p className={cn("text-[11px] font-black uppercase", isXmas ? "text-yellow-400" : "text-yellow-950/80")}>{formatImprovementText(winner.improvement)}</p>
                                                        <p className={cn("text-[10px] font-medium", isXmas ? "text-white/80" : "text-yellow-950/60")}>{formatPrizeMoney(winner.prize || 0)}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {monthlyAward.runnersUp?.map(runnerUp => {
                                            const isTie = monthlyAward.runnersUp.length > 1;
                                            const rawTitle = isTie ? 'JoRuMiMoM' : 'RuMiMoM';
                                            const displayTitle = isCurrent ? `Current ${rawTitle}` : rawTitle;
                                            const style = getDilutedBackground('slate', monthlyAward.runnersUp.length);

                                            return (
                                                <div key={runnerUp.id} style={style} className="rounded-md flex items-stretch h-[100px] overflow-hidden shadow-sm border border-slate-600/10">
                                                    <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r"><AvatarImage src={getAvatarUrl(runnerUp.avatar)} className="object-cover h-full" /><AvatarFallback className="rounded-none">{runnerUp.name?.charAt(0)}</AvatarFallback></Avatar>
                                                    <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                        <p className="text-[13px] font-bold text-slate-900 tracking-tight">{displayTitle}</p>
                                                        <p className="text-[12px] font-bold truncate leading-tight my-0.5">{runnerUp.name}</p>
                                                        <p className={cn("text-[11px] font-black uppercase text-slate-950/80")}>{formatImprovementText(runnerUp.improvement)}</p>
                                                        <p className={cn("text-[10px] font-medium text-slate-950/60")}>{formatPrizeMoney(runnerUp.prize || 0)}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )})}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
