
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
import { users, teams, playerTeamScores } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

export default function StatsPage() {
  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.rank - b.rank), []);
  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), []);

  const getScoreColor = (score: number) => {
    if (score === 5) return 'bg-green-200/50 dark:bg-green-800/50 font-bold';
    if (score >= 3) return 'bg-green-100/50 dark:bg-green-900/40';
    if (score <= 0) return 'bg-red-100/50 dark:bg-red-900/40 text-red-500';
    return '';
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">PredictionStatsMatrix</h1>
        <p className="text-muted-foreground">
          A detailed breakdown of each player's prediction scores for every team.
        </p>
      </header>
      <Card>
        <CardHeader>
            <CardTitle>StatsMatrix</CardTitle>
            <CardDescription>
                Player scores per predicted team. Green indicates a good prediction, red indicates a poor one.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table className="min-w-full border-collapse">
                    <TableHeader>
                        <TableRow className="h-40">
                            <TableHead className="sticky left-0 z-10 bg-card whitespace-nowrap w-[250px]">Player</TableHead>
                             <TableHead className="text-center p-0 w-[40px]">
                                <div className="[writing-mode:vertical-rl] transform-gpu rotate-180 whitespace-nowrap font-bold h-[140px] flex items-center justify-center">TOTAL</div>
                            </TableHead>
                            {sortedTeams.map((team) => {
                                return (
                                <TableHead key={team.id} className="text-center p-0 w-[40px]">
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
                                <TableCell className="text-center font-bold text-lg">
                                    {user.score}
                                </TableCell>
                                {sortedTeams.map((team) => {
                                    const score = playerTeamScores.find(
                                        (s) => s.userId === user.id && s.teamId === team.id
                                    )?.score ?? 0;
                                    return (
                                        <TableCell key={`${user.id}-${team.id}`} className={cn("text-center font-medium p-0", getScoreColor(score))}>
                                            {score}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
