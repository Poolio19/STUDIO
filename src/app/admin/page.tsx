
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

import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
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
import { testDbWriteFlow } from '@/ai/flows/test-db-write-flow';
import { MatchResultSchema } from '@/ai/flows/update-match-results-flow-types';
import type { Match, Team } from '@/lib/types';
import pastFixtures from '@/lib/past-fixtures.json';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isRecalculating, setIsRecalculating] = React.useState(false);
  const [isImportingPast, setIsImportingPast] = React.useState(false);
  const [isTestingDbWrite, setIsTestingDbWrite] = React.useState(false);


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

    setWeekFixtures(existingFixtures);

    const initialScores = existingFixtures.reduce((acc, match) => {
        acc[match.id] = { 
          homeScore: match.homeScore === -1 ? '' : String(match.homeScore), 
          awayScore: match.awayScore === -1 ? '' : String(match.awayScore) 
        };
        return acc;
    }, {} as {[matchId: string]: {homeScore: string, awayScore: string}});
    setScores(initialScores);
  }, [matchesData, teamMap]);

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
                ...match,
                homeScore: !isNaN(homeScore) ? homeScore : -1,
                awayScore: !isNaN(awayScore) ? awayScore : -1,
            };
        });

        const parsedResults = MatchResultSchema.array().safeParse(resultsToUpdate);

        if (!parsedResults.success) {
            console.error("Zod validation failed:", parsedResults.error);
            const errorMessages = parsedResults.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Data validation failed: ${errorMessages}`);
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

  const handleRecalculateAllData = async () => {
    setIsRecalculating(true);
    toast({
      title: 'Recalculating All Data...',
      description: 'This will update all standings and scores based on the current match results in the database.',
    });
    try {
      const result = await updateAllData();
      if (result.success) {
        toast({
          title: 'Recalculation Complete!',
          description: 'All league standings and player scores have been successfully updated.',
        });
      } else {
        throw new Error(result.message || 'The master data update flow failed.');
      }
    } catch (error: any) {
      console.error('Error during master data update:', error);
      toast({
        variant: 'destructive',
        title: 'Recalculation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsRecalculating(false);
    }
  };

   const handleImportPastFixtures = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    }
    setIsImportingPast(true);
    toast({
      title: 'Importing All Fixtures...',
      description: 'Importing from JSON file. This will overwrite existing matches.',
    });

    try {
        const matchesCollectionRef = collection(firestore, 'matches');
        
        // Firestore allows a maximum of 500 operations in a single batch.
        const BATCH_SIZE = 500;
        let batch = writeBatch(firestore);
        let operationCount = 0;
        let totalImported = 0;

        for (const fixture of pastFixtures) {
            const { id, ...fixtureData } = fixture;
            if (!id) {
                console.warn('Skipping fixture with no ID:', fixture);
                continue;
            }
            const docRef = doc(matchesCollectionRef, id);
            batch.set(docRef, fixtureData);
            operationCount++;
            
            // If the batch is full, commit it and start a new one.
            if (operationCount === BATCH_SIZE) {
                await batch.commit();
                totalImported += operationCount;
                batch = writeBatch(firestore);
                operationCount = 0;
            }
        }
        
        // Commit the final batch if it has any operations.
        if (operationCount > 0) {
            await batch.commit();
            totalImported += operationCount;
        }

        toast({
          title: 'Import Complete!',
          description: `Successfully imported ${totalImported} matches. Triggering a full data recalculation.`,
        });

        await handleRecalculateAllData();

    } catch (error: any) {
        console.error('Error during client-side past fixtures import:', error);
        toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: error.message || 'An unexpected error occurred during the import.',
        });
    } finally {
        setIsImportingPast(false);
    }
  };

  const handleTestDbWrite = async () => {
    setIsTestingDbWrite(true);
    toast({
      title: 'Running DB Write Test...',
      description: 'Attempting to write to collection `test_01`.',
    });
    try {
      const result = await testDbWriteFlow();
      if (result.success) {
        toast({
          title: 'DB Write Test Successful!',
          description: `Successfully wrote document to path: ${result.path}`,
        });
      } else {
        throw new Error(result.message || 'The test write flow reported a failure.');
      }
    } catch (error: any) {
      console.error('Error during DB write test:', error);
      toast({
        variant: 'destructive',
        title: 'DB Write Test Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsTestingDbWrite(false);
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
        if(counts.has(match.homeTeamId)) {
          counts.set(match.homeTeamId, (counts.get(match.homeTeamId) || 0) + 1);
        }
        if(counts.has(match.awayTeamId)) {
          counts.set(match.awayTeamId, (counts.get(match.awayTeamId) || 0) + 1);
        }
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
                    Check the connection and run master data operations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {dbStatus.connected ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />}
                <p className="font-medium">{dbStatus.message}</p>
                </div>
                {matchesError && <p className="text-sm text-red-500 mt-2">Error loading matches: {matchesError.message}</p>}
                
                 <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={isTestingDbWrite || !dbStatus.connected} onClick={handleTestDbWrite}>
                        {isTestingDbWrite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Test DB Write
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isRecalculating || !dbStatus.connected}>
                            {isRecalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Force Recalculate All Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will run the master data update flow. It will recalculate all standings, user scores, and histories based on the existing match results in the database. This can be a long-running and resource-intensive operation.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRecalculateAllData}>Yes, Recalculate</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isImportingPast || !dbStatus.connected}>
                            {isImportingPast ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Import All Fixtures (Wk 1-38)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will import all fixtures from the JSON backup file, overwriting any existing matches with the same ID. This action is irreversible. It will automatically trigger a full data recalculation upon completion.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportPastFixtures}>Yes, Import Fixtures</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>


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
                        <p className="text-muted-foreground">No fixtures found for Week {selectedWeek}. You may need to manually add them or use a different import method.</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}

    