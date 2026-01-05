
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

  const { chartData, yAxisDomain, chartConfig } = useMemo(() => {
    if (!users || !userHistories) return { chartData: [], yAxisDomain: [0, 0], chartConfig: {} };
    
    const allScores = userHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));

    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0, 10], chartConfig: {} };
    
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

    const config = sortedUsers.reduce((config, user, index) => {
      config[user.name] = {
        label: user.name,
        colour: `hsl(var(--chart-color-${index + 1}))`,
      };
      return config;
    }, {} as any);


    return { chartData: transformedData, yAxisDomain, chartConfig: config };
  }, [users, userHistories, sortedUsers]);

  const surnameCounts = useMemo(() => {
    if (!sortedUsers) return new Map<string, number>();
    const counts = new Map<string, number>();
    sortedUsers.forEach(user => {
      if (user.isPro) return;
      const parts = user.name.split(' ');
      const surname = parts[parts.length - 1];
      counts.set(surname, (counts.get(surname) || 0) + 1);
    });
    return counts;
  }, [sortedUsers]);

  const formatNameForLegend = (name: string) => {
    if (name.startsWith('THE ')) {
      return name.substring(4);
    }
    const parts = name.split(' ');
    if (parts.length > 1) {
      const surname = parts[parts.length - 1];
      if (surnameCounts.get(surname) === 1) {
        return surname;
      }
      return `${parts[0].charAt(0)} ${surname}`;
    }
    return name;
  };

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Player Score Graph</h1>
        <p className="text-slate-400">
          Track player score progression over the season.
        </p>
      </header>

      {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">Loading chart data...</div>
      ) : (
          <Card>
            <CardHeader>
              <CardTitle>Player Scores By Week</CardTitle>
              <CardDescription>
                Each line represents a player's total score over the weeks.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-flow-col grid-rows-12 gap-x-4 gap-y-0 text-xs mb-6">
                    {sortedUsers.map((user: User) => {
                    const userConfig = chartConfig[user.name];
                    if (!userConfig) return null;
                    const formattedName = formatNameForLegend(user.name);
                    return (
                        <div key={user.id} className="flex items-center space-x-2 truncate py-0">
                        <span
                            className="inline-block h-2 w-2 rounded-sm shrink-0"
                            style={{ backgroundColor: userConfig.colour }}
                        ></span>
                        <span className="truncate" title={`${user.name} ${user.score}`}>{`${formattedName} ${user.score}`}</span>
                        </div>
                    );
                    })}
                </div>
              <PlayerPerformanceChart 
                chartData={chartData} 
                yAxisDomain={yAxisDomain} 
                sortedUsers={sortedUsers} 
                chartConfig={chartConfig}
              />
            </CardContent>
          </Card>
      )}
    </div>
  );
}
