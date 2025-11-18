
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { User, Team, PlayerTeamScore, PreviousSeasonStanding, Prediction } from '@/lib/data';

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

export default function StatsPage() {
  const firestore = useFirestore();
  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const teamsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const predictionsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);
  const previousStandingsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'previousSeasonStandings') : null, [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollectionRef);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsCollectionRef);
  const { data: userPredictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsCollectionRef);
  const { data: previousSeasonStandings, isLoading: prevStandingsLoading } = useCollection<PreviousSeasonStanding>(previousStandingsCollectionRef);
  
  const { playerTeamScores } = useMemo(() => {
    if (!userPredictions || !previousSeasonStandings) return { playerTeamScores: [] };
    
    const actualRanks = new Map<string, number>();
    previousSeasonStandings.forEach((s: any) => actualRanks.set(s.teamId, s.rank));

    const scores = userPredictions.flatMap((prediction: any) => {
      return prediction.rankings.map((teamId: string, index: number) => {
        const predictedRank = index + 1;
        const actualRank = actualRanks.get(teamId) || 0;
        let score = 0;
        if (actualRank > 0) {
            score = 5 - Math.abs(predictedRank - actualRank);
        }
        return {
            userId: prediction.id, // prediction doc id is the user id
            teamId: teamId,
            score: score,
        };
      });
    });
    return { playerTeamScores: scores as PlayerTeamScore[] };
  }, [userPredictions, previousSeasonStandings]);


  const sortedUsers = useMemo(() => users ? [...users].sort((a, b) => (a.rank || 0) - (b.rank || 0)) : [], [users]);
  const sortedTeams = useMemo(() => teams ? [...teams].sort((a, b) => a.name.localeCompare(b.name)) : [], [teams]);

  const isLoading = usersLoading || teamsLoading || predictionsLoading || prevStandingsLoading;

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
                    <div className="flex justify-center items-center h-64">Loading stats...</div>
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
                                        const score = playerTeamScores.find(
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

    