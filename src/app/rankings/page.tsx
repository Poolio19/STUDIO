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
import type { User, UserHistory, Match, Prediction } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import historicalPlayersData from '@/lib/historical-players.json';

export default function RankingsPage() {
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  const historiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(historiesQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);

  const isLoading = usersLoading || historiesLoading || matchesLoading || predictionsLoading;

  const currentWk = useMemo(() => {
    if (!matchesData) return 0;
    const played = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
    return played.length > 0 ? Math.max(...played.map(m => m.week)) : 0;
  }, [matchesData]);

  const activeUsers = useMemo(() => {
    if (!users || !predictions) return [];
    
    // Strictly filter for current season entries (historical ID or Pro, and valid prediction)
    const historicalUserIds = new Set(historicalPlayersData.map(p => p.id));
    const activeIds = new Set(predictions.filter(p => p.rankings?.length === 20).map(p => p.userId || (p as any).id));
    
    return users
        .filter(u => u.name && (historicalUserIds.has(u.id) || u.isPro) && activeIds.has(u.id))
        .sort((a, b) => a.rank - b.rank);
  }, [users, predictions]);

  const { chartData, yAxisDomain, chartConfig, legendUsers } = useMemo(() => {
    if (!activeUsers.length || !userHistories) return { chartData: [], yAxisDomain: [0, 10], chartConfig: {}, legendUsers: [] };
    
    const activeHistories = userHistories.filter(h => activeUsers.some(u => u.id === h.userId));
    const domain: [number, number] = [0, activeUsers.length + 1];

    const weeks = Array.from({ length: currentWk + 1 }, (_, i) => i);
    const data = weeks.map(week => {
      const entry: any = { week: `Wk ${week}` };
      activeHistories.forEach(h => {
        const u = activeUsers.find(user => user.id === h.userId);
        if (u) {
            const val = h.weeklyScores.find(w => w.week === week)?.rank;
            if (val && val > 0) entry[u.name] = val;
        }
      });
      return entry;
    });

    const config = activeUsers.reduce((acc, u, i) => {
      acc[u.name] = { label: u.name, colour: `hsl(var(--chart-color-${(i % 50) + 1}))` };
      return acc;
    }, {} as any);
    
    const numRows = 13; const numCols = Math.ceil(activeUsers.length / numRows);
    const legend: (User | undefined)[] = new Array(numCols * numRows).fill(undefined);
    activeUsers.forEach((u, i) => legend[(i % numRows) * numCols + Math.floor(i / numRows)] = u);

    return { chartData: data, yAxisDomain: domain, chartConfig: config, legendUsers: legend };
  }, [activeUsers, userHistories, currentWk]);

  const surnameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeUsers.forEach(u => {
      const parts = u.name.split(' ');
      const s = parts[parts.length - 1];
      counts.set(s, (counts.get(s) || 0) + 1);
    });
    return counts;
  }, [activeUsers]);

  const formatLegendName = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      const s = parts[parts.length - 1];
      return surnameCounts.get(s) === 1 ? s : `${parts[0].charAt(0)} ${s}`;
    }
    return name;
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
          <Card className="flex justify-center items-center h-[600px]"><Loader2 className="size-8 animate-spin text-muted-foreground" /></Card>
      ) : (
          <Card>
            <CardHeader><CardTitle>Player Position By Week</CardTitle><CardDescription>Weekly rank progression for active season players.</CardDescription></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-x-4 gap-y-1 text-[10px] mb-6">
                    {legendUsers.map((u, i) => {
                        if (!u) return <div key={i} />;
                        return (
                            <div key={u.id} className="flex items-center space-x-2 truncate">
                                <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: chartConfig[u.name]?.colour }}></span>
                                <span className="truncate">{`${u.rank} ${formatLegendName(u.name)}`}</span>
                            </div>
                        );
                    })}
                </div>
              <PlayerRankChart chartData={chartData} yAxisDomain={yAxisDomain} sortedUsers={activeUsers} chartConfig={chartConfig} currentUserId={resolvedUserId} />
            </CardContent>
          </Card>
      )}
    </div>
  );
}