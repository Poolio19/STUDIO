
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
import { teams, predictions, currentStandings, Team } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type ConsensusData = {
  [teamId: string]: number[];
};

export default function ConsensusPage() {
  const standingsWithTeamData = useMemo(() => {
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return currentStandings
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return team ? { ...team, rank: standing.rank } : null;
      })
      .filter((team): team is Team & { rank: number } => !!team)
      .sort((a, b) => a.rank - b.rank);
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

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
            <Table className="min-w-full border-separate border-spacing-y-1">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 w-[50px] bg-card text-center">Pos</TableHead>
                  <TableHead className="sticky left-[50px] z-10 w-[48px] bg-card"></TableHead>
                  <TableHead className="sticky left-[98px] z-10 w-[240px] bg-card">Team</TableHead>
                  {positions.map((pos) => (
                    <TableHead key={pos} className="w-[60px] text-center">{pos}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {standingsWithTeamData.map((teamData) => {
                  if (!teamData) return null;
                  const TeamIcon = Icons[teamData.logo as IconName] || Icons.match;
                  const teamId = teamData.id;
                  const predictionCounts = consensusData[teamId];
                  if (!predictionCounts) return null; // guard against missing data
                  const isLiverpool = teamId === 'team_12';
                  return (
                    <TableRow
                      key={teamId}
                      className="border-b-4 border-transparent"
                      style={{
                        color: teamData.textColour,
                      }}
                    >
                      <TableCell 
                        className={cn("sticky left-0 z-10 text-center font-medium rounded-l-md p-4")}
                        style={{ backgroundColor: teamData.bgColourFaint }}
                      >
                        {teamData.rank}
                      </TableCell>
                       <TableCell
                        className={cn("sticky left-[50px] z-10 p-0")}
                        style={{ backgroundColor: teamData.bgColourFaint }}
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
                        className={cn("sticky left-[98px] z-10 whitespace-nowrap p-4")}
                        style={{ backgroundColor: teamData.bgColourFaint }}
                      >
                        <span className="font-medium">{teamData.name}</span>
                      </TableCell>
                      {predictionCounts.map((count, posIndex) => {
                        const maxCount = predictions.length;
                        const alpha = count > 0 ? 0.1 + (0.9 * (count / maxCount)) : 0;
                        const cellStyle = teamData.bgColourSolid && count > 0 ? {
                          backgroundColor: hexToRgba(teamData.bgColourSolid, alpha)
                        } : {};

                        return (
                          <TableCell
                            key={`${teamId}-${posIndex}`}
                            className={cn(
                              'text-center font-medium p-0',
                              posIndex === predictionCounts.length - 1 && 'rounded-r-md'
                            )}
                            style={cellStyle}
                          >
                            {count > 0 ? count : ''}
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
