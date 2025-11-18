
'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { weeklyTeamStandings, teamRecentResults, TeamRecentResult } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { TeamStandingsChart } from '@/components/charts/team-standings-chart';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Team, CurrentStanding } from '@/lib/data';

export default function StandingsPage() {
    const firestore = useFirestore();
    const teamsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
    const standingsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'standings') : null, [firestore]);

    const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsCollectionRef);
    const { data: currentStandings, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsCollectionRef);

    const isLoading = teamsLoading || standingsLoading;

    const { standingsWithTeamData, chartData } = useMemo(() => {
        if (!teams || !currentStandings) {
            return { standingsWithTeamData: [], chartData: [] };
        }

        const recentResultsMap = new Map(teamRecentResults.map(r => [r.teamId, r.results]));
        const teamMap = new Map(teams.map(t => [t.id, t]));

        const initialData = currentStandings
            .map(standing => {
                const team = teamMap.get(standing.teamId);
                const recentResults = recentResultsMap.get(standing.teamId) || Array(6).fill('-');
                return team ? {
                    ...standing,
                    ...team,
                    sortValue: standing.points + (standing.goalDifference / 100) + (standing.goalsFor / 1000),
                    recentResults: recentResults
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
    }, [teams, currentStandings]);

    const getResultColor = (result: 'W' | 'D' | 'L' | '-') => {
        switch (result) {
            case 'W': return 'bg-green-500 text-white';
            case 'D': return 'bg-blue-300 text-white';
            case 'L': return 'bg-red-500 text-white';
            default: return 'bg-gray-200 text-gray-500';
        }
    };

    const gamesPlayed = currentStandings?.[0]?.gamesPlayed || 0;
    const weekHeaders = Array.from({ length: 6 }, (_, i) => {
        const week = gamesPlayed - 5 + i;
        return week > 0 ? `WK${week}` : '';
    }).filter(Boolean);


  return (
    <div className="space-y-8">
       <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">Premier League</h1>
      </header>

      <TeamStandingsChart chartData={chartData} sortedTeams={standingsWithTeamData as (Team & { rank: number })[]} />

      <Card>
        <CardHeader className="items-center">
          <CardTitle className="bg-black text-yellow-400 p-2 rounded-md">Team Standings 2025-2026</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border-separate border-spacing-y-1">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos</TableHead>
                <TableHead className="w-[48px]"></TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Plyd</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">Pts</TableHead>
                <TableHead colSpan={6} className="text-center">Form</TableHead>
              </TableRow>
               <TableRow>
                 <TableHead colSpan={11}></TableHead>
                {Array(6-weekHeaders.length).fill(0).map((_, i) => <TableHead key={`empty-${i}`} className="w-12"></TableHead>)}
                {weekHeaders.map(header => <TableHead key={header} className="text-center w-12">{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={17} className="text-center">Loading standings...</TableCell></TableRow>
              ) : (
                standingsWithTeamData.map(team => {
                    if (!team) return null;
                    const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                    const isLiverpool = team.id === 'team_12';
                    const resultsToDisplay = team.recentResults.slice(-weekHeaders.length);

                    return (
                    <TableRow
                        key={team.id}
                        style={{
                        backgroundColor: team.bgColourFaint,
                        color: team.textColour,
                        }}
                        className="border-b-4 border-transparent"
                    >
                        <TableCell className="font-medium rounded-l-md">{team.rank}</TableCell>
                        <TableCell
                        className="p-0"
                        >
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                            <TeamIcon
                                className={cn(
                                "size-5",
                                isLiverpool && "scale-x-[-1]"
                                )}
                                style={{ color: team.iconColour }}
                            />
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                        <span className="font-medium">{team.name}</span>
                        </TableCell>
                        <TableCell className="text-center">{team.gamesPlayed}</TableCell>
                        <TableCell className="text-center">{team.wins}</TableCell>
                        <TableCell className="text-center">{team.draws}</TableCell>
                        <TableCell className="text-center">{team.losses}</TableCell>
                        <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                        <TableCell className="text-center">{team.goalsFor}</TableCell>
                        <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                        <TableCell className="text-center font-bold">{team.points}</TableCell>
                        {Array(6-resultsToDisplay.length).fill('-').map((_, index) => (
                        <TableCell key={index} className={cn("text-center font-bold p-0 w-12")}>
                            <div className={cn("flex items-center justify-center h-10 w-full", getResultColor('-'))}>
                            -
                            </div>
                        </TableCell>
                        ))}
                        {resultsToDisplay.map((result, index) => (
                        <TableCell key={index} className={cn("text-center font-bold p-0 w-12", index === resultsToDisplay.length - 1 && 'rounded-r-md')}>
                            <div className={cn("flex items-center justify-center h-10 w-full", getResultColor(result), index === resultsToDisplay.length - 1 && 'rounded-r-md')}>
                            {result}
                            </div>
                        </TableCell>
                        ))}
                    </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    