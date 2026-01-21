'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function LegendsPage() {
  return (
    <div className="space-y-8">
      <Card className="flex flex-col items-center justify-center text-center h-96">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The PredLegends page is coming soon, showcasing the historical winners of the competition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Check back later to see the hall of fame!</p>
        </CardContent>
      </Card>
    </div>
  );
}
