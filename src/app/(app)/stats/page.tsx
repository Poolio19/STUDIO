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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import type { User, Team, PlayerTeamScore } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

export default function StatsPage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const usersQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'users') : null, [firestore, isUserLoading]);
  const teamsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'teams') : null, [firestore, isUserLoading]);
  const scoresQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'playerTeamScores') : null, [firestore, isUserLoading]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: playerTeamScores, isLoading: scoresLoading } = useCollection<PlayerTeamScore>(scoresQuery);

  const isLoading = isUserLoading || usersLoading || teamsLoading || scoresLoading;
  
  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a, b) => a.rank - b.rank);
  }, [users]);
  
  const sortedTeams = useMemo(() => {
    if (!teams) return [];
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);


  const getScoreColour = (score: number) => {
    if (score === 5) return 'bg-green-500/80 dark:bg-green-700/80 font-bold text-white';
    if (score === 4) return 'bg-green-400/50 dark:bg-green-800/50';
    if (score === 3) return 'bg-green-300/50 dark:bg-green-900/50';
    if (score <= 0) return 'bg-red-400/50 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    return '';
  };


  return (
    <div className="flex flex-col gap-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Prediction Stats Matrix</h1>
        <p className="text-slate-400">
          A detailed breakdown of each player's prediction scores for every team.
        </p>
      </header>
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
                    <div className="flex justify-center items-center h-96">Loading stats...</div>
                ) : (
                    <Table className="min-w-full border-collapse">
                        <TableHeader>
                            <TableRow className="h-[65px]">
                                <TableHead className="sticky left-0 z-10 bg-card whitespace-nowrap w-[250px] p-0">
                                    <div className="flex items-end h-full pb-1 pl-12">
                                        <span className="text-xl font-bold text-black dark:text-white">Player</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center p-0 w-[40px] border-l border-dashed border-border">
                                    <div className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap font-bold h-[57px] w-full flex items-center justify-end">TOTAL</div>
                                </TableHead>
                                {sortedTeams.map((team) => {
                                    return (
                                    <TableHead key={team.id} className="text-left p-0 w-[40px] border-l border-dashed border-border">
                                        <div className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap font-medium h-[57px] w-full flex items-center justify-end">{team.name}</div>
                                    </TableHead>
                                )})}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => (
                                <TableRow key={user.id} className="h-10">
                                    <TableCell className="sticky left-0 z-10 bg-card whitespace-nowrap font-medium p-0 w-[250px]">
                                        <div className="flex items-center justify-between gap-3 h-10 pl-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg border-l border-dashed border-border p-0">
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
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
