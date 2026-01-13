
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

import { collection, doc, getDoc, writeBatch, setDoc, getDocs, query } from 'firebase/firestore';
import { Icons, IconName } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import type { Match, Team, Prediction, User as UserProfile, UserHistory, CurrentStanding, WeeklyTeamStanding, PlayerTeamScore } from '@/lib/types';
import pastFixtures from '@/lib/past-fixtures.json';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};


export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isRecalculating, setIsRecalculating] = React.useState(false);
  const [isImportingPast, setIsImportingPast] = React.useState(false);
  const [isTestingDbWrite, setIsTestingDbWrite] = React.useState(false);
  const [isTestingClientDbWrite, setIsTestingClientDbWrite] = React.useState(false);


  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});
  
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  
  const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useCollection<Match>(matchesQuery);

  const teamMap = React.useMemo(() => {
    if (!teamsData) return new Map();
    return new Map(teamsData.map(t => [t.id, t]));
  }, [teamsData]);

  const connectivityCheckDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'connectivity-test', 'connectivity-doc') : null),
    [firestore]
  );
  
  React.useEffect(() => {
    if (!connectivityCheckDocRef) return;
    
    const checkConnection = async () => {
      try {
        await getDoc(connectivityCheckDocRef);
        setDbStatus({ connected: true, message: 'Database is connected.' });
      } catch (error: any) {
         if (error.code === 'permission-denied') {
            setDbStatus({ connected: true, message: 'Database is connected (with secure rules).' });
        } else if (error.code === 'unavailable' || error.message.includes('offline')) {
            setDbStatus({ connected: false, message: 'Database connection failed: Client is offline.' });
        } else {
            console.error("Database connection check failed:", error);
            setDbStatus({ connected: false, message: `Connection failed: ${error.message}` });
        }
      }
    };
    
    checkConnection();
  }, [connectivityCheckDocRef]);

  const handleWeekChange = React.useCallback((weekStr: string) => {
    const week = parseInt(weekStr);
    setSelectedWeek(week);

    const existingFixtures = (matchesData || [])
        .filter(m => m.week === week)
        .map(match => {
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            if (!homeTeam || !awayTeam) return null;
            return {
                ...match,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
            };
        })
        .filter((match): match is EditableMatch => match !== null);

    setWeekFixtures(existingFixtures);

    const initialScores = existingFixtures.reduce((acc, match) => {
        acc[match.id] = { 
          homeScore: match.homeScore === -1 ? '' : String(match.homeScore), 
          awayScore: match.awayScore === -1 ? '' : String(match.awayScore) 
        };
        return acc;
    }, {} as {[matchId: string]: {homeScore: string, awayScore: string}});
    setScores(initialScores);
  }, [matchesData, teamMap]);

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
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot save results. Week not selected or Firestore not available.' });
        return;
    }
    setIsUpdating(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Saving results and recalculating all league data. This may take a moment.',
    });
    
    try {
        const resultsToUpdate = weekFixtures.map(match => {
            const scoreData = scores[match.id];
            const homeScore = parseInt(scoreData?.homeScore, 10);
            const awayScore = parseInt(scoreData?.awayScore, 10);

            return {
                ...match,
                homeScore: !isNaN(homeScore) ? homeScore : -1,
                awayScore: !isNaN(awayScore) ? awayScore : -1,
            };
        });

        // Use a client-side batch write
        const batch = writeBatch(firestore);
        resultsToUpdate.forEach(result => {
            const { id, homeTeam, awayTeam, ...matchData } = result;
            const docRef = doc(firestore, 'matches', id);
            batch.set(docRef, matchData, { merge: true });
        });
        await batch.commit();

        toast({
            title: `Week ${selectedWeek} Matches Updated!`,
            description: `${resultsToUpdate.length} match records were saved. Now recalculating all league data...`,
        });

        await handleRecalculateAllData();

    } catch (error: any) {
        console.error(`Error during full data update for week ${selectedWeek}:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred during the update process.',
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
    setIsRecalculating(true);
    toast({
        title: 'Recalculating All Data...',
        description: 'This will update all standings and scores based on the current match results in the database.',
    });

    try {
        const batch = writeBatch(firestore);

        // 1. Fetch all necessary data from Firestore
        toast({ title: 'Step 1/6: Fetching all required data...' });
        const [
            teamsSnap, 
            matchesSnap, 
            usersSnap, 
            predictionsSnap, 
            userHistoriesSnap,
            standingsSnap,
            playerTeamScoresSnap,
            teamRecentResultsSnap
        ] = await Promise.all([
            getDocs(query(collection(firestore, 'teams'))),
            getDocs(query(collection(firestore, 'matches'))),
            getDocs(query(collection(firestore, 'users'))),
            getDocs(query(collection(firestore, 'predictions'))),
            getDocs(query(collection(firestore, 'userHistories'))),
            getDocs(query(collection(firestore, 'standings'))),
            getDocs(query(collection(firestore, 'playerTeamScores'))),
            getDocs(query(collection(firestore, 'teamRecentResults')))
        ]);

        const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        const teamMap = new Map(teams.map(t => [t.id, t]));
        
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const playedMatches = allMatches.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        const predictions = predictionsSnap.docs.map(doc => ({ userId: doc.id, ...doc.data() } as Prediction));
        const userHistoriesMap = new Map(userHistoriesSnap.docs.map(doc => [doc.id, doc.data() as UserHistory]));

        // 2. Clear old derivative data collections
        toast({ title: 'Step 2/6: Clearing old calculated data...' });
        standingsSnap.forEach(doc => batch.delete(doc.ref));
        playerTeamScoresSnap.forEach(doc => batch.delete(doc.ref));
        teamRecentResultsSnap.forEach(doc => batch.delete(doc.ref));
        
        // 3. Calculate new league standings from scratch
        toast({ title: 'Step 3/6: Calculating new league standings...' });
        const teamStats: { [teamId: string]: Omit<CurrentStanding, 'teamId' | 'rank'> } = {};
        
        teams.forEach(team => {
            teamStats[team.id] = {
                points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0
            };
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
            teamId,
            ...stats,
            teamName: teamMap.get(teamId)?.name || 'Unknown',
        }));
        
        newStandings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return a.teamName.localeCompare(b.teamName);
        });

        const finalStandings: CurrentStanding[] = newStandings.map((s, index) => {
            const { teamName, ...rest } = s;
            return { ...rest, rank: index + 1 };
        });

        finalStandings.forEach(standing => {
            const standingRef = doc(firestore, 'standings', standing.teamId);
            batch.set(standingRef, standing);
        });

        // 4. Recalculate user scores with CLIENT-SIDE logic
        toast({ title: 'Step 4/6: Calculating user scores...' });
        const actualTeamRanks = new Map(finalStandings.map(s => [s.teamId, s.rank]));
        const userScores: { [userId: string]: number } = {};

        predictions.forEach(prediction => {
            if (!prediction.rankings) return;
            let totalScore = 0;
            prediction.rankings.forEach((teamId, index) => {
                const predictedRank = index + 1;
                const actualRank = actualTeamRanks.get(teamId);
                
                if (actualRank !== undefined && actualRank > 0) {
                    const scoreForTeam = 5 - Math.abs(predictedRank - actualRank);
                    totalScore += scoreForTeam;
                }
            });
            userScores[prediction.userId] = totalScore;
        });
        
        // 5. Update user profiles, user histories, and player team scores
        toast({ title: 'Step 5/6: Updating user profiles and scores...' });
        const userUpdates = users.map(user => {
            const newScore = userScores[user.id] !== undefined ? userScores[user.id] : user.score;
            return {
                ...user,
                previousScore: user.score,
                previousRank: user.rank,
                score: newScore,
                scoreChange: newScore - (user.score || 0)
            };
        });

        userUpdates.sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
        
        const maxWeeksPlayed = playedMatches.length > 0 ? Math.max(0, ...playedMatches.map(m => m.week)) : 0;
        
        for (let i = 0; i < userUpdates.length; i++) {
            const user = userUpdates[i];
            const newRank = i + 1;
            user.rankChange = (user.previousRank || 0) > 0 ? (user.previousRank || newRank) - newRank : 0;
            user.rank = newRank;
            
            user.maxRank = Math.max(user.maxRank || 0, user.rank);
            user.minRank = Math.min(user.minRank || 99, user.rank);
            user.maxScore = Math.max(user.maxScore || -Infinity, user.score);
            user.minScore = Math.min(user.minScore || Infinity, user.score);
            
            const userRef = doc(firestore, 'users', user.id);
            const { id, ...userData } = user;
            batch.set(userRef, userData, { merge: true });
            
            const historyData = userHistoriesMap.get(user.id) || { userId: user.id, weeklyScores: [] };
            const weekHistoryIndex = historyData.weeklyScores.findIndex(ws => ws.week === maxWeeksPlayed);

            if (weekHistoryIndex > -1) {
                historyData.weeklyScores[weekHistoryIndex] = { week: maxWeeksPlayed, score: user.score, rank: user.rank };
            } else if (maxWeeksPlayed > 0) {
                historyData.weeklyScores.push({ week: maxWeeksPlayed, score: user.score, rank: user.rank });
            }
            batch.set(doc(firestore, 'userHistories', user.id), historyData);

            const userPrediction = predictions.find(p => p.userId === user.id);
            if (userPrediction && userPrediction.rankings) {
                userPrediction.rankings.forEach((teamId, index) => {
                    const predictedRank = index + 1;
                    const actualRank = actualTeamRanks.get(teamId) || 0;
                    const score = actualRank > 0 ? 5 - Math.abs(predictedRank - actualRank) : 0;
                    
                    const scoreId = `${user.id}_${teamId}`;
                    const scoreRef = doc(firestore, 'playerTeamScores', scoreId);
                    batch.set(scoreRef, { userId: user.id, teamId, score });
                });
            }
        }
        
        if (maxWeeksPlayed > 0) {
            finalStandings.forEach(standing => {
                const weeklyStandingId = `${maxWeeksPlayed}-${standing.teamId}`;
                const weeklyStandingRef = doc(firestore, 'weeklyTeamStandings', weeklyStandingId);
                batch.set(weeklyStandingRef, { week: maxWeeksPlayed, teamId: standing.teamId, rank: standing.rank });
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

        // 6. Commit all batched writes to Firestore
        toast({ title: 'Step 6/6: Committing all updates...' });
        await batch.commit();
        
        toast({
            title: 'Recalculation Complete!',
            description: 'All league standings and player scores have been successfully updated.',
        });

    } catch (error: any) {
        console.error('Error during client-side master data update:', error);
        toast({
            variant: 'destructive',
            title: 'Recalculation Failed',
            description: error.message || 'An unexpected error occurred during client-side recalculation.',
        });
    } finally {
        setIsRecalculating(false);
    }
  };


   const handleImportPastFixtures = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    }
    setIsImportingPast(true);
    toast({
      title: 'Importing All Fixtures...',
      description: 'Importing from JSON file. This may overwrite existing matches.',
    });

    try {
        const matchesCollectionRef = collection(firestore, 'matches');
        const batch = writeBatch(firestore);

        // First, clear existing matches to ensure a clean import
        const existingMatchesSnap = await getDocs(matchesCollectionRef);
        existingMatchesSnap.forEach(doc => {
            batch.delete(doc.ref);
        });

        pastFixtures.forEach(fixture => {
            const { id, ...fixtureData } = fixture;
            if (!id) {
                console.warn('Skipping fixture with no ID:', fixture);
                return;
            }
            const docRef = doc(matchesCollectionRef, id);
            batch.set(docRef, fixtureData);
        });

        await batch.commit();

        toast({
          title: 'Import Complete!',
          description: `Successfully imported ${pastFixtures.length} matches. Now triggering a full data recalculation.`,
        });

        // Automatically trigger recalculation after successful import
        await handleRecalculateAllData();

    } catch (error: any) {
        console.error('Error during client-side past fixtures import:', error);
        toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: error.message || 'An unexpected error occurred during the import.',
        });
    } finally {
        setIsImportingPast(false);
    }
  };

  const handleTestDbWrite = async () => {
    setIsTestingDbWrite(true);
    toast({
      title: 'Running DB Write Test...',
      description: 'Attempting to write to collection `test_01`.',
    });
    try {
        const { testDbWriteFlow } = await import('@/ai/flows/test-db-write-flow');
        const result = await testDbWriteFlow();
        if (result.success) {
            toast({
                title: 'DB Write Test Successful!',
                description: result.message,
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
      console.error('Error during DB write test:', error);
      toast({
        variant: 'destructive',
        title: 'DB Write Test Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsTestingDbWrite(false);
    }
  };

  const handleClientDbWrite = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    setIsTestingClientDbWrite(true);
    toast({ title: 'Running Client-Side DB Write Test...', description: 'Attempting to write to collection `direct_test`.' });
    try {
      const testDocRef = doc(firestore, 'direct_test', 'test-doc-01');
      await setDoc(testDocRef, { success: true, timestamp: new Date() });
      toast({ title: 'Client-Side Write Successful!', description: 'Successfully wrote a document to `direct_test` collection.' });
    } catch (error: any) {
      console.error("Client-side DB write test failed:", error);
      toast({ variant: 'destructive', title: 'Client-Side Write Failed', description: error.message || 'An unknown error occurred.' });
    } finally {
      setIsTestingClientDbWrite(false);
    }
  };


  const isLoadingData = teamsLoading || matchesLoading || !firestore || !dbStatus.connected;
  
  const allWeeks = React.useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => i + 1);
  }, []);

  const teamMatchCounts = React.useMemo(() => {
    if (!matchesData || !teamsData) return [];
    
    // Filter for matches that have been played, up to week 18.
    const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1 && m.week <= 18 && m.week > 0);
    const counts = new Map<string, number>();

    teamsData.forEach(team => counts.set(team.id, 0));

    playedMatches.forEach(match => {
        if(counts.has(match.homeTeamId)) {
          counts.set(match.homeTeamId, (counts.get(match.homeTeamId) || 0) + 1);
        }
        if(counts.has(match.awayTeamId)) {
          counts.set(match.awayTeamId, (counts.get(match.awayTeamId) || 0) + 1);
        }
    });
    
    return Array.from(counts.entries())
      .map(([teamId, count]) => ({
          teamName: teamMap.get(teamId)?.name || 'Unknown',
          count: count
      }))
      .sort((a,b) => a.teamName.localeCompare(b.teamName));

  }, [matchesData, teamsData, teamMap]);

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
                <CardTitle>Database Status</CardTitle>
                <CardDescription>
                    Check the connection and run master data operations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {dbStatus.connected ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />}
                <p className="font-medium">{dbStatus.message}</p>
                </div>
                {matchesError && <p className="text-sm text-red-500 mt-2">Error loading matches: {matchesError.message}</p>}
                
                 <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={isTestingClientDbWrite || !dbStatus.connected} onClick={handleClientDbWrite}>
                        {isTestingClientDbWrite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Run Direct DB Write
                    </Button>
                     <Button variant="outline" disabled={isTestingDbWrite || !dbStatus.connected} onClick={handleTestDbWrite}>
                        {isTestingDbWrite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Test DB Write
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isRecalculating || !dbStatus.connected}>
                            {isRecalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Force Recalculate All Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will run the master data update flow. It will recalculate all standings, user scores, and histories based on the existing match results in the database. This can be a long-running and resource-intensive operation.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRecalculateAllData}>Yes, Recalculate</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isImportingPast || !dbStatus.connected}>
                            {isImportingPast ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Import All Fixtures (Wk 1-38)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will import all fixtures from the JSON backup file, overwriting any existing matches with the same ID. This action is irreversible.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportPastFixtures}>Yes, Import Fixtures</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>


            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Team Match Count</CardTitle>
                <CardDescription>
                    Diagnostic tool to show played matches per team from the database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 overflow-y-auto border rounded-lg p-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        {teamMatchCounts.map(({ teamName, count }) => (
                            <div key={teamName} className="flex justify-between text-sm">
                                <span className="font-medium">{teamName}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Update Match Results</CardTitle>
              <CardDescription>
                  Select a week to view its fixtures, enter the scores, and save the results. Saving will trigger a full recalculation of all league and player data. This is disabled until the database is connected.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <div className="flex gap-4 items-center">
                 <Select onValueChange={handleWeekChange} disabled={isLoadingData}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                        {allWeeks.map(week => (
                            <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
               </div>

              {selectedWeek !== null && isLoadingData && <div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading fixture data...</div>}

              {selectedWeek !== null && !isLoadingData && (
                  <div className="space-y-4 pt-4">
                      <h3 className="font-semibold">Fixtures for Week {selectedWeek}</h3>
                      {weekFixtures.length > 0 ? (
                        <>
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
                                            disabled={!dbStatus.connected}
                                        />
                                        <span>-</span>
                                        <Input
                                            id={`${match.id}-away`}
                                            type="number"
                                            value={scores[match.id]?.awayScore ?? ''}
                                            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                            className="w-16 text-center"
                                            disabled={!dbStatus.connected}
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
                            <Button onClick={handleSaveWeekResults} disabled={isUpdating || isLoadingData}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : `Save & Recalculate Week ${selectedWeek}`}
                            </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No fixtures found for Week {selectedWeek}. You may need to manually add them or use a different import method.</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}

    