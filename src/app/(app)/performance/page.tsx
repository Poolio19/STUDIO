
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { PlayerPerformanceChart } from '@/components/charts/player-performance-chart';
import type { User, UserHistory } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function PerformancePage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const usersQuery = useMemoFirebase(() => !isUserLoading && firestore ? query(collection(firestore, 'users'), orderBy('rank', 'asc')) : null, [firestore, isUserLoading]);
  const userHistoriesQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'userHistories') : null, [firestore, isUserLoading]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(userHistoriesQuery);
  
  const isLoading = isUserLoading || usersLoading || historiesLoading;

  const sortedUsers = users || [];

  const { chartData, yAxisDomain } = useMemo(() => {
    if (!users || !userHistories) return { chartData: [], yAxisDomain: [0, 0] };
    
    const allScores = userHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0, 10] };
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
  }, [users, userHistories]);

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Player Score Graph</h1>
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
            {isLoading ? (
                <div className="flex justify-center items-center h-[600px]">Loading chart data...</div>
            ) : (
                <PlayerPerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={sortedUsers} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
