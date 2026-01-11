
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
import { MatchResultSchema } from '@/ai/flows/update-match-results-flow-types';
import type { Match, Team } from '@/lib/types';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdatingMatches, setIsUpdatingMatches] = React.useState(false);

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

  const connectivityCheckDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'connectivity-test', 'connectivity-doc') : null),
    [firestore]
  );


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

  const handleWeekChange = (weekStr: string) => {
    if (!matchesData) return;
    const week = parseInt(weekStr);
    setSelectedWeek(week);
    const fixturesForWeek = matchesData.filter(m => m.week === week).map(match => {
        return {
            ...match,
            homeTeam: teamMap.get(match.homeTeamId)!,
            awayTeam: teamMap.get(match.awayTeamId)!,
        };
    });
    setWeekFixtures(fixturesForWeek);

    const initialScores = fixturesForWeek.reduce((acc, match) => {
        acc[match.id] = { homeScore: String(match.homeScore), awayScore: String(match.awayScore) };
        return acc;
    }, {} as {[matchId: string]: {homeScore: string, awayScore: string}});
    setScores(initialScores);
  };

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
    setIsUpdatingMatches(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Saving results via AI flow.',
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
            throw new Error('No valid scores entered for this week.');
        }

        const flowResult = await updateMatchResults({ results: validResults });
        
        if (!flowResult.success) {
            throw new Error(`The AI flow reported an error during the update.`);
        }

        toast({
            title: `Week ${selectedWeek} Updated!`,
            description: `${flowResult.updatedCount} match records were successfully updated via the AI flow.`,
        });

    } catch (error: any) {
        console.error(`Error updating match results for week ${selectedWeek}:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsUpdatingMatches(false);
    }
  };

  const isLoading = teamsLoading || matchesLoading;
  const allWeeks = React.useMemo(() => {
    if (!matchesData) return [];
    return [...new Set(matchesData.map(m => m.week))].sort((a,b) => a-b);
  }, [matchesData]);

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
                  Select a week to view its fixtures, enter the scores, and save the results to the database. Use a value of -1 for scores that are not yet final. This is disabled until the database is connected.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <Select onValueChange={handleWeekChange} disabled={!dbStatus.connected || isLoading}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a week" />
                  </SelectTrigger>
                  <SelectContent>
                      {allWeeks.map(week => (
                          <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>

              {isLoading && <div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading fixture data...</div>}

              {selectedWeek !== null && !isLoading && (
                  <div className="space-y-4 pt-4">
                      <h3 className="font-semibold">Fixtures for Week {selectedWeek}</h3>
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
                      <Button onClick={handleSaveWeekResults} disabled={isUpdatingMatches || !dbStatus.connected}>
                          {isUpdatingMatches ? (
                              <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                              </>
                          ) : `Save Week ${selectedWeek} Results`}
                      </Button>
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
