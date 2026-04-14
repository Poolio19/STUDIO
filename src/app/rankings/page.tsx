
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
import type { User, UserHistory, Prediction } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const historiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: userHistories, isLoading: historiesLoading } = useCollection<UserHistory>(historiesQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection<Prediction>(predictionsQuery);

  const isLoading = usersLoading || historiesLoading || predictionsLoading;

  const activeUsers = useMemo(() => {
    if (!users || !predictions) return [];
    const activeIds = new Set(predictions.filter(p => p.rankings?.length === 20).map(p => p.userId || (p as any).id));
    
    return users
        .filter(u => u.name && activeIds.has(u.id))
        .sort((a, b) => a.rank - b.rank);
  }, [users, predictions]);

  const { chartData, yAxisDomain, chartConfig, legendUsers, currentWk } = useMemo(() => {
    if (!activeUsers.length || !userHistories) return { chartData: [], yAxisDomain: [0, 10], chartConfig: {}, legendUsers: [], currentWk: 0 };
    
    const activeHistories = userHistories.filter(h => activeUsers.some(u => u.id === h.userId));
    
    const allWks = activeHistories.flatMap(h => h.weeklyScores.map(ws => Number(ws.week)));
    const maxWk = allWks.length > 0 ? Math.max(...allWks) : 0;

    const domain: [number, number] = [0, activeUsers.length + 1];

    const weeks = Array.from({ length: maxWk + 1 }, (_, i) => i);
    const data = weeks.map(week => {
      const entry: any = { week: `Wk ${week}` };
      activeHistories.forEach(h => {
        const u = activeUsers.find(user => user.id === h.userId);
        if (u) {
            const val = h.weeklyScores.find(w => Number(w.week) === week)?.rank;
            if (val && val > 0) entry[u.name] = val;
        }
      });
      return entry;
    });

    const config = activeUsers.reduce((acc, u, i) => {
      acc[u.name] = { label: u.name, colour: `hsl(var(--chart-color-${(i % 100) + 1}))` };
      return acc;
    }, {} as any);
    
    const numRows = 13; const numCols = Math.ceil(activeUsers.length / numRows);
    const legend: (User | undefined)[] = new Array(numCols * numRows).fill(undefined);
    activeUsers.forEach((u, i) => legend[(i % numRows) * numCols + Math.floor(i / numRows)] = u);

    return { chartData: data, yAxisDomain: domain, chartConfig: config, legendUsers: legend, currentWk: maxWk };
  }, [activeUsers, userHistories]);

  const surnameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeUsers.forEach(u => {
      if (u.name) {
        const parts = u.name.split(' ');
        const s = parts[parts.length - 1];
        counts.set(s, (counts.get(s) || 0) + 1);
      }
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
            <CardHeader><CardTitle>Player Position By Week</CardTitle><CardDescription>Weekly rank progression up to Week {currentWk}.</CardDescription></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-x-4 gap-y-1 text-[10px] mb-6">
                    {legendUsers.map((u, i) => {
                        if (!u) return <div key={i} />;
                        const isMe = u.id === resolvedUserId;
                        return (
                            <div key={u.id} className={cn(
                                "flex items-center space-x-2 truncate p-1 rounded transition-all", 
                                isMe && "bg-primary/20 ring-1 ring-primary/50 scale-105 shadow-sm"
                            )}>
                                <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: chartConfig[u.name]?.colour }}></span>
                                <span className={cn("truncate", isMe && "font-black text-primary")}>{`${u.rank} ${formatLegendName(u.name)}`}</span>
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
