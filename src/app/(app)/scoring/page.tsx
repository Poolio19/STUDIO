'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//     title: 'Rules and Scoring | PremPred 2025-2026',
//     description: 'Understand how scores are calculated and the rules of the game.',
// };

export default function RulesAndScoringPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Rules And Scoring</h1>
        <p className="text-muted-foreground">
          Understand how scores are calculated and other important rules.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
          <CardDescription>
            Points are awarded based on the accuracy of your predictions for each
            of the 20 teams' final league positions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-2">
              For Each Team Prediction:
            </h3>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="font-bold text-primary">5 points</span> are awarded for correctly predicting a team's exact
                final position.
              </li>
              <li>
                For each position your prediction is away from the actual
                final position, <span className="font-bold text-destructive">1 point</span> is subtracted from the initial 5
                points.
              </li>
              <li>
                The formula for a single team's score is:{' '}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  5 - abs(predicted_position - actual_position)
                </code>
                .
              </li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-2">Example Calculation</h3>
            <p className="text-muted-foreground mb-2">
              Let's say a team finishes in 1st place:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>If you predicted 1st: you get 5 points.</li>
              <li>If you predicted 2nd: you get 4 points (5 - 1).</li>
              <li>If you predicted 6th: you get 0 points (5 - 5).</li>
              <li>If you predicted 10th: you get -4 points (5 - 9).</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-2">Total Score</h3>
            <p className="text-muted-foreground">
              Your total score for the season is the sum of the points you've
              earned for all 20 teams. This can be a positive or negative number.
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Important: Penalties</AlertTitle>
        <AlertDescription>
          <p>
            Late entry into the prediction league or late payment of league fees
            will result in penalties being applied to your total score. Please
            ensure your predictions and payments are submitted on time to avoid
            any deductions.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
