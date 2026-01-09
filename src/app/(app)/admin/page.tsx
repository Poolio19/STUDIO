
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';


async function importClientSideData(db: Firestore, purge: boolean = false): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  const collections: { name: string; data: any[]; idField: string | string[]; }[] = [
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
    if (purge) {
      console.log("Starting data purge...");
      for (const { name } of collections) {
        const collectionRef = collection(db, name);
        const snapshot = await getDocs(collectionRef);
        if (snapshot.empty) {
          console.log(`Collection '${name}' is already empty. Skipping purge.`);
          continue;
        }
        
        // Firestore allows a maximum of 500 operations in a single batch.
        const BATCH_SIZE = 499;
        let batch = writeBatch(db);
        let count = 0;
        for (const document of snapshot.docs) {
            batch.delete(document.ref);
            count++;
            if (count % BATCH_SIZE === 0) {
                await batch.commit();
                console.log(`Deleted ${count} documents from '${name}'.`);
                batch = writeBatch(db);
            }
        }
        if (count % BATCH_SIZE !== 0) {
          await batch.commit();
          console.log(`Deleted final ${count % BATCH_SIZE} documents from '${name}'.`);
        }
        console.log(`Purged collection: ${name}`);
      }
      console.log("All collections have been purged.");
    }
    
    console.log("Starting data import...");
    for (const { name, data, idField } of collections) {
        if (!data || data.length === 0) {
            console.warn(`No data for collection ${name}, skipping.`);
            continue;
        }
      
        const BATCH_SIZE = 499;
        let batch = writeBatch(db);
        let count = 0;
        for(const item of data) {
            let docId: string;
            if (Array.isArray(idField)) {
                docId = idField.map(field => item[field]).join('_');
            } else {
                docId = item[idField];
            }

            if (!docId) {
                console.warn(`Missing ID for item in collection ${name}`, item);
                continue; // Continue with the next item
            }

            const docRef = doc(db, name, String(docId));
            
            const itemData = {...item};
            if (!Array.isArray(idField) && idField in itemData) {
              delete itemData[idField as keyof typeof itemData];
            }
            
            batch.set(docRef, itemData);
            count++;

            if(count % BATCH_SIZE === 0) {
              await batch.commit();
              console.log(`Committed a batch of documents to '${name}'.`);
              batch = writeBatch(db);
            }
        }

        if (count % BATCH_SIZE !== 0) {
            await batch.commit();
            console.log(`Committed final batch of documents to '${name}'.`);
        }

        console.log(`Imported collection: ${name}`);
    }

    return { success: true, message: `All application data has been ${purge ? 'purged and' : ''} re-imported successfully.` };

  } catch (error: any) {
    console.error('Client-side data operation failed:', error);
    return { success: false, message: `Operation failed: ${error.message}` };
  }
}

type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

type DbStatus = {
  status: 'pending' | 'success' | 'error';
  message: string;
};

export default function AdminPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isImporting, setIsImporting] = React.useState(false);
  const [isUpdatingMatches, setIsUpdatingMatches] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});

  const [dbStatus, setDbStatus] = React.useState<DbStatus>({
    status: 'pending',
    message: 'Checking database connection...',
  });

  const teamMap = React.useMemo(() => new Map(teams.map(t => [t.id, t])), []);

  React.useEffect(() => {
    const checkDbConnection = async () => {
      if (!firestore) {
        setDbStatus({ status: 'error', message: 'Firestore client is not available.' });
        return;
      }
      try {
        await getDoc(doc(firestore, '_internal_test_collection_do_not_delete', 'test_doc'));
        setDbStatus({ status: 'success', message: 'Successfully connected to the database.' });
      } catch (error: any) {
        if (error.code === 'permission-denied') {
             setDbStatus({ status: 'success', message: 'Connection confirmed (permission-denied is OK).' });
        } else {
            console.error("Database connection check failed:", error);
            setDbStatus({ status: 'error', message: `Database connection failed: ${error.message}` });
        }
      }
    };

    checkDbConnection();
  }, [firestore]);


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
    if (selectedWeek === null || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot save results. Week or database not selected.' });
        return;
    }
    setIsUpdatingMatches(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Saving results directly to the database.',
    });

    try {
        const batch = writeBatch(firestore);
        const matchesCollectionRef = collection(firestore, 'matches');
        
        const resultsToUpdate = Object.entries(scores).map(([matchId, score]) => {
            const match = weekFixtures.find(f => f.id === matchId)!;
            return {
                ...match,
                homeScore: parseInt(score.homeScore, 10),
                awayScore: parseInt(score.awayScore, 10),
            };
        });
        
        const validResults = resultsToUpdate.filter(r => !isNaN(r.homeScore) && !isNaN(r.awayScore));

        if (validResults.length === 0) {
            throw new Error('No valid scores entered for this week.');
        }

        validResults.forEach(result => {
            const { homeTeam, awayTeam, ...matchData } = result;
            const docRef = doc(matchesCollectionRef, result.id);
            batch.set(docRef, matchData, { merge: true });
        });

        await batch.commit();

        toast({
            title: `Week ${selectedWeek} Updated!`,
            description: `${validResults.length} match records were successfully updated.`,
        });

    } catch (error: any) {
         console.error(`Error updating match results for week ${selectedWeek}:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred during the client-side batch write.',
        });
    } finally {
        setIsUpdatingMatches(false);
    }
  };

  const performImport = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }
    setIsImporting(true);
    toast({
      title: 'Purging and Re-Importing Data...',
      description: `Wiping and repopulating database with initial application data. This may take a moment.`,
    });

    const result = await importClientSideData(firestore, true);
    
    toast({
      variant: result.success ? 'default' : 'destructive',
      title: result.success ? 'Import Complete!' : 'Import Failed',
      description: result.message,
    });
    
    setIsImporting(false);
    
    if (result.success) {
      // Small delay to allow Firestore propagation before reload
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  const handleDataImportClick = async () => {
    setIsAlertOpen(true);
  };
  
  const handleBulkUpdateMatches = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not available for bulk update.' });
        return;
    }
    setIsUpdatingMatches(true);
    toast({
      title: 'Syncing All Match Results...',
      description: 'Sending all fixture data directly to the database. This is a non-destructive operation.',
    });
  
    try {
      if (matches.length === 0) {
        throw new Error('No local match data found to sync.');
      }
      
      const BATCH_SIZE = 499;
      const matchesToSync = matches.filter(m => typeof m.homeScore === 'number' && m.homeScore !== -1 && 
                                               typeof m.awayScore === 'number' && m.awayScore !== -1);
      
      for (let i = 0; i < matchesToSync.length; i += BATCH_SIZE) {
          const batch = writeBatch(firestore);
          const chunk = matchesToSync.slice(i, i + BATCH_SIZE);
          chunk.forEach(match => {
              const docRef = doc(firestore, 'matches', match.id);
              batch.set(docRef, match, { merge: true });
          });
          await batch.commit();
          console.log(`Synced a batch of ${chunk.length} matches.`);
      }
  
      toast({
        title: 'All Match Results Synced!',
        description: `${matchesToSync.length} match records were successfully synced to the database.`,
      });
    } catch (error: any) {
      console.error('Error in bulk updating match results:', error);
      toast({
        variant: 'destructive',
        title: 'Bulk Sync Failed',
        description: error.message || 'An unexpected error occurred while syncing matches.',
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
                <CardTitle>Database Connection Status</CardTitle>
                <CardDescription>
                    This is a simple check to see if the application can connect to the Firestore database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {dbStatus.status === 'pending' && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
                {dbStatus.status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
                {dbStatus.status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
                <p className={cn(
                    'font-medium',
                    dbStatus.status === 'success' ? 'text-green-600' :
                    dbStatus.status === 'error' ? 'text-red-600' :
                    'text-muted-foreground'
                )}>{dbStatus.message}</p>
                </div>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle>Update Match Results</CardTitle>
                <CardDescription>
                    Select a week to view its fixtures, enter the scores, and save the results to the database. Use a value of -1 for scores that are not yet final.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Select onValueChange={handleWeekChange}>
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
                                    />
                                    <span>-</span>
                                     <Input
                                        id={`${match.id}-away`}
                                        type="number"
                                        value={scores[match.id]?.awayScore ?? ''}
                                        onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                        className="w-16 text-center"
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
                        <Button onClick={handleSaveWeekResults} disabled={isUpdatingMatches || dbStatus.status !== 'success'}>
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

        <Card>
            <CardHeader>
                <CardTitle>Bulk Data Operations</CardTitle>
                <CardDescription>
                    Use these actions to perform large-scale data updates. Be cautious as some actions are destructive.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h3 className="font-semibold">Sync All Local Matches to DB</h3>
                  <p className="text-sm text-muted-foreground mb-2">Safely adds or updates all match results from the local data file to the database. This is non-destructive.</p>
                  <Button onClick={handleBulkUpdateMatches} disabled={isUpdatingMatches || dbStatus.status !== 'success'}>
                    {isUpdatingMatches ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing Matches...
                      </>
                    ) : (
                      'Sync All Local Matches to DB'
                    )}
                  </Button>
              </div>
              <div>
                  <h3 className="font-semibold text-red-600">Purge and Re-Import All Data</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-bold text-red-500">Destructive:</span> Deletes all data and replaces it with the initial dataset. Use to reset the app to a clean state.
                  </p>
                  <Button variant="destructive" onClick={handleDataImportClick} disabled={isImporting || dbStatus.status !== 'success'}>
                      {isImporting ? (
                      <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing Data...
                      </>
                      ) : (
                      'Purge and Re-Import All Data'
                      )}
                  </Button>
              </div>
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite Existing Data?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete all data in the collections and replace it with the initial application data. This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setIsAlertOpen(false);
              await performImport();
            }}>
              Purge and Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
