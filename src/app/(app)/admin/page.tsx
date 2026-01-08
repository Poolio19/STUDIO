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
    
    // Use a map for faster lookups
    const collectionDataMap = new Map([
        ['teams', teams],
        ['standings', standings.map(s => ({...s, id: s.teamId}))], // ensure id for doc ref
        ['users', fullUsers],
        ['predictions', fullPredictions.map(p => ({...p, id: p.userId}))],
        ['matches', matches],
        ['previousSeasonStandings', previousSeasonStandings.map(s => ({...s, id: s.teamId}))],
        ['seasonMonths', seasonMonths],
        ['monthlyMimoM', monthlyMimoM],
        ['userHistories', fullUserHistories.map(h => ({...h, id: h.userId}))],
        ['playerTeamScores', playerTeamScores.map(s => ({...s, id: `${s.userId}_${s.teamId}`}))],
        ['weeklyTeamStandings', weeklyTeamStandings.map(w => ({...w, id: `${w.week}_${w.teamId}`}))],
        ['teamRecentResults', teamRecentResults.map(r => ({...r, id: r.teamId}))],
    ]);

    for (const name of collectionNames) {
        const collectionRef = collection(db, name);
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        console.log(`Queued deletion for all ${snapshot.size} documents in '${name}'.`);
    }

    await batch.commit();
    
    // Create a new batch for setting data
    const setBatch = writeBatch(db);

    for (const name of collectionNames) {
      const data = collectionDataMap.get(name);
      if (data) {
        data.forEach((item: any) => {
          if (item.id) {
            const docRef = doc(db, name, item.id);
            setBatch.set(docRef, item);
          } else {
            console.warn(`Skipping item in '${name}' due to missing id:`, item);
          }
        });
      }
    }

    await setBatch.commit();

    return { success: true, message: 'All application data has been purged and re-imported successfully.' };

  } catch (error: any) {
    console.error('Client-side data import failed:', error);
    return { success: false, message: `Import failed: ${error.message}` };
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
    if (selectedWeek === null) return;
    setIsUpdatingMatches(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Sending fixture data to the server for a safe update.',
    });

    try {
        const results = Object.entries(scores).map(([matchId, score]) => {
            const match = weekFixtures.find(f => f.id === matchId)!;
            return {
                matchId: match.id,
                week: match.week,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                matchDate: match.matchDate,
                homeScore: parseInt(score.homeScore),
                awayScore: parseInt(score.awayScore),
            };
        });

        const input = {
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
      description: 'Sending all fixture data to the server for a safe, non-destructive update.',
    });
  
    try {
      const allResults = matches.map(match => ({
        matchId: match.id,
        week: match.week,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      }));
  
      const input = {
        results: allResults,
      };
  
      const result = await updateMatchResults(input);
  
      if (!result.success) {
        throw new Error('The bulk match update process failed on the server.');
      }
  
      toast({
        title: 'All Match Results Updated!',
        description: `${result.updatedCount} match records were successfully updated in the database.`,
      });
    } catch (error: any) {
      console.error('Error in bulk updating match results:', error);
      toast({
        variant: 'destructive',
        title: 'Bulk Update Failed',
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
                  <h3 className="font-semibold">Sync All Local Matches to DB</h3>
                  <p className="text-sm text-muted-foreground mb-2">Safely adds or updates all match results from the local data file to the database. This is non-destructive.</p>
                  <Button onClick={handleBulkUpdateMatches} disabled={isUpdatingMatches || !firestore}>
                    {isUpdatingMatches ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating All Matches...
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
                  <Button variant="destructive" onClick={handleDataImport} disabled={isImporting || !firestore}>
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

    