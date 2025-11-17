
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
import { Award, Star, CalendarClock, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

const getRankChangeIcon = (change: number) => {
  if (change > 0) return 'rankUp';
  if (change < 0) return 'rankDown';
  return 'rankSame';
};

const formatPointsChange = (change: number) => {
    if (change > 0) return <span className="text-green-500">+{change}</span>;
    if (change < 0) return <span className="text-red-500">{change}</span>;
    return <span>{change}</span>;
}

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

export default function MostImprovedPage() {
  const sortedByImprovement = [...users].sort((a, b) => b.rankChange - a.rankChange);
  
  // For design purposes, we assume it's mid-September
  const currentMonthName = 'September';
  const currentYear = 2025;

  const mimoMWithDetails = useMemo(() => {
    const awardsByMonth: { [key: string]: { winners: any[], runnersUp: any[] } } = {};

    monthlyMimoM.forEach(m => {
      const key = m.special ? m.special : `${m.month}-${m.year}`;
      if (!awardsByMonth[key]) {
        awardsByMonth[key] = { winners: [], runnersUp: [] };
      }
      const user = users.find(u => u.id === m.userId);
      if (user) {
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

        let currentLeaders: User[] | null = null;
        if (isCurrentMonth && !awards) {
            const maxRankChange = sortedByImprovement[0].rankChange;
            if (maxRankChange > 0) {
              currentLeaders = sortedByImprovement.filter(u => u.rankChange === maxRankChange);
            }
        }
        
        return {
            ...seasonMonth,
            isCurrentMonth,
            currentLeaders,
            winners: awards?.winners.length > 0 ? awards.winners : null,
            runnersUp: awards?.runnersUp.length > 0 ? awards.runnersUp : null
        }
    }).sort((a, b) => {
      const monthOrder = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
      if (a.year !== b.year) return a.year - b.year;
      
      const aIndex = monthOrder.indexOf(a.month);
      const bIndex = monthOrder.indexOf(b.month);

      if (aIndex !== bIndex) return aIndex - bIndex;

      // If months are the same (e.g., December), 'special' comes after.
      if (a.special && !b.special) return 1;
      if (!a.special && b.special) return -1;
      
      return 0;
    });
  }, [sortedByImprovement, currentMonthName, currentYear]);

  const ladderWithRanks = useMemo(() => {
    let rank = 0;
    let lastRankChange = Infinity;
    return sortedByImprovement.map((user, index) => {
      if (user.rankChange < lastRankChange) {
        rank = index + 1;
        lastRankChange = user.rankChange;
      }
      return { ...user, displayRank: rank };
    });
  }, [sortedByImprovement]);

  const getLadderRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/20';
    if (rank === 2) return 'bg-slate-400/20';
    return '';
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Most Improved (and Runner Up) Manager(s) of the Month MiMoM & RuMiMoM</h1>
          <p className="text-muted-foreground">Celebrating the meek, rarely-vaunted, mid-season heroes of the PremPred - with cash!</p>
      </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/5 to-slate-400/20">
                    <CardTitle>In-Month MiMoM Standings</CardTitle>
                    <CardDescription>Current standings for SEPT</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table className="border-separate border-spacing-y-1">
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-center">Position Change</TableHead>
                            <TableHead className="text-center">Points Change</TableHead>
                            <TableHead className="text-center">Current Score</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ladderWithRanks.map((user) => {
                            const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                            const rankColor = getLadderRankColor(user.displayRank);
                            return (
                                <TableRow key={user.id} className={cn(rankColor, "border-b-4 border-transparent")}>
                                    <TableCell className={cn("font-medium", rankColor && 'first:rounded-l-md')}>{user.displayRank}</TableCell>
                                    <TableCell className={cn(rankColor)}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className={cn("text-center", rankColor)}>
                                        <div className="flex items-center justify-center gap-1 font-bold text-lg">
                                        <RankIcon className="size-5" />
                                        <span>{Math.abs(user.rankChange)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("text-center font-medium", rankColor)}>{formatPointsChange(user.scoreChange)}</TableCell>
                                    <TableCell className={cn("text-center font-bold", rankColor && 'last:rounded-r-md')}>{user.score}</TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>MiMoM Hall of Fame</CardTitle>
                        <CardDescription>Previous winners and runners-up.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mimoMWithDetails.map((monthlyAward, index) => {
                            const hasAwards = monthlyAward.winners || monthlyAward.runnersUp || monthlyAward.currentLeaders;
                            const isFuture = !hasAwards;
                            const isCurrent = monthlyAward.isCurrentMonth && !monthlyAward.winners;
                            
                            const winnerPrize = 10 / (monthlyAward.winners?.length || monthlyAward.currentLeaders?.length || 1);
                            const runnerUpPrize = 5 / (monthlyAward.runnersUp?.length || 1);

                            return (
                            <div key={index} className={cn("p-3 border rounded-lg flex flex-col items-center justify-start text-center", {
                                'opacity-70': isCurrent,
                                'opacity-50': isFuture && !isCurrent,
                            })}>
                                <p className="font-bold mb-2 text-sm">{monthlyAward.abbreviation}</p>
                                
                                {hasAwards ? (
                                    <div className="w-full space-y-2">
                                        {(monthlyAward.winners || monthlyAward.currentLeaders)?.map(winner => (
                                            <div key={winner.userId || winner.id} className="bg-yellow-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(winner.avatar || '')} alt={winner.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{winner.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{winner.name} - £{winnerPrize % 1 === 0 ? winnerPrize : winnerPrize.toFixed(2)}</p>
                                                    {monthlyAward.winners && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{(monthlyAward.winners.length > 1 ? 'JoMiMoM' : 'MiMoM')}</p>}
                                                    {monthlyAward.currentLeaders && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">Current Leader</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {monthlyAward.runnersUp && (monthlyAward.winners?.length === 1 || monthlyAward.currentLeaders?.length === 1) && monthlyAward.runnersUp.map(runnerUp => (
                                            <div key={runnerUp.userId} className="bg-slate-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(runnerUp.avatar || '')} alt={runnerUp.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{runnerUp.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{runnerUp.name} - £{runnerUpPrize % 1 === 0 ? runnerUpPrize : runnerUpPrize.toFixed(2)}</p>
                                                    <p className="text-xs font-semibold text-slate-800/80 dark:text-slate-200/80">{(monthlyAward.runnersUp!.length > 1 ? 'JoRuMiMoM' : 'RuMiMoM')}</p>
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
