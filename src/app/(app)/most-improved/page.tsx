
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
  const mostImprovedPlayer = sortedByImprovement[0];
  
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
    });
  }, [sortedByImprovement, currentMonthName, currentYear]);

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Most Improved Manager of the Month (MiMoM)</h1>
          <p className="text-muted-foreground">Celebrating the sharpest climbers in the ranks.</p>
      </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card className="bg-primary/10 border-primary/50">
                    <CardHeader className="flex-row items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/20">
                        <Trophy className="size-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Manager of the Month - {currentMonthName}</CardTitle>
                        <CardDescription>This is the current leader for this month's award!</CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={getAvatarUrl(mostImprovedPlayer.avatar)} alt={mostImprovedPlayer.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{mostImprovedPlayer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <h3 className="text-xl font-bold">{mostImprovedPlayer.name}</h3>
                        <p className="text-muted-foreground">Jumped <span className="font-bold text-green-600">{mostImprovedPlayer.rankChange}</span> spots this month!</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>Monthly Improvement Rankings</CardTitle>
                    <CardDescription>Current rankings based on position change in Week {currentWeek}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-center">Position Change</TableHead>
                            <TableHead className="text-center">Points Change</TableHead>
                            <TableHead className="text-right">Current Score</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {sortedByImprovement.map((user, index) => {
                            const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold text-lg">
                                        <RankIcon className="size-5" />
                                        <span>{Math.abs(user.rankChange)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{formatPointsChange(user.scoreChange)}</TableCell>
                                    <TableCell className="text-right font-bold">{user.score}</TableCell>
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {mimoMWithDetails.map((monthlyAward, index) => {
                            const isFuture = !monthlyAward.winners && !monthlyAward.currentLeaders;
                            const isCurrent = monthlyAward.isCurrentMonth;

                            return (
                            <div key={index} className={cn("p-3 border rounded-lg flex flex-col items-center justify-start text-center", {
                                'opacity-70': isCurrent,
                                'opacity-50': isFuture,
                            })}>
                                <p className="font-bold mb-2 text-sm">{monthlyAward.abbreviation}</p>
                                
                                {monthlyAward.winners || monthlyAward.currentLeaders ? (
                                    <div className="w-full space-y-2">
                                        {(monthlyAward.winners || monthlyAward.currentLeaders)?.map(winner => (
                                            <div key={winner.userId || winner.id} className="bg-yellow-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(winner.avatar || '')} alt={winner.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{winner.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{winner.name}</p>
                                                    {monthlyAward.winners && <p className="text-xs font-semibold text-yellow-800/80 dark:text-yellow-200/80">{monthlyAward.winners && monthlyAward.winners.length > 1 ? 'JoMiMoM' : 'MiMoM'}</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {monthlyAward.runnersUp && monthlyAward.winners?.length === 1 && monthlyAward.runnersUp.map(runnerUp => (
                                            <div key={runnerUp.userId} className="bg-slate-400/20 p-2 rounded-md flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(runnerUp.avatar || '')} alt={runnerUp.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{runnerUp.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{runnerUp.name}</p>
                                                     <p className="text-xs font-semibold text-slate-800/80 dark:text-slate-200/80">{monthlyAward.runnersUp && monthlyAward.runnersUp.length > 1 ? 'JoRuMiMoM' : 'RuMiMoM'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1 flex-grow text-muted-foreground p-4">
                                        <CalendarClock className="size-8" />
                                        <p className="text-xs font-medium">TBC</p>
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
