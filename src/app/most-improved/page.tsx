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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { allAwardPeriods } from '@/lib/award-periods';
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
      const playedMatches = matchesData.filter(m => Number(m.homeScore) !== -1 && Number(m.awayScore) !== -1);
      const playedWeeks = playedMatches.map(m => m.week);
      return playedWeeks.length > 0 ? Math.max(...playedWeeks) : 0;
    }
    return 0;
  }, [matchesData]);

  const activeUserIds = useMemo(() => {
    if (!predictions || !users) return new Set<string>();
    const historicalIds = new Set(historicalPlayersData.map(p => p.id));
    return new Set(
      predictions
        .filter(p => p.rankings && p.rankings.length === 20)
        .map(p => p.userId || (p as any).id)
        .filter(id => historicalIds.has(id) || users.find(u => u.id === id)?.isPro)
    );
  }, [predictions, users]);

  const standingsContext = useMemo(() => {
    if (!users || !userHistories) return null;
    
    const rawPeriod = allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek) || allAwardPeriods[allAwardPeriods.length - 1];
    
    // Check if anyone in active pool has scored yet in the raw period
    const hasProgress = users.some(u => {
        if (!activeUserIds.has(u.id)) return false;
        const h = userHistories.find(hist => hist.userId === u.id);
        if (!h) return false;
        const currentScore = h.weeklyScores.find(ws => ws.week === currentWeek)?.score ?? 0;
        const startScore = h.weeklyScores.find(ws => ws.week === rawPeriod.startWeek)?.score ?? 0;
        return currentScore > startScore;
    });

    // We are in Week 1 of a month if we've passed the start week but no one has scored yet
    const isWeekOneTransition = !hasProgress && currentWeek >= rawPeriod.startWeek && currentWeek > 0;
    
    if (isWeekOneTransition) {
        const prevPeriod = allAwardPeriods.filter(p => p.endWeek <= currentWeek).sort((a,b) => b.endWeek - a.endWeek)[0];
        if (prevPeriod) return { period: prevPeriod, isFinal: true };
    }
    
    return { period: rawPeriod, isFinal: false };
  }, [currentWeek, users, userHistories, activeUserIds]);

  const ladderData = useMemo(() => {
    if (!users || !userHistories || !standingsContext || !activeUserIds.size) {
      return { ladderWithRanks: [], firstPlaceImprovement: undefined, secondPlaceImprovement: undefined };
    }

    const { period, isFinal } = standingsContext;
    const monthlyImprovements: (User & { improvement: number, rankChangeInMonth: number })[] = [];
    const activePlayersOnly = users.filter(u => !u.isPro && u.name && activeUserIds.has(u.id));
    
    activePlayersOnly.forEach(user => {
        const history = userHistories.find(h => h.userId === user.id);
        if (history && history.weeklyScores) {
            const scores = [...history.weeklyScores].sort((a,b) => a.week - b.week);
            const startData = scores.find(ws => ws.week === period.startWeek) || scores[0];
            const endData = scores.filter(ws => ws.week <= (isFinal ? period.endWeek : currentWeek)).reverse()[0] || scores[scores.length-1];

            if (startData && endData) {
                const improvement = endData.score - startData.score;
                const rankChangeInMonth = (startData.rank > 0 && endData.rank > 0) ? startData.rank - endData.rank : 0;
                monthlyImprovements.push({ ...user, improvement, rankChangeInMonth, score: endData.score, rank: endData.rank });
            }
        }
    });

    if (monthlyImprovements.length === 0) return { ladderWithRanks: [], firstPlaceImprovement: undefined, secondPlaceImprovement: undefined };

    monthlyImprovements.sort((a, b) => b.improvement - a.improvement || b.score - a.score);
    
    let rank = 0;
    let lastImp = Infinity;
    const ladderWithRanks = monthlyImprovements.map((u, i) => {
      if (u.improvement < lastImp) rank = i + 1;
      else if (i === 0) rank = 1;
      lastImp = u.improvement;
      return { ...u, displayRank: rank };
    });

    const allImps = [...new Set(ladderWithRanks.map(u => u.improvement))].sort((a, b) => b - a);
    return { ladderWithRanks, firstPlaceImprovement: allImps[0], secondPlaceImprovement: allImps[1] };
  }, [users, userHistories, standingsContext, currentWeek, activeUserIds]);
  
  const hallOfFameData = useMemo(() => {
    if (!users || !monthlyMimoMAwards || !standingsContext) return [];
    const userMap = new Map(users.map(u => [u.id, u]));

    return allAwardPeriods.map(period => {
        const isCurrent = (standingsContext.period.id === period.id && !standingsContext.isFinal);
        const isPast = period.endWeek <= currentWeek;
        const isFuture = !isPast && !isCurrent && period.startWeek > currentWeek;

        // Hide Feb award in HoF during Week 1 transition of March
        const hideDueToTransition = standingsContext.isFinal && standingsContext.period.id === period.id;
        // Hide potential current winners in HoF until Week 2 scores are in
        const hideDueToWeekOne = isCurrent && currentWeek <= period.startWeek;

        let winners: (User & { improvement: number, prize?: number })[] = [];
        let runnersUp: (User & { improvement: number, prize?: number })[] = [];
        
        if (!hideDueToWeekOne && !hideDueToTransition) {
            const periodAwards = monthlyMimoMAwards.filter(a => 
                a.year === period.year && (a.month.toLowerCase() === (period.month || period.id).toLowerCase() || (a.special === 'Xmas No 1' && period.id === 'xmas'))
            );
            
            if (periodAwards.length > 0) {
                const rawWinners = periodAwards.filter(a => a.type === 'winner').map(a => {
                    const u = userMap.get(a.userId);
                    return u ? { ...u, improvement: a.improvement ?? 0 } : null;
                }).filter((u): u is User & { improvement: number } => !!u);

                const rawRunnersUp = periodAwards.filter(a => a.type === 'runner-up').map(a => {
                    const u = userMap.get(a.userId);
                    return u ? { ...u, improvement: a.improvement ?? 0 } : null;
                }).filter((u): u is User & { improvement: number } => !!u);

                const winPrize = period.id === 'xmas' ? 10 : (10 / (rawWinners.length || 1));
                const ruPrize = (rawWinners.length === 1 && rawRunnersUp.length > 0) ? (5 / rawRunnersUp.length) : 0;
                winners = rawWinners.map(w => ({ ...w, prize: winPrize }));
                runnersUp = rawRunnersUp.map(r => ({ ...r, prize: ruPrize }));
            }
        }
        
        return { 
            id: period.id, 
            abbreviation: period.id === 'xmas' ? 'Xmas No. 1' : period.abbreviation, 
            isCurrent, 
            isFuture, 
            winners, 
            runnersUp 
        };
    });
  }, [users, monthlyMimoMAwards, currentWeek, standingsContext]);

  const getWinnerRowStyle = (rank: number, improvement: number) => {
      if (improvement <= 0) return {};
      if (rank === 1) return { backgroundColor: 'rgba(250, 204, 21, 0.25)' }; // Yellow
      if (ladderData.firstPlaceImprovement !== ladderData.secondPlaceImprovement && improvement === ladderData.secondPlaceImprovement) {
          return { backgroundColor: 'rgba(148, 163, 184, 0.25)' }; // Slate
      }
      return {};
  };

  const getDilutedBackground = (baseColor: 'yellow' | 'slate', count: number) => {
      const colors = { yellow: 'rgba(250, 204, 21, ', slate: 'rgba(148, 163, 184, ' };
      let opacity = 1.0;
      if (count === 2) opacity = 0.65;
      if (count === 3) opacity = 0.45;
      if (count >= 4) opacity = 0.25;
      return { backgroundColor: colors[baseColor] + opacity + ')' };
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin mr-2" /> Loading MiMoM Central...</div>;

  return (
    <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                        <CardTitle>
                            {standingsContext?.isFinal ? `MiMoM Final Standings for ${standingsContext.period.month || standingsContext.period.special}` : `In-Month MiMoM Standings`}
                        </CardTitle>
                        <CardDescription>
                            {standingsContext?.isFinal ? `Results are locked. Prizes bagged.` : `Live progress for ${standingsContext?.period.month || standingsContext?.period.special}`}
                        </CardDescription>
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
                                const rowStyle = getWinnerRowStyle(user.displayRank, user.improvement);
                                return (
                                    <TableRow key={user.id} style={rowStyle} className="transition-colors hover:brightness-95">
                                        <TableCell className="p-2 font-black text-center">{user.displayRank}</TableCell>
                                        <TableCell className="p-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 rounded-none shrink-0"><AvatarImage src={getAvatarUrl(user.avatar)} className="object-cover h-full w-full" /><AvatarFallback className="rounded-none">{user.name.charAt(0)}</AvatarFallback></Avatar>
                                                <span className="font-bold truncate">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-center font-black">{formatPointsChange(user.improvement)}</TableCell>
                                        <TableCell className={cn("p-2 text-center font-black", getRankChangeColour(user.rankChangeInMonth))}>
                                            <div className="flex items-center justify-center gap-1"><PositionChangeIcon className="size-4" />{Math.abs(user.rankChangeInMonth)}</div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">No active competition data for this period.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                        <CardTitle>MiMoM Hall of Fame</CardTitle>
                        <CardDescription>Official winners and runners-up for the 2025-26 season.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                        {hallOfFameData.map((award) => {
                            if (award.isFuture) return null;
                            const isXmas = award.id === 'xmas';
                            return (
                            <div key={award.id} className={cn("p-2 border rounded-lg flex flex-col items-center min-h-[240px]", award.isCurrent && "opacity-70")}>
                                <p className="font-black mb-3 text-[11px] border-b w-full pb-1 uppercase tracking-widest text-muted-foreground/80">{award.abbreviation}</p>
                                <div className="w-full space-y-2">
                                    {award.winners.map(winner => {
                                        const title = isXmas ? 'Xmas No 1' : (award.winners.length > 1 ? 'JoMiMoM' : 'MiMoM');
                                        const style = isXmas ? { backgroundColor: '#064e3b', borderColor: '#dc2626', color: '#fff' } : getDilutedBackground('yellow', award.winners.length);
                                        return (
                                            <div key={winner.id} style={style} className={cn("rounded-none flex items-stretch h-[100px] overflow-hidden shadow-sm border", isXmas && "border-2")}>
                                                {isXmas && <Holly />}
                                                <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r bg-card"><AvatarImage src={getAvatarUrl(winner.avatar)} className="object-cover h-full" /><AvatarFallback className="rounded-none">{winner.name?.charAt(0)}</AvatarFallback></Avatar>
                                                <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                    <p className={cn("text-[13px] font-bold tracking-tight", isXmas ? "text-white" : "text-yellow-950")}>{title}</p>
                                                    <p className="text-[12px] font-bold truncate leading-tight my-0.5">{winner.name}</p>
                                                    <p className={cn("text-[11px] font-black uppercase", isXmas ? "text-yellow-400" : "text-yellow-950/80")}>{formatImprovementText(winner.improvement)}</p>
                                                    <p className={cn("text-[10px] font-medium", isXmas ? "text-white/80" : "text-yellow-950/60")}>{formatPrizeMoney(winner.prize || 0)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {award.runnersUp.map(ru => {
                                        const title = award.runnersUp.length > 1 ? 'JoRuMiMoM' : 'RuMiMoM';
                                        return (
                                            <div key={ru.id} style={getDilutedBackground('slate', award.runnersUp.length)} className="rounded-none flex items-stretch h-[100px] overflow-hidden shadow-sm border border-slate-600/10">
                                                <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r bg-card"><AvatarImage src={getAvatarUrl(ru.avatar)} className="object-cover h-full" /><AvatarFallback className="rounded-none">{ru.name?.charAt(0)}</AvatarFallback></Avatar>
                                                <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                    <p className="text-[13px] font-bold text-slate-900 tracking-tight">{title}</p>
                                                    <p className="text-[12px] font-bold truncate leading-tight my-0.5">{ru.name}</p>
                                                    <p className={cn("text-[11px] font-black uppercase text-slate-950/80")}>{formatImprovementText(ru.improvement)}</p>
                                                    <p className="text-[10px] font-medium text-slate-950/60">{formatPrizeMoney(ru.prize || 0)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {award.winners.length === 0 && !award.isFuture && <div className="bg-muted/30 py-1.5 px-2 rounded-md flex items-center justify-center h-[100px]"><p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">TBC</p></div>}
                                </div>
                            </div>
                        )})}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
