
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
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.rank - b.rank);
  }, []);

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
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Player Position Graph</h1>
        <p className="text-slate-400">
          Track player rank progression over the season.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Player Position By Week</CardTitle>
          <CardDescription>
            Each line represents a player's rank over the weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerRankChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={sortedUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
