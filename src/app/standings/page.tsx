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
} from "@/components/ui/accordion";
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

export default function StandingsPage() {
    const firestore = useFirestore();

    const teamsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'teams')) : null, [firestore]);
    const matchesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'matches')) : null, [firestore]);
    const standingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'standings')) : null, [firestore]);
    const weeklyTeamStandingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'weeklyTeamStandings')) : null, [firestore]);
    const recentResultsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teamRecentResults') : null, [firestore]);
    
    const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
    const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
    const { data: standingsData, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
    const { data: weeklyTeamStandings, isLoading: weeklyStandingsLoading } = useCollection<WeeklyTeamStanding>(weeklyTeamStandingsQuery);
    const { data: recentResultsData } = useCollection<any>(recentResultsQuery);

    const isLoading = teamsLoading || matchesLoading || standingsLoading || weeklyStandingsLoading;
    
    const { 
        standingsWithTeamData, 
        chartData, 
        weeklyResults,
        latestWeek,
    } = useMemo(() => {
        if (isLoading || !teamsData || !standingsData || !matchesData || !weeklyTeamStandings) {
            return { standingsWithTeamData: [], chartData: [], weeklyResults: new Map(), latestWeek: 0 };
        }

        const teamMap = new Map(teamsData.map(t => [t.id, t]));
        const recentMap = new Map(recentResultsData?.map(r => [r.teamId, r.results]) || []);
        
        const latestW = weeklyTeamStandings.length > 0 ? Math.max(...weeklyTeamStandings.map(ws => Number(ws.week))) : 0;

        const finalStandings = standingsData.map(standing => {
            const team = teamMap.get(standing.teamId);
            if (!team) return null;
            return { ...standing, ...team, recentResults: recentMap.get(team.id) || Array(6).fill('NG') };
        }).filter((t): t is any => !!t).sort((a,b) => a.rank - b.rank);

        const finalChartData = (() => {
            const data = [];
            for (let w = 0; w <= latestW; w++) {
                const entry: any = { week: w };
                teamsData.forEach(t => {
                    const ws = weeklyTeamStandings.find(s => Number(s.week) === w && s.teamId === t.id);
                    if (ws) entry[t.name] = ws.rank;
                });
                data.push(entry);
            }
            return data;
        })();

        const resultsByW = new Map();
        const played = matchesData.filter(m => Number(m.homeScore) >= 0 && Number(m.awayScore) >= 0);
        played.sort((a,b) => Number(a.week) - Number(b.week)).forEach(m => {
            const list = resultsByW.get(Number(m.week)) || [];
            const h = teamMap.get(m.homeTeamId); const a = teamMap.get(m.awayTeamId);
            if (h && a) list.push({ ...m, homeTeam: h, awayTeam: a });
            resultsByW.set(Number(m.week), list);
        });

        return { standingsWithTeamData: finalStandings, chartData: finalChartData, weeklyResults: resultsByW, latestWeek: latestW };
    }, [isLoading, teamsData, matchesData, standingsData, weeklyTeamStandings, recentResultsData]);

    const getResultColor = (res: string) => {
        if (!res || res === 'NG') return 'bg-muted text-muted-foreground opacity-40';
        if (res.length > 1) {
            if (res.includes('W') && !res.includes('L')) return 'bg-green-600 text-white';
            if (res.includes('L') && !res.includes('W')) return 'bg-red-600 text-white';
            return 'bg-orange-400 text-white';
        }
        if (res === 'W') return 'bg-green-500 text-white';
        if (res === 'D') return 'bg-blue-300 text-white';
        if (res === 'L') return 'bg-red-500 text-white';
        return 'bg-muted text-muted-foreground opacity-40';
    };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

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
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="hidden md:table-cell text-center">GF</TableHead>
                <TableHead className="hidden md:table-cell text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center font-bold">Pts</TableHead>
                <TableHead colSpan={6} className="text-center">Form Guide (Last 6 Weeks)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standingsWithTeamData.map(team => {
                  const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                  return (
                  <TableRow key={team.id} style={{ backgroundColor: team.bgColourFaint, color: team.textColour }} className="border-b-4 border-transparent">
                      <TableCell className="font-medium rounded-l-md">{team.rank}</TableCell>
                      <TableCell className="p-0">
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                                <TeamIcon className={cn("size-5", team.id === 'team_12' && "scale-x-[-1]")} style={{ color: team.iconColour }} />
                            </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-medium">{team.name}</span></TableCell>
                      <TableCell className="text-center">{team.gamesPlayed}</TableCell>
                      <TableCell className="text-center">{team.wins}</TableCell>
                      <TableCell className="text-center">{team.draws}</TableCell>
                      <TableCell className="text-center">{team.losses}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.goalsFor}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                      <TableCell className="text-center font-bold">{team.points}</TableCell>
                      {team.recentResults.map((res: string, i: number) => (
                      <TableCell key={i} className={cn("text-center font-black p-0 w-12", i === 5 && 'rounded-r-md')}>
                          <div className={cn("flex flex-col items-center justify-center h-10 w-full text-[10px]", getResultColor(res), i === 5 && 'rounded-r-md')}>
                            <span className="text-[8px] leading-none opacity-70 mb-0.5">W{latestWeek - (5 - i)}</span>
                            <span className="leading-none tracking-tighter">{res}</span>
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
        <CardHeader className="items-center"><CardTitle className="bg-black text-yellow-400 p-2 rounded-md">Week by Week Results</CardTitle><CardDescription>Detailed results for every gameweek.</CardDescription></CardHeader>
        <CardContent>
            <Accordion type="single" collapsible defaultValue={`week-${latestWeek}`}>
                {[...weeklyResults.keys()].sort((a,b) => b-a).map(wNum => (
                    <AccordionItem value={`week-${wNum}`} key={wNum}>
                        <AccordionTrigger className="text-lg font-bold">Week {wNum}</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {weeklyResults.get(wNum)?.map((m: any, idx: number) => {
                                    const teamMap = new Map(teamsData?.map(t => [t.id, t]) || []);
                                    const h = teamMap.get(m.homeTeamId); const a = teamMap.get(m.awayTeamId);
                                    if (!h || !a) return null;
                                    const HomeIcon = Icons[h.logo as IconName] || Icons.match;
                                    const AwayIcon = Icons[a.logo as IconName] || Icons.match;
                                    return (
                                        <div key={idx} className="flex items-center justify-center p-3 rounded-lg border bg-muted/5">
                                            <div className="flex items-center gap-3 justify-end w-2/5">
                                                <span className="font-bold text-right text-xs truncate">{h.name}</span>
                                                <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: h.bgColourSolid }}>
                                                    <HomeIcon className="size-5" style={{ color: h.iconColour }} />
                                                </div>
                                            </div>
                                            <div className="font-black text-xl px-4 text-center whitespace-nowrap min-w-[80px]">{m.homeScore} - {m.awayScore}</div>
                                            <div className="flex items-center gap-3 w-2/5">
                                                <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: a.bgColourSolid }}>
                                                    <AwayIcon className="size-5" style={{ color: a.iconColour }} />
                                                </div>
                                                <span className="font-bold text-xs truncate">{a.name}</span>
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