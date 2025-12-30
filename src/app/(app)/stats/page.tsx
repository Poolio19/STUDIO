
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

export default function StatsPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('rank', 'asc')) : null, [firestore]);
  const teamsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'teams'), orderBy('name', 'asc')) : null, [firestore]);
  const scoresQuery = useMemoFirebase(() => firestore ? collection(firestore, 'playerTeamScores') : null, [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: playerTeamScores, isLoading: scoresLoading } = useCollection<PlayerTeamScore>(scoresQuery);

  const isLoading = usersLoading || teamsLoading || scoresLoading;
  
  const sortedUsers = users || [];
  const sortedTeams = teams || [];

  const getScoreColour = (score: number) => {
    if (score === 5) return 'bg-green-200/50 dark:bg-green-800/50 font-bold';
    if (score >= 3) return 'bg-green-100/50 dark:bg-green-900/40';
    if (score <= 0) return 'bg-red-100/50 dark:bg-red-900/40 text-red-500';
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
                            <TableRow className="h-40">
                                <TableHead className="sticky left-0 z-10 bg-card whitespace-nowrap w-[250px]">Player</TableHead>
                                <TableHead className="text-center p-0 w-[40px] border-l border-dashed border-border">
                                    <div className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap font-bold h-[140px] flex items-center justify-center">TOTAL</div>
                                </TableHead>
                                {sortedTeams.map((team) => {
                                    return (
                                    <TableHead key={team.id} className="text-center p-0 w-[40px] border-l border-dashed border-border">
                                        <div className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap font-medium h-[140px] flex items-center justify-center">{team.name}</div>
                                    </TableHead>
                                )})}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="sticky left-0 z-10 bg-card whitespace-nowrap font-medium w-[250px]">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg border-l border-dashed border-border">
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
