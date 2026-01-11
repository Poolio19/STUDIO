'use client';

import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { WeeklyTeamStanding, Match, Team, CurrentStanding, TeamRecentResult } from '@/lib/types';
import { Icons, IconName } from '@/components/icons';
import { TeamStandingsChart } from '@/components/charts/team-standings-chart';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';


type StandingWithTeam = CurrentStanding & Team & { recentResults: ('W' | 'D' | 'L' | '-')[] };


export default function StandingsPage() {
    const firestore = useFirestore();

    const teamsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'teams')) : null, [firestore]);
    const matchesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'matches')) : null, [firestore]);
    const standingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'standings')) : null, [firestore]);
    const weeklyTeamStandingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'weeklyTeamStandings')) : null, [firestore]);
    const teamRecentResultsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'teamRecentResults')) : null, [firestore]);
    
    const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
    const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
    const { data: standingsData, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
    const { data: weeklyTeamStandings, isLoading: weeklyStandingsLoading } = useCollection<WeeklyTeamStanding>(weeklyTeamStandingsQuery);
    const { data: teamRecentResults, isLoading: recentResultsLoading } = useCollection<TeamRecentResult>(teamRecentResultsQuery);

    const isLoading = teamsLoading || matchesLoading || standingsLoading || weeklyStandingsLoading || recentResultsLoading;
    
    const { 
        standingsWithTeamData, 
        chartData, 
        weeklyResults,
        gamesPlayed,
    } = useMemo(() => {
        if (!teamsData || !standingsData || !matchesData || !weeklyTeamStandings || !teamRecentResults) {
            return { standingsWithTeamData: [], chartData: [], weeklyResults: new Map(), gamesPlayed: 0 };
        }

        const teamMap = new Map(teamsData.map(t => [t.id, t]));
        const recentResultsMap = new Map(teamRecentResults.map(r => [r.teamId, r.results]));

        const finalStandingsWithTeamData = standingsData.map(standing => {
            const team = teamMap.get(standing.teamId)!;
            const recentResults = recentResultsMap.get(standing.teamId) || Array(6).fill('-');
            return { ...standing, ...team, recentResults };
        }).sort((a,b) => a.rank - b.rank);

        // Chart Data Transformation
        const finalChartData = (() => {
            if (!teamsData || teamsData.length === 0) {
                return [];
            }
            if (!weeklyTeamStandings || weeklyTeamStandings.length === 0) {
                // Handle Week 0: Create a single data point for the initial standings
                const week0Data: { [key: string]: any } = { week: 0 };
                standingsData.forEach(standing => {
                    const teamName = teamMap.get(standing.teamId)?.name;
                    if (teamName) {
                        week0Data[teamName] = standing.rank;
                        week0Data[`${teamName}-outer`] = standing.rank;
                        week0Data[`${teamName}-inner`] = standing.rank;
                    }
                });
                return [week0Data];
            }

            const teamNameMap = new Map(teamsData.map(t => [t.id, t.name]));
            const standingsByWeek: { [week: number]: { teamId: string, rank: number }[] } = {};
            for (const standing of weeklyTeamStandings) {
                if (!standingsByWeek[standing.week]) {
                    standingsByWeek[standing.week] = [];
                }
                standingsByWeek[standing.week].push(standing);
            }
            
            const sortedWeeks = Object.keys(standingsByWeek).map(Number).sort((a, b) => a - b);
            
            return sortedWeeks.map(week => {
                const weekData: { [key: string]: any } = { week };
                for (const standing of standingsByWeek[week]) {
                    const teamName = teamNameMap.get(standing.teamId);
                    if (teamName) {
                        weekData[teamName] = standing.rank;
                        weekData[`${teamName}-outer`] = standing.rank;
                        weekData[`${teamName}-inner`] = standing.rank;
                    }
                }
                return weekData;
            });
        })();

        // Weekly Results for Accordion
        const resultsByWeek = new Map<number, (Match & {homeTeam: Team, awayTeam: Team})[]>();
        const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        playedMatches.sort((a,b) => a.week - b.week).forEach(match => {
            if (match.week === 0) return;
            const weekMatches = resultsByWeek.get(match.week) || [];
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            if (homeTeam && awayTeam) {
                weekMatches.push({ ...match, homeTeam, awayTeam });
            }
            resultsByWeek.set(match.week, weekMatches);
        });

        const currentGamesPlayed = finalStandingsWithTeamData.length > 0 ? Math.max(...finalStandingsWithTeamData.map(s => s.gamesPlayed), 0) : 0;

        return { 
            standingsWithTeamData: finalStandingsWithTeamData, 
            chartData: finalChartData, 
            weeklyResults: resultsByWeek,
            gamesPlayed: currentGamesPlayed,
        };
    }, [teamsData, matchesData, standingsData, weeklyTeamStandings, teamRecentResults]);


    const getResultColor = (result: 'W' | 'D' | 'L' | '-') => {
        switch (result) {
            case 'W': return 'bg-green-500 text-white';
            case 'D': return 'bg-blue-300 text-white';
            case 'L': return 'bg-red-500 text-white';
            default: return 'bg-gray-200 text-gray-500';
        }
    };

    const weekHeaders = Array.from({ length: 6 }, (_, i) => {
        const week = gamesPlayed - 5 + i;
        return week > 0 ? `WK${week}` : '';
    }).filter(Boolean);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
                <h1 className="text-3xl font-bold tracking-tight">Premier League</h1>
                <p className="text-slate-400">Official league standings, results, and form guide for the 2025-26 season.</p>
            </header>
            <div className="flex justify-center items-center h-96">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Loading league data...</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
       <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">Premier League</h1>
          <p className="text-slate-400">Official league standings, results, and form guide for the 2025-26 season.</p>
      </header>
        
      <TeamStandingsChart chartData={chartData} sortedTeams={standingsWithTeamData as (Team & { rank: number })[]} />

      <Card>
        <CardContent className="pt-6">
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
              {standingsWithTeamData.map(team => {
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader className="items-center">
            <CardTitle className="bg-black text-yellow-400 p-2 rounded-md">Week by Week Results</CardTitle>
             <CardDescription>A complete history of the season's results.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible defaultValue={`week-${gamesPlayed}`}>
                {[...weeklyResults.keys()].sort((a,b) => b-a).map(weekNumber => (
                    <AccordionItem value={`week-${weekNumber}`} key={weekNumber}>
                        <AccordionTrigger className="text-lg font-bold">Week {weekNumber}</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {weeklyResults.get(weekNumber)?.map((match, index) => {
                                    const HomeIcon = Icons[match.homeTeam.logo as IconName] || Icons.match;
                                    const AwayIcon = Icons[match.awayTeam.logo as IconName] || Icons.match;
                                    return (
                                        <div key={index} className="flex items-center justify-center p-3 rounded-lg border">
                                            <div className="flex items-center gap-3 justify-end w-2/5">
                                                <span className="font-medium text-right">{match.homeTeam.name}</span>
                                                 <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.homeTeam.bgColourSolid }}>
                                                    <HomeIcon className="size-5" style={{ color: match.homeTeam.iconColour }} />
                                                </div>
                                            </div>
                                            <div className="font-bold text-lg px-4 text-center">
                                                {match.homeScore} - {match.awayScore}
                                            </div>
                                            <div className="flex items-center gap-3 w-2/5">
                                                 <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.awayTeam.bgColourSolid }}>
                                                    <AwayIcon className="size-5" style={{ color: match.awayTeam.iconColour }} />
                                                </div>
                                                <span className="font-medium">{match.awayTeam.name}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
