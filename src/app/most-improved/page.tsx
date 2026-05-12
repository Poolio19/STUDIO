
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

const formatImprovementText = (val: number, isXmas?: boolean) => {
    if (isXmas) return `${val} PTS`;
    const prefix = val >= 0 ? '+' : '';
    return `${prefix}${val}PTS`;
}

const formatPrizeMoney = (val: number) => {
    if (val <= 0) return '£0.00';
    if (val % 1 === 0) return `£${val}.00`;
    return `£${val.toFixed(2)}`;
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

  const isLoading = usersLoading || historiesLoading || matchesLoading || mimoMLoading || predictionsLoading;

  const currentWeek = useMemo(() => {
    if (!matchesData || matchesData.length === 0) return 0;
    const played = matchesData.filter(m => Number(m.homeScore) >= 0);
    return played.length > 0 ? Math.max(...played.map(m => Number(m.week))) : 0;
  }, [matchesData]);

  const activeUserIds = useMemo(() => {
    if (!predictions) return new Set<string>();
    return new Set(predictions.filter(p => p.rankings && p.rankings.length === 20).map(p => p.userId || (p as any).id));
  }, [predictions]);

  const transitionContext = useMemo(() => {
    if (!users || !userHistories || !activeUserIds.size) return null;
    const rawPeriod = allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek) || allAwardPeriods[allAwardPeriods.length - 1];
    const hasProgress = users.some(u => {
        if (!activeUserIds.has(u.id)) return false;
        const h = userHistories.find(hist => hist.userId === u.id);
        if (!h) return false;
        const curS = h.weeklyScores.find(ws => Number(ws.week) === currentWeek)?.score ?? 0;
        const startS = h.weeklyScores.find(ws => Number(ws.week) === rawPeriod.startWeek)?.score ?? 0;
        return curS > startS;
    });
    const isTransition = !hasProgress && currentWeek >= rawPeriod.startWeek && currentWeek > 0;
    if (isTransition) {
        const prevPeriod = allAwardPeriods.filter(p => p.endWeek <= currentWeek && p.id !== 'xmas').sort((a,b) => b.endWeek - a.endWeek)[0];
        if (prevPeriod) return { period: prevPeriod, isFinal: true };
    }
    return { period: rawPeriod, isFinal: false };
  }, [currentWeek, users, userHistories, activeUserIds]);

  const ladderData = useMemo(() => {
    if (!users || !userHistories || !transitionContext || !activeUserIds.size) return { list: [], topImp: 0, ruImp: 0, sharers: 0 };
    const { period, isFinal } = transitionContext;
    const isXmasSlot = period.id === 'xmas';
    const results: (User & { improvement: number, rankChangeInMonth: number, displayRank: number })[] = [];
    const players = users.filter(u => !u.isPro && u.name && activeUserIds.has(u.id));

    players.forEach(user => {
        const history = userHistories.find(h => h.userId === user.id);
        if (history) {
            const startData = history.weeklyScores.find(ws => Number(ws.week) === period.startWeek);
            const endData = history.weeklyScores.filter(ws => Number(ws.week) <= (isFinal ? period.endWeek : currentWeek)).reverse()[0];
            if (startData && endData) {
                const improvement = isXmasSlot ? Number(endData.score) : (Number(endData.score) - Number(startData.score));
                const rankChangeInMonth = (startData.rank > 0 && endData.rank > 0) ? startData.rank - endData.rank : 0;
                results.push({ ...user, improvement, rankChangeInMonth, displayRank: 0 });
            }
        }
    });

    results.sort((a, b) => b.improvement - a.improvement || b.score - a.score || a.name.localeCompare(b.name));
    
    let r = 0; let lastI = Infinity;
    const list = results.map((u, i) => {
      if (u.improvement < lastI) r = i + 1;
      lastI = u.improvement;
      return { ...u, displayRank: r };
    });
    const imps = [...new Set(list.map(u => u.improvement))].sort((a, b) => b - a);
    return { list, topImp: imps[0] || 0, ruImp: imps[1] || 0, sharers: list.filter(u => u.improvement === imps[0]).length };
  }, [users, userHistories, transitionContext, currentWeek, activeUserIds]);
  
  const hallOfFameData = useMemo(() => {
    if (!users) return [];
    const userMap = new Map(users.map(u => [u.id, u]));
    return allAwardPeriods.map(period => {
        const isCurrentAwardPeriod = (transitionContext?.period?.id === period.id && !transitionContext?.isFinal);
        const isPast = period.endWeek <= currentWeek;
        const isXmasSlot = period.id === 'xmas';
        let winners: any[] = []; let runnersUp: any[] = [];
        const periodAwards = monthlyMimoMAwards?.filter(a => {
            const yearMatch = Number(a.year) === period.year;
            const monthMatch = a.month && period.month && a.month.toLowerCase().startsWith(period.month.toLowerCase().substring(0,3));
            const specialMatch = (a.special === 'Xmas No 1' || a.month?.toLowerCase() === 'xmas') && isXmasSlot;
            return yearMatch && (monthMatch || specialMatch);
        });

        if (periodAwards && periodAwards.length > 0) {
            const rawWinners = periodAwards.filter(a => a.type === 'winner').map(a => {
                const u = userMap.get(a.userId);
                return u ? { ...u, id: a.userId, improvement: Number(a.improvement ?? 0) } : null;
            }).filter(u => !!u);
            const rawRunnersUp = periodAwards.filter(a => a.type === 'runner-up').map(a => {
                const u = userMap.get(a.userId);
                return u ? { ...u, id: a.userId, improvement: Number(a.improvement ?? 0) } : null;
            }).filter(u => !!u);
            
            // PRIZE LOGIC OVERHAUL: Joint winners split the combined pool (£15)
            let winPrize = 0;
            let ruPrize = 0;
            if (rawWinners.length > 1) {
                winPrize = 15 / rawWinners.length;
            } else if (rawWinners.length === 1) {
                winPrize = 10;
                ruPrize = rawRunnersUp.length > 0 ? (5 / rawRunnersUp.length) : 0;
            }
            winners = rawWinners.map(w => ({ ...w, prize: winPrize }));
            runnersUp = rawRunnersUp.map(r => ({ ...r, prize: ruPrize }));
        } 
        else if (isPast && userHistories) {
            const players = users.filter(u => !u.isPro && u.name && activeUserIds.has(u.id));
            const autoList: any[] = [];
            players.forEach(user => {
                const history = userHistories.find(h => h.userId === user.id);
                if (history) {
                    const sData = history.weeklyScores.find(ws => Number(ws.week) === period.startWeek);
                    const eData = history.weeklyScores.find(ws => Number(ws.week) === period.endWeek);
                    if (eData) {
                        const val = isXmasSlot ? Number(eData.score) : (Number(eData.score) - Number(sData?.score ?? 0));
                        autoList.push({ ...user, id: user.id, score: Number(eData.score), improvement: val, historyRank: eData.rank });
                    }
                }
            });
            if (autoList.length > 0) {
                if (isXmasSlot) {
                    // Christmas No 1 logic: Strictly identify Rank 1 (Ordinal)
                    const topTier = autoList.filter(u => u.historyRank === 1);
                    winners = topTier.map(w => ({ ...w, prize: 10 / topTier.length }));
                } else {
                    autoList.sort((a, b) => b.improvement - a.improvement || b.score - a.score || a.name.localeCompare(b.name));
                    const maxVal = autoList[0].improvement;
                    const topTier = autoList.filter(u => u.improvement === maxVal);
                    
                    // COMBINED POOL LOGIC (£15 shared if ties)
                    let winPrize = 0;
                    let ruPrize = 0;
                    if (topTier.length > 1) {
                        winPrize = 15 / topTier.length;
                    } else {
                        winPrize = 10;
                        const secondVal = autoList.find(u => u.improvement < maxVal)?.improvement;
                        if (secondVal !== undefined) {
                            const secondTier = autoList.filter(u => u.improvement === secondVal);
                            ruPrize = 5 / secondTier.length;
                            runnersUp = secondTier.map(r => ({ ...r, prize: ruPrize }));
                        }
                    }
                    winners = topTier.map(w => ({ ...w, prize: winPrize }));
                }
            }
        }
        return { id: period.id, label: period.special || period.month || period.abbreviation, isCurrent: isCurrentAwardPeriod, isFuture: !isPast && !isCurrentAwardPeriod && period.startWeek > currentWeek, winners, runnersUp };
    });
  }, [users, monthlyMimoMAwards, currentWeek, transitionContext, userHistories, activeUserIds]);

  const getWinnerRowStyle = (rank: number, improvement: number) => {
      if (improvement === 0 && ladderData.topImp === 0) return {};
      if (rank === 1) return { backgroundColor: `rgba(250, 204, 21, 0.4)` };
      if (ladderData.topImp !== ladderData.ruImp && improvement === ladderData.ruImp) return { backgroundColor: `rgba(148, 163, 184, 0.2)` };
      return {};
  };

  if (isLoading && !users) return <div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin mr-2" /> Loading MiMoM...</div>;

  return (
    <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/10 via-background to-slate-400/10">
                        <CardTitle>{transitionContext?.isFinal ? `MiMoM Final Standings for ${transitionContext.period.month || transitionContext.period.special}` : `In-Month MiMoM Standings`}</CardTitle>
                        <CardDescription>{transitionContext?.isFinal ? `Results are locked.` : `Live progress for ${transitionContext?.period.month || transitionContext?.period.special}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">Rank</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="text-center">{transitionContext?.period.id === 'xmas' ? 'Total Pts' : 'PTS Change'}</TableHead>
                                    <TableHead className="text-center">Pos Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {ladderData.list.length > 0 ? ladderData.list.map((user) => {
                                const Icon = getRankChangeIcon(user.rankChangeInMonth);
                                const isXmas = transitionContext?.period.id === 'xmas';
                                return (
                                    <TableRow key={user.id} style={getWinnerRowStyle(user.displayRank, user.improvement)} className="transition-colors hover:brightness-95 border-b">
                                        <TableCell className="p-2 font-black text-center">{user.displayRank}</TableCell>
                                        <TableCell className="p-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 rounded-none shrink-0"><AvatarImage src={getAvatarUrl(user.avatar)} className="object-cover rounded-none" /><AvatarFallback className="rounded-none">{user.name.charAt(0)}</AvatarFallback></Avatar>
                                                <span className="font-bold truncate">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-center font-black">{isXmas ? user.improvement : (user.improvement >= 0 ? `+${user.improvement}` : user.improvement)}</TableCell>
                                        <TableCell className={cn("p-2 text-center font-black", getRankChangeColour(user.rankChangeInMonth))}>
                                            <div className="flex items-center justify-center gap-1"><Icon className="size-4" />{Math.abs(user.rankChangeInMonth)}</div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">No historical progress data available yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/10 via-background to-slate-400/10">
                        <CardTitle>MiMoM Hall of Fame</CardTitle>
                        <CardDescription>Official winners and runners-up for the 2025-26 season.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                        {hallOfFameData.map((award) => {
                            if (award.isFuture) return null;
                            const isXmas = award.id === 'xmas';
                            return (
                            <div key={award.id} className={cn("p-2 border rounded-lg flex flex-col items-center min-h-[240px]", award.isCurrent && "opacity-70")}>
                                <p className="font-black mb-3 text-[11px] border-b w-full pb-1 uppercase tracking-widest text-muted-foreground/80 text-center">{award.label}</p>
                                <div className="w-full space-y-2">
                                    {award.winners.map(winner => (
                                        <div key={winner.id} className={cn("rounded-none flex items-stretch h-[100px] overflow-hidden shadow-sm border", isXmas ? "bg-emerald-900 border-red-600 text-white border-2" : "bg-yellow-50 border-yellow-500")}>
                                            {isXmas && <Holly />}
                                            <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r bg-card"><AvatarImage src={getAvatarUrl(winner.avatar)} className="object-cover h-full rounded-none" /><AvatarFallback className="rounded-none">{winner.name?.charAt(0)}</AvatarFallback></Avatar>
                                            <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                <p className={cn("text-[13px] font-bold tracking-tight", isXmas ? "text-white" : (award.winners.length > 1 ? 'JoMiMoM' : 'MiMoM'))}>{isXmas ? 'Xmas No 1' : (award.winners.length > 1 ? 'JoMiMoM' : 'MiMoM')}</p>
                                                <p className="text-[12px] font-bold truncate leading-tight my-0.5">{winner.name}</p>
                                                <p className={cn("text-[11px] font-black uppercase", isXmas ? "text-yellow-400" : "text-yellow-950/80")}>{formatImprovementText(winner.improvement, isXmas)}</p>
                                                <p className={cn("text-[10px] font-medium", isXmas ? "text-white/80" : "text-yellow-950/60")}>{formatPrizeMoney(winner.prize || 0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {award.runnersUp.map(ru => (
                                        <div key={ru.id} className="rounded-none flex items-stretch h-[100px] overflow-hidden shadow-sm border border-slate-300 bg-slate-50">
                                            <Avatar className="w-1/4 h-full rounded-none shrink-0 border-r bg-card"><AvatarImage src={getAvatarUrl(ru.avatar)} className="object-cover h-full rounded-none" /><AvatarFallback className="rounded-none">{ru.name?.charAt(0)}</AvatarFallback></Avatar>
                                            <div className="flex-1 flex flex-col justify-center px-2 text-center overflow-hidden">
                                                <p className="text-[13px] font-bold text-slate-900 tracking-tight">{award.runnersUp.length > 1 ? 'JoRuMiMoM' : 'RuMiMoM'}</p>
                                                <p className="text-[12px] font-bold truncate leading-tight my-0.5">{ru.name}</p>
                                                <p className={cn("text-[11px] font-black uppercase text-slate-950/80")}>{formatImprovementText(ru.improvement)}</p>
                                                <p className={cn("text-[10px] font-medium text-slate-950/60")}>{formatPrizeMoney(ru.prize || 0)}</p>
                                            </div>
                                        </div>
                                    ))}
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
