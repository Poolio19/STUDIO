'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, ShieldAlert, Trash2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { collection, doc, writeBatch, getDocs, query, deleteDoc } from 'firebase/firestore';
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

import type { Match, Team, WeekResults } from '@/lib/types';
import { recalculateAllDataClientSide } from '@/lib/recalculate';

import { useForm, Controller } from 'react-hook-form';
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

import historicalPlayersData from '@/lib/historical-players.json';
import { bulkCreateAuthUsersChunk } from './actions';

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

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isWritingFile, setIsWritingFile] = React.useState(false);
  const [isImportingFile, setIsImportingFile] = React.useState(false);
  const [isImportingUsers, setIsImportingUsers] = React.useState(false);
  const [initialWeekSet, setInitialWeekSet] = React.useState(false);

  const [latestFileContent, setLatestFileContent] = React.useState<string | null>(null);

  const [allMatches, setAllMatches] = React.useState<Match[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());

  // --- Security Redirect ---
  React.useEffect(() => {
    if (!isUserLoading && (!user || user.email !== 'jim.poole@prempred.com')) {
      router.replace('/leaderboard');
    }
  }, [user, isUserLoading, router]);

  const fetchAllMatches = React.useCallback(async () => {
    if (!firestore) return;
    const matchesSnap = await getDocs(query(collection(firestore, 'matches')));
    const matches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    setAllMatches(matches);
  }, [firestore]);
  
  React.useEffect(() => {
    async function fetchAllData() {
      if (!firestore || !user || user.email !== 'jim.poole@prempred.com') return;
      const teamsSnap = await getDocs(query(collection(firestore, 'teams')));
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeamsMap(new Map(teams.map(t => [t.id, t])));
      
      fetchAllMatches();
    }
    fetchAllData();
  }, [firestore, fetchAllMatches, user]);

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

  const handleImportAuthUsers = async () => {
    if (!firestore) return;
    setIsImportingUsers(true);
    toast({ title: 'Starting Strict Identity Sync...', description: 'Syncing IDs and cleaning up duplicates.' });
    
    try {
        // Phase 1: Cleanup Forked Profiles
        toast({ title: 'Phase 1: Cleaning up duplicates...' });
        const allUsersSnap = await getDocs(collection(firestore, 'users'));
        const historicalEmails = new Set(historicalPlayersData.map(p => p.email.toLowerCase()));
        const canonicalIds = new Set(historicalPlayersData.map(p => p.id));
        
        let deletedCount = 0;
        for (const userDoc of allUsersSnap.docs) {
            const data = userDoc.data();
            const email = data.email?.toLowerCase();
            // If this doc ID is not canonical but matches a historical email, delete the duplicate fork
            if (!canonicalIds.has(userDoc.id) && historicalEmails.has(email)) {
                await deleteDoc(userDoc.ref);
                deletedCount++;
            }
        }
        if (deletedCount > 0) toast({ title: `Removed ${deletedCount} duplicate profiles.` });

        // Phase 2: Sync Authentication in chunks
        const authChunks = [];
        const authChunkSize = 50;
        for (let i = 0; i < historicalPlayersData.length; i += authChunkSize) {
            authChunks.push(historicalPlayersData.slice(i, i + authChunkSize));
        }

        let totalCreated = 0;
        let totalUpdated = 0;
        let chunkIndex = 1;

        for (const chunk of authChunks) {
            toast({ title: `Syncing Auth Chunk ${chunkIndex}/${authChunks.length}` });
            const result = await bulkCreateAuthUsersChunk(chunk);
            totalCreated += result.createdCount;
            totalUpdated += result.updatedCount;
            chunkIndex++;
        }
        
        // Phase 3: Restore Stats to canonical documents
        const dbChunks = [];
        const dbChunkSize = 100;
        for (let i = 0; i < historicalPlayersData.length; i += dbChunkSize) {
            dbChunks.push(historicalPlayersData.slice(i, i + dbChunkSize));
        }

        chunkIndex = 1;
        for (const chunk of dbChunks) {
            toast({ title: `Restoring Stats Chunk ${chunkIndex}/${dbChunks.length}` });
            const batch = writeBatch(firestore);
            chunk.forEach(player => {
                const userRef = doc(firestore, 'users', player.id);
                const { id, email, ...stats } = player;
                batch.set(userRef, { 
                    ...stats, 
                    email: email?.toLowerCase(),
                    mustChangePassword: true 
                }, { merge: true });
            });
            await batch.commit();
            chunkIndex++;
        }

        toast({
            title: 'Strict Identity Sync Complete!',
            description: `Auth: ${totalCreated} new, ${totalUpdated} fixed. Historical stats restored.`,
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
    } finally {
        setIsImportingUsers(false);
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

  if (isUserLoading || !user || user.email !== 'jim.poole@prempred.com') {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                          <AlertDialogHeader><AlertDialogTitle>Strict Identity Sync</AlertDialogTitle><AlertDialogDescription>Resets passwords to `Password`, forces canonical UIDs (usr_XXX), and cleans up duplicate profile documents in Firestore.</AlertDialogDescription></AlertDialogHeader>
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
          <CardHeader><CardTitle>Historical Stats (Backup Reference)</CardTitle></CardHeader>
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
                {historicalPlayersData.map((player) => (
                  <div key={player.id} className="grid grid-cols-[2fr_repeat(17,1fr)] gap-1 items-center hover:bg-muted/50 rounded-md">
                      <span className="font-medium text-sm truncate sticky left-0 bg-card py-1">{player.name}</span>
                       {historicalDataHeaders.map(header => (
                          <div key={header.key} className="w-full text-center h-8 text-xs px-1 flex items-center justify-center border rounded bg-muted/20">
                            {(player as any)[header.key] ?? 0}
                          </div>
                       ))}
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
    </div>
  );
}
