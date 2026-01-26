
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
import type { User, UserHistory, SeasonMonth, Match } from '@/lib/types';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { allAwardPeriods } from '@/lib/award-periods';
import historicalMimoAwards from '@/lib/historical-mimo-awards.json';


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

export default function MostImprovedPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  const seasonMonthsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'seasonMonths') : null, [firestore]);
  const userHistoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: seasonMonthsData, isLoading: seasonMonthsLoading } = useCollection<SeasonMonth>(seasonMonthsQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(userHistoriesQuery);

  const isLoading = usersLoading || matchesLoading || seasonMonthsLoading || historiesLoading;

  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
      const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
      return Math.max(...playedMatches.map(m => m.week), 0);
    }
    return 0;
  }, [matchesData]);

  const currentAwardPeriod = useMemo(() => {
    return allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek);
  }, [currentWeek]);
  
  const currentMonthName = currentAwardPeriod?.month || currentAwardPeriod?.special || '';

  const ladderData = useMemo(() => {
    if (!users || !userHistories || !currentAwardPeriod || currentWeek < currentAwardPeriod.startWeek) {
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

  const seasonMonths = useMemo(() => {
    if (!seasonMonthsData) return [];
    return [...seasonMonthsData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
        const aIndex = monthOrder.indexOf(a.month);
        const bIndex = monthOrder.indexOf(b.month);
        if (aIndex !== bIndex) return aIndex - bIndex;
        if (a.special && !b.special) return 1;
        if (!a.special && b.special) return -1;
        return 0;
    });
  }, [seasonMonthsData]);

  const userNameMap = useMemo(() => {
    if (!users) return new Map<string, User>();
    return new Map(users.map(u => [u.name, u]));
  }, [users]);

  const mimoMWithDetails = useMemo(() => {
    if (!users || !seasonMonths || !userHistories || !userNameMap) return [];
    
    return seasonMonths.map(seasonMonth => {
        const seasonString = `${seasonMonth.year}-${seasonMonth.year + 1}`;
        const historicalMonth = historicalMimoAwards.find(h => 
            h.season === seasonString && 
            (h.month.toUpperCase() === (seasonMonth.month?.toUpperCase() || ''))
        );

        let isFuture = false;
        const period = allAwardPeriods.find(p => p.id === seasonMonth.id);
        if (period) {
          isFuture = currentWeek < period.startWeek;
        }

        if (historicalMonth && !isFuture) {
            const winners = historicalMonth.awards.filter(a => a.type === 'MiMoM' || a.type === 'JoMiMoM');
            const runnersUp = historicalMonth.awards.filter(a => a.type === 'RuMiMoM' || a.type === 'JoRuMiMoM');

            const mapAwardToUser = (award: (typeof historicalMonth.awards)[0]) => {
                const user = userNameMap.get(award.name);
                return {
                    ...(user || { id: award.name, name: award.name, avatar: '' }),
                    improvement: award.improvement,
                };
            };
            
            return {
                ...seasonMonth,
                isCurrentMonth: false,
                isFuture: false,
                winners: winners.map(mapAwardToUser),
                runnersUp: runnersUp.map(mapAwardToUser),
                currentLeaders: null,
                currentRunnersUp: null,
            };
        }

        // Live calculation for current/future periods
        const isCurrentPeriod = currentAwardPeriod?.id === seasonMonth.id;
        let currentLeaders: (User & { improvement: number })[] | null = null;
        let currentRunnersUp: (User & { improvement: number })[] | null = null;

        if (isCurrentPeriod && currentWeek >= currentAwardPeriod.startWeek) {
            const startWeek = currentAwardPeriod.startWeek;
            const endWeek = currentWeek;

            const monthlyImprovements: { userId: string; improvement: number; endScore: number; user: User }[] = [];

            const nonProUsers = users.filter(u => !u.isPro);
            nonProUsers.forEach(user => {
                const history = userHistories.find(h => h.userId === user.id);
                if (history) {
                    const startWeekData = history.weeklyScores.find(ws => ws.week === startWeek);
                    const endWeekData = history.weeklyScores.find(ws => ws.week === endWeek);
                    if (startWeekData && endWeekData) {
                        const improvement = endWeekData.score - startWeekData.score;
                        monthlyImprovements.push({ userId: user.id, improvement, endScore: endWeekData.score, user });
                    }
                }
            });

            if (monthlyImprovements.length > 0) {
                monthlyImprovements.sort((a, b) => b.improvement - a.improvement || b.endScore - a.endScore);
                
                const bestImprovement = monthlyImprovements[0].improvement;
                const winners = monthlyImprovements.filter(u => u.improvement === bestImprovement);

                currentLeaders = winners.map(w => ({ ...w.user, improvement: w.improvement }));

                if (winners.length === 1) {
                     const remainingPlayers = monthlyImprovements.filter(u => u.improvement < bestImprovement);
                    if (remainingPlayers.length > 0) {
                        const secondBestImprovement = remainingPlayers[0].improvement;
                        const runnersUp = remainingPlayers.filter(u => u.improvement === secondBestImprovement);
                        currentRunnersUp = runnersUp.map(r => ({ ...r.user, improvement: r.improvement }));
                    }
                }
            }
        }
        
        return {
            ...seasonMonth,
            isCurrentMonth: isCurrentPeriod,
            isFuture,
            winners: null,
            runnersUp: null,
            currentLeaders,
            currentRunnersUp,
        }
    });
  }, [users, seasonMonths, currentAwardPeriod, userHistories, currentWeek, userNameMap]);


  const getLadderRankColour = (user: (typeof ladderData.ladderWithRanks)[0]) => {
    if (ladderData.firstPlaceImprovement !== undefined && user.improvement === ladderData.firstPlaceImprovement) return 'bg-yellow-400/20';
    if (ladderData.secondPlaceImprovement !== undefined && user.improvement === ladderData.secondPlaceImprovement && ladderData.secondPlaceImprovement !== ladderData.firstPlaceImprovement) return 'bg-slate-400/20';
    return '';
  };

  const currentMonthAbbreviation = useMemo(() => {
    return currentAwardPeriod?.abbreviation || currentMonthName.slice(0, 4).toUpperCase();
  }, [currentAwardPeriod, currentMonthName]);

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
                    <CardTitle>In-Month MiMoM Standings</CardTitle>
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
                            return (
                                <TableRow key={user.id} className="border-b-4 border-transparent">
                                    <TableCell className={cn("p-2 font-medium text-center", rankColour, rankColour && 'rounded-l-md')}>{user.displayRank}</TableCell>
                                    <TableCell className={cn("p-2", rankColour)}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
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
                        <CardDescription>Previous winners and runners-up.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mimoMWithDetails.map((monthlyAward, index) => {
                            const hasAwards = monthlyAward.winners || monthlyAward.runnersUp || monthlyAward.currentLeaders || monthlyAward.currentRunnersUp;
                            const isFuture = monthlyAward.isFuture;
                            const isCurrent = monthlyAward.isCurrentMonth;
                            
                            const winners = monthlyAward.winners || monthlyAward.currentLeaders;
                            const runnersUp = monthlyAward.runnersUp || monthlyAward.currentRunnersUp;

                            const isTie = winners && winners.length > 1;
                            const winnerPrize = isTie ? 15 / winners.length : 10 / (winners?.length || 1);
                            const runnerUpPrize = isTie ? 0 : (winners?.length === 1 && runnersUp?.length ? 5 / runnersUp.length : 0);

                            return (
                            <div key={index} className={cn("p-3 border rounded-lg flex flex-col items-center justify-start text-center", {
                                'opacity-70': isCurrent,
                                'opacity-50': isFuture && !isCurrent,
                            })}>
                                <p className="font-bold mb-2 text-sm">{monthlyAward.abbreviation}</p>
                                
                                {hasAwards ? (
                                    <div className="w-full space-y-2">
                                        {winners?.map(winner => (
                                            <div key={winner.userId || winner.id} className="bg-yellow-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(winner.avatar || '')} alt={winner.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{(winner.name || '?').charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{winner.name}
                                                        {typeof winner.improvement === 'number' && <span className="font-normal text-muted-foreground"> ({winner.improvement >= 0 ? '+' : ''}{winner.improvement}pts)</span>}
                                                    </p>
                                                    {monthlyAward.winners && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{isTie ? 'JoMiMoM' : 'MiMoM'}</p>}
                                                    {monthlyAward.currentLeaders && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{isTie ? 'Current JoMiMoM' : 'Current Leader'}</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {runnerUpPrize > 0 && runnersUp?.map(runnerUp => (
                                            <div key={runnerUp.userId || runnerUp.id} className="bg-slate-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(runnerUp.avatar || '')} alt={runnerUp.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{(runnerUp.name || '?').charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{runnerUp.name}
                                                        {typeof runnerUp.improvement === 'number' && <span className="font-normal text-muted-foreground"> ({runnerUp.improvement >= 0 ? '+' : ''}{runnerUp.improvement}pts)</span>}
                                                    </p>
                                                    <p className="text-xs font-semibold text-slate-800/80 dark:text-slate-200/80">{(runnersUp.length > 1 ? 'JoRuMiMoM' : 'RuMiMoM')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full space-y-2">
                                        <div className="bg-yellow-400/20 p-2 rounded-md flex items-center justify-center h-[60px]">
                                            <p className="text-sm font-bold text-yellow-800/80 dark:text-yellow-200/80">MiMoM - TBC</p>
                                        </div>
                                        <div className="bg-slate-400/20 p-2 rounded-md flex items-center justify-center h-[60px]">
                                            <p className="text-sm font-bold text-slate-800/80 dark:text-slate-200/80">RuMiMoM - TBC</p>
                                        </div>
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
