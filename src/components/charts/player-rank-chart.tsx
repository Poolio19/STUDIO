
'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
              tickCount={yAxisDomain[1]}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                  <ChartTooltipContent
                      labelKey="name"
                      indicator="dot"
                      formatter={(value, name) => {
                          return (
                           <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-sm" style={{ backgroundColor: chartConfig[name]?.colour }}/>
                            <span className="font-medium">{name}:</span>
                            <span className="text-muted-foreground">Rank {value}</span>
                           </div>
                        )
                      }}
                  />
              }
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
