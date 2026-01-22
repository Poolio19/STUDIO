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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { collection, doc, writeBatch, getDocs, query, orderBy } from 'firebase/firestore';
import { Icons } from '@/components/icons';
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

import type { Match, Team, WeekResults, User } from '@/lib/types';
import { createResultsFile } from '@/ai/flows/create-results-file-flow';
import { recalculateAllDataClientSide } from '@/lib/recalculate';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

import pastFixtures from '@/lib/past-fixtures.json';
import previousSeasonData from '@/lib/previous-season-standings-24-25.json';
import historicalPlayersData from '@/lib/historical-players.json';

const scoreSchema = z.union([z.literal('P'), z.literal('p'), z.coerce.number().int()]);

const scoreTransformer = (val: 'P' | 'p' | number | string | null | undefined) => {
    if (val === undefined || val === null || val === '') return -1; // Not played is -1
    if (typeof val === 'string' && val.toLowerCase() === 'p') return -2; // Postponed is -2
    const num = Number(val);
    return isNaN(num) ? -1 : num;
}

const displayScore = (val: number | undefined | null | string) => {
    if (val === undefined || val === null || val === -1) return '';
    if (val === -2) return 'P';
    return String(val);
}

const scoresFormSchema = z.object({
  week: z.coerce.number().min(1).max(38),
  results: z.array(z.object({
    id: z.string(),
    homeScore: z.preprocess(scoreTransformer, z.number().int()),
    awayScore: z.preprocess(scoreTransformer, z.number().int()),
  })),
});

type ScoresFormValues = z.infer<typeof scoresFormSchema>;

const historicalDataFormSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    name: z.string(),
    seasonsPlayed: z.coerce.number().int().min(0),
    first: z.coerce.number().int().min(0),
    second: z.coerce.number().int().min(0),
    third: z.coerce.number().int().min(0),
    fourth: z.coerce.number().int().min(0),
    fifth: z.coerce.number().int().min(0),
    sixth: z.coerce.number().int().min(0),
    seventh: z.coerce.number().int().min(0),
    eighth: z.coerce.number().int().min(0),
    ninth: z.coerce.number().int().min(0),
    tenth: z.coerce.number().int().min(0),
    mimoM: z.coerce.number().int().min(0),
    ruMimoM: z.coerce.number().int().min(0),
    joMimoM: z.coerce.number().int().min(0),
    joRuMimoM: z.coerce.number().int().min(0),
    cashWinnings: z.coerce.number().min(0),
  }))
});
type HistoricalDataFormValues = z.infer<typeof historicalDataFormSchema>;


export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isWritingFile, setIsWritingFile] = React.useState(false);
  const [isImportingFile, setIsImportingFile] = React.useState(false);
  const [isImportingFixtures, setIsImportingFixtures] = React.useState(false);
  const [isImportingStandings, setIsImportingStandings] = React.useState(false);
  const [isUpdatingHistoricalData, setIsUpdatingHistoricalData] = React.useState(false);

  const [latestFilePath, setLatestFilePath] = React.useState<string | null>(null);
  const [latestFileContent, setLatestFileContent] = React.useState<string | null>(null);

  const [allMatches, setAllMatches] = React.useState<Match[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  
  const fetchAllMatches = React.useCallback(async () => {
    if (!firestore) return;
    const matchesSnap = await getDocs(query(collection(firestore, 'matches')));
    const matches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    setAllMatches(matches);
  }, [firestore]);
  
  React.useEffect(() => {
    async function fetchAllData() {
      if (!firestore) return;
      const teamsSnap = await getDocs(query(collection(firestore, 'teams')));
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeamsMap(new Map(teams.map(t => [t.id, t])));
      
      fetchAllMatches();
    }
    fetchAllData();
  }, [firestore, fetchAllMatches]);

  const defaultWeek = React.useMemo(() => {
    if (!allMatches || allMatches.length === 0) {
      return 1;
    }
    // Create a map of week -> {total: number, played: number}
    const weekStats = allMatches.reduce((acc, match) => {
      if (!acc[match.week]) {
        acc[match.week] = { total: 0, played: 0 };
      }
      acc[match.week].total++;
      if (match.homeScore !== -1 && match.awayScore !== -1) {
        acc[match.week].played++;
      }
      return acc;
    }, {} as Record<number, { total: number, played: number }>);

    const weeksWithPlayedMatches = Object.keys(weekStats)
      .map(Number)
      .filter(week => weekStats[week].played > 0);

    if (weeksWithPlayedMatches.length === 0) {
      return 1; // No matches played at all
    }

    const latestPlayedWeek = Math.max(...weeksWithPlayedMatches);

    const latestWeekStats = weekStats[latestPlayedWeek];
    if (latestWeekStats.played < latestWeekStats.total) {
      // Latest week with played matches is incomplete
      return latestPlayedWeek;
    } else {
      // Latest week with played matches is complete, go to next week
      return Math.min(latestPlayedWeek + 1, 38);
    }
  }, [allMatches]);
  
  const scoresForm = useForm<ScoresFormValues>({
    resolver: zodResolver(scoresFormSchema),
    defaultValues: {
      week: 1,
      results: [],
    },
  });

  const historicalForm = useForm<HistoricalDataFormValues>({
    resolver: zodResolver(historicalDataFormSchema),
    defaultValues: {
      users: [],
    },
  });
  const { fields, replace } = useFieldArray({
    control: historicalForm.control,
    name: "users"
  });

  React.useEffect(() => {
    if (historicalPlayersData.length > 0) {
        replace(historicalPlayersData.map(u => ({
            id: u.id,
            name: u.name,
            seasonsPlayed: u.seasonsPlayed || 0,
            first: u.first || 0,
            second: u.second || 0,
            third: u.third || 0,
            fourth: u.fourth || 0,
            fifth: u.fifth || 0,
            sixth: u.sixth || 0,
            seventh: u.seventh || 0,
            eighth: u.eighth || 0,
            ninth: u.ninth || 0,
            tenth: u.tenth || 0,
            mimoM: u.mimoM || 0,
            ruMimoM: u.ruMimoM || 0,
            joMimoM: u.joMimoM || 0,
            joRuMimoM: u.joRuMimoM || 0,
            cashWinnings: u.cashWinnings || 0,
        })));
    }
}, [replace]);


  React.useEffect(() => {
    if (defaultWeek > 0 && !scoresForm.formState.isDirty) {
      scoresForm.setValue('week', defaultWeek);
    }
  }, [defaultWeek, scoresForm]);


  const selectedWeek = scoresForm.watch('week');
  const weekFixtures = React.useMemo(() => {
    return allMatches
      .filter(fixture => fixture.week === selectedWeek)
      .sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  }, [selectedWeek, allMatches]);

  React.useEffect(() => {
    const results = weekFixtures.map(fixture => ({
      id: fixture.id,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
    }));
    scoresForm.reset({ week: selectedWeek, results: results });
  }, [selectedWeek, weekFixtures, scoresForm]);


  const onWriteResultsFileSubmit = async (data: ScoresFormValues) => {
    setIsWritingFile(true);
    setLatestFilePath(null);
    setLatestFileContent(null);
    
    const validResults = data.results.filter(r => (r.homeScore >= 0 && r.awayScore >= 0) || (r.homeScore === -2 && r.awayScore === -2));
    
    toast({ title: `Creating results file for Week ${data.week}...` });
    try {
      const result = await createResultsFile({
        week: data.week,
        results: validResults.map(r => ({ id: r.id, homeScore: r.homeScore, awayScore: r.awayScore })),
      });
  
      if (!result.success || !result.filePath || !result.fileContent) {
        throw new Error(result.message || 'Failed to create results file.');
      }
  
      setLatestFilePath(result.filePath);
      setLatestFileContent(result.fileContent);

      toast({
        title: 'File Created!',
        description: `Results file for ${validResults.length} matches created and is ready for import.`,
      });
  
    } catch (error: any) {
      console.error('Error during file creation:', error);
      toast({
        variant: 'destructive',
        title: 'File Creation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsWritingFile(false);
    }
  };

  const handleImportResultsFile = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    if (!latestFileContent) {
      toast({ variant: 'destructive', title: 'Error', description: 'No results file content available. Please complete Step 1.' });
      return;
    }

    setIsImportingFile(true);
    
    try {
      const weekData: WeekResults = JSON.parse(latestFileContent);
      const batch = writeBatch(firestore);
      
      const scoredResults = weekData.results.filter(r => (r.homeScore >= 0 && r.awayScore >= 0) || (r.homeScore === -2 && r.awayScore === -2));

      for (const result of scoredResults) {
        if (!result.id) {
          console.warn('Skipping result with no ID:', result);
          continue;
        }

        const docRef = doc(firestore, 'matches', result.id);
        batch.update(docRef, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
      }

      await batch.commit();
      await fetchAllMatches();

      toast({
        title: 'Import Complete!',
        description: `Updated ${scoredResults.length} matches for Week ${weekData.week}. You can now run the full recalculation.`,
      });

    } catch (error: any) {
      console.error('Error during database update:', error);
      toast({
        variant: 'destructive',
        title: 'Database Update Failed',
        description: error.message || 'An unexpected error occurred during the update.',
      });
    } finally {
      setIsImportingFile(false);
    }
  };


 const handleFullUpdateAndRecalculate = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }

    setIsUpdating(true);
    toast({ title: 'Starting Full Recalculation...', description: 'This will recalculate all league data based on the current scores in the database. This might take a minute.' });

    try {
      await recalculateAllDataClientSide(firestore, (message) => {
        toast({ title: 'Recalculation Progress', description: message });
      });
      
      toast({
          title: 'Full Data Recalculation Complete!',
          description: 'All application data has been successfully updated.',
      });
      await fetchAllMatches();

    } catch (error: any) {
        console.error('Error during full update process:', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred during the update.',
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleImportPastFixtures = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
        return;
    }
    setIsImportingFixtures(true);
    toast({ title: 'Importing Past Fixtures...', description: 'This will delete all existing matches and import from the backup file.' });
    try {
        const matchesCollection = collection(firestore, 'matches');
        const batch = writeBatch(firestore);

        const snapshot = await getDocs(matchesCollection);
        const deletedCount = snapshot.size;
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        const importedCount = pastFixtures.length;
        pastFixtures.forEach(fixture => {
            const { id, ...fixtureData } = fixture;
            if (!id) return;
            const docRef = doc(matchesCollection, id);
            batch.set(docRef, fixtureData);
        });

        await batch.commit();
        
        toast({ title: 'Success!', description: `Deleted ${deletedCount}, imported ${importedCount} fixtures.` });
        await fetchAllMatches();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Fixture Import Failed', description: error.message });
    } finally {
        setIsImportingFixtures(false);
    }
  };

  const handleImportPreviousStandings = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
        return;
    }
    setIsImportingStandings(true);
    toast({ title: 'Importing Previous Standings...', description: 'This will clear and repopulate the 24-25 season standings.' });
    try {
        const standingsCollection = collection(firestore, 'previousSeasonStandings');
        const teamsCollection = collection(firestore, 'teams');

        const batch = writeBatch(firestore);

        const teamsSnap = await getDocs(teamsCollection);
        const allCurrentTeams = teamsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
        const teamNameToIdMap = new Map(allCurrentTeams.map(t => [t.name, t.id]));

        const nameMapping: { [key: string]: string } = {
          "Man City": "Manchester City",
          "Notts Forest": "Nottingham Forest",
          "Man United": "Manchester United"
        };
        const standingsTeamNames = new Set(previousSeasonData.map(s => nameMapping[s.name] || s.name));
        
        const promotedTeams = allCurrentTeams
            .filter(t => !standingsTeamNames.has(t.name))
            .sort((a, b) => a.name.localeCompare(b.name));

        const snapshot = await getDocs(standingsCollection);
        const deletedCount = snapshot.size;
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        let importedCount = 0;

        previousSeasonData.forEach(standing => {
            const teamName = nameMapping[standing.name] || standing.name;
            const teamId = teamNameToIdMap.get(teamName);
            if (teamId) {
                const docRef = doc(standingsCollection, teamId);
                batch.set(docRef, {
                    teamId: teamId,
                    rank: standing.rank,
                    points: standing.points,
                    goalDifference: standing.goalDifference
                });
                importedCount++;
            }
        });
        
        promotedTeams.forEach((team, index) => {
            const docRef = doc(standingsCollection, team.id);
            batch.set(docRef, {
                teamId: team.id,
                rank: 18 + index,
                points: 0,
                goalDifference: 0
            });
            importedCount++;
        });

        await batch.commit();

        toast({ title: 'Success!', description: `Deleted ${deletedCount}, imported ${importedCount} standings.` });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Standings Import Failed', description: error.message });
    } finally {
        setIsImportingStandings(false);
    }
  }

  const onHistoricalSubmit = async (data: HistoricalDataFormValues) => {
    if (!firestore) return;
    setIsUpdatingHistoricalData(true);
    toast({ title: 'Updating historical data...' });
    try {
        const batch = writeBatch(firestore);
        data.users.forEach(user => {
            const userRef = doc(firestore, 'users', user.id);
            batch.update(userRef, {
                seasonsPlayed: user.seasonsPlayed,
                first: user.first,
                second: user.second,
                third: user.third,
                fourth: user.fourth,
                fifth: user.fifth,
                sixth: user.sixth,
                seventh: user.seventh,
                eighth: user.eighth,
                ninth: user.ninth,
                tenth: user.tenth,
                mimoM: user.mimoM,
                ruMimoM: user.ruMimoM,
                joMimoM: user.joMimoM,
                joRuMimoM: user.joRuMimoM,
                cashWinnings: user.cashWinnings,
            });
        });
        await batch.commit();
        toast({ title: 'Success!', description: 'Historical data updated for all players.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setIsUpdatingHistoricalData(false);
    }
  };


  const weekOptions = Array.from({ length: 38 }, (_, i) => i + 1);

  const historicalDataHeaders = [
    { key: 'seasonsPlayed', label: 'S', tooltip: 'Seasons Played' },
    { key: 'first', label: '1', tooltip: '1st Place Finishes' },
    { key: 'second', label: '2', tooltip: '2nd Place Finishes' },
    { key: 'third', label: '3', tooltip: '3rd Place Finishes' },
    { key: 'fourth', label: '4', tooltip: '4th Place Finishes' },
    { key: 'fifth', label: '5', tooltip: '5th Place Finishes' },
    { key: 'sixth', label: '6', tooltip: '6th Place Finishes' },
    { key: 'seventh', label: '7', tooltip: '7th Place Finishes' },
    { key: 'eighth', label: '8', tooltip: '8th Place Finishes' },
    { key: 'ninth', label: '9', tooltip: '9th Place Finishes' },
    { key: 'tenth', label: '10', tooltip: '10th Place Finishes' },
    { key: 'mimoM', label: 'M', tooltip: 'MiMoM Wins' },
    { key: 'ruMimoM', label: 'R', tooltip: 'RuMiMoM Wins' },
    { key: 'joMimoM', label: 'J', tooltip: 'JoMiMoM Wins' },
    { key: 'joRuMimoM', label: 'JR', tooltip: 'JoRuMiMoM Wins' },
    { key: 'cashWinnings', label: '£', tooltip: 'Total Cash Winnings' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Step 1 & 2: Enter & Write Results</CardTitle>
                <CardDescription>
                    Select a week, enter the scores, then create a temporary results file and write it to the database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={scoresForm.handleSubmit(onWriteResultsFileSubmit)} className="space-y-4">
                  <Controller
                    control={scoresForm.control}
                    name="week"
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a week" />
                        </SelectTrigger>
                        <SelectContent>
                          {weekOptions.map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <div className="space-y-2 pr-2">
                    {weekFixtures.map((fixture, index) => {
                       if (!fixture) return null;
                       const homeTeam = teamsMap.get(fixture.homeTeamId);
                       const awayTeam = teamsMap.get(fixture.awayTeamId);

                      return (
                        <div key={fixture.id} className="grid grid-cols-[1fr_auto_10px_auto_1fr] items-center gap-2">
                            <span className="text-right font-medium">{homeTeam?.name || fixture.homeTeamId}</span>
                            <Controller
                                control={scoresForm.control}
                                name={`results.${index}.homeScore`}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        className="w-20 text-center h-8"
                                        value={displayScore(field.value)}
                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                    />
                                )}
                            />
                            <span className="text-center font-bold">-</span>
                             <Controller
                                control={scoresForm.control}
                                name={`results.${index}.awayScore`}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        className="w-20 text-center h-8"
                                        value={displayScore(field.value)}
                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                    />
                                )}
                            />
                            <span className="font-medium">{awayTeam?.name || fixture.awayTeamId}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex items-center gap-4'>
                    <Button type="submit" disabled={isWritingFile}>
                        {isWritingFile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        1. Create Week {selectedWeek} Results File
                    </Button>
                     <Button type="button" onClick={handleImportResultsFile} disabled={isImportingFile || !latestFileContent}>
                        {isImportingFile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        2. Write Week {selectedWeek} Results to DB
                    </Button>
                  </div>
                </form>
            </CardContent>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Step 3: Master Data Control</CardTitle>
                    <CardDescription>
                        After writing new results to the database, run this to recalculate all scores and standings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg" className="text-lg" disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            3. Update & Recalculate All Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will recalculate standings, scores, and histories based on the current data in the database. This is a long-running operation.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFullUpdateAndRecalculate}>Yes, Run Full Recalculation</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Definitive Data Imports</CardTitle>
                    <CardDescription>
                        Use these actions to reset collections from their JSON backup files.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="outline" disabled={isImportingFixtures}>
                                {isImportingFixtures ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.database className="mr-2 h-4 w-4" />}
                                Import Definitive Past Fixtures
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete all matches in the database and re-import them from `past-fixtures.json`.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleImportPastFixtures}>Yes, Import Fixtures</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="outline" disabled={isImportingStandings}>
                                {isImportingStandings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.database className="mr-2 h-4 w-4" />}
                                Import Previous Season Standings
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                               This will clear and repopulate the previous season standings. This is the foundation for the Week 0 user scores.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleImportPreviousStandings}>Yes, Import Standings</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
      <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Historical Player Data</CardTitle>
            <CardDescription>Manage players' historical achievements and trophy cabinet. Scroll right for more stats.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={historicalForm.handleSubmit(onHistoricalSubmit)} className="space-y-4">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[2fr_repeat(17,1fr)] gap-1 pb-2 min-w-[1000px]">
                  <span className="font-medium text-muted-foreground text-sm sticky left-0 bg-card pr-2">Player</span>
                  <TooltipProvider>
                    {historicalDataHeaders.map(header => (
                      <Tooltip key={header.key}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto font-medium text-muted-foreground text-xs">{header.label}</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{header.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
                <div className="space-y-1 min-w-[1000px]">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[2fr_repeat(17,1fr)] gap-1 items-center hover:bg-muted/50 rounded-md">
                      <span className="font-medium text-sm truncate sticky left-0 bg-card pr-2 py-1">{field.name}</span>
                       {historicalDataHeaders.map(header => (
                          <Controller
                              key={`${field.id}-${header.key}`}
                              control={historicalForm.control}
                              name={`users.${index}.${header.key as any}`}
                              render={({ field }) => (
                                  <Input
                                      {...field}
                                      type="number"
                                      className="w-full text-center h-8 text-xs px-1"
                                      onChange={e => field.onChange(e.target.valueAsNumber)}
                                  />
                              )}
                          />
                       ))}
                  </div>
                ))}
                </div>
              </div>
              <Button type="submit" disabled={isUpdatingHistoricalData} className="mt-4">
                {isUpdatingHistoricalData ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Save Historical Data
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
