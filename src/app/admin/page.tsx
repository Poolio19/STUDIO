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
      toast({ title: 'Recalculation: Fetching base data...' });
  
      // --- 1. Fetch all base data ---
      const [teamsSnap, matchesSnap, usersSnap, predictionsSnap] = await Promise.all([
        getDocs(query(collection(firestore, 'teams'))),
        getDocs(query(collection(firestore, 'matches'))),
        getDocs(query(collection(firestore, 'users'))),
        getDocs(query(collection(firestore, 'predictions'))),
      ]);
  
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      const teamMap = new Map(teams.map(t => [t.id, t]));
      const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
  
      // --- 2. Clear all derived data collections ---
      toast({ title: 'Recalculation: Clearing old derived data...' });
      const collectionsToClear = ['standings', 'playerTeamScores', 'teamRecentResults', 'weeklyTeamStandings', 'userHistories', 'monthlyMimoM'];
      const deletionBatch = writeBatch(firestore);
      for (const collectionName of collectionsToClear) {
        const snap = await getDocs(query(collection(firestore, collectionName)));
        snap.forEach(doc => deletionBatch.delete(doc.ref));
      }
      await deletionBatch.commit();
      
      const mainBatch = writeBatch(firestore);
  
      // --- 3. Build history week by week ---
      const playedMatches = allMatches.filter(m => m.homeScore > -1 && m.awayScore > -1);
      const playedWeeks = [...new Set(playedMatches.map(m => m.week))].sort((a, b) => a - b);
  
      const allUserHistories: { [userId: string]: UserHistory } = {};
      users.forEach(u => {
        allUserHistories[u.id] = { userId: u.id, weeklyScores: [] };
      });
  
      for (const week of playedWeeks) {
        toast({ title: `Recalculation: Processing Week ${week}...` });
  
        // A. Calculate team standings up to the current week
        const matchesUpToWeek = allMatches.filter(m => m.week <= week && m.homeScore > -1 && m.awayScore > -1);
        const weeklyTeamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank' > } = {};
        teams.forEach(team => {
            weeklyTeamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        });
        matchesUpToWeek.forEach(match => {
            const homeStats = weeklyTeamStats[match.homeTeamId];
            const awayStats = weeklyTeamStats[match.awayTeamId];
            if (!homeStats || !awayStats) return;
            
            homeStats.gamesPlayed++;
            awayStats.gamesPlayed++;
            homeStats.goalsFor += match.homeScore;
            awayStats.goalsFor += match.awayScore;
            homeStats.goalsAgainst += match.awayScore;
            awayStats.goalsAgainst += match.homeScore;
            
            if (match.homeScore > match.awayScore) { homeStats.points += 3; homeStats.wins++; awayStats.losses++; }
            else if (match.homeScore < match.awayScore) { awayStats.points += 3; awayStats.wins++; homeStats.losses++; }
            else { homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++; }
        });
        Object.keys(weeklyTeamStats).forEach(teamId => {
            weeklyTeamStats[teamId].goalDifference = weeklyTeamStats[teamId].goalsFor - weeklyTeamStats[teamId].goalsAgainst;
        });
        const weeklyStandingsRanked = Object.entries(weeklyTeamStats)
            .map(([teamId, stats]) => ({ teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown' }))
            .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
        
        const rankedTeamsForWeek = weeklyStandingsRanked.map((s, i) => ({ ...s, rank: i + 1 }));
        const actualTeamRanksForWeek = new Map(rankedTeamsForWeek.map(s => [s.teamId, s.rank]));

        rankedTeamsForWeek.forEach(standing => {
          mainBatch.set(doc(firestore, 'weeklyTeamStandings', `${week}-${standing.teamId}`), {
              week: week,
              teamId: standing.teamId,
              rank: standing.rank
          });
        });

        // B. Calculate user scores for the week
        const userScoresForWeek: { [userId: string]: number } = {};
        predictions.forEach(prediction => {
          if (!prediction.rankings) return;
          let totalScore = 0;
          prediction.rankings.forEach((teamId, index) => {
            const predictedRank = index + 1;
            const actualRank = actualTeamRanksForWeek.get(teamId);
            if (actualRank !== undefined && actualRank > 0) {
              const score = 5 - Math.abs(predictedRank - actualRank);
              totalScore += score;
              if (week === playedWeeks[playedWeeks.length -1]) { // Only write final player scores
                mainBatch.set(doc(firestore, 'playerTeamScores', `${prediction.userId}_${teamId}`), { userId: prediction.userId, teamId, score });
              }
            }
          });
          userScoresForWeek[prediction.userId] = totalScore;
        });
  
        // C. Rank users for the week
        const rankedUsersForWeek = users
          .map(user => ({ ...user, scoreForWeek: userScoresForWeek[user.id] ?? 0 }))
          .sort((a, b) => b.scoreForWeek - a.scoreForWeek || a.name.localeCompare(b.name));
        
        let lastScore = -Infinity;
        let currentRank = 0;
        for (let i = 0; i < rankedUsersForWeek.length; i++) {
          const user = rankedUsersForWeek[i];
          if (i === 0 || user.scoreForWeek < lastScore) {
            currentRank = i + 1;
          }
          lastScore = user.scoreForWeek;
          allUserHistories[user.id].weeklyScores.push({ week: week, score: user.scoreForWeek, rank: currentRank });
        }
      }
  
      // --- 4. Process final user states and write histories ---
      toast({ title: 'Recalculation: Finalizing user profiles...' });
      for (const user of users) {
        const userHistory = allUserHistories[user.id];
        if (!userHistory || userHistory.weeklyScores.length === 0) continue;
  
        const finalWeekData = userHistory.weeklyScores[userHistory.weeklyScores.length - 1];
        const previousWeekIndex = userHistory.weeklyScores.findIndex(ws => ws.week === finalWeekData.week) -1;
        const previousWeekData = previousWeekIndex >= 0 ? userHistory.weeklyScores[previousWeekIndex] : null;

        const allRanks = userHistory.weeklyScores.map(ws => ws.rank).filter(r => r > 0);
        const allScores = userHistory.weeklyScores.map(ws => ws.score);
        
        const finalUserData: Partial<UserProfile> = {
          score: finalWeekData.score,
          rank: finalWeekData.rank,
          previousScore: previousWeekData?.score ?? 0,
          previousRank: previousWeekData?.rank ?? 0,
          scoreChange: finalWeekData.score - (previousWeekData?.score ?? 0),
          rankChange: (previousWeekData?.rank ?? 0) > 0 ? (previousWeekData!.rank - finalWeekData.rank) : 0,
          maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
          minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
          maxRank: allRanks.length > 0 ? Math.max(...allRanks) : 0,
          minRank: allRanks.length > 0 ? Math.min(...allRanks) : 0,
        };
        mainBatch.set(doc(firestore, 'users', user.id), finalUserData, { merge: true });
        mainBatch.set(doc(firestore, 'userHistories', user.id), userHistory);
      }

      // --- 5. Calculate and store Monthly MimoM awards ---
      toast({ title: 'Recalculation: Calculating monthly awards...' });

      const monthWeekRanges = [
        { id: 'aug', month: 'August', year: 2025, startWeek: 0, endWeek: 4 },
        { id: 'sep', month: 'September', year: 2025, startWeek: 4, endWeek: 8 },
        { id: 'oct', month: 'October', year: 2025, startWeek: 8, endWeek: 11 },
        { id: 'nov', month: 'November', year: 2025, startWeek: 11, endWeek: 14 },
        { id: 'dec', month: 'December', year: 2025, startWeek: 14, endWeek: 19 },
        { id: 'jan', month: 'January', year: 2026, startWeek: 19, endWeek: 23 },
        { id: 'feb', month: 'February', year: 2026, startWeek: 23, endWeek: 27 },
        { id: 'mar', month: 'March', year: 2026, startWeek: 27, endWeek: 31 },
        { id: 'apr', month: 'April', year: 2026, startWeek: 31, endWeek: 35 },
        { id: 'may', month: 'May', year: 2026, startWeek: 35, endWeek: 38 },
      ];
      
      const specialAwards = [
          { id: 'xmas', special: 'Christmas No. 1', year: 2025, week: 18 },
      ];

      const nonProUsers = users.filter(u => !u.isPro);
      const maxRank = nonProUsers.length > 0 ? nonProUsers.length : 50;


      for (const month of monthWeekRanges) {
        if (playedWeeks.includes(month.endWeek)) {
          const monthlyImprovements: { userId: string; improvement: number; endRank: number }[] = [];
          
          nonProUsers.forEach(user => {
            const userHistory = allUserHistories[user.id];
            if (userHistory) {
              const startWeekData = userHistory.weeklyScores.find(ws => ws.week === month.startWeek);
              const endWeekData = userHistory.weeklyScores.find(ws => ws.week === month.endWeek);
              
              const startRank = startWeekData && startWeekData.rank > 0 ? startWeekData.rank : maxRank;
              
              if (endWeekData && endWeekData.rank > 0) {
                const improvement = startRank - endWeekData.rank;
                monthlyImprovements.push({ userId: user.id, improvement, endRank: endWeekData.rank });
              }
            }
          });

          if (monthlyImprovements.length > 0) {
            monthlyImprovements.sort((a, b) => b.improvement - a.improvement || a.endRank - b.endRank);
            
            const bestImprovement = monthlyImprovements[0].improvement;
            const winners = monthlyImprovements.filter(u => u.improvement === bestImprovement);

            winners.forEach(winner => {
              const awardId = `${month.id}-${winner.userId}`;
              mainBatch.set(doc(firestore, 'monthlyMimoM', awardId), {
                month: month.month,
                year: month.year,
                userId: winner.userId,
                type: 'winner',
              });
            });

            if (winners.length === 1) {
              const remainingPlayers = monthlyImprovements.filter(u => u.improvement < bestImprovement);
              if (remainingPlayers.length > 0) {
                const secondBestImprovement = remainingPlayers[0].improvement;
                const runnersUp = remainingPlayers.filter(u => u.improvement === secondBestImprovement);
                runnersUp.forEach(runnerUp => {
                   const awardId = `${month.id}-ru-${runnerUp.userId}`;
                   mainBatch.set(doc(firestore, 'monthlyMimoM', awardId), {
                    month: month.month,
                    year: month.year,
                    userId: runnerUp.userId,
                    type: 'runner-up',
                  });
                });
              }
            }
          }
        }
      }

      for (const award of specialAwards) {
          if (playedWeeks.includes(award.week)) {
              nonProUsers.forEach(user => {
                  const userHistory = allUserHistories[user.id];
                  if (userHistory) {
                      const awardWeekData = userHistory.weeklyScores.find(ws => ws.week === award.week);
                      if (awardWeekData && awardWeekData.rank === 1) {
                          const awardId = `${award.id}-${user.id}`;
                          mainBatch.set(doc(firestore, 'monthlyMimoM', awardId), {
                              month: '',
                              year: award.year,
                              userId: user.id,
                              special: award.special,
                              type: 'winner'
                          });
                      }
                  }
              });
          }
      }

      // --- 6. Generate final league standings and recent results ---
      toast({ title: 'Recalculation: Generating final standings...' });
      const finalMatches = allMatches.filter(m => m.week <= (playedWeeks[playedWeeks.length -1] || 0) && m.homeScore > -1 && m.awayScore > -1);
      const finalTeamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
      teams.forEach(team => {
          finalTeamStats[team.id] = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
      });
      finalMatches.forEach(match => {
          const homeStats = finalTeamStats[match.homeTeamId];
          const awayStats = finalTeamStats[match.awayTeamId];
          if (!homeStats || !awayStats) return;
          
          homeStats.gamesPlayed++; awayStats.gamesPlayed++;
          homeStats.goalsFor += match.homeScore; awayStats.goalsFor += match.awayScore;
          homeStats.goalsAgainst += match.awayScore; awayStats.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) { homeStats.points += 3; homeStats.wins++; awayStats.losses++; }
          else if (match.homeScore < match.awayScore) { awayStats.points += 3; awayStats.wins++; homeStats.losses++; }
          else { homeStats.points++; awayStats.points++; homeStats.draws++; awayStats.draws++; }
      });
      Object.keys(finalTeamStats).forEach(teamId => {
          finalTeamStats[teamId].goalDifference = finalTeamStats[teamId].goalsFor - finalTeamStats[teamId].goalsAgainst;
      });
      const newStandings = Object.entries(finalTeamStats)
        .map(([teamId, stats]) => ({ teamId, ...stats, teamName: teamMap.get(teamId)?.name || 'Unknown' }))
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamName.localeCompare(b.teamName));
      newStandings.forEach((s, index) => {
          const { teamName, ...rest } = s;
          mainBatch.set(doc(firestore, 'standings', s.teamId), { ...rest, rank: index + 1 });
      });

      teams.forEach(team => {
        const teamMatches = playedMatches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id).sort((a,b) => b.week - a.week);
        const results: ('W' | 'D' | 'L' | '-')[] = Array(6).fill('-');
        teamMatches.slice(0, 6).forEach((match, i) => {
            if (i < 6) {
                if (match.homeScore === match.awayScore) results[i] = 'D';
                else if ((match.homeTeamId === team.id && match.homeScore > match.awayScore) || (match.awayTeamId === team.id && match.awayScore > match.homeScore)) results[i] = 'W';
                else results[i] = 'L';
            }
        });
        mainBatch.set(doc(firestore, 'teamRecentResults', team.id), { teamId: team.id, results: results.reverse() });
      });

      // --- 7. Commit all changes ---
      toast({ title: 'Recalculation: Committing all updates...' });
      await mainBatch.commit();
  
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
                <CardTitle>Step 1 &amp; 2: Enter &amp; Write Results</CardTitle>
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
                        3. Update &amp; Recalculate All Data
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
