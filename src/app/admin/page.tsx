
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

import { collection, doc, getDoc } from 'firebase/firestore';
import { Icons, IconName } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateMatchResults } from '@/ai/flows/update-match-results-flow';
import { MatchResultSchema } from '@/ai/flows/update-match-results-flow-types';
import type { Match, Team } from '@/lib/types';


type EditableMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
};

// --- TEMPORARY FIXTURE IMPORTER ---
const teamNameToIdMap: { [key: string]: string } = {
    'Arsenal': 'team_01', 'Aston Villa': 'team_02', 'Bournemouth': 'team_03',
    'Brentford': 'team_04', 'Brighton': 'team_05', 'Burnley': 'team_06',
    'Chelsea': 'team_07', 'Crystal Palace': 'team_08', 'Everton': 'team_09',
    'Fulham': 'team_10', 'Leeds': 'team_11', 'Liverpool': 'team_12',
    'Man City': 'team_13', 'Man Utd': 'team_14', 'Newcastle': 'team_15',
    'Notts Forest': 'team_16', 'Sunderland': 'team_17', 'Tottenham': 'team_18',
    'West Ham': 'team_19', 'Wolves': 'team_20',
};

const rawFixtureData = `
19	30/12/2025 00:00	West Ham	-1	-1	Brighton
19	30/12/2025 00:00	Notts Forest	-1	-1	Everton
19	30/12/2025 00:00	Chelsea	-1	-1	Bournemouth
19	30/12/2025 00:00	Burnley	-1	-1	Newcastle
19	30/12/2025 00:00	Man Utd	-1	-1	Wolves
19	30/12/2025 00:00	Arsenal	-1	-1	Aston Villa
19	01/01/2026 00:00	Liverpool	-1	-1	Leeds
19	01/01/2026 00:00	Crystal Palace	-1	-1	Fulham
19	01/01/2026 00:00	Sunderland	-1	-1	Man City
19	01/01/2026 00:00	Brentford	-1	-1	Tottenham
20	03/01/2026 00:00	Aston Villa	-1	-1	Notts Forest
20	03/01/2026 00:00	Wolves	-1	-1	West Ham
20	03/01/2026 00:00	Brighton	-1	-1	Burnley
20	03/01/2026 00:00	Bournemouth	-1	-1	Arsenal
20	04/01/2026 00:00	Leeds	-1	-1	Man Utd
20	04/01/2026 00:00	Tottenham	-1	-1	Sunderland
20	04/01/2026 00:00	Newcastle	-1	-1	Crystal Palace
20	04/01/2026 00:00	Fulham	-1	-1	Liverpool
20	04/01/2026 00:00	Everton	-1	-1	Brentford
20	04/01/2026 00:00	Man City	-1	-1	Chelsea
21	06/01/2026 00:00	West Ham	-1	-1	Notts Forest
21	07/01/2026 00:00	Man City	-1	-1	Brighton
21	07/01/2026 00:00	Fulham	-1	-1	Chelsea
21	07/01/2026 00:00	Everton	-1	-1	Wolves
21	07/01/2026 00:00	Crystal Palace	-1	-1	Aston Villa
21	07/01/2026 00:00	Brentford	-1	-1	Sunderland
21	07/01/2026 00:00	Bournemouth	-1	-1	Tottenham
21	07/01/2026 00:00	Newcastle	-1	-1	Leeds
21	07/01/2026 00:00	Burnley	-1	-1	Man Utd
21	08/01/2026 00:00	Arsenal	-1	-1	Liverpool
22	17/01/2026 00:00	Man Utd	-1	-1	Man City
22	17/01/2026 00:00	Tottenham	-1	-1	West Ham
22	17/01/2026 00:00	Sunderland	-1	-1	Crystal Palace
22	17/01/2026 00:00	Liverpool	-1	-1	Burnley
22	17/01/2026 00:00	Leeds	-1	-1	Fulham
22	17/01/2026 00:00	Chelsea	-1	-1	Brentford
22	17/01/2026 00:00	Notts Forest	-1	-1	Arsenal
22	18/01/2026 00:00	Wolves	-1	-1	Newcastle
22	18/01/2026 00:00	Aston Villa	-1	-1	Everton
22	19/01/2026 00:00	Brighton	-1	-1	Bournemouth
23	24/01/2026 00:00	West Ham	-1	-1	Sunderland
23	24/01/2026 00:00	Man City	-1	-1	Wolves
23	24/01/2026 00:00	Fulham	-1	-1	Brighton
23	24/01/2026 00:00	Burnley	-1	-1	Tottenham
23	24/01/2026 00:00	Bournemouth	-1	-1	Liverpool
23	25/01/2026 00:00	Newcastle	-1	-1	Aston Villa
23	25/01/2026 00:00	Crystal Palace	-1	-1	Chelsea
23	25/01/2026 00:00	Brentford	-1	-1	Notts Forest
23	25/01/2026 00:00	Arsenal	-1	-1	Man Utd
23	26/01/2026 00:00	Everton	-1	-1	Leeds
24	31/01/2026 00:00	Wolves	-1	-1	Bournemouth
24	31/01/2026 00:00	Leeds	-1	-1	Arsenal
24	31/01/2026 00:00	Brighton	-1	-1	Everton
24	31/01/2026 00:00	Chelsea	-1	-1	West Ham
24	31/01/2026 00:00	Liverpool	-1	-1	Newcastle
24	01/02/2026 00:00	Notts Forest	-1	-1	Crystal Palace
24	01/02/2026 00:00	Man Utd	-1	-1	Fulham
24	01/02/2026 00:00	Aston Villa	-1	-1	Brentford
24	01/02/2026 00:00	Tottenham	-1	-1	Man City
24	02/02/2026 00:00	Sunderland	-1	-1	Burnley
25	07/02/2026 00:00	Wolves	-1	-1	Chelsea
25	07/02/2026 00:00	Newcastle	-1	-1	Brentford
25	07/02/2026 00:00	Man Utd	-1	-1	Tottenham
25	07/02/2026 00:00	Liverpool	-1	-1	Man City
25	07/02/2026 00:00	Leeds	-1	-1	Notts Forest
25	07/02/2026 00:00	Fulham	-1	-1	Everton
25	07/02/2026 00:00	Burnley	-1	-1	West Ham
25	07/02/2026 00:00	Brighton	-1	-1	Crystal Palace
25	07/02/2026 00:00	Arsenal	-1	-1	Sunderland
25	07/02/2026 00:00	Bournemouth	-1	-1	Aston Villa
26	11/02/2026 00:00	West Ham	-1	-1	Man Utd
26	11/02/2026 00:00	Tottenham	-1	-1	Newcastle
26	11/02/2026 00:00	Sunderland	-1	-1	Liverpool
26	11/02/2026 00:00	Notts Forest	-1	-1	Wolves
26	11/02/2026 00:00	Man City	-1	-1	Fulham
26	11/02/2026 00:00	Everton	-1	-1	Bournemouth
26	11/02/2026 00:00	Crystal Palace	-1	-1	Burnley
26	11/02/2026 00:00	Chelsea	-1	-1	Leeds
26	11/02/2026 00:00	Brentford	-1	-1	Arsenal
26	11/02/2026 00:00	Aston Villa	-1	-1	Brighton
27	21/02/2026 00:00	West Ham	-1	-1	Bournemouth
27	21/02/2026 00:00	Tottenham	-1	-1	Arsenal
27	21/02/2026 00:00	Sunderland	-1	-1	Fulham
27	21/02/2026 00:00	Notts Forest	-1	-1	Liverpool
27	21/02/2026 00:00	Man City	-1	-1	Newcastle
27	21/02/2026 00:00	Everton	-1	-1	Man Utd
27	21/02/2026 00:00	Crystal Palace	-1	-1	Wolves
27	21/02/2026 00:00	Chelsea	-1	-1	Burnley
27	21/02/2026 00:00	Brentford	-1	-1	Brighton
27	21/02/2026 00:00	Aston Villa	-1	-1	Leeds
28	28/02/2026 00:00	Wolves	-1	-1	Aston Villa
28	28/02/2026 00:00	Newcastle	-1	-1	Everton
28	28/02/2026 00:00	Man Utd	-1	-1	Crystal Palace
28	28/02/2026 00:00	Liverpool	-1	-1	West Ham
28	28/02/2026 00:00	Leeds	-1	-1	Man City
28	28/02/2026 00:00	Fulham	-1	-1	Tottenham
28	28/02/2026 00:00	Burnley	-1	-1	Brentford
28	28/02/2026 00:00	Brighton	-1	-1	Notts Forest
28	28/02/2026 00:00	Arsenal	-1	-1	Chelsea
28	28/02/2026 00:00	Bournemouth	-1	-1	Sunderland
29	04/03/2026 00:00	Wolves	-1	-1	Liverpool
29	04/03/2026 00:00	Tottenham	-1	-1	Crystal Palace
29	04/03/2026 00:00	Newcastle	-1	-1	Man Utd
29	04/03/2026 00:00	Man City	-1	-1	Notts Forest
29	04/03/2026 00:00	Leeds	-1	-1	Sunderland
29	04/03/2026 00:00	Fulham	-1	-1	West Ham
29	04/03/2026 00:00	Everton	-1	-1	Burnley
29	04/03/2026 00:00	Brighton	-1	-1	Arsenal
29	04/03/2026 00:00	Aston Villa	-1	-1	Chelsea
29	04/03/2026 00:00	Bournemouth	-1	-1	Brentford
30	14/03/2026 00:00	West Ham	-1	-1	Man City
30	14/03/2026 00:00	Sunderland	-1	-1	Brighton
30	14/03/2026 00:00	Notts Forest	-1	-1	Fulham
30	14/03/2026 00:00	Man Utd	-1	-1	Aston Villa
30	14/03/2026 00:00	Liverpool	-1	-1	Tottenham
30	14/03/2026 00:00	Crystal Palace	-1	-1	Leeds
30	14/03/2026 00:00	Chelsea	-1	-1	Newcastle
30	14/03/2026 00:00	Burnley	-1	-1	Bournemouth
30	14/03/2026 00:00	Brentford	-1	-1	Wolves
30	14/03/2026 00:00	Arsenal	-1	-1	Everton
31	21/03/2026 00:00	Wolves	-1	-1	Arsenal
31	21/03/2026 00:00	Tottenham	-1	-1	Notts Forest
31	21/03/2026 00:00	Newcastle	-1	-1	Sunderland
31	21/03/2026 00:00	Man City	-1	-1	Crystal Palace
31	21/03/2026 00:00	Leeds	-1	-1	Brentford
31	21/03/2026 00:00	Fulham	-1	-1	Burnley
31	21/03/2026 00:00	Everton	-1	-1	Chelsea
31	21/03/2026 00:00	Brighton	-1	-1	Liverpool
31	21/03/2026 00:00	Aston Villa	-1	-1	West Ham
31	21/03/2026 00:00	Bournemouth	-1	-1	Man Utd
32	11/04/2026 00:00	West Ham	-1	-1	Wolves
32	11/04/2026 00:00	Sunderland	-1	-1	Tottenham
32	11/04/2026 00:00	Notts Forest	-1	-1	Aston Villa
32	11/04/2026 00:00	Man Utd	-1	-1	Leeds
32	11/04/2026 00:00	Liverpool	-1	-1	Fulham
32	11/04/2026 00:00	Crystal Palace	-1	-1	Newcastle
32	11/04/2026 00:00	Chelsea	-1	-1	Man City
32	11/04/2026 00:00	Burnley	-1	-1	Brighton
32	11/04/2026 00:00	Brentford	-1	-1	Everton
32	11/04/2026 00:00	Arsenal	-1	-1	Bournemouth
33	18/04/2026 00:00	Tottenham	-1	-1	Brighton
33	18/04/2026 00:00	Notts Forest	-1	-1	Burnley
33	18/04/2026 00:00	Newcastle	-1	-1	Bournemouth
33	18/04/2026 00:00	Man City	-1	-1	Arsenal
33	18/04/2026 00:00	Leeds	-1	-1	Wolves
33	18/04/2026 00:00	Everton	-1	-1	Liverpool
33	18/04/2026 00:00	Crystal Palace	-1	-1	West Ham
33	18/04/2026 00:00	Chelsea	-1	-1	Man Utd
33	18/04/2026 00:00	Brentford	-1	-1	Fulham
33	18/04/2026 00:00	Aston Villa	-1	-1	Sunderland
34	25/04/2026 00:00	Wolves	-1	-1	Tottenham
34	25/04/2026 00:00	West Ham	-1	-1	Everton
34	25/04/2026 00:00	Sunderland	-1	-1	Notts Forest
34	25/04/2026 00:00	Man Utd	-1	-1	Brentford
34	25/04/2026 00:00	Liverpool	-1	-1	Crystal Palace
34	25/04/2026 00:00	Fulham	-1	-1	Aston Villa
34	25/04/2026 00:00	Burnley	-1	-1	Man City
34	25/04/2026 00:00	Brighton	-1	-1	Chelsea
34	25/04/2026 00:00	Arsenal	-1	-1	Newcastle
34	25/04/2026 00:00	Bournemouth	-1	-1	Leeds
35	02/05/2026 00:00	Wolves	-1	-1	Sunderland
35	02/05/2026 00:00	Newcastle	-1	-1	Brighton
35	02/05/2026 00:00	Man Utd	-1	-1	Liverpool
35	02/05/2026 00:00	Leeds	-1	-1	Burnley
35	02/05/2026 00:00	Everton	-1	-1	Man City
35	02/05/2026 00:00	Chelsea	-1	-1	Notts Forest
35	02/05/2026 00:00	Brentford	-1	-1	West Ham
35	02/05/2026 00:00	Aston Villa	-1	-1	Tottenham
35	02/05/2026 00:00	Arsenal	-1	-1	Fulham
35	02/05/2026 00:00	Bournemouth	-1	-1	Crystal Palace
36	09/05/2026 00:00	West Ham	-1	-1	Arsenal
36	09/05/2026 00:00	Tottenham	-1	-1	Leeds
36	09/05/2026 00:00	Sunderland	-1	-1	Man Utd
36	09/05/2026 00:00	Notts Forest	-1	-1	Newcastle
36	09/05/2026 00:00	Man City	-1	-1	Brentford
36	09/05/2026 00:00	Liverpool	-1	-1	Chelsea
36	09/05/2026 00:00	Fulham	-1	-1	Bournemouth
36	09/05/2026 00:00	Crystal Palace	-1	-1	Everton
36	09/05/2026 00:00	Burnley	-1	-1	Aston Villa
36	09/05/2026 00:00	Brighton	-1	-1	Wolves
37	17/05/2026 00:00	Wolves	-1	-1	Fulham
37	17/05/2026 00:00	Newcastle	-1	-1	West Ham
37	17/05/2026 00:00	Man Utd	-1	-1	Notts Forest
37	17/05/2026 00:00	Leeds	-1	-1	Brighton
37	17/05/2026 00:00	Everton	-1	-1	Sunderland
37	17/05/2026 00:00	Chelsea	-1	-1	Tottenham
37	17/05/2026 00:00	Brentford	-1	-1	Crystal Palace
37	17/05/2026 00:00	Aston Villa	-1	-1	Liverpool
37	17/05/2026 00:00	Arsenal	-1	-1	Burnley
37	17/05/2026 00:00	Bournemouth	-1	-1	Man City
38	24/05/2026 00:00	West Ham	-1	-1	Leeds
38	24/05/2026 00:00	Tottenham	-1	-1	Everton
38	24/05/2026 00:00	Sunderland	-1	-1	Chelsea
38	24/05/2026 00:00	Notts Forest	-1	-1	Bournemouth
38	24/05/2026 00:00	Man City	-1	-1	Aston Villa
38	24/05/2026 00:00	Liverpool	-1	-1	Brentford
38	24/05/2026 00:00	Fulham	-1	-1	Newcastle
38	24/05/2026 00:00	Crystal Palace	-1	-1	Arsenal
38	24/05/2026 00:00	Burnley	-1	-1	Wolves
38	24/05/2026 00:00	Brighton	-1	-1	Man Utd
`;

function FixturesImporter() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasImported, setHasImported] = React.useState(false);

    const handleImport = async () => {
        setIsLoading(true);
        toast({ title: 'Importing fixtures...', description: 'Please wait while we add the new matches to the database.' });
        try {
            const fixtures = rawFixtureData.trim().split('\n').map(line => {
                const [week, date, time, homeTeamName, homeScore, awayScore, awayTeamName] = line.split('\t');
                const homeTeamId = teamNameToIdMap[homeTeamName];
                const awayTeamId = teamNameToIdMap[awayTeamName];
                
                if (!homeTeamId || !awayTeamId) {
                    console.warn(`Could not find team ID for match: ${homeTeamName} vs ${awayTeamName}`);
                    return null;
                }

                const matchDate = new Date(`${date.split('/').reverse().join('-')}T${time}:00`).toISOString();

                return {
                    id: `${week}-${homeTeamId}-${awayTeamId}`,
                    week: parseInt(week, 10),
                    homeTeamId: homeTeamId,
                    awayTeamId: awayTeamId,
                    homeScore: parseInt(homeScore, 10),
                    awayScore: parseInt(awayScore, 10),
                    matchDate: matchDate,
                };
            }).filter(Boolean);

            const parsedResults = MatchResultSchema.array().safeParse(fixtures);
            if (!parsedResults.success) {
                throw new Error('Fixture data validation failed.');
            }

            const result = await updateMatchResults({ results: parsedResults.data });

            if (result.success) {
                toast({ title: 'Import successful!', description: `${result.updatedCount} fixtures have been added.` });
                setHasImported(true);
            } else {
                throw new Error('The import flow reported a failure.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Import Failed', description: error.message || 'An unknown error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (hasImported) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-green-600">Import Complete</CardTitle>
                    <CardDescription>
                        The fixture data has been successfully imported. You can now remove the `FixturesImporter` component and related code from `src/app/admin/page.tsx`.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import Season Fixtures (Weeks 19-38)</CardTitle>
                <CardDescription>
                    Click the button below to import the remaining 200 fixtures for the season into the database. This is a one-time operation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleImport} disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : 'Import Fixtures'}
                </Button>
            </CardContent>
        </Card>
    );
}


export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [dbStatus, setDbStatus] = React.useState<{ connected: boolean, message: string }>({ connected: false, message: 'Checking connection...' });

  const [isUpdatingMatches, setIsUpdatingMatches] = React.useState(false);

  const [selectedWeek, setSelectedWeek] = React.useState<number | null>(null);
  const [weekFixtures, setWeekFixtures] = React.useState<EditableMatch[]>([]);
  const [scores, setScores] = React.useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});
  
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  
  const { data: teamsData, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);

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

  const handleWeekChange = (weekStr: string) => {
    const week = parseInt(weekStr);
    setSelectedWeek(week);

    const fixturesForWeek = (matchesData || [])
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

    setWeekFixtures(fixturesForWeek);

    const initialScores = fixturesForWeek.reduce((acc, match) => {
        acc[match.id] = { homeScore: String(match.homeScore), awayScore: String(match.awayScore) };
        return acc;
    }, {} as {[matchId: string]: {homeScore: string, awayScore: string}});
    setScores(initialScores);
  };

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
    if (selectedWeek === null) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot save results. Week not selected.' });
        return;
    }
    setIsUpdatingMatches(true);
    toast({
      title: `Updating Week ${selectedWeek} Results...`,
      description: 'Saving results via AI flow.',
    });
    
    try {
        const resultsToUpdate = Object.entries(scores).map(([matchId, scoreData]) => {
            const match = weekFixtures.find(f => f.id === matchId)!;
            return {
                id: match.id,
                week: match.week,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: parseInt(scoreData.homeScore, 10),
                awayScore: parseInt(scoreData.awayScore, 10),
                matchDate: match.matchDate,
            };
        });

        // Validate with Zod before sending to the flow
        const parsedResults = MatchResultSchema.array().safeParse(resultsToUpdate);

        if (!parsedResults.success) {
            console.error("Zod validation failed:", parsedResults.error);
            const errorMessages = parsedResults.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Data validation failed: ${errorMessages}`);
        }
        
        const validResults = parsedResults.data.filter(r => !isNaN(r.homeScore) && !isNaN(r.awayScore));

        if (validResults.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Valid Scores',
                description: 'No valid scores were entered for this week. Please enter scores before saving.',
            });
            setIsUpdatingMatches(false);
            return;
        }

        const flowResult = await updateMatchResults({ results: validResults });
        
        if (!flowResult.success) {
            throw new Error(`The AI flow reported an error during the update.`);
        }

        toast({
            title: `Week ${selectedWeek} Updated!`,
            description: `${flowResult.updatedCount} match records were successfully updated via the AI flow.`,
        });

    } catch (error: any) {
        console.error(`Error updating match results for week ${selectedWeek}:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsUpdatingMatches(false);
    }
  };

  const isLoading = teamsLoading || matchesLoading || !firestore || !dbStatus.connected;
  
  const allWeeks = React.useMemo(() => {
    // Show all 38 weeks regardless of whether fixtures exist yet.
    return Array.from({ length: 38 }, (_, i) => i + 1);
  }, []);

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

      <FixturesImporter />

      <Card>
          <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>
                  Check the connection to the Firestore database.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center gap-4 rounded-lg border p-4">
              {dbStatus.connected ? <Icons.shieldCheck className="h-6 w-6 text-green-500" /> : <Icons.bug className="h-6 w-6 text-red-500" />}
              <p className="font-medium">{dbStatus.message}</p>
              </div>
          </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Update Match Results</CardTitle>
              <CardDescription>
                  Select a week to view its fixtures, enter the scores, and save the results to the database. Use a value of -1 for scores that are not yet final. This is disabled until the database is connected.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <Select onValueChange={handleWeekChange} disabled={isLoading}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a week" />
                  </SelectTrigger>
                  <SelectContent>
                      {allWeeks.map(week => (
                          <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>

              {selectedWeek !== null && isLoading && <div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading fixture data...</div>}

              {selectedWeek !== null && !isLoading && (
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
                            <Button onClick={handleSaveWeekResults} disabled={isUpdatingMatches || isLoading}>
                                {isUpdatingMatches ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : `Save Week ${selectedWeek} Results`}
                            </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No fixtures found for Week {selectedWeek}.</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
