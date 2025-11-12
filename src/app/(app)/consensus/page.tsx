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
import { teams, currentStandings, predictions } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type ConsensusData = {
  [teamId: string]: number[];
};

export default function ConsensusPage() {
  const standingsWithTeamData = useMemo(() => {
    return currentStandings
      .map((standing) => {
        const team = teams.find((t) => t.id === standing.teamId);
        return team ? { ...standing, ...team } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.rank - b!.rank);
  }, []);

  const consensusData = useMemo((): ConsensusData => {
    const data: ConsensusData = teams.reduce((acc, team) => {
      acc[team.id] = Array(20).fill(0);
      return acc;
    }, {} as ConsensusData);

    predictions.forEach((prediction) => {
      prediction.rankings.forEach((teamId, index) => {
        if (data[teamId]) {
          data[teamId][index]++;
        }
      });
    });

    return data;
  }, []);

  const positions = Array.from({ length: 20 }, (_, i) => i + 1);

  const getCellColor = (count: number) => {
    if (count > predictions.length / 2) return 'bg-primary/30';
    if (count > predictions.length / 4) return 'bg-primary/20';
    if (count > 0) return 'bg-primary/10';
    return '';
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Prediction Consensus</h1>
        <p className="text-muted-foreground">
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
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 w-[50px] bg-card text-center">Pos</TableHead>
                  <TableHead className="sticky left-[50px] z-10 w-[200px] bg-card">Team (Current Position)</TableHead>
                  {positions.map((pos) => (
                    <TableHead key={pos} className="w-[60px] text-center">{pos}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {standingsWithTeamData.map((teamData, index) => {
                  if (!teamData) return null;
                  const TeamIcon = Icons[teamData.logo as IconName] || Icons.match;
                  const teamId = teamData.id;
                  const predictionCounts = consensusData[teamId];
                  return (
                    <TableRow key={teamId}>
                      <TableCell className="sticky left-0 z-10 bg-card text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="sticky left-[50px] z-10 bg-card">
                        <div className="flex items-center gap-3">
                          <TeamIcon className="size-5" />
                          <span className="font-medium">{teamData.name}</span>
                        </div>
                      </TableCell>
                      {predictionCounts.map((count, posIndex) => (
                        <TableCell
                          key={`${teamId}-${posIndex}`}
                          className={cn('text-center font-medium', getCellColor(count))}
                        >
                          {count > 0 ? count : ''}
                        </TableCell>
                      ))}
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
