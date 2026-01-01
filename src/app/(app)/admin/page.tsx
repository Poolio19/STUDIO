
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { importData, ensureUser, testDatabaseConnection, type ImportDataInput, type TestDatabaseConnectionInput } from '@/ai/flows/import-data-flow';
import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
import { type UpdateMatchResultsInput } from '@/ai/flows/update-match-results-flow-types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, Query } from 'firebase/firestore';
import type { Match, Team } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
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
  const [isConnectionSuccessful, setIsConnectionSuccessful] = React.useState(false);
  const [isEnsuringUser, setIsEnsuringUser] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = React.useState(false);
  const [databaseId, setDatabaseId] = React.useState('');

  const [selectedWeek, setSelectedWeek] = React.useState<string>('1');
  const [matchesForWeek, setMatchesForWeek] = React.useState<MatchWithTeamData[]>([]);
  const [scores, setScores] = React.useState<{ [matchId: string]: { homeScore: string; awayScore: string } }>({});

  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const teamMap = React.useMemo(() => {
    if (!teams) return new Map();
    return new Map(teams.map(t => [t.id, t]));
  }, [teams]);
  
  React.useEffect(() => {
    // Reset connection status if databaseId changes
    setIsConnectionSuccessful(false);
  }, [databaseId]);

  const handleTestConnection = async () => {
    if (!databaseId) {
      toast({
        variant: 'destructive',
        title: 'Database ID Required',
        description: 'Please enter a Database ID to test the connection.',
      });
      return;
    }
    setIsTestingConnection(true);
    toast({
      title: 'Testing Connection...',
      description: `Attempting to connect to database: ${databaseId}`,
    });

    const input: TestDatabaseConnectionInput = { databaseId };

    try {
      const result = await testDatabaseConnection(input);
      if (result.success) {
        toast({
          title: 'Connection Successful!',
          description: result.message,
        });
        setIsConnectionSuccessful(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: result.message,
        });
        setIsConnectionSuccessful(false);
      }
    } catch (error: any) {
      console.error('Test connection failed:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsConnectionSuccessful(false);
    }
    setIsTestingConnection(false);
  };


  const fetchMatchesForWeek = React.useCallback(async (week: string) => {
    if (!firestore || teamsLoading || teamMap.size === 0) return;

    setIsLoadingMatches(true);
    const weekNumber = parseInt(week, 10);
    const matchesQuery = query(collection(firestore, 'matches'), where('week', '==', weekNumber));
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
        initialScores[m.id] = { homeScore: m.homeScore.toString(), awayScore: m.awayScore.toString() };
    });
    setScores(initialScores);
    setIsLoadingMatches(false);
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

  const handleEnsureUser = async () => {
    setIsEnsuringUser(true);
    toast({
      title: 'Setting up Default User...',
      description: 'Attempting to create or verify the default user account.',
    });

    try {
      const result = await ensureUser();
      if (result.success) {
        toast({
            title: 'User Setup Complete',
            description: result.message,
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'User Setup Failed',
            description: result.message,
        });
      }
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
    setIsImporting(true);
    toast({
      title: 'Importing Data...',
      description: 'Populating the Firestore database with initial data. This may take a moment.',
    });

    const input: ImportDataInput = {};
    if (databaseId) {
      input.databaseId = databaseId;
    }

    try {
      const result = await importData(input);
      if (result.success) {
        toast({
            title: 'Import Complete!',
            description: result.message,
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: result.message || 'There was an error populating the database. Check the console for details.',
        });
      }
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
      // No need to re-fetch, the local state is the source of truth for the form
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
            <CardTitle>Data Import</CardTitle>
            <CardDescription>
                First, ensure a default user exists. Second, connect to and import data into a specific Firestore database.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
            
            <Alert>
                <AlertTitle>Step 1: Ensure Default User</AlertTitle>
                <AlertDescription>
                    This creates the 'alex@example.com' user if it doesn't already exist. This is only needed once.
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
                    Enter the ID of your Firestore database (e.g., 'prempred-master'), test the connection, then import the data.
                </AlertDescription>
                <div className="space-y-2 mt-4">
                    <Label htmlFor="databaseId">Firestore Database ID</Label>
                    <Input 
                        id="databaseId"
                        placeholder="e.g., prempred-master"
                        value={databaseId}
                        onChange={(e) => setDatabaseId(e.target.value)}
                        disabled={anyLoading}
                    />
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button onClick={handleTestConnection} disabled={anyLoading || !databaseId} className="flex-1">
                        {isTestingConnection ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                        </>
                        ) : (
                        '1. Test Connection'
                        )}
                    </Button>
                    <Button onClick={handleDataImport} disabled={anyLoading || !isConnectionSuccessful} className="flex-1">
                        {isImporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                        </>
                        ) : (
                        '2. Import All Data'
                        )}
                    </Button>
                 </div>
            </Alert>
           
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Update Weekly Results</CardTitle>
                <CardDescription>
                    Select a week and enter the scores for each match. You can submit partial results and update them multiple times.
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
                        {matchesForWeek.map(match => {
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
                        })}
                    </div>
                )}
                 <Button onClick={handleUpdateResults} disabled={isUpdating || isLoadingMatches || matchesForWeek.length === 0}>
                    {isUpdating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Scores...
                    </>
                    ) : (
                    'Submit Scores'
                    )}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
