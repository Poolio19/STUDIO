
'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { users } from '@/lib/data';
import * as React from 'react';

interface PlayerPerformanceChartProps {
  chartData: any[];
  yAxisDomain: [number, number];
}

const chartConfig = users.reduce((config, user, index) => {
  config[user.name] = {
    label: user.name,
    colour: `hsl(var(--chart-color-${index + 1}))`,
  };
  return config;
}, {} as any);


export function PlayerPerformanceChart({ chartData, yAxisDomain }: PlayerPerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[600px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 40,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={
                <ChartTooltipContent
                    labelKey="name"
                    indicator="dot"
                    formatter={(value, name) => (
                       <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: `var(--colour-${name})` }}/>
                        <span className="font-medium">{name}:</span>
                        <span className="text-muted-foreground">{value} pts</span>
                       </div>
                    )}
                />
            }
          />
          <Legend />
            {users.map((user) => (
                <Line
                key={user.id}
                dataKey={user.name}
                type="monotone"
                stroke={`var(--colour-${user.name})`}
                strokeWidth={2}
                dot={false}
                />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

    