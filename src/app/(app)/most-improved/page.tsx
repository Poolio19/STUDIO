
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
import { users, monthlyMimoM, currentStandings, seasonMonths, type User } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons, IconName } from '@/components/icons';
import { Award, Star, CalendarClock, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

const getRankChangeIcon = (change: number) => {
  if (change > 0) return ArrowUp;
  if (change < 0) return ArrowDown;
  return Minus;
};

const getRankChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
}

const formatPointsChange = (change: number) => {
    if (change > 0) return <span className="text-green-500">+{change}</span>;
    if (change < 0) return <span className="text-red-500">{change}</span>;
    return <span>{change}</span>;
}

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

export default function MostImprovedPage() {
  
  const currentMonthName = 'September';
  const currentYear = 2025;

  const ladderData = useMemo(() => {
    // Rank change is previous - current. A positive number is an improvement.
    const regularPlayersSorted = users
      .filter(u => !u.isPro)
      .sort((a, b) => b.rankChange - a.rankChange || a.rank - b.rank);
      
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
    const firstPlaceRankChange = allRankChanges[0];
    const secondPlaceRankChange = allRankChanges.length > 1 ? allRankChanges[1] : undefined;

    return { ladderWithRanks: rankedUsers, firstPlaceRankChange, secondPlaceRankChange };
  }, [users]);

  const mimoMWithDetails = useMemo(() => {
    const awardsByMonth: { [key: string]: { winners: any[], runnersUp: any[] } } = {};
    const monthOrder = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
    const currentMonthIndex = monthOrder.indexOf(currentMonthName);

    const proPlayerIds = new Set(users.filter(u => u.isPro).map(u => u.id));

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
            if(secondPlaceRankChange !== undefined) {
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
  }, [users, currentMonthName, currentYear, ladderData]);

  const getLadderRankColor = (user: (typeof ladderData.ladderWithRanks)[0]) => {
    if (ladderData.firstPlaceRankChange !== undefined && user.rankChange === ladderData.firstPlaceRankChange) return 'bg-yellow-400/20';
    if (ladderData.secondPlaceRankChange !== undefined && user.rankChange === ladderData.secondPlaceRankChange) return 'bg-slate-400/20';
    return '';
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Most Improved Manager Of The Month</h1>
          <p className="text-muted-foreground">Celebrating the meek, rarely-vaunted, mid-season heroes of the PremPred - with cash!</p>
      </header>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="flex flex-col gap-8 lg:col-span-2">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                    <CardTitle>In-Month MiMoM Standings</CardTitle>
                    <CardDescription>Current standings for SEPT</CardDescription>
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
                            const rankColor = getLadderRankColor(user);
                            return (
                                <TableRow key={user.id} className="border-b-4 border-transparent">
                                    <TableCell className={cn("p-2 font-medium text-center", rankColor, rankColor && 'rounded-l-md')}>{user.displayRank}</TableCell>
                                    <TableCell className={cn("p-2", rankColor)}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold text-lg", rankColor, getRankChangeColor(user.rankChange))}>
                                        <div className="flex items-center justify-center gap-1">
                                            <RankIcon className="size-5" />
                                            <span>{Math.abs(user.rankChange)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("p-2 text-center font-medium", rankColor)}>{formatPointsChange(user.scoreChange)}</TableCell>
                                    <TableCell className={cn("p-2 text-center font-bold", rankColor, rankColor && 'rounded-r-md')}>{user.score}</TableCell>
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

                            const winnerPrize = 10 / (winners?.length || 1);
                            const runnerUpPrize = (winners?.length === 1 && runnersUp?.length) ? (5 / runnersUp.length) : 0;

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
                                                    {monthlyAward.winners && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{(winners.length > 1 ? 'JoMiMoM' : 'MiMoM')}</p>}
                                                    {monthlyAward.currentLeaders && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">Current Leader</p>}
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

    

    
