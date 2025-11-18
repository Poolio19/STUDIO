
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { users, userHistories } from '@/lib/data';
import { useMemo } from 'react';
import { PlayerRankChart } from '@/components/charts/player-rank-chart';

export default function RankingsPage() {
  const { chartData, yAxisDomain } = useMemo(() => {
    const totalPlayers = users.length;
    const yAxisDomain: [number, number] = [1, totalPlayers];

    const weeks = [...new Set(userHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.week)))].sort((a,b) => a-b);
    
    const transformedData = weeks.map(week => {
      const weekData: { [key: string]: number | string } = { week: `Wk ${week}` };
      userHistories.forEach(history => {
        const user = users.find(u => u.id === history.userId);
        if (user) {
          const weekScore = history.weeklyScores.find(w => w.week === week);
          if (weekScore && weekScore.rank > 0) {
            weekData[user.name] = weekScore.rank;
          }
        }
      });
      return weekData;
    });

    return { chartData: transformedData, yAxisDomain };
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">PlayerRankings</h1>
        <p className="text-muted-foreground">
          Track player rank progression over the season.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>PlayerPositionByWeek</CardTitle>
          <CardDescription>
            Each line represents a player's rank over the weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerRankChart chartData={chartData} yAxisDomain={yAxisDomain} />
        </CardContent>
      </Card>
    </div>
  );
}
