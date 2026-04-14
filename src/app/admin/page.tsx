'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { Match, Team } from '@/lib/types';
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

const scoreTransformer = (val: any) => {
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
  const [lastResetWeek, setLastResetWeek] = React.useState<number | null>(null);
  const [latestFileContent, setLatestFileContent] = React.useState<string | null>(null);

  const [allMatches, setAllMatches] = React.useState<Match[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const hasSetDefaultWeek = React.useRef(false);

  const isAdmin = user?.email === 'jim.poole@prempred.com' || user?.email === 'jimpoolio@hotmail.com' || user?.uid === 'usr_009';

  const scoresForm = useForm<ScoresFormValues>({
    resolver: zodResolver(scoresFormSchema),
    defaultValues: { week: 1, results: [] },
  });

  React.useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace('/leaderboard');
    }
  }, [user, isUserLoading, router, isAdmin]);

  const fetchAllMatches = React.useCallback(async () => {
    if (!firestore) return;
    const matchesSnap = await getDocs(query(collection(firestore, 'matches')));
    const matches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    setAllMatches(matches);

    if (!hasSetDefaultWeek.current) {
        const played = matches.filter(m => Number(m.homeScore) !== -1);
        if (played.length > 0) {
            const maxW = Math.max(...played.map(m => Number(m.week)));
            scoresForm.setValue('week', maxW);
        } else {
            scoresForm.setValue('week', 1);
        }
        hasSetDefaultWeek.current = true;
    }
  }, [firestore, scoresForm]);
  
  React.useEffect(() => {
    if (!firestore || !user || !isAdmin) return;
    async function fetchAllData() {
      const teamsSnap = await getDocs(query(collection(firestore, 'teams')));
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeamsMap(new Map(teams.map(t => [t.id, t])));
      fetchAllMatches();
    }
    fetchAllData();
  }, [firestore, fetchAllMatches, user, isAdmin]);

  const selectedWeek = scoresForm.watch('week');
  const weekFixtures = React.useMemo(() => {
    return allMatches
      .filter(fixture => Number(fixture.week) === selectedWeek)
      .sort((a,b) => new Date(a.matchDateOrig || 0).getTime() - new Date(b.matchDateOrig || 0).getTime());
  }, [selectedWeek, allMatches]);

  React.useEffect(() => {
    if (weekFixtures.length === 0) return;
    
    // Forced reset when switching weeks to avoid sticky data
    if (lastResetWeek !== selectedWeek) {
        const results = weekFixtures.map(fixture => {
            const dateStr = fixture.matchDatePlay || fixture.matchDateOrig || new Date().toISOString();
            const d = new Date(dateStr);
            const hours = String(d.getUTCHours()).padStart(2, '0');
            const minutes = String(d.getUTCMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            return {
                id: fixture.id,
                homeScore: fixture.homeScore ?? -1,
                awayScore: fixture.awayScore ?? -1,
                playYear: String(d.getUTCFullYear()) || '',
                playMonth: String(d.getUTCMonth() + 1).padStart(2, '0') || '',
                playDay: String(d.getUTCDate()).padStart(2, '0') || '',
                playTime: timeOptions.includes(formattedTime) ? formattedTime : "15:00",
            };
        });
        scoresForm.reset({ week: selectedWeek, results: results });
        setLastResetWeek(selectedWeek);
    }
  }, [selectedWeek, weekFixtures, scoresForm, lastResetWeek]);

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
        batch.update(doc(firestore, 'matches', result.id), { 
            homeScore: Number(result.homeScore), 
            awayScore: Number(result.awayScore),
            matchDatePlay: result.matchDatePlay
        });
      }
      await batch.commit();
      await fetchAllMatches();
      toast({ title: 'Database Updated!' });
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
        toast({ title: 'Progress', description: message });
      });
      toast({ title: 'Success!', description: 'All tables have been updated.' });
      await fetchAllMatches();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setIsUpdating(false);
    }
  };

  if (isUserLoading || !user || !isAdmin) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="size-12 animate-spin text-muted-foreground" /></div>;
  }

  const currentResults = scoresForm.watch('results');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Admin Control Panel</CardTitle></CardHeader>
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
                    <div className="hidden lg:grid grid-cols-[1fr_auto_10px_auto_1fr_240px] items-center gap-4 px-4 text-[10px] font-black text-muted-foreground uppercase mb-2 border-b pb-2">
                        <span className="text-right">Home</span>
                        <span className="w-12 text-center">Score</span>
                        <span />
                        <span className="w-12 text-center">Score</span>
                        <span className="text-left">Away</span>
                        <span className="text-center">Actually Played (Y/M/D/Time)</span>
                    </div>
                    {currentResults?.length === weekFixtures.length && weekFixtures.map((fixture, index) => {
                       const homeTeam = teamsMap.get(fixture.homeTeamId);
                       const awayTeam = teamsMap.get(fixture.awayTeamId);
                      return (
                        <div key={fixture.id} className="p-3 border rounded-md bg-muted/5">
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_10px_auto_1fr_240px] items-center gap-4">
                                <div className="flex items-center justify-end gap-2 lg:gap-0 lg:block lg:text-right">
                                    <span className="font-bold text-sm">{homeTeam?.name || fixture.homeTeamId}</span>
                                </div>
                                <Controller 
                                    control={scoresForm.control} 
                                    name={`results.${index}.homeScore`} 
                                    render={({ field }) => (
                                        <Input 
                                            {...field} 
                                            type="text" 
                                            className="w-12 text-center h-8 font-black" 
                                            value={displayScore(field.value)} 
                                            onChange={e => field.onChange(e.target.value.toUpperCase())} 
                                        />
                                    )} 
                                />
                                <span className="text-center font-bold hidden lg:inline">-</span>
                                <Controller 
                                    control={scoresForm.control} 
                                    name={`results.${index}.awayScore`} 
                                    render={({ field }) => (
                                        <Input 
                                            {...field} 
                                            type="text" 
                                            className="w-12 text-center h-8 font-black" 
                                            value={displayScore(field.value)} 
                                            onChange={e => field.onChange(e.target.value.toUpperCase())} 
                                        />
                                    )} 
                                />
                                <div className="flex items-center justify-start gap-2 lg:gap-0 lg:block lg:text-left">
                                    <span className="font-bold text-sm">{awayTeam?.name || fixture.awayTeamId}</span>
                                </div>
                                <div className="flex items-center gap-1 justify-center pt-2 lg:pt-0">
                                    <Controller control={scoresForm.control} name={`results.${index}.playYear`} render={({ field }) => (<Input {...field} className="w-[54px] h-7 text-[11px] text-center px-1" value={field.value || ''} placeholder="YYYY" />)} />
                                    <Controller control={scoresForm.control} name={`results.${index}.playMonth`} render={({ field }) => (<Input {...field} className="w-[34px] h-7 text-[11px] text-center px-1" value={field.value || ''} placeholder="MM" />)} />
                                    <Controller control={scoresForm.control} name={`results.${index}.playDay`} render={({ field }) => (<Input {...field} className="w-[34px] h-7 text-[11px] text-center px-1" value={field.value || ''} placeholder="DD" />)} />
                                    <Controller control={scoresForm.control} name={`results.${index}.playTime`} render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || "15:00"}>
                                            <SelectTrigger className="w-[68px] h-7 text-[11px] px-1.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{timeOptions.map(t => <SelectItem key={t} value={t} className="text-[11px]">{t}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex items-center gap-4 pt-4 border-t'>
                    <Button type="submit" disabled={isWritingFile}>{isWritingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 1. Prepare Changes</Button>
                    <Button type="button" onClick={handleImportResultsFile} disabled={isImportingFile || !latestFileContent}>{isImportingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 2. Save to Database</Button>
                  </div>
                </form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Master Controls</CardTitle></CardHeader>
            <CardContent>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="w-full" disabled={isUpdating}>{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 3. Run Recalculation</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Run full overhaul?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFullUpdateAndRecalculate}>Recalculate Now</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}