
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
import { useFirebase } from '@/firebase';
import {
  teams,
  standings,
  fullUsers,
  fullPredictions,
  matches,
  previousSeasonStandings,
  seasonMonths,
  monthlyMimoM,
  fullUserHistories,
  playerTeamScores,
  weeklyTeamStandings,
  teamRecentResults,
  type Match,
  type Team
} from '@/lib/data';
import { collection, doc, writeBatch, getDocs, Firestore, getDoc } from 'firebase/firestore';
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
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


async function importClientSideData(db: Firestore, setProgress: (message: string) => void): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  const collections: { name: string; data: any[]; idField: string | string[] | null; }[] = [
      { name: 'teams', data: teams, idField: 'id' },
      { name: 'standings', data: standings, idField: 'teamId' },
      { name: 'users', data: fullUsers, idField: 'id' },
      { name: 'predictions', data: fullPredictions, idField: 'userId' },
      { name: 'matches', data: matches, idField: 'id' },
      { name: 'previousSeasonStandings', data: previousSeasonStandings, idField: 'teamId' },
      { name: 'seasonMonths', data: seasonMonths, idField: 'id' },
      { name: 'monthlyMimoM', data: monthlyMimoM, idField: 'id' },
      { name: 'userHistories', data: fullUserHistories, idField: 'userId' },
      { name: 'playerTeamScores', data: playerTeamScores, idField: ['userId', 'teamId'] },
      { name: 'weeklyTeamStandings', data: weeklyTeamStandings, idField: ['week', 'teamId'] },
      { name: 'teamRecentResults', data: teamRecentResults, idField: 'teamId' },
  ];
   
  try {
    setProgress("Purging existing data...");
    for (const { name } of collections) {
      const collectionRef = collection(db, name);
      const snapshot = await getDocs(collectionRef);
      if (snapshot.empty) {
        setProgress(`Collection ${name} is already empty.`);
        continue;
      }
      
      const BATCH_SIZE = 499;
      for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = snapshot.docs.slice(i, i + BATCH_SIZE);
        chunk.forEach(document => {
            batch.delete(document.ref);
        });
        await batch.commit();
        setProgress(`Purged ${chunk.length} documents from ${name}...`);
      }
      setProgress(`Finished purging collection: ${name}.`);
    }
    
    setProgress("Importing new data...");
    for (const { name, data, idField } of collections) {
        if (!data || data.length === 0) {
            setProgress(`Skipping empty collection: ${name}.`);
            continue;
        }
      
        const BATCH_SIZE = 499;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = data.slice(i, i + BATCH_SIZE);

            chunk.forEach(item => {
                let docId: string;
                if(idField === null) {
                    docId = doc(collection(db, name)).id;
                } else if (Array.isArray(idField)) {
                    docId = idField.map(field => item[field]).join('_');
                } else {
                    docId = item[idField];
                }

                if (!docId) {
                    console.warn(`Missing ID for item in collection ${name}`, item);
                    return;
                }

                const docRef = doc(db, name, String(docId));
                batch.set(docRef, item);
            });

            await batch.commit();
            setProgress(`Imported ${chunk.length} documents into ${name}...`);
        }
        setProgress(`Finished importing collection: ${name}.`);
    }

    return { success: true, message: `All application data has been purged and re-imported successfully.` };

  } catch (error: any) {
    console.error('Client-side data operation failed:', error);
    return { success: false, message: `Operation failed: ${error.message}` };
  }
}

type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

export default function AdminPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState<string | null>(null);

  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdatingMatches, setIsUpdatingMatches] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});

  const teamMap = React.useMemo(() => new Map(teams.map(t => [t.id, t])), []);

  React.useEffect(() => {
    const checkConnection = async () => {
      if (!firestore) {
        setTimeout(checkConnection, 200); // Retry if firestore isn't initialized yet
        return;
      }
      try {
        // This is a special path that is allowed by security rules for this exact purpose.
        const docRef = doc(firestore, '____connectivity-test____', '____test____');
        await getDoc(docRef);
        // This case should ideally not be hit with the new rule, but is kept as a fallback.
        setDbStatus({ connected: true, message: 'Database is connected.' });
      } catch (error: any) {
         if (error.code === 'permission-denied') {
            // A "permission-denied" error on our test path means the rules are working and we are connected.
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
  }, [firestore]);


  const handlePurgeAndImport = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    setIsImporting(true);
    setImportProgress("Initializing data reset...");
    
    const result = await importClientSideData(firestore, setImportProgress);
    
    toast({
      variant: result.success ? 'default' : 'destructive',
      title: result.success ? 'Import Complete!' : 'Import Failed',
      description: result.message,
    });
    
    setImportProgress(result.message);
    setIsImporting(false);
  }


  const handleWeekChange = (weekStr: string) => {
    const week = parseInt(weekStr);
    setSelectedWeek(week);
    const fixturesForWeek = matches.filter(m => m.week === week).map(match => {
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

  return (
    <>
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
                <CardTitle>Database Reset</CardTitle>
                <CardDescription>
                    This will permanently delete all data in all collections and re-populate it with the initial dataset. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" disabled={!dbStatus.connected || isImporting}>
                            {isImporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting Database...
                                </>
                            ) : "Purge and Re-Import All Data"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all collections and documents in your database and replace them with the original seed data. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePurgeAndImport}>Yes, reset the database</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {importProgress && (
                     <div className="flex items-center gap-4 rounded-lg border p-4 mt-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="font-medium">{importProgress}</p>
                    </div>
                )}
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
                 <Select onValueChange={handleWeekChange} disabled={!dbStatus.connected}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 38 }, (_, i) => i + 1).map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedWeek !== null && (
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
    </>
  );
}
