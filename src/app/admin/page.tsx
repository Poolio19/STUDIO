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

import { collection, doc, writeBatch, getDocs, query } from 'firebase/firestore';
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
import { createResultsFile } from '@/ai/flows/create-results-file-flow';
import { updateScoresFromJson } from '@/ai/flows/update-scores-from-json-flow';

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


export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isWritingFile, setIsWritingFile] = React.useState(false);
  const [isImportingFile, setIsImportingFile] = React.useState(false);
  const [latestFilePath, setLatestFilePath] = React.useState<string | null>(null);
  const [latestFileContent, setLatestFileContent] = React.useState<string | null>(null);


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
    setLatestFileContent(null);
    toast({ title: `Creating results file for Week ${data.week}...` });
    try {
      const result = await createResultsFile({
        week: data.week,
        results: data.results.map(r => ({ id: r.id, homeScore: r.homeScore, awayScore: r.awayScore })),
      });
  
      if (!result.success || !result.filePath || !result.fileContent) {
        throw new Error(result.message || 'Failed to create results file.');
      }
  
      setLatestFilePath(result.filePath);
      setLatestFileContent(result.fileContent);

      toast({
        title: 'File Created!',
        description: `Results file created locally and is ready for import.`,
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
    toast({ title: `Writing Week ${selectedWeek} results to database...` });

    try {
      const weekData: WeekResults = JSON.parse(latestFileContent);
      const batch = writeBatch(firestore);
      let updatedCount = 0;

      for (const result of weekData.results) {
        if (!result.id) {
          console.warn('Skipping result with no ID:', result);
          continue;
        }

        const docRef = doc(firestore, 'matches', result.id);
        batch.update(docRef, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
        updatedCount++;
      }

      await batch.commit();

      toast({
        title: 'Import Complete!',
        description: `Updated ${updatedCount} matches for Week ${weekData.week}. You can now run the full recalculation.`,
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

        // --- 1. Fetch all necessary data from Firestore ---
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
        
        // --- 2. Create a clean "before" snapshot of user data for calculating season highs/lows ---
        const oldUsersDataMap = new Map(users.map(u => [u.id, {
            score: u.score || 0,
            rank: u.rank || 0,
            minScore: u.minScore,
            maxScore: u.maxScore,
            minRank: u.minRank,
            maxRank: u.maxRank,
        }]));


        const batch = writeBatch(firestore);

        // --- 3. Clear old calculated data that will be fully replaced ---
        toast({ title: 'Recalculation: Clearing old calculated data...' });
        standingsSnap.forEach(doc => batch.delete(doc.ref));
        playerTeamScoresSnap.forEach(doc => batch.delete(doc.ref));
        teamRecentResultsSnap.forEach(doc => batch.delete(doc.ref));
        weeklyTeamStandingsSnap.forEach(doc => batch.delete(doc.ref));
        
        // --- 4. Calculate new league standings ---
        toast({ title: 'Recalculation: Calculating new league standings...' });
        const finalTeamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
        teams.forEach(team => {
            finalTeamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        });

        playedMatches.forEach(match => {
            const homeStats = finalTeamStats[match.homeTeamId];
            const awayStats = finalTeamStats[match.awayTeamId];
            if (!homeStats || !awayStats) return;

            homeStats.gamesPlayed++;
            awayStats.gamesPlayed++;
            homeStats.goalsFor += match.homeScore;
            awayStats.goalsFor += match.awayScore;
            homeStats.goalsAgainst += match.awayScore;
            awayStats.goalsAgainst += match.homeScore;
            if (match.homeScore > match.awayScore) {
                homeStats.points += 3; homeStats.wins++; awayStats.losses++;
            } else if (match.homeScore < match.awayScore) {
                awayStats.points += 3; awayStats.wins++; homeStats.losses++;
            } else {
                homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++;
            }
        });

        Object.keys(finalTeamStats).forEach(teamId => {
            finalTeamStats[teamId].goalDifference = finalTeamStats[teamId].goalsFor - finalTeamStats[teamId].goalsAgainst;
        });

        const newStandings = Object.entries(finalTeamStats).map(([teamId, stats]) => ({
            teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown',
        }));
        
        newStandings.sort((a, b) => b.points - a.points || b.goalDifference - b.goalsFor || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));

        const finalStandings: CurrentStanding[] = newStandings.map((s, index) => {
            const { teamName, ...rest } = s;
            return { ...rest, rank: index + 1 };
        });

        finalStandings.forEach(standing => {
            const standingRef = doc(firestore, 'standings', standing.teamId);
            batch.set(standingRef, standing);
        });

        // --- 5. Calculate new user scores & prepare for ranking ---
        toast({ title: 'Recalculation: Calculating user scores...' });
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
        
        // --- 6. Rank users and calculate changes ---
        toast({ title: 'Recalculation: Updating user profiles and histories...' });
        
        const rankedUsers = users
          .map(user => ({
            ...user,
            newScore: userScores[user.id] ?? 0,
          }))
          .sort((a, b) => b.newScore - a.newScore || a.name.localeCompare(b.name));

        const maxWeeksPlayedNow = playedMatches.length > 0 ? Math.max(0, ...playedMatches.map(m => m.week)) : 0;
        
        for (let i = 0; i < rankedUsers.length; i++) {
            const userWithNewData = rankedUsers[i];
            const newRank = i + 1;
            
            const oldData = oldUsersDataMap.get(userWithNewData.id);
            
            const sourceHistory = userHistoriesMap.get(userWithNewData.id);
            const historyData = {
                userId: userWithNewData.id,
                weeklyScores: sourceHistory ? [...sourceHistory.weeklyScores] : [],
            };

            const recentHistoryBeforeNow = historyData.weeklyScores
                .filter(ws => ws.week < maxWeeksPlayedNow)
                .sort((a, b) => b.week - a.week);
            const previousWeekHistory = recentHistoryBeforeNow.length > 0 ? recentHistoryBeforeNow[0] : null;

            const previousScoreForChange = previousWeekHistory?.score ?? 0;
            const previousRankForChange = previousWeekHistory?.rank ?? 0;

            const scoreChange = userWithNewData.newScore - previousScoreForChange;
            const rankChange = previousRankForChange > 0 ? previousRankForChange - newRank : 0;
            
            // Robustly calculate new min/max score and rank
            let currentMinScore = oldData?.minScore ?? userWithNewData.newScore;
            let currentMaxScore = oldData?.maxScore ?? userWithNewData.newScore;
            let currentMinRank = (oldData?.minRank && oldData.minRank > 0) ? oldData.minRank : 999;
            let currentMaxRank = oldData?.maxRank ?? 0;

            const newMinScore = Math.min(currentMinScore, userWithNewData.newScore);
            const newMaxScore = Math.max(currentMaxScore, userWithNewData.newScore);
            const newMinRank = newRank > 0 ? Math.min(currentMinRank, newRank) : currentMinRank;
            const newMaxRank = newRank > 0 ? Math.max(currentMaxRank, newRank) : currentMaxRank;

            const finalUserData: Partial<UserProfile> = {
                score: userWithNewData.newScore,
                rank: newRank,
                previousScore: previousScoreForChange,
                previousRank: previousRankForChange,
                scoreChange: scoreChange,
                rankChange: rankChange,
                maxScore: newMaxScore,
                minScore: newMinScore,
                maxRank: newMaxRank,
                minRank: newMinRank,
            };
        
            batch.set(doc(firestore, 'users', userWithNewData.id), finalUserData, { merge: true });
        
            const weekHistoryIndex = historyData.weeklyScores.findIndex(ws => ws.week === maxWeeksPlayedNow);
            const newWeekEntry = { week: maxWeeksPlayedNow, score: userWithNewData.newScore, rank: newRank };
        
            if (weekHistoryIndex > -1) {
              historyData.weeklyScores[weekHistoryIndex] = newWeekEntry;
            } else if (maxWeeksPlayedNow > 0) {
              historyData.weeklyScores.push(newWeekEntry);
            }
        
            if (historyData.weeklyScores.length > 0) {
                historyData.weeklyScores.sort((a, b) => a.week - b.week);
                batch.set(doc(firestore, 'userHistories', userWithNewData.id), historyData);
            }
        }
        
        // --- 7. Generate weekly historical standings and recent results ---
        toast({ title: 'Recalculation: Generating weekly historical data...' });
        const playedWeeks = [...new Set(playedMatches.map(m => m.week))].sort((a, b) => a - b);

        for (const week of playedWeeks) {
            const matchesUpToWeek = allMatches.filter(m => m.week <= week && m.homeScore > -1 && m.awayScore > -1);
            const currentTeamStatsForWeek: { [teamId: string]: any } = {};
            teams.forEach(team => {
                currentTeamStatsForWeek[team.id] = { teamName: team.name, points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
            });

            matchesUpToWeek.forEach(match => {
                const homeStats = currentTeamStatsForWeek[match.homeTeamId];
                const awayStats = currentTeamStatsForWeek[match.awayTeamId];
                if (!homeStats || !awayStats) return;
                
                homeStats.gamesPlayed++;
                awayStats.gamesPlayed++;
                homeStats.goalsFor += match.homeScore;
                awayStats.goalsFor += match.awayScore;
                homeStats.goalsAgainst += match.awayScore;
                awayStats.goalsAgainst += match.homeScore;
                if (match.homeScore > match.awayScore) {
                    homeStats.points += 3; homeStats.wins++; awayStats.losses++;
                } else if (match.homeScore < match.awayScore) {
                    awayStats.points += 3; awayStats.wins++; homeStats.losses++;
                } else {
                    homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++;
                }
            });
            Object.keys(currentTeamStatsForWeek).forEach(teamId => {
                currentTeamStatsForWeek[teamId].goalDifference = currentTeamStatsForWeek[teamId].goalsFor - currentTeamStatsForWeek[teamId].goalsAgainst;
            });
            const weeklyStandingsRanked = Object.entries(currentTeamStatsForWeek)
                .map(([teamId, stats]) => ({ teamId, ...stats }))
                .sort((a, b) => b.points - a.points || b.goalDifference - b.goalsFor || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
            
            weeklyStandingsRanked.forEach((standing, index) => {
                const rank = index + 1;
                batch.set(doc(firestore, 'weeklyTeamStandings', `${week}-${standing.teamId}`), {
                    week: week,
                    teamId: standing.teamId,
                    rank: rank
                });
            });
        }
        
        teams.forEach(team => {
            const teamMatches = playedMatches
                .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
                .sort((a,b) => b.week - a.week);
            const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
            teamMatches.slice(0, 6).forEach((match, i) => {
                if (i < 6) {
                    if (match.homeScore === match.awayScore) results[i] = 'D';
                    else if ((match.homeTeamId === team.id && match.homeScore > match.awayScore) || (match.awayTeamId === team.id && match.awayScore > match.homeScore)) results[i] = 'W';
                    else results[i] = 'L';
                }
            });
            batch.set(doc(firestore, 'teamRecentResults', team.id), { teamId: team.id, results: results.reverse() });
        });

        // --- 8. Commit all changes to the database ---
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
