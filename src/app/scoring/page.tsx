'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Trophy, Swords, Medal, Info } from 'lucide-react';

export default function RulesAndScoringPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
          <CardDescription>
            Points are awarded based on the accuracy of your predictions for the 20 teams' final league positions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-2">For Each Team Prediction:</h3>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li><span className="font-bold text-primary">5 points</span> for an exact position match.</li>
              <li><span className="font-bold text-destructive">-1 point</span> for every position your prediction is away from the actual result.</li>
              <li>Formula: <code className="bg-muted px-1 rounded">5 - abs(predicted - actual)</code>.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Swords className="size-6 text-primary" />Beat the Pros Bounty</CardTitle>
                <CardDescription>Rewards for strictly outperforming the experts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>A regular player is a "Pro Slayer" if they strictly outrank <strong>ALL</strong> professionals and finish outside the Top 10 prize positions.</p>
                <div className="p-3 bg-card rounded-md border shadow-sm flex justify-between items-center">
                    <span className="font-bold">Bounty Reward</span>
                    <span className="text-lg font-bold text-primary">£5.00 per Slayer</span>
                </div>
                <p className="text-[10px] italic">* The total bounty paid out varies week to week based on the number of eligible slayers.</p>
            </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="size-6 text-yellow-600" />Seasonal Prize Fund</CardTitle>
                <CardDescription>Based on 106 entries (£530 total pot).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">The net fund (after MiMoM, Xmas, and Slayer deductions) is divided among the Top 10:</p>
                <ul className="space-y-1 text-sm">
                    <li className="flex justify-between"><span>10th Place</span><span className="font-bold">3.0073% of Net Fund</span></li>
                    <li className="flex justify-between"><span>Higher Ranks</span><span className="font-bold">1.25x the rank below</span></li>
                </ul>
                <Alert className="bg-background/50 border-yellow-500/30">
                    <Info className="size-4" />
                    <AlertDescription className="text-[10px]">
                        <strong>The Pro Rule:</strong> Pros always win ties. They receive £0 but consume the higher rank prize slot, pushing regular players into the lower shared positions.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
