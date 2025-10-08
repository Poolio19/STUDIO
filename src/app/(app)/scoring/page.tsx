'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';

import {
  calculatePredictionScores,
  CalculatePredictionScoresOutput,
} from '@/ai/flows/calculate-prediction-scores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { users, predictions } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const initialUserPredictions = predictions.map(p => 
    `User ${p.userId} predicted standings: ${p.rankings.join(', ')}`
).join('\n');

const initialActualResults = `Final Standings: team_1, team_2, team_3, team_4, team_5, team_6, team_7, team_8, team_9, team_10, team_11, team_12, team_13, team_14, team_15, team_16, team_17, team_18, team_19, team_20`;

type State = {
  result: CalculatePredictionScoresOutput | null;
  error: string | null;
};

async function handleAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const actualResults = formData.get('actualResults') as string;
  const userPredictions = formData.get('userPredictions') as string;
  
  if (!actualResults || !userPredictions) {
    return { result: null, error: 'Please fill in all fields.' };
  }

  try {
    const result = await calculatePredictionScores({
      actualFinalStandings: actualResults,
      userRankings: userPredictions,
    });
    return { result, error: null };
  } catch (e: any) {
    return { result: null, error: e.message || 'An unknown error occurred.' };
  }
}

export default function ScoringPage() {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(handleAction, { result: null, error: null });
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    await formAction(formData);
    setPending(false);
  };

  if (formState.error) {
    toast({
      variant: 'destructive',
      title: 'Scoring Error',
      description: formState.error,
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Automated Scoring</h1>
        <p className="text-muted-foreground">Input final league standings to let the AI calculate player scores.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Score Calculation</CardTitle>
          <CardDescription>Enter the final league standings and user predictions to calculate scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="actualResults">Actual Final Standings</Label>
                <Textarea
                  id="actualResults"
                  name="actualResults"
                  placeholder="e.g., Final Standings: team_1, team_2, team_3, ..."
                  rows={8}
                  defaultValue={initialActualResults}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userPredictions">User Predicted Rankings</Label>
                <Textarea
                  id="userPredictions"
                  name="userPredictions"
                  placeholder="e.g., User usr_1 predicted standings: team_5, team_2, team_1, ..."
                  rows={8}
                  defaultValue={initialUserPredictions}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? 'Calculating...' : 'Calculate Scores'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {formState.result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Calculated Scores</CardTitle>
                    <CardDescription>The new scores calculated by the AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(formState.result.scores).map(([userId, score]) => {
                                const user = users.find(u => u.id === userId);
                                return (
                                    <TableRow key={userId}>
                                        <TableCell>{user ? user.name : userId}</TableCell>
                                        <TableCell className="text-right font-bold">{score}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Scoring Summary</CardTitle>
                    <CardDescription>The AI's summary of the scoring process.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formState.result.summary}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
