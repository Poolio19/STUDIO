'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Trophy, Swords, Medal } from 'lucide-react';

export default function RulesAndScoringPage() {
  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Swords className="size-6 text-primary" />
                    Beat the Pros Bounty
                </CardTitle>
                <CardDescription>Extra rewards for outperforming the experts.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Any regular player who finishes the season ranked higher than <strong>ALL</strong> of "THE PROs" (BBC, Guardian, Supercomputer, etc.) will receive a potential bounty prize.
                </p>
                <div className="flex items-center justify-between p-3 bg-card rounded-md border shadow-sm">
                    <span className="font-bold">Pro Slayer Bonus</span>
                    <span className="text-lg font-bold text-primary">£5.00</span>
                </div>
            </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="size-6 text-yellow-600" />
                    Season Prize Tiers
                </CardTitle>
                <CardDescription>Based on final league position (Regular Players only).</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[
                        { rank: '1st', label: 'Champion', prize: '£50.00', icon: Trophy },
                        { rank: '2nd', label: 'Runner Up', prize: '£41.00', icon: Medal },
                        { rank: '3rd', label: '3rd Place', prize: '£33.00', icon: Medal },
                        { rank: '4th', label: '4th Place', prize: '£26.00', icon: null },
                        { rank: '5th', label: '5th Place', prize: '£20.00', icon: null },
                    ].map((tier) => (
                        <div key={tier.rank} className="flex items-center justify-between p-2 bg-card rounded border text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-bold w-8">{tier.rank}</span>
                                <span className="text-muted-foreground">{tier.label}</span>
                            </div>
                            <span className="font-bold">{tier.prize}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

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
