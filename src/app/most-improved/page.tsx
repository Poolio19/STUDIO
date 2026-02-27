'use client';

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
import type { User, UserHistory, Match, MonthlyMimoM } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
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
    if (val <= 0) return '';
    const rounded = Math.round(val * 100) / 100;
    return rounded % 1 === 0 ? `£${rounded}` : `£${rounded.toFixed(2)}`;
}

const Holly = () => (
    <svg className="absolute top-1 right-1 size-6 text-red-500 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(userHistoriesQuery);
  const { data: monthlyMimoMAwards, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);

  const isLoading = usersLoading || matchesLoading || historiesLoading || mimoMLoading;

  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
      const playedWeeks = playedMatches.map(m => m.week);
      return playedWeeks.length > 0 ? Math.max(...playedWeeks) : 0;
    }
    return 0;
  }, [matchesData]);

  const currentAwardPeriod = useMemo(() => {
    return allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek);
  }, [currentWeek]);
  
  const currentMonthName = currentAwardPeriod?.month || currentAwardPeriod?.special || '';

  const ladderData = useMemo(() => {
    if (!users || !userHistories || !currentAwardPeriod) {
      return { ladderWithRanks: [], firstPlaceImprovement: undefined, secondPlaceImprovement: undefined };
    }

    const startWeek = currentAwardPeriod.startWeek;
    const endWeek = currentWeek;

    const monthlyImprovements: (User & { improvement: number, rankChangeInMonth: number })[] = [];

    const nonProUsers = users.filter(u => !u.isPro);
    nonProUsers.forEach(user => {
        const history = userHistories.find(h => h.userId === user.id);
        if (history && history.weeklyScores) {
            const startWeekData = history.weeklyScores.find(ws => ws.week === startWeek);
            const endWeekData = history.weeklyScores.find(ws => ws.week === endWeek);

            if (startWeekData && endWeekData) {
                const improvement = endWeekData.score - startWeekData.score;
                const rankChangeInMonth = (startWeekData.rank > 0 && endWeekData.rank > 0) ? startWeekData.rank - endWeekData.rank : 0;
                monthlyImprovements.push({ ...user, improvement, rankChangeInMonth, score: endWeekData.score });
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
  }, [users, userHistories, currentAwardPeriod, currentWeek]);
  
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
                (a.month.toLowerCase() === period.id.toLowerCase() || a.id.includes(period.id))
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
            abbreviation: period.id === 'xmas' ? 'XMAS No. 1' : period.abbreviation,
            isCurrentMonth: isCurrentPeriod,
            isFuture,
            winners,
            runnersUp,
        };
    });
  }, [userMap, monthlyMimoMAwards, allAwardPeriods, currentWeek, currentAwardPeriod, ladderData]);


  const getLadderRankColour = (user: (typeof ladderData.ladderWithRanks)[0]) => {
    if (ladderData.firstPlaceImprovement !== undefined && user.improvement === ladderData.firstPlaceImprovement) return 'bg-yellow-400/20';
    if (currentAwardPeriod?.id !== 'xmas' && ladderData.secondPlaceImprovement !== undefined && user.improvement === ladderData.secondPlaceImprovement && ladderData.secondPlaceImprovement !== ladderData.firstPlaceImprovement) return 'bg-slate-400/20';
    return '';
  };

  const getDilutedBackground = (baseColor: 'yellow' | 'slate', count: number) => {
      const colors = {
          yellow: 'rgba(250, 204, 21, ', 
          slate: 'rgba(148, 163, 184, ' 
      };
      let opacity = 1.0;
      if (count === 2) opacity = 0.65;
      if (count === 3) opacity = 0.45;
      if (count >= 4) opacity = 0.25;
      return { backgroundColor: colors[baseColor] + opacity + ')' };
  };

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-center items-center h-96">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Loading MimoM data...</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="flex flex-col gap-8 lg:col-span-2">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                    <CardTitle>{currentAwardPeriod?.id === 'xmas' ? 'XMAS No. 1 Race' : 'In-Month MiMoM Standings'}</CardTitle>
                    <CardDescription>Current standings for {currentMonthName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table className="border-separate border-spacing-y-1">
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="w-[50px] text-center align-bottom">Rank</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Player</TableHead>
                                <TableHead colSpan={2} className="text-center border-l">Change</TableHead>
                                <TableHead colSpan={2} className="text-center border-l">Current</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="text-center border-l">Points</TableHead>
                                <TableHead className="text-center">Position</TableHead>
                                <TableHead className="text-center border-l">Points</TableHead>
                                <TableHead className="text-center">Position</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ladderData.ladderWithRanks.map((user) => {
                            const PositionChangeIcon = getRankChangeIcon(user.rankChangeInMonth);
                            const rankColour = getLadderRankColour(user);
                            const isCurrentUser = user.id === resolvedUserId;
                            return (
                                <TableRow key={user.id} className={cn("border-b-4 border-transparent", { 'ring-2 ring-primary ring-inset': isCurrentUser })}>
                                    <TableCell className={cn("p-2 font-medium text-center", rankColour, rankColour && 'rounded-l-md')}>{user.displayRank}</TableCell>
                                    <TableCell className={cn("p-2", rankColour)}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn({ 'font-bold': isCurrentUser })}>{user.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold border-l", rankColour)}>{formatPointsChange(user.improvement)}</TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold", rankColour, getRankChangeColour(user.rankChangeInMonth))}>
                                        <div className="flex items-center justify-center gap-1">
                                            <PositionChangeIcon className="size-5" />
                                            <span>{Math.abs(user.rankChangeInMonth)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold border-l", rankColour)}>{user.score}</TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold", rankColour, rankColour && 'rounded-r-md')}>{user.rank}</TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                        <CardTitle>MiMoM Hall Of Fame</CardTitle>
                        <CardDescription>This Season's Winners and Runners-up.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hallOfFameData.map((monthlyAward) => {
                            const isFuture = monthlyAward.isFuture;
                            const isCurrent = monthlyAward.isCurrentMonth;
                            const isXmas = monthlyAward.id === 'xmas';

                            return (
                            <div key={monthlyAward.id} className={cn("p-2 border rounded-lg flex flex-col items-center justify-start text-center", {
                                'opacity-50': isFuture,
                                'opacity-70 grayscale-[30%]': isCurrent,
                            })}>
                                <p className="font-black mb-3 text-[11px] border-b w-full pb-1 uppercase tracking-[0.15em] text-muted-foreground/80">{monthlyAward.abbreviation}</p>
                                
                                {isFuture || (isCurrent && monthlyAward.winners.length === 0) ? (
                                     <div className="w-full space-y-2">
                                        <div className="bg-muted/30 py-1.5 px-2 rounded-md flex items-center justify-center h-[70px]">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{isXmas ? 'XMAS NO. 1' : 'MIMOM'} TBC</p>
                                        </div>
                                        {!isXmas && (
                                            <div className="bg-muted/20 py-1.5 px-2 rounded-md flex items-center justify-center h-[70px]">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-widest">RUMIMOM TBC</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full space-y-2">
                                        {monthlyAward.winners?.map(winner => {
                                            const isTie = monthlyAward.winners.length > 1;
                                            const awardTitle = isXmas ? 'XMAS NO. 1' : (isTie ? 'JOMIMOM' : 'MIMOM');
                                            const displayTitle = isCurrent ? `CURRENT ${awardTitle}` : awardTitle;
                                            const style = isXmas ? { backgroundColor: '#064e3b', borderColor: '#dc2626', color: '#fff' } : getDilutedBackground('yellow', monthlyAward.winners.length);
                                            
                                            return (
                                                <div key={winner.id} style={style} className={cn("rounded-md flex items-stretch h-[70px] overflow-hidden shadow-sm border relative", isXmas && "border-2")}>
                                                    {isXmas && <Holly />}
                                                    <div className="w-1/4 h-full shrink-0">
                                                        <Avatar className="h-full w-full rounded-none">
                                                            <AvatarImage src={getAvatarUrl(winner.avatar)} alt={winner.name} className="object-cover" />
                                                            <AvatarFallback className="rounded-none">{winner.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center px-2 text-left overflow-hidden">
                                                        <p className={cn("text-[12px] font-black uppercase tracking-tighter leading-none mb-1", isXmas ? "text-white" : "text-yellow-900/90")}>
                                                            {displayTitle}
                                                        </p>
                                                        <p className="text-[13px] font-bold leading-none truncate mb-1">
                                                            {winner.name}
                                                        </p>
                                                        <p className={cn("text-[10px] font-black leading-none uppercase", isXmas ? "text-yellow-400" : "text-yellow-950/60")}>
                                                            {formatImprovementText(winner.improvement)} <span className="font-medium normal-case ml-1">{formatPrizeMoney(winner.prize || 0)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {monthlyAward.runnersUp?.map(runnerUp => {
                                            const awardTitle = monthlyAward.runnersUp.length > 1 ? 'JORUMIMOM' : 'RUMIMOM';
                                            const displayTitle = isCurrent ? `CURRENT ${awardTitle}` : awardTitle;
                                            const style = getDilutedBackground('slate', monthlyAward.runnersUp.length);

                                            return (
                                                <div key={runnerUp.id} style={style} className="rounded-md flex items-stretch h-[70px] overflow-hidden shadow-sm border border-slate-600/10">
                                                    <div className="w-1/4 h-full shrink-0">
                                                        <Avatar className="h-full w-full rounded-none">
                                                            <AvatarImage src={getAvatarUrl(runnerUp.avatar)} alt={runnerUp.name} className="object-cover" />
                                                            <AvatarFallback className="rounded-none">{runnerUp.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center px-2 text-left overflow-hidden">
                                                        <p className="text-[12px] font-black uppercase text-slate-900/90 tracking-tighter leading-none mb-1">
                                                            {displayTitle}
                                                        </p>
                                                        <p className="text-[13px] font-bold leading-none truncate mb-1">
                                                            {runnerUp.name}
                                                        </p>
                                                        <p className="text-[10px] font-black leading-none text-slate-950/60 uppercase">
                                                            {formatImprovementText(runnerUp.improvement)} <span className="font-medium normal-case ml-1">{formatPrizeMoney(runnerUp.prize || 0)}</span>
                                                        </p>
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