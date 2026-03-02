'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WeeklyTeamStanding, Match, Team, CurrentStanding } from '@/lib/types';
import { Icons, IconName } from '@/components/icons';
import { TeamStandingsChart } from '@/components/charts/team-standings-chart';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type FormResult = {
    result: 'W' | 'D' | 'L' | '-';
    week: number;
    date: string;
};

export default function StandingsPage() {
    const firestore = useFirestore();

    const teamsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'teams')) : null, [firestore]);
    const matchesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'matches')) : null, [firestore]);
    const standingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'standings')) : null, [firestore]);
    const weeklyTeamStandingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'weeklyTeamStandings')) : null, [firestore]);
    
    const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
    const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
    const { data: standingsData, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
    const { data: weeklyTeamStandings, isLoading: weeklyStandingsLoading } = useCollection<WeeklyTeamStanding>(weeklyTeamStandingsQuery);

    const isLoading = teamsLoading || matchesLoading || standingsLoading || weeklyStandingsLoading;
    
    const { 
        standingsWithTeamData, 
        chartData, 
        weeklyResults,
        gamesPlayed,
    } = useMemo(() => {
        if (isLoading || !teamsData || !standingsData || !matchesData || !weeklyTeamStandings) {
            return { standingsWithTeamData: [], chartData: [], weeklyResults: new Map(), gamesPlayed: 0 };
        }

        const teamMap = new Map(teamsData.map(t => [t.id, t]));
        
        const playedMatches = matchesData.filter(m => Number(m.homeScore) > -1 && Number(m.awayScore) > -1);
        
        const finalStandingsWithTeamData = standingsData.map(standing => {
            const team = teamMap.get(standing.teamId)!;
            // SORT BY DATE, NOT WEEK NUMBER
            const teamMatches = playedMatches.filter(m => m.homeTeamId === standing.teamId || m.awayTeamId === standing.teamId)
                .sort((a,b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()).slice(0, 6);
            
            const recentResults: FormResult[] = teamMatches.reverse().map(m => {
                const hS = Number(m.homeScore);
                const aS = Number(m.awayScore);
                let res: 'W' | 'D' | 'L' = 'D';
                if (hS === aS) res = 'D';
                else if (m.homeTeamId === standing.teamId) res = hS > aS ? 'W' : 'L';
                else res = aS > hS ? 'W' : 'L';
                return { result: res, week: m.week, date: m.matchDate };
            });
            while (recentResults.length < 6) recentResults.unshift({ result: '-', week: 0, date: '' });

            return { ...standing, ...team, recentResults };
        }).sort((a,b) => a.rank - b.rank);

        const playedWeeksSet = new Set(playedMatches.map(m => m.week));
        let chronologicalWeek = 0;
        for (let i = 1; i <= 38; i++) {
            if (playedWeeksSet.has(i)) chronologicalWeek = i;
            else break;
        }

        const finalChartData = (() => {
            const maxWeek = Math.max(0, ...[...playedWeeksSet]); 
            
            const ranksByWeek: { [week: number]: { [teamId: string]: number } } = {};
            weeklyTeamStandings.forEach(ws => {
                if (!ranksByWeek[ws.week]) ranksByWeek[ws.week] = {};
                ranksByWeek[ws.week][ws.teamId] = ws.rank;
            });
        
            const transformedData = [];
            for (let week = 0; week <= maxWeek; week++) {
                const weekEntry: { [key: string]: any } = { week };
                teamsData.forEach(team => {
                    // Carry forward previous week's rank if current is missing
                    let rank = ranksByWeek[week]?.[team.id];
                    if (rank === undefined && week > 0) {
                        for(let prev = week - 1; prev >= 0; prev--) {
                            if(ranksByWeek[prev]?.[team.id]) {
                                rank = ranksByWeek[prev][team.id];
                                break;
                            }
                        }
                    }
                    weekEntry[team.name] = rank ?? 20;
                });
                transformedData.push(weekEntry);
            }
            return transformedData;
        })();

        const resultsByWeek = new Map<number, (Match & {homeTeam: Team, awayTeam: Team})[]>();
        playedMatches.sort((a,b) => a.week - b.week).forEach(match => {
            const weekMatches = resultsByWeek.get(match.week) || [];
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            if (homeTeam && awayTeam) {
                weekMatches.push({ ...match, homeTeam, awayTeam });
            }
            resultsByWeek.set(match.week, weekMatches);
        });

        return { 
            standingsWithTeamData: finalStandingsWithTeamData, 
            chartData: finalChartData, 
            weeklyResults: resultsByWeek,
            gamesPlayed: chronologicalWeek,
        };
    }, [isLoading, teamsData, matchesData, standingsData, weeklyTeamStandings]);

    const getResultColor = (result: 'W' | 'D' | 'L' | '-') => {
        switch (result) {
            case 'W': return 'bg-green-500 text-white';
            case 'D': return 'bg-blue-300 text-white';
            case 'L': return 'bg-red-500 text-white';
            default: return 'bg-gray-200 text-gray-500';
        }
    };

  if (isLoading) {
    return (
        <div className="space-y-8">
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
      <TeamStandingsChart chartData={chartData} sortedTeams={standingsWithTeamData as (Team & { rank: number })[]} />

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table className="border-separate border-spacing-y-1">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos</TableHead>
                <TableHead className="w-[48px]"></TableHead>
                <TableHead className="min-w-[120px]">Team</TableHead>
                <TableHead className="hidden md:table-cell text-center">Plyd</TableHead>
                <TableHead className="hidden md:table-cell text-center">W</TableHead>
                <TableHead className="hidden md:table-cell text-center">D</TableHead>
                <TableHead className="hidden md:table-cell text-center">L</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="hidden md:table-cell text-center">GF</TableHead>
                <TableHead className="hidden md:table-cell text-center">GA</TableHead>
                <TableHead className="text-center">Pts</TableHead>
                <TableHead colSpan={6} className="text-center">Recent Form Guide (L-R: Oldest to Newest)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standingsWithTeamData.map(team => {
                  if (!team) return null;
                  const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                  const isLiverpool = team.id === 'team_12';

                  return (
                  <TableRow
                      key={team.id}
                      style={{ backgroundColor: team.bgColourFaint, color: team.textColour }}
                      className="border-b-4 border-transparent"
                  >
                      <TableCell className="font-medium rounded-l-md">{team.rank}</TableCell>
                      <TableCell className="p-0">
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                            <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: team.iconColour }} />
                            </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-medium">{team.name}</span></TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.gamesPlayed}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.wins}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.draws}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.losses}</TableCell>
                      <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.goalsFor}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-center font-bold">{team.points}</TableCell>
                      
                      {team.recentResults.map((res, index) => (
                      <TableCell key={index} className={cn("text-center font-bold p-0 w-12", index === 5 && 'rounded-r-md', index < 3 ? 'table-cell' : 'hidden md:table-cell')}>
                          <div className={cn("flex flex-col items-center justify-center h-10 w-full", getResultColor(res.result), index === 5 && 'rounded-r-md')}>
                            <span className="text-[10px] leading-none opacity-70 mb-0.5">{res.week > 0 ? `W${res.week}` : ''}</span>
                            <span className="leading-none">{res.result}</span>
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
                                                <span className="font-medium text-right text-xs md:text-sm">{match.homeTeam.name}</span>
                                                 <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: match.homeTeam.bgColourSolid }}>
                                                    <HomeIcon className="size-5" style={{ color: match.homeTeam.iconColour }} />
                                                </div>
                                            </div>
                                            <div className="font-bold text-base md:text-lg px-2 md:px-4 text-center whitespace-nowrap">
                                                {match.homeScore} - {match.awayScore}
                                            </div>
                                            <div className="flex items-center gap-3 w-2/5">
                                                 <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: match.awayTeam.bgColourSolid }}>
                                                    <AwayIcon className="size-5" style={{ color: match.awayTeam.iconColour }} />
                                                </div>
                                                <span className="font-medium text-xs md:text-sm">{match.awayTeam.name}</span>
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