
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { PlayerRankChart } from '@/components/charts/player-rank-chart';
import type { User, UserHistory } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export default function RankingsPage() {
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


  const { chartData, yAxisDomain } = useMemo(() => {
    if (!users || !userHistories) return { chartData: [], yAxisDomain: [1, 20] };
    
    const totalPlayers = users.length > 0 ? users.length : 20;
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
  }, [users, userHistories]);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-[600px]">Loading chart data...</div>
          ) : (
            <PlayerRankChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={sortedUsers} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    