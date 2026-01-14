
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

import type { Match, Team, Prediction, User as UserProfile, UserHistory, CurrentStanding } from '@/lib/types';
import { importPastFixtures } from '@/ai/flows/import-past-fixtures-flow';
import { reimportFixtures } from '@/ai/flows/reimport-fixtures-flow';
import week23Fixtures from '@/lib/week-23-fixtures.json';


export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isUpdatingWeek, setIsUpdatingWeek] = React.useState(false);

  const connectivityCheckDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'connectivity-test', 'connectivity-doc') : null),
    [firestore]
  );
  
  React.useEffect(() => {
    if (!firestore) return;

    const checkConnection = async () => {
      try {
        if (!connectivityCheckDocRef) return;
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
  }, [connectivityCheckDocRef, firestore]);

  const handleUpdateWeek23 = async () => {
    setIsUpdatingWeek(true);
    toast({ title: 'Updating Week 23...', description: 'Re-importing fixtures for week 23.' });

    try {
      const result = await reimportFixtures({ week: 23, fixtures: week23Fixtures as Match[] });
      if (!result.success) {
        throw new Error('Week 23 fixture import failed.');
      }
      toast({ title: 'Week 23 Updated!', description: `Imported ${result.importedCount} fixtures.` });
    } catch (error: any) {
      console.error('Error during week 23 update:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdatingWeek(false);
    }
  };


 const handleFullUpdate = async () => {
    setIsUpdating(true);
    toast({ title: 'Starting Full Update...', description: 'Step 1: Re-importing all fixtures.' });

    try {
        const importResult = await importPastFixtures();
        if (!importResult.success) {
            throw new Error(importResult.message || 'Fixture import failed.');
        }
        
        toast({ title: `Import Complete (${importResult.importedCount} fixtures)`, description: 'Step 2: Recalculating all league data.' });

        await handleRecalculateAllData();
        
        toast({
            title: 'Full Data Update Complete!',
            description: 'All fixtures and application data have been successfully updated.',
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
        const playedMatches = allMatches.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
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
                <CardTitle>Update Week 23</CardTitle>
                <CardDescription>
                    This will re-import the fixtures for Week 23 from the dedicated library file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleUpdateWeek23} disabled={isUpdatingWeek || !dbStatus.connected}>
                    {isUpdatingWeek ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Update Week 23 Results
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Master Data Control</CardTitle>
                <CardDescription>
                    This will re-import all fixtures from the main library and then recalculate all data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                {dbStatus.connected ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />}
                <p className="font-medium">{dbStatus.message}</p>
                </div>
                
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="text-lg" disabled={isUpdating || !dbStatus.connected}>
                        {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        Update & Recalculate All Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will re-import all fixtures from the library and then recalculate standings, scores, and histories. This is a long-running operation.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFullUpdate}>Yes, Run Full Update</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
