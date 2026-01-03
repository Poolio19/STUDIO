
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Team, Prediction } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';

type ConsensusData = {
  [teamId: string]: number[];
};

const lightTextColours = ['#FFFFFF', '#FBE122', '#99D6EA', '#FDBE11'];

export default function ConsensusPage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const teamsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'teams') : null, [firestore, isUserLoading]);
  const predictionsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'predictions') : null, [firestore, isUserLoading]);
  const standingsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'standings') : null, [firestore, isUserLoading]);


  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: userPredictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);
  const { data: currentStandings, isLoading: standingsLoading } = useCollection<any>(standingsQuery);

  const isLoading = isUserLoading || teamsLoading || predictionsLoading || standingsLoading;

  const standingsWithTeamData = useMemo(() => {
    if (!teams || !currentStandings) return [];
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return currentStandings
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return team ? { ...team, rank: standing.rank } : null;
      })
      .filter((team): team is Team & { rank: number } => !!team)
      .sort((a,b) => a.rank - b.rank);
  }, [teams, currentStandings]);

  const consensusData = useMemo((): ConsensusData | null => {
    if (!teams || !userPredictions) return null;
    const data: ConsensusData = teams.reduce((acc, team) => {
      acc[team.id] = Array(20).fill(0);
      return acc;
    }, {} as ConsensusData);

    userPredictions.forEach((prediction) => {
      if (prediction.rankings) {
        prediction.rankings.forEach((teamId, index) => {
          if (data[teamId]) {
            data[teamId][index]++;
          }
        });
      }
    });

    return data;
  }, [teams, userPredictions]);

  const positions = Array.from({ length: 20 }, (_, i) => i + 1);

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (isLoading) {
    return (
       <div className="space-y-8">
         <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
           <h1 className="text-3xl font-bold tracking-tight">Prediction Consensus</h1>
           <p className="text-slate-400">
             See how the community predicts the final league standings.
           </p>
         </header>
         <Card>
            <CardHeader>
                <CardTitle>Consensus Matrix</CardTitle>
                <CardDescription>
                The grid shows the number of players who have predicted each team to
                finish in a specific position.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icons.logo className="size-5 animate-spin" />
                <span>Loading consensus data...</span>
              </div>
            </CardContent>
         </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Prediction Consensus</h1>
        <p className="text-slate-400">
          See how the community predicts the final league standings.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Consensus Matrix</CardTitle>
          <CardDescription>
            The grid shows the number of players who have predicted each team to
            finish in a specific position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 w-[50px] bg-card text-center">Pos</TableHead>
                  <TableHead className="sticky left-[50px] z-20 w-[48px] bg-card"></TableHead>
                  <TableHead className="sticky left-[98px] z-10 bg-card w-[150px]">Team</TableHead>
                  {positions.map((pos) => (
                    <TableHead key={pos} className="w-[60px] text-center">{pos}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {standingsWithTeamData.map((teamData) => {
                  if (!teamData || !consensusData || !userPredictions) return null;
                  const TeamIcon = Icons[teamData.logo as IconName] || Icons.match;
                  const teamId = teamData.id;
                  const predictionCounts = consensusData[teamId];
                  if (!predictionCounts) return null;
                  const isLiverpool = teamId === 'team_12';
                  return (
                    <TableRow
                      key={teamId}
                      className="border-b border-dashed border-border"
                    >
                      <TableCell
                        className={cn("sticky left-0 z-20 text-center font-medium p-4 rounded-l-md")}
                        style={{ backgroundColor: teamData.bgColourFaint, color: teamData.textColour }}
                      >
                        {teamData.rank}
                      </TableCell>
                      <TableCell
                        className={cn("sticky left-[50px] z-20 p-0")}
                        style={{ backgroundColor: teamData.bgColourFaint, color: teamData.textColour }}
                      >
                        <div className="flex items-center justify-center h-full">
                          <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: teamData.bgColourSolid }}>
                            <TeamIcon
                              className={cn("size-5", isLiverpool && "scale-x-[-1]")}
                              style={{ color: teamData.iconColour }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn("sticky left-[98px] z-10 py-4 pr-4 pl-4 overflow-hidden")}
                        style={{ backgroundColor: teamData.bgColourFaint, color: teamData.textColour }}
                      >
                        <span className="font-medium">{teamData.name}</span>
                      </TableCell>
                      {predictionCounts.map((count, posIndex) => {
                        const maxCount = userPredictions.length;
                        const alpha = count > 0 ? 0.1 + (0.9 * (count / maxCount)) : 0;
                        const cellStyle: React.CSSProperties = { color: teamData.textColour };
                        if (teamData.bgColourSolid && count > 0) {
                          cellStyle.backgroundColor = hexToRgba(teamData.bgColourSolid, alpha);
                          if (teamData.textColour && lightTextColours.includes(teamData.textColour)) {
                            if (alpha < 0.4) {
                              cellStyle.color = teamData.bgColourSolid;
                            }
                          }
                        }
                        const isLastCell = posIndex === predictionCounts.length - 1;
                        return (
                          <TableCell
                            key={`${teamId}-${posIndex}`}
                            className={cn('text-center font-medium p-0 border-l border-b border-dashed border-border', isLastCell && 'rounded-r-md')}
                            style={cellStyle}
                          >
                            <div className="flex items-center justify-center h-[53px]">
                              {count > 0 ? count : ''}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    