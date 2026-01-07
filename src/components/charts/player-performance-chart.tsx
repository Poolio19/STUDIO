
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

interface PlayerPerformanceChartProps {
    chartData: any[];
    yAxisDomain: [number, number];
    sortedUsers: User[];
    chartConfig: any;
}


export function PlayerPerformanceChart({ chartData, yAxisDomain, sortedUsers, chartConfig }: PlayerPerformanceChartProps) {
  
  const yAxisTicks = React.useMemo(() => {
    if (!yAxisDomain) return [];
    const [min, max] = yAxisDomain;
    const ticks = [];
    const start = Math.ceil(min / 10) * 10;
    for (let i = start; i <= max; i += 10) {
      ticks.push(i);
    }
    return ticks;
  }, [yAxisDomain]);

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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
