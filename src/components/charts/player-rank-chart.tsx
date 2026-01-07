
'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

import {
  ChartContainer,
} from '@/components/ui/chart';
import { User } from '@/lib/data';
import * as React from 'react';

interface PlayerRankChartProps {
    chartData: any[];
    yAxisDomain: [number, number];
    sortedUsers: User[];
    chartConfig: any;
}

export function PlayerRankChart({ chartData, yAxisDomain, sortedUsers, chartConfig }: PlayerRankChartProps) {
  
  const yAxisTicks = React.useMemo(() => {
    if (!yAxisDomain) return [];
    
    const ticks: number[] = [1];
    for (let i = 5; i <= 109; i += 5) {
      ticks.push(i);
    }
    if (!ticks.includes(109)) {
        ticks.push(109);
    }

    return ticks.sort((a, b) => a - b);
  }, []);


  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="h-[600px] w-full">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: -20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              reversed
              domain={yAxisDomain}
              ticks={yAxisTicks}
            />
              {sortedUsers.map((user) => (
                  <Line
                  key={user.id}
                  dataKey={user.name}
                  type="monotone"
                  stroke={chartConfig[user.name]?.colour}
                  strokeWidth={2}
                  dot={false}
                  />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
