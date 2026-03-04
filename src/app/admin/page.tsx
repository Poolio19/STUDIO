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
import { Loader2, Users, Database, RefreshCw } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { collection, doc, writeBatch, getDocs, query, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
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

import type { Match, Team, User as UserProfile } from '@/lib/types';
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

const timeOptions = ["12:00", "12:30", "14:00", "14:15", "15:00", "16:00", "16:30", "17:30", "19:30", "20:00", "20:15"];

const scoresFormSchema = z.object({
  week: z.coerce.number().min(1).max(38),
  results: z.array(z.object({
    id: z.string(),
    homeScore: z.preprocess(scoreTransformer, z.number().int()),
    awayScore: z.preprocess(scoreTransformer, z.number().int()),
    playYear: z.string(),
    playMonth: z.string(),
    playDay: z.string(),
    playTime: z.string(),
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
  const [isSavingStats, setIsSavingStats] = React.useState<string | null>(null);

  const [latestFileContent, setLatestFileContent] = React.useState<string | null>(null);

  const [allMatches, setAllMatches] = React.useState<Match[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());

  const isAdmin = user?.email === 'jim.poole@prempred.com' || user?.email === 'jimpoolio@hotmail.com' || user?.uid === 'usr_009';

  React.useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace('/leaderboard');
    }
  }, [user, isUserLoading, router, isAdmin]);

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('name', 'asc')) : null, [firestore]);
  const { data: dbUsers } = useCollection<UserProfile>(usersQuery);

  const fetchAllMatches = React.useCallback(async () => {
    if (!firestore) return;
    const matchesSnap = await getDocs(query(collection(firestore, 'matches')));
    const matches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    setAllMatches(matches);
  }, [firestore]);
  
  React.useEffect(() => {
    async function fetchAllData() {
      if (!firestore || !user || !isAdmin) return;
      const teamsSnap = await getDocs(query(collection(firestore, 'teams')));
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeamsMap(new Map(teams.map(t => [t.id, t])));
      fetchAllMatches();
    }
    fetchAllData();
  }, [firestore, fetchAllMatches, user, isAdmin]);

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
            const isComplete = weekMatches.every(m => Number(m.homeScore) >= 0);
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
      .sort((a,b) => new Date(a.matchDatePlay || a.matchDateOrig).getTime() - new Date(b.matchDatePlay || b.matchDateOrig).getTime());
  }, [selectedWeek, allMatches]);

  React.useEffect(() => {
    if (!initialWeekSet) return;
    const results = weekFixtures.map(fixture => {
      // Prepopulate with MatchDateOrig as primary source for 'Actually Played' columns
      const dateToUse = new Date(fixture.matchDateOrig);
      return {
        id: fixture.id,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        playYear: String(dateToUse.getUTCFullYear()),
        playMonth: String(dateToUse.getUTCMonth() + 1).padStart(2, '0'),
        playDay: String(dateToUse.getUTCDate()).padStart(2, '0'),
        playTime: `${String(dateToUse.getUTCHours()).padStart(2, '0')}:${String(dateToUse.getUTCMinutes()).padStart(2, '0')}`,
      };
    });
    scoresForm.reset({ week: selectedWeek, results: results });
  }, [selectedWeek, weekFixtures, scoresForm, initialWeekSet]);

  const onWriteResultsFileSubmit = (data: ScoresFormValues) => {
    setIsWritingFile(true);
    setLatestFileContent(null);
    try {
      const weekResultsData = {
        week: data.week,
        results: data.results.map(r => ({ 
            id: r.id, 
            homeScore: Number(r.homeScore), 
            awayScore: Number(r.awayScore),
            matchDatePlay: `${r.playYear}-${r.playMonth}-${r.playDay}T${r.playTime}:00Z`
        })),
      };
      setLatestFileContent(JSON.stringify(weekResultsData, null, 2));
      toast({ title: 'Batch Ready!', description: `Content for ${data.results.length} matches is staged.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Preparation Failed', description: error.message });
    } finally {
      setIsWritingFile(false);
    }
  };

  const handleImportResultsFile = async () => {
    if (!firestore || !latestFileContent) return;
    setIsImportingFile(true);
    try {
      const weekData: any = JSON.parse(latestFileContent);
      const batch = writeBatch(firestore);
      for (const result of weekData.results) {
        if (!result.id) continue;
        batch.update(doc(firestore, 'matches', result.id), { 
            homeScore: Number(result.homeScore), 
            awayScore: Number(result.awayScore),
            matchDatePlay: result.matchDatePlay
        });
      }
      await batch.commit();
      await fetchAllMatches();
      toast({ title: 'Database Updated!', description: `Saved ${weekData.results.length} match records.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Write Failed', description: error.message });
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
    toast({ title: 'Starting Identity Sync...', description: 'Syncing IDs and historical stats.' });
    
    try {
        const allUsersSnap = await getDocs(collection(firestore, 'users'));
        const historicalEmails = new Set(historicalPlayersData.map(p => p.email.toLowerCase()));
        const historicalNames = new Set(historicalPlayersData.map(p => p.name));
        const canonicalIds = new Set(historicalPlayersData.map(p => p.id));
        
        let deletedCount = 0;
        for (const userDoc of allUsersSnap.docs) {
            const data = userDoc.data();
            const email = data.email?.toLowerCase();
            const name = data.name;
            if (!canonicalIds.has(userDoc.id) && (historicalEmails.has(email) || historicalNames.has(name))) {
                await deleteDoc(userDoc.ref);
                deletedCount++;
            }
        }
        if (deletedCount > 0) toast({ title: `Removed ${deletedCount} duplicates.` });

        const authChunks = [];
        const authChunkSize = 50;
        for (let i = 0; i < historicalPlayersData.length; i += authChunkSize) {
            authChunks.push(historicalPlayersData.slice(i, i + authChunkSize));
        }

        let totalCreated = 0;
        let totalUpdated = 0;

        for (const chunk of authChunks) {
            const result = await bulkCreateAuthUsersChunk(chunk);
            totalCreated += result.createdCount;
            totalUpdated += result.updatedCount;
        }
        
        const dbChunks = [];
        const dbChunkSize = 100;
        for (let i = 0; i < historicalPlayersData.length; i += dbChunkSize) {
            dbChunks.push(historicalPlayersData.slice(i, i + dbChunkSize));
        }

        for (const chunk of dbChunks) {
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
        }

        toast({
            title: 'Identity Sync Complete!',
            description: `Auth: ${totalCreated} new, ${totalUpdated} fixed. Historical stats restored.`,
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
    } finally {
        setIsImportingUsers(false);
    }
  };

  const updatePlayerStat = async (userId: string, key: string, value: string | number) => {
      if (!firestore) return;
      setIsSavingStats(userId);
      try {
          const userRef = doc(firestore, 'users', userId);
          await updateDoc(userRef, { [key]: value });
          toast({ title: 'Stat updated' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Update failed', description: e.message });
      } finally {
          setIsSavingStats(null);
      }
  }

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

  if (isUserLoading || !user || !isAdmin) {
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
                <CardTitle>Results &amp; Played Dates</CardTitle>
                <CardDescription>Select a week, enter scores and adjust Played Dates if rescheduled.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={scoresForm.handleSubmit(onWriteResultsFileSubmit)} className="space-y-6">
                  <Controller
                    control={scoresForm.control}
                    name="week"
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={String(field.value)}>
                        <SelectTrigger className="w-full lg:w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 38 }, (_, i) => i + 1).map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="space-y-2">
                    <div className="hidden lg:grid grid-cols-[1fr_auto_10px_auto_1fr_240px] items-center gap-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        <span className="text-right">Home</span>
                        <span className="w-12 text-center">Score</span>
                        <span />
                        <span className="w-12 text-center">Score</span>
                        <span className="text-left">Away</span>
                        <span className="text-center">Actually Played (Y/M/D/Time)</span>
                    </div>
                    {weekFixtures.map((fixture, index) => {
                       const homeTeam = teamsMap.get(fixture.homeTeamId);
                       const awayTeam = teamsMap.get(fixture.awayTeamId);
                      return (
                        <div key={fixture.id} className="p-3 border rounded-md bg-muted/5">
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_10px_auto_1fr_240px] items-center gap-4">
                                <div className="flex items-center justify-end gap-2 lg:gap-0 lg:block lg:text-right">
                                    <span className="lg:hidden text-[10px] uppercase font-bold text-muted-foreground mr-auto">Home:</span>
                                    <span className="font-medium text-sm">{homeTeam?.name || fixture.homeTeamId}</span>
                                </div>
                                
                                <Controller
                                    control={scoresForm.control}
                                    name={`results.${index}.homeScore`}
                                    render={({ field }) => (
                                        <Input {...field} type="text" className="w-12 text-center h-8" value={displayScore(field.value)} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                                    )}
                                />
                                <span className="text-center font-bold hidden lg:inline">-</span>
                                 <Controller
                                    control={scoresForm.control}
                                    name={`results.${index}.awayScore`}
                                    render={({ field }) => (
                                        <Input {...field} type="text" className="w-12 text-center h-8" value={displayScore(field.value)} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                                    )}
                                />
                                
                                <div className="flex items-center justify-start gap-2 lg:gap-0 lg:block lg:text-left">
                                    <span className="font-medium text-sm">{awayTeam?.name || fixture.awayTeamId}</span>
                                    <span className="lg:hidden text-[10px] uppercase font-bold text-muted-foreground ml-auto">Away:</span>
                                </div>

                                <div className="flex items-center gap-1.5 justify-center pt-2 lg:pt-0 border-t lg:border-t-0 border-muted">
                                    <Controller
                                        control={scoresForm.control}
                                        name={`results.${index}.playYear`}
                                        render={({ field }) => (
                                            <Input {...field} className="w-14 h-7 text-[11px] text-center px-1" placeholder="YYYY" />
                                        )}
                                    />
                                    <Controller
                                        control={scoresForm.control}
                                        name={`results.${index}.playMonth`}
                                        render={({ field }) => (
                                            <Input {...field} className="w-9 h-7 text-[11px] text-center px-1" placeholder="MM" />
                                        )}
                                    />
                                    <Controller
                                        control={scoresForm.control}
                                        name={`results.${index}.playDay`}
                                        render={({ field }) => (
                                            <Input {...field} className="w-9 h-7 text-[11px] text-center px-1" placeholder="DD" />
                                        )}
                                    />
                                    <Controller
                                        control={scoresForm.control}
                                        name={`results.${index}.playTime`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[70px] h-7 text-[11px] px-1.5"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map(t => <SelectItem key={t} value={t} className="text-[11px]">{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex items-center gap-4 pt-4 border-t'>
                    <Button type="submit" disabled={isWritingFile} className="flex-1 lg:flex-none">{isWritingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 1. Prepare Changes</Button>
                    <Button type="button" onClick={handleImportResultsFile} disabled={isImportingFile || !latestFileContent} className="flex-1 lg:flex-none">{isImportingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 2. Save to Database</Button>
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
                          <AlertDialogHeader><AlertDialogTitle>Strict Identity Sync</AlertDialogTitle><AlertDialogDescription>Resets passwords to `Password` and restores canonical UIDs.</AlertDialogDescription></AlertDialogHeader>
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
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="size-5" /> Live Career Stats (Editable)</CardTitle>
              <CardDescription>Manually adjust historical tallies stored in Firestore.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[200px_repeat(17,1fr)] gap-1 pb-2 min-w-[1200px]">
                  <span className="font-medium text-muted-foreground text-sm sticky left-0 bg-card">Player</span>
                  <TooltipProvider>
                    {historicalDataHeaders.map(header => (
                      <Tooltip key={header.key}><TooltipTrigger asChild><Button variant="ghost" size="sm" className="p-1 h-auto font-medium text-xs">{header.label}</Button></TooltipTrigger><TooltipContent><p>{header.tooltip}</p></TooltipContent></Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
                {dbUsers?.map((player) => (
                  <div key={player.id} className="grid grid-cols-[200px_repeat(17,1fr)] gap-1 items-center hover:bg-muted/50 rounded-md">
                      <span className="font-medium text-sm truncate sticky left-0 bg-card py-1 border-r pr-2">{player.name}</span>
                       {historicalDataHeaders.map(header => (
                          <div key={header.key} className="w-full text-center">
                            <Input 
                                type="text" 
                                className="h-8 text-xs px-1 text-center bg-muted/20"
                                defaultValue={(player as any)[header.key] ?? 0}
                                onBlur={(e) => {
                                    const val = header.key === 'cashWinnings' ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
                                    if (!isNaN(val)) updatePlayerStat(player.id, header.key, val);
                                }}
                            />
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
