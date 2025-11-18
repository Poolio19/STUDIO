
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
import { PlayerPerformanceChart } from '@/components/charts/player-performance-chart';

export default function PerformancePage() {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.rank - b.rank);
  }, []);

  const { chartData, yAxisDomain } = useMemo(() => {
    const allScores = userHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const yAxisDomain: [number, number] = [minScore - 5, maxScore + 5];

    const weeks = [...new Set(userHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].sort((a,b) => a-b);
    
    const transformedData = weeks.map(week => {
      const weekData: { [key: string]: number | string } = { week: `Wk ${week}` };
      userHistories.forEach(history => {
        const user = users.find(u => u.id === history.userId);
        if (user) {
          const weekScore = history.weeklyScores.find(w => w.week === week);
          if (weekScore) {
            weekData[user.name] = weekScore.score;
          }
        }
      });
      return weekData;
    });

    return { chartData: transformedData, yAxisDomain };
  }, []);

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Player Performance</h1>
        <p className="text-slate-400">
          Track player score progression over the season.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Player Scores By Week</CardTitle>
          <CardDescription>
            Each line represents a player's total score over the weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerPerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={sortedUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
