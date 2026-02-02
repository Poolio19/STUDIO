
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
import { Loader2, Users, AlertCircle } from 'lucide-react';
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
import { bulkCreateAuthUsers } from './actions';

const scoreTransformer = (val: 'P' | 'p' | number | string | null | undefined) => {
    if (val === undefined || val === null || val === '') return -1;
    if (typeof val === 'string' && val.toLowerCase() === 'p') return -2;
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
    xmasNo1: z.coerce.number().int().min(0),
    cashWinnings: z.coerce.number().min(0),
    phoneNumber: z.string().optional(),
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
  const [isImportingUsers, setIsImportingUsers] = React.useState(false);
  const [initialWeekSet, setInitialWeekSet] = React.useState(false);

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
    if (!allMatches || allMatches.length === 0) return 1;
    const matchesByWeek: Record<number, Match[]> = {};
    for (const match of allMatches) {
        if (!matchesByWeek[match.week]) matchesByWeek[match.week] = [];
        matchesByWeek[match.week].push(match);
    }
    for (let i = 1; i <= 38; i++) {
        const weekMatches = matchesByWeek[i];
        if (weekMatches && weekMatches.length > 0) {
            const isComplete = weekMatches.every(m => m.homeScore >= 0);
            if (!isComplete) return i;
        }
    }
    const latestDefinedWeek = Math.max(...Object.keys(matchesByWeek).map(Number));
    return (latestDefinedWeek > 0 && latestDefinedWeek < 38) ? latestDefinedWeek + 1 : (latestDefinedWeek > 0 ? latestDefinedWeek : 1);
  }, [allMatches]);
  
  const scoresForm = useForm<ScoresFormValues>({
    resolver: zodResolver(scoresFormSchema),
    defaultValues: { week: 1, results: [] },
  });

  const historicalForm = useForm<HistoricalDataFormValues>({
    resolver: zodResolver(historicalDataFormSchema),
    defaultValues: {
      users: historicalPlayersData.map(u => ({
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
        xmasNo1: u.xmasNo1 || 0,
        cashWinnings: u.cashWinnings || 0,
        phoneNumber: u.phoneNumber || ''
      })),
    },
  });
  
  const { fields } = useFieldArray({ control: historicalForm.control, name: "users" });

  React.useEffect(() => {
    if (defaultWeek > 0 && !initialWeekSet && allMatches.length > 0) {
      scoresForm.setValue('week', defaultWeek, { shouldDirty: false });
      setInitialWeekSet(true);
    }
  }, [defaultWeek, scoresForm, initialWeekSet, allMatches]);

  const selectedWeek = scoresForm.watch('week');
  const weekFixtures = React.useMemo(() => {
    return allMatches
      .filter(fixture => fixture.week === selectedWeek)
      .sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  }, [selectedWeek, allMatches]);

  React.useEffect(() => {
    if (!initialWeekSet) return;
    const results = weekFixtures.map(fixture => ({
      id: fixture.id,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
    }));
    scoresForm.reset({ week: selectedWeek, results: results });
  }, [selectedWeek, weekFixtures, scoresForm, initialWeekSet]);

  const onWriteResultsFileSubmit = (data: ScoresFormValues) => {
    setIsWritingFile(true);
    setLatestFileContent(null);
    const validResults = data.results.filter(r => (r.homeScore >= 0 && r.awayScore >= 0) || (r.homeScore === -2 && r.awayScore === -2));
    try {
      const weekResultsData = {
        week: data.week,
        results: validResults.map(r => ({ id: r.id, homeScore: r.homeScore, awayScore: r.awayScore })),
      };
      setLatestFileContent(JSON.stringify(weekResultsData, null, 2));
      toast({ title: 'Content Created!', description: `Results content for ${validResults.length} matches is ready.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Content Creation Failed', description: error.message });
    } finally {
      setIsWritingFile(false);
    }
  };

  const handleImportResultsFile = async () => {
    if (!firestore || !latestFileContent) return;
    setIsImportingFile(true);
    try {
      const weekData: WeekResults = JSON.parse(latestFileContent);
      const batch = writeBatch(firestore);
      const scoredResults = weekData.results.filter(r => (r.homeScore >= 0 && r.awayScore >= 0) || (r.homeScore === -2 && r.awayScore === -2));
      for (const result of scoredResults) {
        if (!result.id) continue;
        batch.update(doc(firestore, 'matches', result.id), { homeScore: result.homeScore, awayScore: result.awayScore });
      }
      await batch.commit();
      await fetchAllMatches();
      toast({ title: 'Import Complete!', description: `Updated ${scoredResults.length} matches.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Database Update Failed', description: error.message });
    } finally {
      setIsImportingFile(false);
    }
  };

 const handleFullUpdateAndRecalculate = async () => {
    if (!firestore) return;
    setIsUpdating(true);
    try {
      await recalculateAllDataClientSide(firestore, (message) => {
        toast({ title: 'Recalculation Progress', description: message });
      });
      toast({ title: 'Success!', description: 'All data has been successfully updated.' });
      await fetchAllMatches();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleImportPastFixtures = async () => {
    if (!firestore) return;
    setIsImportingFixtures(true);
    try {
        const matchesCollection = collection(firestore, 'matches');
        const batch = writeBatch(firestore);
        const snapshot = await getDocs(matchesCollection);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        pastFixtures.forEach(fixture => {
            const { id, ...fixtureData } = fixture;
            if (!id) return;
            batch.set(doc(matchesCollection, id), fixtureData);
        });
        await batch.commit();
        toast({ title: 'Success!', description: `Imported ${pastFixtures.length} fixtures.` });
        await fetchAllMatches();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Fixture Import Failed', description: error.message });
    } finally {
        setIsImportingFixtures(false);
    }
  };

  const handleImportPreviousStandings = async () => {
    if (!firestore) return;
    setIsImportingStandings(true);
    try {
        const standingsCollection = collection(firestore, 'previousSeasonStandings');
        const teamsCollection = collection(firestore, 'teams');
        const batch = writeBatch(firestore);
        const teamsSnap = await getDocs(teamsCollection);
        const teamNameToIdMap = new Map(teamsSnap.docs.map(doc => [doc.data().name as string, doc.id]));
        const nameMapping: { [key: string]: string } = { "Man City": "Manchester City", "Notts Forest": "Nottingham Forest", "Man United": "Manchester United" };
        const snapshot = await getDocs(standingsCollection);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        previousSeasonData.forEach(standing => {
            const teamName = nameMapping[standing.name] || standing.name;
            const teamId = teamNameToIdMap.get(teamName);
            if (teamId) {
                batch.set(doc(standingsCollection, teamId), { teamId, rank: standing.rank, points: standing.points, goalDifference: standing.goalDifference });
            }
        });
        await batch.commit();
        toast({ title: 'Success!', description: `Standings updated.` });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Standings Import Failed', description: error.message });
    } finally {
        setIsImportingStandings(false);
    }
  }

  const handleImportAuthUsers = async () => {
    if (!firestore) return;
    setIsImportingUsers(true);
    toast({ title: 'Starting Auth & Firestore Sync...', description: 'Resetting passwords and forcing canonical UIDs.' });
    try {
        // 1. Sync Authentication (this enforces canonical UIDs like usr_009)
        const result = await bulkCreateAuthUsers();
        
        // 2. Restore ALL historical stats to Firestore in chunks.
        // This ensures the Trophy Cabinet is populated for all players.
        const chunks = [];
        const chunkSize = 400;
        for (let i = 0; i < historicalPlayersData.length; i += chunkSize) {
            chunks.push(historicalPlayersData.slice(i, i + chunkSize));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(firestore);
            chunk.forEach(player => {
                const userRef = doc(firestore, 'users', player.id);
                // Ensure email used for login is correct, set the mustChangePassword flag,
                // and push all historical achievements from the backup JSON.
                const { id, email, ...stats } = player;
                batch.set(userRef, { 
                    ...stats, 
                    email: email?.toLowerCase(),
                    mustChangePassword: true 
                }, { merge: true });
            });
            await batch.commit();
        }

        toast({
            title: 'Bulk Sync Complete!',
            description: `Auth: Created ${result.createdCount}, Updated ${result.updatedCount}. Firestore stats restored.`,
            variant: result.errors.length > 0 ? 'destructive' : 'default',
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Bulk Sync Failed', description: error.message });
    } finally {
        setIsImportingUsers(false);
    }
  };

  const onHistoricalSubmit = async (data: HistoricalDataFormValues) => {
    if (!firestore) return;
    setIsUpdatingHistoricalData(true);
    try {
        const batch = writeBatch(firestore);
        data.users.forEach(user => {
            const { id, name, ...userData } = user;
            batch.set(doc(firestore, 'users', user.id), userData, { merge: true });
        });
        await batch.commit();
        toast({ title: 'Success!', description: 'Historical data saved.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setIsUpdatingHistoricalData(false);
    }
  };

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
    { key: 'joMimoM', label: 'JM', tooltip: 'JoMiMoM Wins' },
    { key: 'joRuMimoM', label: 'JR', tooltip: 'JoRuMiMoM Wins' },
    { key: 'xmasNo1', label: 'Xmas', tooltip: 'Christmas No. 1 Wins' },
    { key: 'cashWinnings', label: '£', tooltip: 'Total Cash Winnings' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Step 1 &amp; 2: Enter &amp; Write Results</CardTitle>
                <CardDescription>Select a week, enter scores, then save to DB.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={scoresForm.handleSubmit(onWriteResultsFileSubmit)} className="space-y-4">
                  <Controller
                    control={scoresForm.control}
                    name="week"
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={String(field.value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 38 }, (_, i) => i + 1).map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="space-y-2">
                    {weekFixtures.map((fixture, index) => {
                       const homeTeam = teamsMap.get(fixture.homeTeamId);
                       const awayTeam = teamsMap.get(fixture.awayTeamId);
                      return (
                        <div key={fixture.id} className="grid grid-cols-[1fr_auto_10px_auto_1fr] items-center gap-2">
                            <span className="text-right font-medium">{homeTeam?.name || fixture.homeTeamId}</span>
                            <Controller
                                control={scoresForm.control}
                                name={`results.${index}.homeScore`}
                                render={({ field }) => (
                                    <Input {...field} type="text" className="w-20 text-center h-8" value={displayScore(field.value)} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                                )}
                            />
                            <span className="text-center font-bold">-</span>
                             <Controller
                                control={scoresForm.control}
                                name={`results.${index}.awayScore`}
                                render={({ field }) => (
                                    <Input {...field} type="text" className="w-20 text-center h-8" value={displayScore(field.value)} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                                )}
                            />
                            <span className="font-medium">{awayTeam?.name || fixture.awayTeamId}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex items-center gap-4'>
                    <Button type="submit" disabled={isWritingFile}>{isWritingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 1. Prepare Week {selectedWeek}</Button>
                    <Button type="button" onClick={handleImportResultsFile} disabled={isImportingFile || !latestFileContent}>{isImportingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 2. Write to DB</Button>
                  </div>
                </form>
            </CardContent>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Step 3: Recalculate</CardTitle></CardHeader>
                <CardContent>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg" className="w-full" disabled={isUpdating}>{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 3. Run Recalculation</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Confirm Master Recalculation</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFullUpdateAndRecalculate}>Recalculate Now</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Identity & Security</CardTitle></CardHeader>
              <CardContent>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full" disabled={isImportingUsers}>{isImportingUsers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />} Bulk Sync & Force Reset</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Strict Identity Sync</AlertDialogTitle><AlertDialogDescription>This resets passwords to `Password` and forces accounts to use canonical UIDs (usr_XXX). It will also restore all Trophy Cabinet data for existing players.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleImportAuthUsers}>Sync & Reset Now</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </CardContent>
            </Card>
        </div>
      </div>
      <Card>
          <CardHeader><CardTitle>Historical Stats</CardTitle></CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[2fr_repeat(17,1fr)] gap-1 pb-2 min-w-[1000px]">
                  <span className="font-medium text-muted-foreground text-sm sticky left-0 bg-card">Player</span>
                  <TooltipProvider>
                    {historicalDataHeaders.map(header => (
                      <Tooltip key={header.key}><TooltipTrigger asChild><Button variant="ghost" size="sm" className="p-1 h-auto font-medium text-xs">{header.label}</Button></TooltipTrigger><TooltipContent><p>{header.tooltip}</p></TooltipContent></Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[2fr_repeat(17,1fr)] gap-1 items-center hover:bg-muted/50 rounded-md">
                      <span className="font-medium text-sm truncate sticky left-0 bg-card py-1">{field.name}</span>
                       {historicalDataHeaders.map(header => (
                          <Controller key={`${field.id}-${header.key}`} control={historicalForm.control} name={`users.${index}.${header.key as any}`} render={({ field }) => (
                                  <Input {...field} type="number" className="w-full text-center h-8 text-xs px-1" onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} value={field.value ?? 0} />
                              )}
                          />
                       ))}
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
    </div>
  );
}
