
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
import type { User, CurrentStanding, MonthlyMimoM, SeasonMonth } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';


const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

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

const getMonthForWeek = (week: number): { month: string; year: number } => {
    if (week <= 4) return { month: 'August', year: 2025 };
    if (week <= 8) return { month: 'September', year: 2025 };
    if (week <= 11) return { month: 'October', year: 2025 };
    if (week <= 14) return { month: 'November', year: 2025 };
    if (week <= 19) return { month: 'December', year: 2025 };
    if (week <= 23) return { month: 'January', year: 2026 };
    if (week <= 27) return { month: 'February', year: 2026 };
    if (week <= 31) return { month: 'March', year: 2026 };
    if (week <= 35) return { month: 'April', year: 2026 };
    if (week >= 36) return { month: 'May', year: 2026 };
    return { month: 'August', year: 2025 }; // Default case
};


export default function MostImprovedPage() {
  const firestore = useFirestore();
  const { isUserLoading: isAuthUserLoading } = useUser();

  const usersQuery = useMemoFirebase(() => !isAuthUserLoading && firestore ? collection(firestore, 'users') : null, [firestore, isAuthUserLoading]);
  const standingsQuery = useMemoFirebase(() => !isAuthUserLoading && firestore ? collection(firestore, 'standings') : null, [firestore, isAuthUserLoading]);
  const mimoMQuery = useMemoFirebase(() => !isAuthUserLoading && firestore ? collection(firestore, 'monthlyMimoM') : null, [firestore, isAuthUserLoading]);
  const seasonMonthsQuery = useMemoFirebase(() => !isAuthUserLoading && firestore ? collection(firestore, 'seasonMonths') : null, [firestore, isAuthUserLoading]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: currentStandings, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
  const { data: monthlyMimoM, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);
  const { data: seasonMonthsData, isLoading: seasonMonthsLoading } = useCollection<SeasonMonth>(seasonMonthsQuery);

  const isLoading = isAuthUserLoading || usersLoading || standingsLoading || mimoMLoading || seasonMonthsLoading;

  const currentWeek = useMemo(() => {
    if (currentStandings && currentStandings.length > 0) {
      // Find the maximum games played across all teams to get the true current week
      return Math.max(...currentStandings.map(s => s.gamesPlayed), 0);
    }
    return 1;
  }, [currentStandings]);

  const { month: currentMonthName, year: currentYear } = getMonthForWeek(currentWeek);

  const ladderData = useMemo(() => {
    if (!users) return { ladderWithRanks: [], firstPlaceRankChange: undefined, secondPlaceRankChange: undefined };
    const regularPlayersSorted = users
      .filter(u => !u.isPro)
      .sort((a, b) => b.rankChange - a.rankChange || (a.rank || 0) - (b.rank || 0));
      
    let rank = 0;
    let lastRankChange = Infinity;
    const rankedUsers = regularPlayersSorted.map((user, index) => {
      if (user.rankChange < lastRankChange) {
        rank = index + 1;
        lastRankChange = user.rankChange;
      }
      return { ...user, displayRank: rank };
    });

    const allRankChanges = [...new Set(rankedUsers.map(u => u.rankChange))].sort((a, b) => b - a);
    const firstPlaceRankChange = allRankChanges.length > 0 ? allRankChanges[0] : undefined;
    const secondPlaceRankChange = allRankChanges.length > 1 ? allRankChanges[1] : undefined;

    return { ladderWithRanks: rankedUsers, firstPlaceRankChange, secondPlaceRankChange };
  }, [users]);
  
  const seasonMonths = useMemo(() => {
    if (!seasonMonthsData) return [];
    return [...seasonMonthsData].sort((a, b) => {
        const aSpecial = a.special === 'Christmas No. 1';
        const bSpecial = b.special === 'Christmas No. 1';
        if (a.year !== b.year) return a.year - b.year;
        if (aSpecial && !bSpecial) return 1;
        if (!aSpecial && bSpecial) return -1;
        const monthOrder = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  }, [seasonMonthsData]);

  const mimoMWithDetails = useMemo(() => {
    if (!users || !monthlyMimoM || !seasonMonths) return [];
    const awardsByMonth: { [key: string]: { winners: any[], runnersUp: any[] } } = {};
    const monthOrder = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
    const currentMonthIndex = monthOrder.indexOf(currentMonthName);

    monthlyMimoM.forEach(m => {
      const key = m.special ? m.special : `${m.month}-${m.year}`;
      if (!awardsByMonth[key]) {
        awardsByMonth[key] = { winners: [], runnersUp: [] };
      }
      const user = users.find(u => u.id === m.userId);
      if (user && !user.isPro) { // Ensure user exists and is not a PRO
        if (m.type === 'winner') {
          awardsByMonth[key].winners.push({ ...m, ...user });
        } else if (m.type === 'runner-up') {
          awardsByMonth[key].runnersUp.push({ ...m, ...user });
        }
      }
    });
    
    return seasonMonths.map(seasonMonth => {
        const key = seasonMonth.special ? seasonMonth.special : `${seasonMonth.month}-${seasonMonth.year}`;
        const awards = awardsByMonth[key];
        const isCurrentMonth = seasonMonth.month === currentMonthName && seasonMonth.year === currentYear;
        
        const monthIndex = monthOrder.indexOf(seasonMonth.month);
        const isFuture = seasonMonth.year > currentYear || (seasonMonth.year === currentYear && monthIndex > currentMonthIndex);

        let currentLeaders: User[] | null = null;
        let currentRunnersUp: User[] | null = null;
        
        if (isCurrentMonth && (!awards || awards.winners.length === 0)) {
            const { ladderWithRanks, firstPlaceRankChange, secondPlaceRankChange } = ladderData;
            if(firstPlaceRankChange !== undefined) {
                currentLeaders = ladderWithRanks.filter(u => u.rankChange === firstPlaceRankChange);
            }
            if(secondPlaceRankChange !== undefined && secondPlaceRankChange !== firstPlaceRankChange) {
                currentRunnersUp = ladderWithRanks.filter(u => u.rankChange === secondPlaceRankChange);
            }
        }
        
        return {
            ...seasonMonth,
            isCurrentMonth,
            isFuture,
            currentLeaders,
            currentRunnersUp,
            winners: awards?.winners.length > 0 ? awards.winners : null,
            runnersUp: awards?.runnersUp.length > 0 ? awards.runnersUp : null
        }
    }).sort((a, b) => {
      const monthOrderSort = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
      
      const aYear = a.special === 'Christmas No. 1' ? a.year + 0.1 : a.year;
      const bYear = b.special === 'Christmas No. 1' ? b.year + 0.1 : b.year;
      if (aYear !== bYear) return aYear - bYear;
      
      const aIndex = monthOrderSort.indexOf(a.month);
      const bIndex = monthOrderSort.indexOf(b.month);

      if (aIndex !== bIndex) return aIndex - bIndex;

      if (a.special && !b.special) return 1;
      if (!a.special && b.special) return -1;
      
      return 0;
    });
  }, [users, monthlyMimoM, seasonMonths, currentMonthName, currentYear, ladderData]);

  const getLadderRankColour = (user: (typeof ladderData.ladderWithRanks)[0]) => {
    if (ladderData.firstPlaceRankChange !== undefined && user.rankChange === ladderData.firstPlaceRankChange) return 'bg-yellow-400/20';
    if (ladderData.secondPlaceRankChange !== undefined && user.rankChange === ladderData.secondPlaceRankChange && ladderData.secondPlaceRankChange !== ladderData.firstPlaceRankChange) return 'bg-slate-400/20';
    return '';
  };

  const currentMonthAbbreviation = useMemo(() => {
    if (!seasonMonths) return currentMonthName.slice(0, 4).toUpperCase();
    return seasonMonths.find(sm => sm.month === currentMonthName && sm.year === currentYear)?.abbreviation || currentMonthName.slice(0, 4).toUpperCase();
  }, [currentMonthName, currentYear, seasonMonths]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
                <h1 className="text-3xl font-bold tracking-tight">Most Improved Manager Of The Month</h1>
                <p className="text-slate-400">Celebrating the meek, rarely-vaunted, mid-season heroes of the PremPred - with cash!</p>
            </header>
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
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">Most Improved Manager Of The Month</h1>
          <p className="text-slate-400">Celebrating the meek, rarely-vaunted, mid-season heroes of the PremPred - with cash!</p>
      </header>
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
                            <TableHead className="w-[50px] text-center">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-center">Position Change</TableHead>
                            <TableHead className="text-center">Points Change</TableHead>
                            <TableHead className="text-center">Current Score</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ladderData.ladderWithRanks.map((user) => {
                            const RankIcon = getRankChangeIcon(user.rankChange);
                            const rankColour = getLadderRankColour(user);
                            return (
                                <TableRow key={user.id} className="border-b-4 border-transparent">
                                    <TableCell className={cn("p-2 font-medium text-center", rankColour, rankColour && 'rounded-l-md')}>{user.displayRank}</TableCell>
                                    <TableCell className={cn("p-2", rankColour)}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold text-lg", rankColour, getRankChangeColour(user.rankChange))}>
                                        <div className="flex items-center justify-center gap-1">
                                            <RankIcon className="size-5" />
                                            <span>{Math.abs(user.rankChange)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-medium", rankColour)}>{formatPointsChange(user.scoreChange)}</TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold", rankColour, rankColour && 'rounded-r-md')}>{user.score}</TableCell>
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
                                                    <AvatarFallback>{winner.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{winner.name} - £{winnerPrize % 1 === 0 ? winnerPrize : winnerPrize.toFixed(2)}</p>
                                                    {monthlyAward.winners && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{isTie ? 'JoMiMoM' : 'MiMoM'}</p>}
                                                    {monthlyAward.currentLeaders && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{isTie ? 'Current JoMiMoM' : 'Current Leader'}</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {runnerUpPrize > 0 && runnersUp?.map(runnerUp => (
                                            <div key={runnerUp.userId || runnerUp.id} className="bg-slate-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(runnerUp.avatar || '')} alt={runnerUp.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{runnerUp.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{runnerUp.name} - £{runnerUpPrize % 1 === 0 ? runnerUpPrize : runnerUpPrize.toFixed(2)}</p>
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

    