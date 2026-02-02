'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import type { User, Team, PlayerTeamScore, CurrentStanding, Prediction } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import historicalPlayersData from '@/lib/historical-players.json';


export default function StatsPage() {
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('rank', 'asc')) : null, [firestore]);
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const scoresQuery = useMemoFirebase(() => firestore ? collection(firestore, 'playerTeamScores') : null, [firestore]);
  const standingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'standings'), orderBy('rank', 'asc')) : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: playerTeamScores, isLoading: scoresLoading } = useCollection<PlayerTeamScore>(scoresQuery);
  const { data: standings, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);

  const isLoading = usersLoading || teamsLoading || scoresLoading || standingsLoading || predictionsLoading;
  
  const sortedUsers = useMemo(() => {
    if (!users || !predictions) return [];
    
    // 1. Identify IDs of players in the official historical list
    const historicalUserIds = new Set(historicalPlayersData.map(p => p.id));

    // 2. Identify IDs of players who have officially entered this season (complete prediction)
    const activeUserIds = new Set(
      predictions
        .filter(p => p.rankings && p.rankings.length === 20)
        .map(p => p.userId || p.id)
    );

    // 3. Filter for users who are both historical players AND active this season
    return [...users]
      .filter(u => u.name && historicalUserIds.has(u.id) && activeUserIds.has(u.id))
      .sort((a, b) => a.rank - b.rank);
  }, [users, predictions]);
  
  const sortedTeams = useMemo(() => {
    if (!teams || !standings) return [];
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return standings
      .sort((a, b) => a.rank - b.rank)
      .map(standing => teamMap.get(standing.teamId))
      .filter((team): team is Team => !!team);
  }, [teams, standings]);


  const getScoreColour = (score: number) => {
    if (score === 5) return 'bg-green-500/80 dark:bg-green-700/80 font-bold text-white';
    if (score === 4) return 'bg-green-400/50 dark:bg-green-800/50';
    if (score === 3) return 'bg-green-300/50 dark:bg-green-900/50';
    if (score <= 0) return 'bg-red-400/50 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    return '';
  };


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
            <CardTitle>Stats Matrix</CardTitle>
            <CardDescription>
                Player scores per predicted team. Green indicates a good prediction, red indicates a poor one.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Loading stats matrix...</span>
                      </div>
                    </div>
                ) : (
                    <Table className="min-w-full border-collapse">
                        <TableHeader>
                            <TableRow className="h-[102px]">
                                <TableHead className="sticky left-0 z-10 bg-card whitespace-nowrap w-[250px] p-0 pl-12">
                                    <div className="flex items-end h-full pb-1">
                                        <span className="text-xl font-bold text-black dark:text-white">Player</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center p-0 border-l border-dashed border-border w-[40px]">
                                     <div
                                        className="[writing-mode:vertical-rl] transform-gpu rotate-180 flex justify-end items-center font-bold h-full w-full pb-1 whitespace-nowrap"
                                    >
                                        TOTAL
                                    </div>
                                </TableHead>
                                {sortedTeams.map((team) => {
                                    return (
                                    <TableHead key={team.id} className="text-left p-0 border-l border-dashed border-border w-[40px]">
                                        <div
                                            className="[writing-mode:vertical-rl] transform-gpu rotate-180 flex justify-end items-center font-medium h-full w-full pb-1 whitespace-nowrap"
                                        >
                                            {team.name}
                                        </div>
                                    </TableHead>
                                )})}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => {
                                const isCurrentUser = user.id === resolvedUserId;
                                return (
                                <TableRow key={user.id} className={cn("h-10", { 'bg-accent': isCurrentUser })}>
                                    <TableCell className={cn("sticky left-0 z-10 bg-card whitespace-nowrap font-medium p-0 w-[250px]", { 'bg-accent': isCurrentUser })}>
                                        <div className="flex items-center justify-between gap-3 h-full pl-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                                    <AvatarFallback>{(user.name || '?').charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className={cn("font-medium", { 'font-bold': isCurrentUser })}>{user.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("text-center font-bold text-lg border-l border-dashed border-border p-0", { 'font-extrabold': isCurrentUser })}>
                                        {user.score}
                                    </TableCell>
                                    {sortedTeams.map((team) => {
                                        const score = playerTeamScores?.find(
                                            (s) => s.userId === user.id && s.teamId === team.id
                                        )?.score ?? 0;
                                        return (
                                            <TableCell key={`${user.id}-${team.id}`} className={cn("text-center font-medium p-0 border-l border-dashed border-border", getScoreColour(score))}>
                                                {score}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
