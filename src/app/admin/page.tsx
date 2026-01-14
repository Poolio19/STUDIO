
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
import { useFirestore, useMemoFirebase } from '@/firebase';

import { collection, doc, getDoc, writeBatch, getDocs, query } from 'firebase/firestore';
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

import type { Match, Team, Prediction, User as UserProfile, UserHistory, CurrentStanding, WeekResults } from '@/lib/types';
import { importPastFixtures } from '@/ai/flows/import-past-fixtures-flow';
import { createResultsFile } from '@/ai/flows/create-results-file-flow';
import { importResultsFile } from '@/ai/flows/import-results-file-flow';


import allFixtures from '@/lib/past-fixtures.json';
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
import { Separator } from '@/components/ui/separator';


const scoreSchema = z.union([z.literal('P'), z.literal('p'), z.coerce.number().int()]);
const scoreTransformer = (val: 'P' | 'p' | number | string) => {
    if (typeof val === 'string' && val.toLowerCase() === 'p') return -2; // Postponed is -2
    if (val === '' || val === null || val === undefined) return -1; // Not played is -1
    const num = Number(val);
    return isNaN(num) ? -1 : num;
}

const displayScore = (val: number | string) => {
    if (val === -1) return '';
    if (val === -2) return 'P';
    return val;
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
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isWritingFile, setIsWritingFile] = React.useState(false);
  const [isImportingFile, setIsImportingFile] = React.useState(false);
  const [latestFilePath, setLatestFilePath] = React.useState<string | null>(null);

  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  
  const lastPlayedWeek = React.useMemo(() => {
    const playedFixtures = allFixtures.filter(fixture => fixture.homeScore > -1 && fixture.awayScore > -1);
    if (playedFixtures.length === 0) return 0;
    return Math.max(...playedFixtures.map(fixture => fixture.week));
  }, []);
  
  const nextUnplayedWeek = lastPlayedWeek < 38 ? lastPlayedWeek + 1 : 38;

  const scoresForm = useForm<ScoresFormValues>({
    resolver: zodResolver(scoresFormSchema),
    defaultValues: {
      week: nextUnplayedWeek,
      results: [],
    },
  });

  const selectedWeek = scoresForm.watch('week');
  const weekFixtures = React.useMemo(() => allFixtures.filter(fixture => fixture.week === selectedWeek), [selectedWeek]);

  React.useEffect(() => {
    async function fetchTeams() {
      if (!firestore) return;
      const teamsSnap = await getDocs(query(collection(firestore, 'teams')));
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeamsMap(new Map(teams.map(t => [t.id, t])));
    }
    fetchTeams();
  }, [firestore]);
  
  React.useEffect(() => {
    const results = weekFixtures.map(fixture => ({
      id: fixture.id,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
    }));
    scoresForm.setValue('results', results);
  }, [selectedWeek, weekFixtures, scoresForm]);


  const onWriteResultsFileSubmit = async (data: ScoresFormValues) => {
    setIsWritingFile(true);
    setLatestFilePath(null);
    toast({ title: `Creating results file for Week ${data.week}...` });
    try {
      const result = await createResultsFile({
        week: data.week,
        results: data.results.map(r => ({ id: r.id, homeScore: r.homeScore, awayScore: r.awayScore })),
      });
  
      if (!result.success || !result.filePath) {
        throw new Error(result.message || 'Failed to create results file.');
      }
  
      setLatestFilePath(result.filePath);
      toast({
        title: 'File Created!',
        description: `Results file created at: ${result.filePath}`,
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
    if (!latestFilePath) {
      toast({ variant: 'destructive', title: 'Error', description: 'No results file has been created yet. Please complete Step 1.' });
      return;
    }
    setIsImportingFile(true);
    toast({ title: `Importing results from ${latestFilePath}...` });
    try {
      const result = await importResultsFile({ filePath: latestFilePath });
      if (!result.success) {
        throw new Error(result.message || 'Failed to import results file.');
      }
      toast({
        title: 'Import Complete!',
        description: `Updated ${result.updatedCount} matches for Week ${result.week}. You can now run the full recalculation.`,
      });

    } catch (error: any) {
      console.error('Error during file import:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'An unexpected error occurred during import.',
      });
    } finally {
      setIsImportingFile(false);
    }
  };


 const handleFullUpdateAndRecalculate = async () => {
    setIsUpdating(true);
    toast({ title: 'Starting Full Recalculation...', description: 'This will recalculate all league data based on the current scores in the database.' });

    try {
        await handleRecalculateAllData();
        
        toast({
            title: 'Full Data Recalculation Complete!',
            description: 'All application data has been successfully updated.',
        });

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


  const handleRecalculateAllData = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
        return;
    }
    
    try {
        toast({ title: 'Recalculation: Fetching all required data...' });

        const [
            teamsSnap, 
            matchesSnap, 
            usersSnap, 
            predictionsSnap, 
            userHistoriesSnap,
            standingsSnap,
            playerTeamScoresSnap,
            teamRecentResultsSnap,
            weeklyTeamStandingsSnap
        ] = await Promise.all([
            getDocs(query(collection(firestore, 'teams'))),
            getDocs(query(collection(firestore, 'matches'))),
            getDocs(query(collection(firestore, 'users'))),
            getDocs(query(collection(firestore, 'predictions'))),
            getDocs(query(collection(firestore, 'userHistories'))),
            getDocs(query(collection(firestore, 'standings'))),
            getDocs(query(collection(firestore, 'playerTeamScores'))),
            getDocs(query(collection(firestore, 'teamRecentResults'))),
            getDocs(query(collection(firestore, 'weeklyTeamStandings')))
        ]);

        const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        const teamMap = new Map(teams.map(t => [t.id, t]));
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const playedMatches = allMatches.filter(m => m.homeScore > -1 && m.awayScore > -1);
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
        const userHistoriesMap = new Map(userHistoriesSnap.docs.map(doc => [doc.id, doc.data() as UserHistory]));
        
        const batch = writeBatch(firestore);

        toast({ title: 'Recalculation: Clearing old calculated data...' });
        standingsSnap.forEach(doc => batch.delete(doc.ref));
        playerTeamScoresSnap.forEach(doc => batch.delete(doc.ref));
        teamRecentResultsSnap.forEach(doc => batch.delete(doc.ref));
        weeklyTeamStandingsSnap.forEach(doc => batch.delete(doc.ref));
        
        toast({ title: 'Recalculation: Calculating new league standings...' });
        const teamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
        
        teams.forEach(team => {
            teamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        });

        playedMatches.forEach(match => {
            const homeStats = teamStats[match.homeTeamId];
            const awayStats = teamStats[match.awayTeamId];
            homeStats.gamesPlayed++;
            awayStats.gamesPlayed++;
            homeStats.goalsFor += match.homeScore;
            awayStats.goalsFor += match.awayScore;
            homeStats.goalsAgainst += match.awayScore;
            awayStats.goalsAgainst += match.homeScore;
            if (match.homeScore > match.awayScore) {
                homeStats.points += 3;
                homeStats.wins++;
                awayStats.losses++;
            } else if (match.homeScore < match.awayScore) {
                awayStats.points += 3;
                awayStats.wins++;
                homeStats.losses++;
            } else {
                homeStats.points++;
                awayStats.points++;
                homeStats.draws++;
                awayStats.draws++;
            }
        });

        Object.keys(teamStats).forEach(teamId => {
            teamStats[teamId].goalDifference = teamStats[teamId].goalsFor - teamStats[teamId].goalsAgainst;
        });

        const newStandings: (Omit<CurrentStanding, 'rank'> & { teamName: string; teamId: string })[] = Object.entries(teamStats).map(([teamId, stats]) => ({
            teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown',
        }));
        
        newStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));

        const finalStandings: CurrentStanding[] = newStandings.map((s, index) => {
            const { teamName, ...rest } = s;
            return { ...rest, rank: index + 1 };
        });

        finalStandings.forEach(standing => {
            const standingRef = doc(firestore, 'standings', standing.teamId);
            batch.set(standingRef, standing);
        });

        toast({ title: 'Recalculation: Calculating user scores & updating profiles...' });
        const actualTeamRanks = new Map(finalStandings.map(s => [s.teamId, s.rank]));
        const userScores: { [userId: string]: number } = {};

        predictions.forEach(prediction => {
            if (!prediction.rankings) return;
            let totalScore = 0;
            prediction.rankings.forEach((teamId, index) => {
                const predictedRank = index + 1;
                const actualRank = actualTeamRanks.get(teamId);
                if (actualRank !== undefined && actualRank > 0) {
                    const score = 5 - Math.abs(predictedRank - actualRank);
                    totalScore += score;
                    batch.set(doc(firestore, 'playerTeamScores', `${prediction.userId}_${teamId}`), { userId: prediction.userId, teamId, score });
                }
            });
            userScores[prediction.userId] = totalScore;
        });
        
        const userUpdates = users.map(user => {
            const newScore = userScores[user.id] !== undefined ? userScores[user.id] : user.score;
            return { ...user, previousScore: user.score, previousRank: user.rank, score: newScore, scoreChange: newScore - (user.score || 0) };
        });

        userUpdates.sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
        
        const maxWeeksPlayedNow = playedMatches.length > 0 ? Math.max(0, ...playedMatches.map(m => m.week)) : 0;
        
        for (let i = 0; i < userUpdates.length; i++) {
            const user = userUpdates[i];
            const newRank = i + 1;
            user.rankChange = (user.previousRank || 0) > 0 ? (user.previousRank || newRank) - newRank : 0;
            user.rank = newRank;
            user.maxRank = Math.max(user.maxRank || 0, user.rank);
            user.minRank = Math.min(user.minRank || 99, user.rank);
            user.maxScore = Math.max(user.maxScore || -Infinity, user.score);
            user.minScore = Math.min(user.minScore || Infinity, user.score);
            const { id, ...userData } = user;
            batch.set(doc(firestore, 'users', user.id), userData, { merge: true });
            
            const historyData = userHistoriesMap.get(user.id) || { userId: user.id, weeklyScores: [] };
            const weekHistoryIndex = historyData.weeklyScores.findIndex(ws => ws.week === maxWeeksPlayedNow);
            if (weekHistoryIndex > -1) {
                historyData.weeklyScores[weekHistoryIndex] = { week: maxWeeksPlayedNow, score: user.score, rank: user.rank };
            } else if (maxWeeksPlayedNow > 0) {
                historyData.weeklyScores.push({ week: maxWeeksPlayedNow, score: user.score, rank: user.rank });
            }
            batch.set(doc(firestore, 'userHistories', user.id), historyData);
        }
        
        if (maxWeeksPlayedNow > 0) {
            finalStandings.forEach(standing => {
                batch.set(doc(firestore, 'weeklyTeamStandings', `${maxWeeksPlayedNow}-${standing.teamId}`), { week: maxWeeksPlayedNow, teamId: standing.teamId, rank: standing.rank });
            });
        }
        
        teams.forEach(team => {
            const teamMatches = playedMatches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id).sort((a,b) => b.week - a.week).slice(0, 6);
            const results = Array(6).fill('-') as ('W' | 'D' | 'L' | '-')[];
            teamMatches.reverse().forEach((match, i) => {
                if (i < 6) {
                    if (match.homeScore === match.awayScore) results[i] = 'D';
                    else if ((match.homeTeamId === team.id && match.homeScore > match.awayScore) || (match.awayTeamId === team.id && match.awayScore > match.homeScore)) results[i] = 'W';
                    else results[i] = 'L';
                }
            });
            batch.set(doc(firestore, 'teamRecentResults', team.id), { teamId: team.id, results: results.reverse() });
        });

        toast({ title: 'Recalculation: Committing all updates...' });
        await batch.commit();

    } catch (error: any) {
        console.error('Error during client-side data recalculation:', error);
        toast({
            variant: 'destructive',
            title: 'Recalculation Failed',
            description: error.message || 'An unexpected error occurred during recalculation.',
        });
        throw error; // Re-throw to be caught by the parent handler
    }
  };

  const weekOptions = Array.from({ length: 38 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Administration
        </h1>
        <p className="text-slate-400">
          Manage your application's data sources and imports.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
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

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
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
                                        className="w-20 text-center"
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
                                        className="w-20 text-center"
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
                     <Button type="button" onClick={handleImportResultsFile} disabled={isImportingFile || !latestFilePath}>
                        {isImportingFile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        2. Write Week {selectedWeek} Results to DB
                    </Button>
                  </div>
                </form>
            </CardContent>
        </Card>

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
      </div>
    </div>
  );
}

    