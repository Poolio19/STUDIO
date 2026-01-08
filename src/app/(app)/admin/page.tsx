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
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
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
import { collection, doc, writeBatch, getDocs, QuerySnapshot, DocumentData, Firestore } from 'firebase/firestore';
import { Icons, IconName } from '@/components/icons';

async function importClientSideData(db: Firestore | null): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  try {
    const batch = writeBatch(db);

    const collectionNames = [
        'teams', 'standings', 'users', 'predictions', 'matches', 
        'previousSeasonStandings', 'seasonMonths', 'monthlyMimoM', 
        'userHistories', 'playerTeamScores', 'weeklyTeamStandings', 'teamRecentResults'
    ];
    
    const deleteCollection = async (collectionName: string) => {
        const collectionRef = collection(db, collectionName);
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        console.log(`Queued deletion for all ${snapshot.size} documents in '${collectionName}'.`);
    };

    for (const name of collectionNames) {
        await deleteCollection(name);
    }
    
    teams.forEach(item => {
      const docRef = doc(db, 'teams', item.id);
      batch.set(docRef, item);
    });

    standings.forEach(item => {
      if (item.teamId) {
        const docRef = doc(db, 'standings', item.teamId);
        batch.set(docRef, item);
      }
    });
    
    fullUsers.forEach(item => {
        const docRef = doc(db, 'users', item.id);
        batch.set(docRef, item);
    });

    fullPredictions.forEach(item => {
      if (item.userId) {
        const docRef = doc(db, 'predictions', item.userId);
        batch.set(docRef, item);
      }
    });

    matches.forEach(item => {
      const matchId = `${item.week}-${item.homeTeamId}-${item.awayTeamId}`;
      const docRef = doc(db, 'matches', matchId);
      batch.set(docRef, item);
    });

    previousSeasonStandings.forEach(item => {
      const docRef = doc(db, 'previousSeasonStandings', item.teamId);
      batch.set(docRef, item);
    });

    seasonMonths.forEach(item => {
      const docRef = doc(db, 'seasonMonths', item.id);
      batch.set(docRef, item);
    });

    monthlyMimoM.forEach(item => {
      const docRef = doc(db, 'monthlyMimoM', item.id);
      batch.set(docRef, item);
    });

    fullUserHistories.forEach(item => {
      const docRef = doc(db, 'userHistories', item.userId);
      batch.set(docRef, item);
    });
    
    playerTeamScores.forEach(item => {
        const docId = `${item.userId}_${item.teamId}`;
        const docRef = doc(db, 'playerTeamScores', docId);
        batch.set(docRef, item);
    });

    weeklyTeamStandings.forEach(item => {
        const docId = `${item.week}_${item.teamId}`;
        const docRef = doc(db, 'weeklyTeamStandings', docId);
        batch.set(docRef, item);
    });

    teamRecentResults.forEach(item => {
        const docRef = doc(db, 'teamRecentResults', item.teamId);
        batch.set(docRef, item);
    });

    await batch.commit();

    return { success: true, message: 'All application data has been purged and re-imported successfully.' };

  } catch (error: any) {
    console.error('Client-side data import failed:', error);
    return { success: false, message: `Import failed: ${error.message}` };
  }
}

type EditableMatch = Match & {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
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

  const teamMap = React.useMemo(() => new Map(teams.map(t => [t.id, t])), []);

  const handleWeekChange = (weekStr: string) => {
    const week = parseInt(weekStr);
    setSelectedWeek(week);
    const fixturesForWeek = matches.filter(m => m.week === week).map(match => {
        const matchId = `${match.week}-${match.homeTeamId}-${match.awayTeamId}`;
        return {
            ...match,
            id: matchId,
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
    if (selectedWeek === null) return;
    setIsUpdatingMatches(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Sending fixture data to the server for a safe update.',
    });

    try {
        const results = Object.entries(scores).map(([matchId, score]) => ({
            matchId: matchId,
            homeScore: parseInt(score.homeScore),
            awayScore: parseInt(score.awayScore),
        }));

        const input = {
            week: selectedWeek,
            results: results.filter(r => !isNaN(r.homeScore) && !isNaN(r.awayScore)),
        };
        const result = await updateMatchResults(input);
        if (!result.success) {
          throw new Error(`Failed to update matches for week ${selectedWeek}.`);
        }

        toast({
            title: `Week ${selectedWeek} Updated!`,
            description: `${result.updatedCount} match records were successfully updated.`,
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

  const performImport = async () => {
    setIsImporting(true);
    toast({
      title: 'Purging and Importing Data...',
      description: `Wiping and repopulating database with initial application data. This may take a moment.`,
    });

    const result = await importClientSideData(firestore);
    
    toast({
      variant: result.success ? 'default' : 'destructive',
      title: result.success ? 'Import Complete!' : 'Import Failed',
      description: result.message,
    });
    
    setIsImporting(false);
  }

  const handleDataImport = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }
    setIsAlertOpen(true);
  };
  
  const handleBulkUpdateMatches = async () => {
    setIsUpdatingMatches(true);
    toast({
      title: 'Updating All Match Results...',
      description: 'Sending all fixture data to the server for a safe update.',
    });

    try {
      const resultsByWeek = matches.reduce((acc, match) => {
        const week = match.week;
        if (!acc[week]) {
          acc[week] = [];
        }
        acc[week].push({
          matchId: `${match.week}-${match.homeTeamId}-${match.awayTeamId}`,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        });
        return acc;
      }, {} as { [week: number]: { matchId: string; homeScore: number; awayScore: number }[] });

      let totalUpdated = 0;
      for (const week in resultsByWeek) {
        if (parseInt(week, 10) === 0) continue;
        const input = {
          week: parseInt(week),
          results: resultsByWeek[week],
        };
        const result = await updateMatchResults(input);
        if (!result.success) {
          throw new Error(`Failed to update matches for week ${week}.`);
        }
        totalUpdated += result.updatedCount;
      }

      toast({
        title: 'All Match Results Updated!',
        description: `${totalUpdated} match records were successfully updated in the database.`,
      });
    } catch (error: any) {
      console.error('Error updating match results:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred while updating matches.',
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
                        <Button onClick={handleSaveWeekResults} disabled={isUpdatingMatches || !firestore}>
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
                  <h3 className="font-semibold">Update All Match Results</h3>
                  <p className="text-sm text-muted-foreground mb-2">Safely adds or updates all match results from the local data file. This is non-destructive.</p>
                  <Button onClick={handleBulkUpdateMatches} disabled={isUpdatingMatches || !firestore}>
                    {isUpdatingMatches ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating All Matches...
                      </>
                    ) : (
                      'Bulk Update All Matches'
                    )}
                  </Button>
              </div>
              <div>
                  <h3 className="font-semibold text-red-600">Purge and Import All Data</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-bold text-red-500">Destructive:</span> Deletes all data and replaces it with the initial dataset. Use to reset the app to a clean state.
                  </p>
                  <Button variant="destructive" onClick={handleDataImport} disabled={isImporting || !firestore}>
                      {isImporting ? (
                      <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing Data...
                      </>
                      ) : (
                      'Purge and Import All Data'
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
