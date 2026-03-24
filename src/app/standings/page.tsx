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
    
    const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
    const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
    const { data: standingsData, isLoading: standingsLoading } = useCollection<CurrentStanding>(standingsQuery);
    const { data: weeklyTeamStandings, isLoading: weeklyStandingsLoading } = useCollection<WeeklyTeamStanding>(weeklyTeamStandingsQuery);

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
        
        // GROUND TRUTH: Identify played matches strictly by recorded scores
        const played = matchesData
            .filter(m => Number(m.homeScore) >= 0 && Number(m.awayScore) >= 0)
            .sort((a,b) => {
                const da = new Date(a.matchDatePlay || a.matchDateOrig).getTime();
                const db = new Date(b.matchDatePlay || b.matchDateOrig).getTime();
                return da - db || Number(a.week) - Number(b.week) || a.id.localeCompare(b.id);
            });
        
        const displayLimit = played.length > 0 ? Math.max(...played.map(m => Number(m.week))) : 0;

        const finalStandings = standingsData.map(standing => {
            const team = teamMap.get(standing.teamId)!;
            if (!team) return null;
            
            // CHRONOLOGICAL FORM: Last 6 played games based on Actual Play Date
            const teamMatches = played.filter(m => (m.homeTeamId === standing.teamId || m.awayTeamId === standing.teamId))
                .sort((a,b) => new Date(a.matchDatePlay || a.matchDateOrig).getTime() - new Date(b.matchDatePlay || b.matchDateOrig).getTime())
                .slice(-6);
            
            const recentResults = teamMatches.map(m => {
                const hS = Number(m.homeScore); const aS = Number(m.awayScore);
                let res: 'W' | 'D' | 'L' = 'D';
                if (hS === aS) res = 'D';
                else if (m.homeTeamId === standing.teamId) res = hS > aS ? 'W' : 'L';
                else res = aS > hS ? 'W' : 'L';
                return { result: res, week: m.week };
            });
            while (recentResults.length < 6) recentResults.unshift({ result: '-', week: 0 });

            return { ...standing, ...team, recentResults };
        }).filter((t): t is any => !!t).sort((a,b) => a.rank - b.rank);

        const finalChartData = (() => {
            const ranksByWeek: any = {};
            weeklyTeamStandings.forEach(ws => {
                const wNum = Number(ws.week);
                if (wNum <= displayLimit) {
                    if (!ranksByWeek[wNum]) ranksByWeek[wNum] = {};
                    ranksByWeek[wNum][ws.teamId] = ws.rank;
                }
            });
            const data = [];
            for (let w = 0; w <= displayLimit; w++) {
                const entry: any = { week: w };
                teamsData.forEach(t => entry[t.name] = ranksByWeek[w]?.[t.id]);
                data.push(entry);
            }
            return data;
        })();

        const resultsByW = new Map();
        played.sort((a,b) => Number(a.week) - Number(b.week)).forEach(m => {
            const list = resultsByW.get(Number(m.week)) || [];
            const h = teamMap.get(m.homeTeamId); const a = teamMap.get(m.awayTeamId);
            if (h && a) list.push({ ...m, homeTeam: h, awayTeam: a });
            resultsByW.set(Number(m.week), list);
        });

        return { standingsWithTeamData: finalStandings, chartData: finalChartData, weeklyResults: resultsByW, latestWeek: displayLimit };
    }, [isLoading, teamsData, matchesData, standingsData, weeklyTeamStandings]);

    const getResultColor = (res: string) => {
        if (res === 'W') return 'bg-green-500 text-white';
        if (res === 'D') return 'bg-blue-300 text-white';
        if (res === 'L') return 'bg-red-500 text-white';
        return 'bg-muted text-muted-foreground';
    };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  const formGuideWeeks = standingsWithTeamData.length > 0 ? { 
      start: Math.min(...standingsWithTeamData[0].recentResults.filter((r:any) => r.week > 0).map((r:any) => r.week)),
      end: Math.max(...standingsWithTeamData[0].recentResults.filter((r:any) => r.week > 0).map((r:any) => r.week))
  } : { start: 0, end: 0 };

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
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">Pts</TableHead>
                <TableHead colSpan={6} className="text-center">Form Guide (Last 6 Games Chronological)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standingsWithTeamData.map(team => {
                  if (!team) return null;
                  const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                  return (
                  <TableRow key={team.id} style={{ backgroundColor: team.bgColourFaint, color: team.textColour }} className="border-b-4 border-transparent">
                      <TableCell className="font-medium rounded-l-md">{team.rank}</TableCell>
                      <TableCell className="p-0"><div className="flex items-center justify-center h-full"><div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}><TeamIcon className={cn("size-5", team.id === 'team_12' && "scale-x-[-1]")} style={{ color: team.iconColour }} /></div></div></TableCell>
                      <TableCell><span className="font-medium">{team.name}</span></TableCell>
                      <TableCell className="hidden md:table-cell text-center">{team.gamesPlayed}</TableCell>
                      <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                      <TableCell className="text-center font-bold">{team.points}</TableCell>
                      {team.recentResults.map((res, i) => (
                      <TableCell key={i} className={cn("text-center font-bold p-0 w-12", i === 5 && 'rounded-r-md')}>
                          <div className={cn("flex flex-col items-center justify-center h-10 w-full", getResultColor(res.result), i === 5 && 'rounded-r-md')}>
                            <span className="text-[9px] leading-none opacity-70 mb-0.5">{res.week > 0 ? `W${res.week}` : ''}</span>
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
        <CardHeader className="items-center"><CardTitle className="bg-black text-yellow-400 p-2 rounded-md">Week by Week Results</CardTitle><CardDescription>Full history of results.</CardDescription></CardHeader>
        <CardContent>
            <Accordion type="single" collapsible defaultValue={`week-${latestWeek}`}>
                {[...weeklyResults.keys()].sort((a,b) => b-a).map(wNum => (
                    <AccordionItem value={`week-${wNum}`} key={wNum}>
                        <AccordionTrigger className="text-lg font-bold">Week {wNum}</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {weeklyResults.get(wNum)?.map((m, idx) => {
                                    const HomeIcon = Icons[m.homeTeam.logo as IconName] || Icons.match;
                                    const AwayIcon = Icons[m.awayTeam.logo as IconName] || Icons.match;
                                    return (
                                        <div key={idx} className="flex items-center justify-center p-3 rounded-lg border">
                                            <div className="flex items-center gap-3 justify-end w-2/5">
                                                <span className="font-medium text-right text-xs">{m.homeTeam.name}</span>
                                                <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: m.homeTeam.bgColourSolid }}>
                                                    <HomeIcon className="size-5" style={{ color: m.homeTeam.iconColour }} />
                                                </div>
                                            </div>
                                            <div className="font-bold text-lg px-4 text-center whitespace-nowrap">{m.homeScore} - {m.awayScore}</div>
                                            <div className="flex items-center gap-3 w-2/5">
                                                <div className="flex items-center justify-center size-8 rounded-full shrink-0" style={{ backgroundColor: m.awayTeam.bgColourSolid }}>
                                                    <AwayIcon className="size-5" style={{ color: m.awayTeam.iconColour }} />
                                                </div>
                                                <span className="font-medium text-xs">{m.awayTeam.name}</span>
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
