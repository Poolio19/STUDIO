
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { importData, ensureUser, testDatabaseConnection } from '@/ai/flows/import-data-flow';
import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
import type { UpdateMatchResultsInput } from '@/ai/flows/update-match-results-flow-types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Match, Team } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type MatchWithTeamData = Match & {
  homeTeam: Team;
  awayTeam: Team;
  id: string;
};


export default function AdminPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [isEnsuringUser, setIsEnsuringUser] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = React.useState(false);
  
  const [databaseId, setDatabaseId] = React.useState('prempred-master');
  const [selectedWeek, setSelectedWeek] = React.useState<string>('1');
  const [matchesForWeek, setMatchesForWeek] = React.useState<MatchWithTeamData[]>([]);
  const [scores, setScores] = React.useState<{ [matchId: string]: { homeScore: string; awayScore: string } }>({});

  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const teamMap = React.useMemo(() => {
    if (!teams) return new Map();
    return new Map(teams.map(t => [t.id, t]));
  }, [teams]);
  
  const fetchMatchesForWeek = React.useCallback(async (week: string) => {
    if (!firestore || teamsLoading || teamMap.size === 0) return;

    setIsLoadingMatches(true);
    const weekNumber = parseInt(week, 10);
    const matchesQuery = query(collection(firestore, 'matches'), where('week', '==', weekNumber));
    
    try {
      const querySnapshot = await getDocs(matchesQuery);
      const matchesData: MatchWithTeamData[] = [];
      querySnapshot.forEach(doc => {
        const match = doc.data() as Match;
        const homeTeam = teamMap.get(match.homeTeamId);
        const awayTeam = teamMap.get(match.awayTeamId);
        if (homeTeam && awayTeam) {
            matchesData.push({ ...match, id: doc.id, homeTeam, awayTeam });
        }
      });
      
      setMatchesForWeek(matchesData);
      
      const initialScores: { [matchId: string]: { homeScore: string; awayScore: string } } = {};
      matchesData.forEach(m => {
          initialScores[m.id] = { homeScore: m.homeScore > -1 ? m.homeScore.toString() : '', awayScore: m.awayScore > -1 ? m.awayScore.toString() : '' };
      });
      setScores(initialScores);
    } catch(e) {
      // This will catch permission errors if the user has not imported data yet.
      // It's safe to ignore here.
    } finally {
      setIsLoadingMatches(false);
    }

  }, [firestore, teamsLoading, teamMap]);

  React.useEffect(() => {
    fetchMatchesForWeek(selectedWeek);
  }, [selectedWeek, fetchMatchesForWeek]);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setScores(prev => ({
        ...prev,
        [matchId]: {
            ...prev[matchId],
            [team === 'home' ? 'homeScore' : 'awayScore']: value,
        },
    }));
  };

  const handleTestConnection = async () => {
    if (!databaseId) {
        toast({
            variant: 'destructive',
            title: 'Database ID Required',
            description: 'Please enter a Firestore Database ID to test.',
        });
        return;
    }
    setIsTestingConnection(true);
    toast({ title: 'Testing Connection...', description: `Pinging database '${databaseId}'...` });

    try {
        const result = await testDatabaseConnection(databaseId);
        toast({
            variant: result.success ? 'default' : 'destructive',
            title: result.success ? 'Connection Successful!' : 'Connection Failed',
            description: result.message,
        });
    } catch (error: any) {
        console.error('Test connection failed:', error);
        toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    }
    setIsTestingConnection(false);
  }

  const handleEnsureUser = async () => {
    setIsEnsuringUser(true);
    toast({
      title: 'Setting up Default User...',
      description: 'Attempting to create or verify the default user account.',
    });

    try {
      const result = await ensureUser();
      toast({
            variant: result.success ? 'default' : 'destructive',
            title: result.success ? 'User Setup Complete' : 'User Setup Failed',
            description: result.message,
      });
    } catch (error: any) {
      console.error('Ensure user failed:', error);
      toast({
        variant: 'destructive',
        title: 'User Setup Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }

    setIsEnsuringUser(false);
  };

  const handleDataImport = async () => {
     if (!databaseId) {
        toast({
            variant: 'destructive',
            title: 'Database ID Required',
            description: 'Please enter the Firestore Database ID before importing data.',
        });
        return;
    }
    setIsImporting(true);
    toast({
      title: 'Importing Data...',
      description: `Populating database '${databaseId}' with initial data. This may take a moment.`,
    });

    try {
      const result = await importData(databaseId);
      toast({
            variant: result.success ? 'default' : 'destructive',
            title: result.success ? 'Import Complete!' : 'Import Failed',
            description: result.message || 'An unexpected error occurred during data import.',
        });
    } catch (error: any) {
      console.error('Data import failed:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'There was an error populating the database. Check the console for details.',
      });
    }

    setIsImporting(false);
  };
  
  const handleUpdateResults = async () => {
    setIsUpdating(true);
    toast({
        title: 'Updating Match Results...',
        description: `Submitting scores for week ${selectedWeek}.`,
    });

    const resultsToUpdate = Object.entries(scores)
      .map(([matchId, score]) => ({
          matchId,
          homeScore: parseInt(score.homeScore, 10),
          awayScore: parseInt(score.awayScore, 10),
      }))
      .filter(result => !isNaN(result.homeScore) && !isNaN(result.awayScore));

    const input: UpdateMatchResultsInput = {
        week: parseInt(selectedWeek, 10),
        results: resultsToUpdate,
    };

    try {
      const response = await updateMatchResults(input);
      toast({
        title: 'Update Complete!',
        description: `${response.updatedCount} match results for week ${selectedWeek} have been updated.`,
      });
    } catch (error) {
      console.error('Match result update failed:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating match results. Check the console for details.',
      });
    }
    setIsUpdating(false);
  };

  const weeks = Array.from({ length: 38 }, (_, i) => i + 1);
  const anyLoading = isTestingConnection || isEnsuringUser || isImporting;

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
            <CardTitle>Data Import / Testing</CardTitle>
            <CardDescription>
                First, ensure a default user exists. Then, connect to your Firestore database and import all sample data.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
            
            <Alert>
                <AlertTitle>Step 1: Ensure Default User</AlertTitle>
                <AlertDescription>
                    Creates 'alex@example.com' if it doesn't exist. This is required for the app to function.
                </AlertDescription>
                 <Button onClick={handleEnsureUser} disabled={anyLoading} className="mt-2">
                    {isEnsuringUser ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking User...
                    </>
                    ) : (
                    'Ensure Default User'
                    )}
                </Button>
            </Alert>
            
            <Alert>
                <AlertTitle>Step 2: Connect & Import Data</AlertTitle>
                <AlertDescription>
                    Enter your Firestore Database ID (e.g., "prempred-master"), test the connection, then import data.
                </AlertDescription>
                <div className="mt-2 space-y-2">
                    <Input 
                        placeholder="Firestore Database ID (e.g. prempred-master)"
                        value={databaseId}
                        onChange={(e) => setDatabaseId(e.target.value)}
                        disabled={anyLoading}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleTestConnection} disabled={anyLoading || !databaseId} className="w-1/2">
                            {isTestingConnection ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                            ) : (
                                '1. Test Connection'
                            )}
                        </Button>
                        <Button onClick={handleDataImport} disabled={anyLoading || !databaseId} className="w-1/2">
                            {isImporting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                            ) : (
                                '2. Import All Data'
                            )}
                        </Button>
                    </div>
                </div>
            </Alert>
           
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Update Weekly Results</CardTitle>
                <CardDescription>
                    Select a week and enter the scores for each match. Scores are saved automatically in the background.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={setSelectedWeek} defaultValue={selectedWeek} disabled={isUpdating || isLoadingMatches}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                        {weeks.map(week => (
                            <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isLoadingMatches ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {matchesForWeek.length > 0 ? matchesForWeek.map(match => {
                            const HomeIcon = Icons[match.homeTeam.logo as IconName] || Icons.match;
                            const AwayIcon = Icons[match.awayTeam.logo as IconName] || Icons.match;
                            return (
                                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-2 justify-end w-2/5 text-right">
                                        <span className="font-medium text-sm">{match.homeTeam.name}</span>
                                        <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.homeTeam.bgColourSolid }}>
                                            <HomeIcon className="size-5" style={{ color: match.homeTeam.iconColour }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            className="w-14 text-center font-bold" 
                                            value={scores[match.id]?.homeScore || ''}
                                            onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                            disabled={isUpdating}
                                            placeholder="-"
                                        />
                                        <span>-</span>
                                        <Input 
                                            type="number" 
                                            className="w-14 text-center font-bold" 
                                            value={scores[match.id]?.awayScore || ''}
                                            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                            disabled={isUpdating}
                                            placeholder="-"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-2/5">
                                        <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: match.awayTeam.bgColourSolid }}>
                                            <AwayIcon className="size-5" style={{ color: match.awayTeam.iconColour }} />
                                        </div>
                                        <span className="font-medium text-sm">{match.awayTeam.name}</span>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-sm text-muted-foreground text-center py-4">No matches found for this week. This may be because data has not been imported yet.</p>}
                    </div>
                )}
                 <Button onClick={handleUpdateResults} disabled={isUpdating || isLoadingMatches || matchesForWeek.length === 0}>
                    {isUpdating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Scores...
                    </>
                    ) : (
                    'Submit All Scores'
                    )}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
