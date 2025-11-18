
'use client';

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
import { teams, currentStandings, weeklyTeamStandings } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { TeamStandingsChart } from '@/components/charts/team-standings-chart';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function StandingsPage() {
    const { standingsWithTeamData, chartData } = useMemo(() => {
        const initialData = currentStandings
            .map(standing => {
                const team = teams.find(t => t.id === standing.teamId);
                return team ? { 
                    ...standing, 
                    ...team,
                    sortValue: standing.points + (standing.goalDifference / 100) + (standing.goalsFor / 1000)
                } : null;
            })
            .filter(Boolean);

        const sortedData = initialData.sort((a, b) => {
            if (!a || !b) return 0;
            return b.sortValue - a.sortValue;
        });
        
        let rank = 1;
        const finalStandings = sortedData.map((team, index) => {
            if (index > 0) {
                const prevTeam = sortedData[index - 1]!;
                if (team!.sortValue !== prevTeam.sortValue) {
                    rank = index + 1;
                }
            }
            return { ...team!, rank: rank };
        });

        // Transform data for the chart
        const weeks = [...new Set(weeklyTeamStandings.map(d => d.week))].sort((a, b) => a - b);
        const transformedChartData = weeks.map(week => {
            const weekData: { [key: string]: any } = { week };
            weeklyTeamStandings
                .filter(d => d.week === week)
                .forEach(standing => {
                    const team = teams.find(t => t.id === standing.teamId);
                    if (team) {
                        weekData[team.name] = standing.rank;
                    }
                });
            return weekData;
        });

        return { standingsWithTeamData: finalStandings, chartData: transformedChartData };
    }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Premier League Standings</h1>
        <p className="text-muted-foreground">The official Premier League table and weekly position tracker.</p>
      </header>

      <TeamStandingsChart chartData={chartData} sortedTeams={standingsWithTeamData} />

      <Card>
        <CardHeader>
          <CardTitle>Premier League Table 2025-2026</CardTitle>
          <CardDescription>Live standings updated weekly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Plyd</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-right">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standingsWithTeamData.map(team => {
                if (!team) return null;
                const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                return (
                  <TableRow key={team.id} className={cn(team.bgColour, team.textColour)}>
                    <TableCell className="font-medium">{team.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <TeamIcon className={cn("size-5", team.colour)} />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{team.gamesPlayed}</TableCell>
                    <TableCell className="text-center">{team.wins}</TableCell>
                    <TableCell className="text-center">{team.draws}</TableCell>
                    <TableCell className="text-center">{team.losses}</TableCell>
                    <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-right font-bold">{team.points}</TableCell>                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
