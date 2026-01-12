
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
import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
import { updateAllData } from '@/ai/flows/update-all-data-flow';
import { MatchResultSchema } from '@/ai/flows/update-match-results-flow-types';
import type { Match, Team } from '@/lib/types';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

const rawFutureFixtures = `
Week 19: 2nd Jan 2026
Bournemouth	v	Arsenal
Aston Villa	v	Brighton
Chelsea	v	Man City
Everton	v	West Ham
Leeds	v	Man Utd
Burnley	v	Fulham
Tottenham	v	Sunderland
Wolves	v	Crystal Palace
Liverpool	v	Nott'm Forest
Newcastle	v	Brentford

Week 20: 17th Jan 2026
Arsenal	v	Tottenham
Brentford	v	Burnley
Brighton	v	Newcastle
Crystal Palace	v	Leeds
Fulham	v	Everton
Sunderland	v	Chelsea
Man City	v	Bournemouth
Man Utd	v	Liverpool
Nott'm Forest	v	Wolves
West Ham	v	Aston Villa

Week 21: 24th Jan 2026
Bournemouth	v	Liverpool
Aston Villa	v	Fulham
Chelsea	v	Arsenal
Everton	v	Brentford
Leeds	v	Crystal Palace
Burnley	v	Sunderland
Tottenham	v	Man City
Wolves	v	Man Utd
Newcastle	v	Brighton
Nott'm Forest	v	West Ham

Week 22: 4th Feb 2026
Arsenal	v	Burnley
Brentford	v	Wolves
Brighton	v	Tottenham
Crystal Palace	v	Everton
Fulham	v	Nott'm Forest
Sunderland	v	Bournemouth
Man City	v	Aston Villa
Man Utd	v	Newcastle
Liverpool	v	Chelsea
West Ham	v	Leeds

Week 23: 8th Feb 2026
Bournemouth	v	Man Utd
Aston Villa	v	Liverpool
Chelsea	v	West Ham
Everton	v	Man City
Leeds	v	Arsenal
Burnley	v	Brighton
Tottenham	v	Brentford
Wolves	v	Sunderland
Newcastle	v	Crystal Palace
Nott'm Forest	v	Fulham

Week 24: 15th Feb 2026
Arsenal	v	Everton
Brentford	v	Leeds
Brighton	v	Wolves
Crystal Palace	v	Aston Villa
Fulham	v	Chelsea
Sunderland	v	Newcastle
Man City	v	Nott'm Forest
Man Utd	v	Burnley
Liverpool	v	Tottenham
West Ham	v	Bournemouth

Week 25: 22nd Feb 2026
Bournemouth	v	Crystal Palace
Aston Villa	v	Man Utd
Chelsea	v	Brighton
Everton	v	Sunderland
Leeds	v	Man City
Burnley	v	West Ham
Tottenham	v	Fulham
Wolves	v	Arsenal
Newcastle	v	Liverpool
Nott'm Forest	v	Brentford

Week 26: 1st Mar 2026
Arsenal	v	Nott'm Forest
Brentford	v	Chelsea
Brighton	v	Bournemouth
Crystal Palace	v	Man Utd
Fulham	v	Newcastle
Sunderland	v	Leeds
Man City	v	Burnley
Liverpool	v	Everton
Tottenham	v	Aston Villa
West Ham	v	Wolves

Week 27: 8th Mar 2026
Bournemouth	v	Fulham
Aston Villa	v	Crystal Palace
Everton	v	Man City
Leeds	v	Brighton
Man Utd	v	Arsenal
Burnley	v	Tottenham
Wolves	v	Brentford
Newcastle	v	Sunderland
Nott'm Forest	v	West Ham
Liverpool	v	Man Utd

Week 28: 15th Mar 2026
Arsenal	v	Newcastle
Brentford	v	Aston Villa
Brighton	v	Liverpool
Crystal Palace	v	Burnley
Fulham	v	Man Utd
Sunderland	v	Nott'm Forest
Man City	v	Tottenham
Leeds	v	Everton
West Ham	v	Chelsea
Wolves	v	Bournemouth

Week 29: 22nd Mar 2026
Bournemouth	v	Leeds
Aston Villa	v	Wolves
Chelsea	v	Sunderland
Everton	v	Fulham
Man Utd	v	Brentford
Burnley	v	Man City
Tottenham	v	West Ham
Newcastle	v	Arsenal
Nott'm Forest	v	Crystal Palace
Liverpool	v	Brighton

Week 30: 5th Apr 2026
Arsenal	v	Liverpool
Brentford	v	Nott'm Forest
Brighton	v	Man Utd
Crystal Palace	v	Tottenham
Fulham	v	Burnley
Sunderland	v	Everton
Man City	v	Newcastle
Leeds	v	Bournemouth
West Ham	v	Man City
Wolves	v	Aston Villa

Week 31: 12th Apr 2026
Bournemouth	v	Brentford
Aston Villa	v	Leeds
Chelsea	v	Wolves
Everton	v	Brighton
Man Utd	v	Sunderland
Burnley	v	Arsenal
Tottenham	v	Nott'm Forest
Newcastle	v	Fulham
Liverpool	v	West Ham
Man City	v	Crystal Palace

Week 32: 19th Apr 2026
Arsenal	v	Aston Villa
Brentford	v	Man City
Brighton	v	Burnley
Crystal Palace	v	Chelsea
Fulham	v	Bournemouth
Sunderland	v	Tottenham
Leeds	v	Liverpool
West Ham	v	Man Utd
Wolves	v	Everton
Nott'm Forest	v	Newcastle

Week 33: 26th Apr 2026
Bournemouth	v	Wolves
Aston Villa	v	Nott'm Forest
Chelsea	v	Fulham
Everton	v	Arsenal
Man Utd	v	Crystal Palace
Burnley	v	Leeds
Tottenham	v	Brighton
Newcastle	v	West Ham
Liverpool	v	Sunderland
Man City	v	Brentford

Week 34: 3rd May 2026
Arsenal	v	Man Utd
Brentford	v	Everton
Brighton	v	Man City
Crystal Palace	v	Liverpool
Fulham	v	Aston Villa
Sunderland	v	Burnley
Leeds	v	Tottenham
West Ham	v	Newcastle
Wolves	v	Nott'm Forest
Man City	v	Chelsea

Week 35: 10th May 2026
Bournemouth	v	Aston Villa
Brentford	v	Sunderland
Brighton	v	Arsenal
Man Utd	v	Everton
Nott'm Forest	v	Chelsea
Burnley	v	Liverpool
Tottenham	v	Wolves
West Ham	v	Fulham
Newcastle	v	Leeds
Man City	v	West Ham

Week 36: 17th May 2026
Arsenal	v	Nott'm Forest
Chelsea	v	Tottenham
Crystal Palace	v	Brentford
Everton	v	Burnley
Fulham	v	Man City
Sunderland	v	Brighton
Leeds	v	Wolves
Man Utd	v	Newcastle
Liverpool	v	Bournemouth
Aston Villa	v	Man Utd

Week 37: 24th May 2026
Bournemouth	v	Everton
Aston Villa	v	Tottenham
Brentford	v	Fulham
Brighton	v	Leeds
Crystal Palace	v	Sunderland
Man City	v	Arsenal
Nott'm Forest	v	Burnley
West Ham	v	Liverpool
Wolves	v	Newcastle
Man Utd	v	Chelsea

Week 38: 31st May 2026
Arsenal	v	Wolves
Chelsea	v	Aston Villa
Everton	v	Nott'm Forest
Fulham	v	Man Utd
Sunderland	v	West Ham
Leeds	v	Bournemouth
Burnley	v	Crystal Palace
Tottenham	v	Brentford
Newcastle	v	Man City
Liverpool	v	Brighton
`;

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdating, setIsUpdating] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});
  
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  
  const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);

  const teamMap = React.useMemo(() => {
    if (!teamsData) return new Map();
    return new Map(teamsData.map(t => [t.id, t]));
  }, [teamsData]);
  
  const teamNameMap = React.useMemo(() => {
    if (!teamsData) return new Map<string, Team>();
    
    const map = new Map<string, Team>();
    
    // First, map all official team names (lowercase) to their Team object.
    teamsData.forEach(team => {
        map.set(team.name.toLowerCase(), team);
    });

    // Then, create a map of all known variations to their official names.
    const teamVariations: {[key: string]: string} = {
        "nott'm forest": "notts forest",
        "wolves": "wolves",
        "man city": "man city",
        "man utd": "man utd"
    };

    // Finally, add the variations to the main map, pointing them to the correct Team object.
    for (const variation in teamVariations) {
        const officialName = teamVariations[variation];
        const teamObject = map.get(officialName.toLowerCase());
        if (teamObject) {
            map.set(variation.toLowerCase(), teamObject);
        }
    }
    
    return map;
  }, [teamsData]);


  const connectivityCheckDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'connectivity-test', 'connectivity-doc') : null),
    [firestore]
  );

  const parseRawFixtures = React.useCallback((week: number): EditableMatch[] => {
    const lines = rawFutureFixtures.trim().split('\n');
    const fixturesForWeek: EditableMatch[] = [];
    let currentWeek = 0;
    let matchDate: Date | null = null;
  
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Week')) {
        currentWeek = parseInt(trimmedLine.split(' ')[1].replace(':', ''));
        const dateString = trimmedLine.substring(trimmedLine.indexOf(':') + 2);
        if (dateString) {
           const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
           matchDate = new Date(cleanedDateString);
        }
      } else if (trimmedLine && currentWeek === week && matchDate && !isNaN(matchDate.getTime())) {
        const parts = trimmedLine.split(/\s+v\s+/);
        if (parts.length === 2) {
          const homeTeamName = parts[0].trim().toLowerCase();
          const awayTeamName = parts[1].trim().toLowerCase();
          
          const homeTeam = teamNameMap.get(homeTeamName) || teamsData?.find(t => t.name.toLowerCase() === homeTeamName);
          const awayTeam = teamNameMap.get(awayTeamName) || teamsData?.find(t => t.name.toLowerCase() === awayTeamName);
  
          if (homeTeam && awayTeam) {
            const matchId = `${week}-${homeTeam.id}-${awayTeam.id}`;
            fixturesForWeek.push({
              id: matchId,
              week: week,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              homeScore: -1,
              awayScore: -1,
              matchDate: matchDate.toISOString(),
              homeTeam: homeTeam,
              awayTeam: awayTeam,
            });
          }
        }
      }
    }
    return fixturesForWeek;
  }, [teamNameMap, teamsData]);

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
        fixturesForWeek = parseRawFixtures(week);
    }
    
    setWeekFixtures(fixturesForWeek);

    const initialScores = fixturesForWeek.reduce((acc, match) => {
        acc[match.id] = { homeScore: String(match.homeScore), awayScore: String(match.awayScore) };
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
        const resultsToUpdate = Object.entries(scores).map(([matchId, scoreData]) => {
            const match = weekFixtures.find(f => f.id === matchId)!;
            return {
                id: match.id,
                week: match.week,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: parseInt(scoreData.homeScore, 10),
                awayScore: parseInt(scoreData.awayScore, 10),
                matchDate: match.matchDate,
            };
        });

        // Validate with Zod before sending to the flow
        const parsedResults = MatchResultSchema.array().safeParse(resultsToUpdate);

        if (!parsedResults.success) {
            console.error("Zod validation failed:", parsedResults.error);
            const errorMessages = parsedResults.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Data validation failed: ${errorMessages}`);
        }
        
        const validResults = parsedResults.data.filter(r => !isNaN(r.homeScore) && !isNaN(r.awayScore));

        if (validResults.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Valid Scores',
                description: 'No valid scores were entered for this week. Please enter scores before saving.',
            });
            setIsUpdating(false);
            return;
        }

        // First, update the match results.
        const matchUpdateResult = await updateMatchResults({ results: validResults });
        
        if (!matchUpdateResult.success) {
            throw new Error(`The AI flow for updating matches reported an error.`);
        }
        
        toast({
            title: `Week ${selectedWeek} Matches Updated!`,
            description: `${matchUpdateResult.updatedCount} match records were saved. Now recalculating all league data...`,
        });

        // After match results are saved, trigger the master update flow.
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

  const isLoadingData = teamsLoading || matchesLoading || !firestore || !dbStatus.connected;
  
  const allWeeks = React.useMemo(() => {
    // Show all 38 weeks regardless of whether fixtures exist yet.
    return Array.from({ length: 38 }, (_, i) => i + 1);
  }, []);

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
          </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Update Match Results</CardTitle>
              <CardDescription>
                  Select a week to view its fixtures, enter the scores, and save the results. Saving will trigger a full recalculation of all league and player data. This is disabled until the database is connected.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        <p className="text-muted-foreground">No fixtures found for Week {selectedWeek}.</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}

    
