
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
import { collection, query } from 'firebase/firestore';

export default function PerformancePage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const usersQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'users') : null, [firestore, isUserLoading]);
  const userHistoriesQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'userHistories') : null, [firestore, isUserLoading]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(userHistoriesQuery);
  
  const isLoading = isUserLoading || usersLoading || historiesLoading;

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a, b) => a.rank - b.rank);
  }, [users]);

  // Filter for top 20 users for the chart
  const top20Users = useMemo(() => {
    return sortedUsers.slice(0, 20);
  }, [sortedUsers]);
  
  const top20UserIds = useMemo(() => {
    return new Set(top20Users.map(u => u.id));
  }, [top20Users]);


  const { chartData, yAxisDomain } = useMemo(() => {
    if (!users || !userHistories || top20Users.length === 0) return { chartData: [], yAxisDomain: [0, 0] };
    
    const relevantUserHistories = userHistories.filter(h => top20UserIds.has(h.userId));
    const allScores = relevantUserHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));

    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0, 10] };
    
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const yAxisDomain: [number, number] = [minScore - 5, maxScore + 5];

    const weeks = [...new Set(userHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].sort((a,b) => a-b);
    
    const transformedData = weeks.map(week => {
      const weekData: { [key: string]: number | string } = { week: `Wk ${week}` };
      relevantUserHistories.forEach(history => {
        const user = top20Users.find(u => u.id === history.userId); 
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
  }, [users, userHistories, top20Users, top20UserIds]);

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
          <CardTitle>Top 20 Player Scores By Week</CardTitle>
          <CardDescription>
            Each line represents a player's total score over the weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-[600px]">Loading chart data...</div>
            ) : (
                <PlayerPerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={top20Users} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
