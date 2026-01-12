
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

import { collection, doc, getDoc } from 'firebase/firestore';
import { Icons, IconName } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
import { updateAllData } from '@/ai/flows/update-all-data-flow';
import { reimportFixtures } from '@/ai/flows/reimport-fixtures-flow';
import { MatchResultSchema } from '@/ai/flows/update-match-results-flow-types';
import type { ReimportFixturesInput } from '@/ai/flows/reimport-fixtures-flow-types';
import type { Match, Team } from '@/lib/types';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

const rawFutureFixtures = `
Week 1:
17th Aug 2025
Arsenal v Wolves
Chelsea v Man City
Everton v Brighton
Ipswich v Liverpool
Newcastle v Southampton
Nott'm Forest v Bournemouth
West Ham v Aston Villa
18th Aug 2025
Brentford v Crystal Palace
Man Utd v Fulham
19th Aug 2025
Leicester v Tottenham

Week 2:
24th Aug 2025
Bournemouth v Newcastle
Aston Villa v Arsenal
Brighton v Man Utd
Crystal Palace v West Ham
Fulham v Leicester
Liverpool v Brentford
Man City v Ipswich
Southampton v Tottenham
Wolves v Chelsea
25th Aug 2025
Tottenham v Everton

Week 3:
31st Aug 2025
Arsenal v Brighton
Brentford v Southampton
Chelsea v Crystal Palace
Everton v Bournemouth
Ipswich v Wolves
Leicester v Aston Villa
Man Utd v Liverpool
Newcastle v Man City
Tottenham v Fulham
West Ham v Nott'm Forest

Week 4:
14th Sep 2025
Bournemouth v Chelsea
Aston Villa v Everton
Brighton v Ipswich
Crystal Palace v Leicester
Fulham v West Ham
Liverpool v Nott'm Forest
Man City v Arsenal
Southampton v Man Utd
Wolves v Newcastle
15th Sep 2025
Tottenham v Brentford

Week 5:
21st Sep 2025
Arsenal v Tottenham
Bournemouth v Wolves
Everton v Southampton
Ipswich v Crystal Palace
Leicester v Man City
Man Utd v Nott'm Forest
Newcastle v Brighton
West Ham v Liverpool
22nd Sep 2025
Fulham v Brentford
23rd Sep 2025
Aston Villa v Chelsea

Week 6:
28th Sep 2025
Brentford v Leicester
Brighton v Aston Villa
Chelsea v Ipswich
Crystal Palace v Man Utd
Liverpool v Arsenal
Man City v Fulham
Nott'm Forest v Newcastle
Southampton v Bournemouth
Tottenham v West Ham
Wolves v Everton

Week 7:
5th Oct 2025
Arsenal v Southampton
Aston Villa v Tottenham
Bournemouth v Liverpool
Chelsea v Nott'm Forest
Everton v Man City
Ipswich v Man Utd
Leicester v Wolves
Fulham v Crystal Palace
Newcastle v Brentford
West Ham v Brighton

Week 8:
19th Oct 2025
Brentford v West Ham
Brighton v Leicester
Crystal Palace v Newcastle
Liverpool v Chelsea
Man City v Aston Villa
Man Utd v Everton
Nott'm Forest v Ipswich
Southampton v Fulham
Tottenham v Bournemouth
Wolves v Arsenal

Week 9:
26th Oct 2025
Arsenal v Nott'm Forest
Aston Villa v Man Utd
Bournemouth v Man City
Chelsea v Brentford
Everton v Ipswich
Leicester v Southampton
Newcastle v Tottenham
West Ham v Wolves
27th Oct 2025
Brighton v Crystal Palace
28th Oct 2025
Fulham v Liverpool

Week 10:
2nd Nov 2025
Brentford v Everton
Crystal Palace v Aston Villa
Ipswich v West Ham
Liverpool v Brighton
Man City v Leicester
Man Utd v Newcastle
Nott'm Forest v Fulham
Southampton v Arsenal
Tottenham v Chelsea
Wolves v Bournemouth

Week 11:
9th Nov 2025
Arsenal v Ipswich
Aston Villa v Southampton
Bournemouth v Brentford
Brighton v Nott'm Forest
Chelsea v Man Utd
Everton v Leicester
Fulham v Man City
Newcastle v Liverpool
West Ham v Everton
Wolves v Tottenham

Week 12:
23rd Nov 2025
Brentford v Brighton
Crystal Palace v Wolves
Ipswich v Bournemouth
Leicester v Arsenal
Liverpool v Aston Villa
Man City v Newcastle
Man Utd v West Ham
Nott'm Forest v Tottenham
Southampton v Chelsea
Everton v Fulham

Week 13:
30th Nov 2025
Arsenal v Man Utd
Aston Villa v Nott'm Forest
Bournemouth v Leicester
Brighton v Everton
Chelsea v Fulham
Newcastle v Ipswich
Tottenham v Man City
West Ham v Southampton
Wolves v Brentford
Liverpool v Crystal Palace

Week 14:
4th Dec 2025
Brentford v Man Utd
Crystal Palace v Tottenham
Everton v Arsenal
Fulham v Bournemouth
Ipswich v Aston Villa
Leicester v West Ham
Man City v Liverpool
Nott'm Forest v Newcastle
Southampton v Wolves
Brighton v Chelsea

Week 15:
7th Dec 2025
Arsenal v Crystal Palace
Aston Villa v Fulham
Bournemouth v Brighton
Chelsea v Everton
Liverpool v Leicester
Man Utd v Man City
Newcastle v West Ham
Nott'm Forest v Southampton
Tottenham v Ipswich
Wolves v Brentford

Week 16:
14th Dec 2025
Brighton v Nott'm Forest
Crystal Palace v Man Utd
Everton v Newcastle
Fulham v Tottenham
Ipswich v Wolves
Leicester v Chelsea
Man City v Aston Villa
Southampton v Liverpool
West Ham v Bournemouth
Brentford v Arsenal

Week 17:
21st Dec 2025
Arsenal v West Ham
Aston Villa v Brentford
Bournemouth v Man City
Chelsea v Southampton
Liverpool v Everton
Man Utd v Leicester
Newcastle v Crystal Palace
Nott'm Forest v Man Utd
Tottenham v Wolves
Ipswich v Fulham

Week 18:
26th Dec 2025
Brentford v Tottenham
Brighton v Ipswich
Crystal Palace v Bournemouth
Everton v Chelsea
Fulham v Newcastle
Leicester v Nott'm Forest
Man City v Man Utd
Southampton v Aston Villa
West Ham v Arsenal
Wolves v Liverpool

Week 19:
28th Dec 2025
Arsenal v Leicester
Aston Villa v Southampton
Bournemouth v West Ham
Chelsea v Crystal Palace
Liverpool v Man City
Man Utd v Brighton
Newcastle v Everton
Nott'm Forest v Wolves
Tottenham v Fulham
Ipswich v Brentford

Week 20:
4th Jan 2026
Brentford v Nott'm Forest
Brighton v Newcastle
Crystal Palace v Arsenal
Everton v Aston Villa
Fulham v Ipswich
Leicester v Bournemouth
Man City v Chelsea
Man Utd v Tottenham
West Ham v Man Utd
Wolves v Liverpool

Week 21:
11th Jan 2026
Arsenal v Man City
Aston Villa v Leicester
Bournemouth v Everton
Chelsea v West Ham
Ipswich v Man Utd
Liverpool v Fulham
Newcastle v Wolves
Nott'm Forest v Crystal Palace
Southampton v Brentford
Tottenham v Brighton

Week 22:
18th Jan 2026
Brentford v Ipswich
Brighton v Southampton
Crystal Palace v Liverpool
Everton v Tottenham
Fulham v Nott'm Forest
Leicester v Man Utd
Man City v Wolves
West Ham v Chelsea
Arsenal v Bournemouth
Aston Villa v Newcastle

Week 23:
25th Jan 2026
Bournemouth v Aston Villa
Chelsea v Leicester
Ipswich v Arsenal
Liverpool v West Ham
Man Utd v Man City
Newcastle v Nott'm Forest
Nott'm Forest v Everton
Southampton v Crystal Palace
Tottenham v Newcastle
Wolves v Fulham

Week 24:
1st Feb 2026
Arsenal v Liverpool
Aston Villa v Ipswich
Brentford v Man City
Crystal Palace v Brighton
Everton v Man Utd
Fulham v Southampton
Leicester v West Ham
Newcastle v Bournemouth
Tottenham v Chelsea
Wolves v Nott'm Forest

Week 25:
8th Feb 2026
Bournemouth v Tottenham
Brighton v Fulham
Chelsea v Aston Villa
Ipswich v Everton
Liverpool v Leicester
Man City v Crystal Palace
Man Utd v Wolves
Nott'm Forest v Arsenal
Southampton v Newcastle
West Ham v Brentford

Week 26:
15th Feb 2026
Arsenal v Man Utd
Aston Villa v Man City
Brentford v West Ham
Crystal Palace v Ipswich
Everton v Nott'm Forest
Fulham v Chelsea
Leicester v Brighton
Liverpool v Southampton
Newcastle v Leicester
Wolves v Tottenham

Week 27:
22nd Feb 2026
Brighton v Liverpool
Chelsea v Newcastle
Ipswich v Tottenham
Man City v Everton
Man Utd v Brentford
Nott'm Forest v Aston Villa
Southampton v Leicester
West Ham v Fulham
Wolves v Crystal Palace
Bournemouth v Arsenal

Week 28:
1st Mar 2026
Arsenal v Chelsea
Aston Villa v Wolves
Brentford v Man Utd
Crystal Palace v Everton
Fulham v Man City
Leicester v Ipswich
Liverpool v Nott'm Forest
Newcastle v Southampton
Tottenham v West Ham
Brighton v Bournemouth

Week 29:
8th Mar 2026
Bournemouth v Southampton
Chelsea v Liverpool
Everton v Leicester
Ipswich v Newcastle
Man City v Brighton
Man Utd v Aston Villa
Nott'm Forest v Brentford
Tottenham v Arsenal
West Ham v Crystal Palace
Wolves v Fulham

Week 30:
15th Mar 2026
Arsenal v Ipswich
Aston Villa v West Ham
Brentford v Chelsea
Brighton v Man City
Crystal Palace v Nott'm Forest
Fulham v Man Utd
Leicester v Everton
Liverpool v Wolves
Newcastle v Man Utd
Southampton v Tottenham

Week 31:
22nd Mar 2026
Chelsea v Southampton
Everton v Crystal Palace
Ipswich v Leicester
Man City v Newcastle
Man Utd v Liverpool
Nott'm Forest v Brighton
Tottenham v Aston Villa
West Ham v Man City
Wolves v Bournemouth
Fulham v Arsenal

Week 32:
5th Apr 2026
Arsenal v Everton
Aston Villa v Nott'm Forest
Bournemouth v Ipswich
Brighton v Wolves
Crystal Palace v Man City
Leicester v Man Utd
Liverpool v Tottenham
Newcastle v Fulham
Southampton v West Ham
Brentford v Chelsea

Week 33:
12th Apr 2026
Chelsea v Bournemouth
Everton v Liverpool
Fulham v Aston Villa
Ipswich v Southampton
Man City v Leicester
Man Utd v Crystal Palace
Nott'm Forest v Man City
Tottenham v Newcastle
West Ham v Brighton
Wolves v Everton

Week 34:
19th Apr 2026
Aston Villa v Bournemouth
Bournemouth v Man Utd
Brighton v West Ham
Crystal Palace v Ipswich
Leicester v Fulham
Liverpool v Newcastle
Man City v Tottenham
Southampton v Nott'm Forest
Wolves v Arsenal
Everton v Brentford

Week 35:
26th Apr 2026
Arsenal v Aston Villa
Brentford v Leicester
Fulham v Man City
Ipswich v West Ham
Liverpool v Man Utd
Newcastle v Chelsea
Nott'm Forest v Everton
Southampton v Brighton
Tottenham v Crystal Palace
Wolves v Southampton

Week 36:
3rd May 2026
Aston Villa v Liverpool
Bournemouth v Nott'm Forest
Brighton v Tottenham
Chelsea v Ipswich
Everton v Wolves
Leicester v Newcastle
Man City v Southampton
Man Utd v Arsenal
West Ham v Brentford
Crystal Palace v Fulham

Week 37:
10th May 2026
Arsenal v Everton
Brentford v Man City
Ipswich v Man City
Liverpool v Leicester
Man Utd v Southampton
Newcastle v Brighton
Nott'm Forest v West Ham
Tottenham v Bournemouth
Wolves v Aston Villa
Crystal Palace v Chelsea

Week 38:
17th May 2026
Aston Villa v Man Utd
Bournemouth v Liverpool
Brighton v Newcastle
Chelsea v Nott'm Forest
Everton v Ipswich
Leicester v Crystal Palace
Man City v Wolves
Southampton v Arsenal
West Ham v Tottenham
Fulham v Brentford
`;

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isReimporting, setIsReimporting] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});
  
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  
  const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useCollection<Match>(matchesQuery);

  const teamMap = React.useMemo(() => {
    if (!teamsData) return new Map();
    return new Map(teamsData.map(t => [t.id, t]));
  }, [teamsData]);
  
  const teamNameMap = React.useMemo(() => {
    if (!teamsData) return new Map<string, Team>();
    const map = new Map<string, Team>();
    teamsData.forEach(team => {
        map.set(team.name.toLowerCase(), team);
    });
    // Manual mappings for common variations
    const teamVariations: {[key: string]: string} = {
        "nott'm forest": "notts forest",
        "wolves": "wolves",
        "man city": "man city",
        "man utd": "man utd",
        "leicester": "leicester city",
        "southampton": "southampton"
    };

    teamsData.forEach(team => {
        const lowerCaseName = team.name.toLowerCase();
        map.set(lowerCaseName, team);

        // Add known simple names
        if (lowerCaseName === 'leicester city') map.set('leicester', team);
        if (lowerCaseName === 'manchester city') map.set('man city', team);
        if (lowerCaseName === 'manchester united') map.set('man utd', team);
        if (lowerCaseName === 'nottingham forest') map.set('nott\'m forest', team);
        if (lowerCaseName === 'wolverhampton wanderers') map.set('wolves', team);
    });

    return map;
}, [teamsData]);


  const connectivityCheckDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'connectivity-test', 'connectivity-doc') : null),
    [firestore]
  );
  
  const parseRawFixtures = React.useCallback((week: number): Omit<Match, 'homeTeam' | 'awayTeam'>[] => {
    if (!teamNameMap.size) {
        console.error("Team name map is not ready.");
        return [];
    }

    const lines = rawFutureFixtures.trim().split('\n');
    const fixturesForWeek: Omit<Match, 'homeTeam' | 'awayTeam'>[] = [];
    let currentWeek = 0;
    let currentDate: Date | null = null;
    let year = 2025; // Default start year

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith('Week')) {
            currentWeek = parseInt(trimmedLine.split(' ')[1].replace(':', ''));
            // Reset date for the new week block
            currentDate = null; 
            // Simple logic to switch year
            if (currentWeek > 18 && year === 2025) {
                year = 2026;
            }
        } else if (/^\d+(st|nd|rd|th)\s+\w+\s+\d{4}/.test(trimmedLine) || /^\d+(st|nd|rd|th)\s+\w+/.test(trimmedLine)) {
             // It's a date line
            const cleanedDateString = trimmedLine.replace(/(\d+)(st|nd|rd|th)/, '$1');
            const dateStrWithYear = cleanedDateString.includes(String(year)) ? cleanedDateString : `${cleanedDateString} ${year}`;
            currentDate = new Date(dateStrWithYear);
        } else if (currentWeek === week && currentDate && !isNaN(currentDate.getTime())) {
            // It's a fixture line for the current week context
            const parts = trimmedLine.split(/\s+v\s+/);
            if (parts.length === 2) {
                const homeTeamName = parts[0].trim().toLowerCase();
                const awayTeamName = parts[1].trim().toLowerCase();

                const homeTeam = teamNameMap.get(homeTeamName);
                const awayTeam = teamNameMap.get(awayTeamName);

                if (homeTeam && awayTeam) {
                    const matchId = `${week}-${homeTeam.id}-${awayTeam.id}`;
                    fixturesForWeek.push({
                        id: matchId,
                        week: week,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        homeScore: -1,
                        awayScore: -1,
                        matchDate: currentDate.toISOString(),
                    });
                } else {
                    console.warn(`Could not find teams for fixture: "${trimmedLine}". Mapped Names: Home='${homeTeamName}', Away='${awayTeamName}'. Found: Home? ${!!homeTeam}, Away? ${!!awayTeam}`);
                }
            }
        }
    }
    return fixturesForWeek;
}, [teamNameMap]);


  React.useEffect(() => {
    if (!connectivityCheckDocRef) return;
    
    const checkConnection = async () => {
      try {
        await getDoc(connectivityCheckDocRef);
        setDbStatus({ connected: true, message: 'Database is connected.' });
      } catch (error: any) {
         if (error.code === 'permission-denied') {
            setDbStatus({ connected: true, message: 'Database is connected (with secure rules).' });
        } else if (error.code === 'unavailable' || error.message.includes('offline')) {
            setDbStatus({ connected: false, message: 'Database connection failed: Client is offline.' });
        } else {
            console.error("Database connection check failed:", error);
            setDbStatus({ connected: false, message: `Connection failed: ${error.message}` });
        }
      }
    };
    
    checkConnection();
  }, [connectivityCheckDocRef]);

  const handleWeekChange = React.useCallback((weekStr: string) => {
    const week = parseInt(weekStr);
    setSelectedWeek(week);

    const existingFixtures = (matchesData || [])
        .filter(m => m.week === week)
        .map(match => {
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            if (!homeTeam || !awayTeam) return null;
            return {
                ...match,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
            };
        })
        .filter((match): match is EditableMatch => match !== null);

    let fixturesForWeek: EditableMatch[];
    if (existingFixtures.length > 0) {
        fixturesForWeek = existingFixtures;
    } else {
        const parsedFixtures = parseRawFixtures(week);
        fixturesForWeek = parsedFixtures.map(f => ({
            ...f,
            homeTeam: teamMap.get(f.homeTeamId)!,
            awayTeam: teamMap.get(f.awayTeamId)!,
        }));
    }
    
    setWeekFixtures(fixturesForWeek);

    const initialScores = fixturesForWeek.reduce((acc, match) => {
        acc[match.id] = { 
          homeScore: match.homeScore === -1 ? '' : String(match.homeScore), 
          awayScore: match.awayScore === -1 ? '' : String(match.awayScore) 
        };
        return acc;
    }, {} as {[matchId: string]: {homeScore: string, awayScore: string}});
    setScores(initialScores);
  }, [matchesData, teamMap, parseRawFixtures]);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setScores(prev => ({
        ...prev,
        [matchId]: {
            ...prev[matchId],
            [team === 'home' ? 'homeScore' : 'awayScore']: value,
        }
    }));
  };

  const handleSaveWeekResults = async () => {
    if (selectedWeek === null) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot save results. Week not selected.' });
        return;
    }
    setIsUpdating(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Saving results and recalculating all league data. This may take a moment.',
    });
    
    try {
        const resultsToUpdate = weekFixtures.map(match => {
            const scoreData = scores[match.id];
            const homeScore = parseInt(scoreData?.homeScore, 10);
            const awayScore = parseInt(scoreData?.awayScore, 10);

            return {
                id: match.id,
                week: match.week,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: !isNaN(homeScore) ? homeScore : match.homeScore,
                awayScore: !isNaN(awayScore) ? awayScore : match.awayScore,
                matchDate: match.matchDate,
            };
        });

        const parsedResults = MatchResultSchema.array().safeParse(resultsToUpdate);

        if (!parsedResults.success) {
            console.error("Zod validation failed:", parsedResults.error);
            const errorMessages = parsedResults.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Data validation failed: ${errorMessages}`);
        }
        
        const validResults = parsedResults.data.filter(r => r.homeScore !== -1 && r.awayScore !== -1);

        if (validResults.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Valid Scores',
                description: 'No new valid scores were entered for this week. Please enter scores before saving.',
            });
            setIsUpdating(false);
            return;
        }

        const matchUpdateResult = await updateMatchResults({ results: parsedResults.data });
        
        if (!matchUpdateResult.success) {
            throw new Error(`The AI flow for updating matches reported an error.`);
        }
        
        toast({
            title: `Week ${selectedWeek} Matches Updated!`,
            description: `${matchUpdateResult.updatedCount} match records were saved. Now recalculating all league data...`,
        });

        const allDataUpdateResult = await updateAllData();

        if (!allDataUpdateResult.success) {
             throw new Error(allDataUpdateResult.message || `The master data update flow failed.`);
        }

        toast({
            title: `Recalculation Complete!`,
            description: `All league standings and player scores have been successfully updated.`,
        });


    } catch (error: any) {
        console.error(`Error during full data update for week ${selectedWeek}:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred during the update process.',
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleReimportFixtures = async () => {
    if (selectedWeek === null) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot re-import. Week not selected.' });
      return;
    }
    setIsReimporting(true);
    toast({
      title: `Re-importing Week ${selectedWeek}...`,
      description: 'Deleting existing fixtures and importing fresh ones. This will reset any scores for this week.',
    });

    try {
      const fixtures = parseRawFixtures(selectedWeek);
      if (fixtures.length === 0) {
        throw new Error("No fixtures could be parsed for the selected week.");
      }

      const result = await reimportFixtures({ week: selectedWeek, fixtures });

      if (result.success) {
        toast({
          title: 'Re-import Successful!',
          description: `Deleted ${result.deletedCount} and imported ${result.importedCount} fixtures for Week ${selectedWeek}.`,
        });
        // Refresh the view
        handleWeekChange(String(selectedWeek));
      } else {
        throw new Error('The re-import flow failed to complete successfully.');
      }
    } catch (error: any) {
      console.error(`Error during re-import for week ${selectedWeek}:`, error);
      toast({
        variant: 'destructive',
        title: 'Re-import Failed',
        description: error.message || 'An unexpected error occurred during the re-import process.',
      });
    } finally {
      setIsReimporting(false);
    }
  };


  const isLoadingData = teamsLoading || matchesLoading || !firestore || !dbStatus.connected;
  
  const allWeeks = React.useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => i + 1);
  }, []);

  const teamMatchCounts = React.useMemo(() => {
    if (!matchesData || !teamsData) return [];
    
    const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
    const counts = new Map<string, number>();

    teamsData.forEach(team => counts.set(team.id, 0));

    playedMatches.forEach(match => {
        counts.set(match.homeTeamId, (counts.get(match.homeTeamId) || 0) + 1);
        counts.set(match.awayTeamId, (counts.get(match.awayTeamId) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .map(([teamId, count]) => ({
          teamName: teamMap.get(teamId)?.name || 'Unknown',
          count: count
      }))
      .sort((a,b) => a.teamName.localeCompare(b.teamName));

  }, [matchesData, teamsData, teamMap]);

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Administration
        </h1>
        <p className="text-slate-400">
          Manage your application's data sources and imports.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>
                    Check the connection to the Firestore database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {dbStatus.connected ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />}
                <p className="font-medium">{dbStatus.message}</p>
                </div>
                {matchesError && <p className="text-sm text-red-500 mt-2">Error loading matches: {matchesError.message}</p>}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Team Match Count</CardTitle>
                <CardDescription>
                    Diagnostic tool to show played matches per team from the database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 overflow-y-auto border rounded-lg p-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        {teamMatchCounts.map(({ teamName, count }) => (
                            <div key={teamName} className="flex justify-between text-sm">
                                <span className="font-medium">{teamName}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Update Match Results</CardTitle>
              <CardDescription>
                  Select a week to view its fixtures, enter the scores, and save the results. Saving will trigger a full recalculation of all league and player data. This is disabled until the database is connected.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <div className="flex gap-4 items-center">
                 <Select onValueChange={handleWeekChange} disabled={isLoadingData}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                        {allWeeks.map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isReimporting || selectedWeek === null}>
                        {isReimporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Re-import Fixtures
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all existing matches for Week {selectedWeek} and re-import them from the source code. Any scores you have entered for this week will be permanently lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReimportFixtures}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
               </div>

              {selectedWeek !== null && isLoadingData && <div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading fixture data...</div>}

              {selectedWeek !== null && !isLoadingData && (
                  <div className="space-y-4 pt-4">
                      <h3 className="font-semibold">Fixtures for Week {selectedWeek}</h3>
                      {weekFixtures.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {weekFixtures.map(match => {
                                    const HomeIcon = Icons[match.homeTeam.logo as IconName] || Icons.match;
                                    const AwayIcon = Icons[match.awayTeam.logo as IconName] || Icons.match;
                                    return (
                                    <div key={match.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                        <div className="flex items-center gap-2 justify-end w-2/5">
                                            <Label htmlFor={`${match.id}-home`} className="text-right">{match.homeTeam.name}</Label>
                                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.homeTeam.bgColourSolid }}>
                                                <HomeIcon className="size-5" style={{ color: match.homeTeam.iconColour }} />
                                            </div>
                                        </div>
                                        <Input
                                            id={`${match.id}-home`}
                                            type="number"
                                            value={scores[match.id]?.homeScore ?? ''}
                                            onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                            className="w-16 text-center"
                                            disabled={!dbStatus.connected}
                                        />
                                        <span>-</span>
                                        <Input
                                            id={`${match.id}-away`}
                                            type="number"
                                            value={scores[match.id]?.awayScore ?? ''}
                                            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                            className="w-16 text-center"
                                            disabled={!dbStatus.connected}
                                        />
                                        <div className="flex items-center gap-2 w-2/5">
                                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.awayTeam.bgColourSolid }}>
                                                <AwayIcon className="size-5" style={{ color: match.awayTeam.iconColour }} />
                                            </div>
                                            <Label htmlFor={`${match.id}-away`}>{match.awayTeam.name}</Label>
                                        </div>
                                    </div>
                                )})}
                            </div>
                            <Button onClick={handleSaveWeekResults} disabled={isUpdating || isLoadingData}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : `Save & Recalculate Week ${selectedWeek}`}
                            </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No fixtures found for Week {selectedWeek}. You may need to re-import them.</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
