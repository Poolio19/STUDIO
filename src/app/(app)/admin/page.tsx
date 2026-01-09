
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

async function importClientSideData(db: Firestore, setProgress: (message: string) => void): Promise<{ success: boolean; message: string }> {
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
    setProgress("Purging existing data...");
    for (const { name } of collections) {
      const collectionRef = collection(db, name);
      const snapshot = await getDocs(collectionRef);
      if (snapshot.empty) {
        continue;
      }
      
      const BATCH_SIZE = 499;
      let i = 0;
      while (i < snapshot.docs.length) {
        const batch = writeBatch(db);
        const chunk = snapshot.docs.slice(i, i + BATCH_SIZE);
        chunk.forEach(document => {
            batch.delete(document.ref);
        });
        await batch.commit();
        i += BATCH_SIZE;
      }
      setProgress(`Purged collection: ${name}`);
    }
    
    setProgress("Importing new data...");
    for (const { name, data, idField } of collections) {
        if (!data || data.length === 0) {
            continue;
        }
      
        const BATCH_SIZE = 499;
        let i = 0;
        while(i < data.length) {
            const batch = writeBatch(db);
            const chunk = data.slice(i, i + BATCH_SIZE);

            chunk.forEach(item => {
                let docId: string;
                if (Array.isArray(idField)) {
                    docId = idField.map(field => item[field]).join('_');
                } else {
                    docId = item[idField];
                }

                if (!docId) {
                    console.warn(`Missing ID for item in collection ${name}`, item);
                    return;
                }

                const docRef = doc(db, name, String(docId));
                
                const itemData = {...item};
                if (!Array.isArray(idField)) {
                  delete itemData[idField as keyof typeof itemData];
                }
                
                batch.set(docRef, itemData);
            });
            await batch.commit();
            i += BATCH_SIZE;
        }
        setProgress(`Imported collection: ${name}`);
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
  const [isImporting, setIsImporting] = React.useState(true);
  const [importProgress, setImportProgress] = React.useState("Initializing data reset...");
  const [importCompleted, setImportCompleted] = React.useState(false);

  const [isUpdatingMatches, setIsUpdatingMatches] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});

  const teamMap = React.useMemo(() => new Map(teams.map(t => [t.id, t])), []);

  React.useEffect(() => {
    const performImport = async () => {
      if (!firestore) {
        setTimeout(performImport, 100); // Wait for firestore
        return;
      }
      setIsImporting(true);
      setImportCompleted(false);

      const result = await importClientSideData(firestore, setImportProgress);
      
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Import Complete!' : 'Import Failed',
        description: result.message,
      });
      
      setImportProgress(result.message);
      setIsImporting(false);
      setImportCompleted(result.success);
    }

    performImport();
  }, [firestore, toast]);


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
                <CardTitle>Database Reset</CardTitle>
                <CardDescription>
                    The database is being automatically purged and re-populated with the initial dataset.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {isImporting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                    importCompleted ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />
                )}
                <p className="font-medium">{importProgress}</p>
                </div>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle>Update Match Results</CardTitle>
                <CardDescription>
                    Select a week to view its fixtures, enter the scores, and save the results to the database. Use a value of -1 for scores that are not yet final. This is disabled until the data reset is complete.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Select onValueChange={handleWeekChange} disabled={isImporting || !importCompleted}>
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
                                        disabled={isImporting || !importCompleted}
                                    />
                                    <span>-</span>
                                     <Input
                                        id={`${match.id}-away`}
                                        type="number"
                                        value={scores[match.id]?.awayScore ?? ''}
                                        onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                        className="w-16 text-center"
                                        disabled={isImporting || !importCompleted}
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
                        <Button onClick={handleSaveWeekResults} disabled={isUpdatingMatches || isImporting || !importCompleted}>
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
