
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

interface PlayerPerformanceChartProps {
    chartData: any[];
    yAxisDomain: [number, number];
    sortedUsers: User[];
}


export function PlayerPerformanceChart({ chartData, yAxisDomain, sortedUsers }: PlayerPerformanceChartProps) {
  
  const chartConfig = React.useMemo(() => {
    return sortedUsers.reduce((config, user, index) => {
      config[user.name] = {
        label: user.name,
        colour: `hsl(var(--chart-color-${index + 1}))`,
      };
      return config;
    }, {} as any);
  }, [sortedUsers]);
  
  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="h-[600px] w-full">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 320, // Increased right margin for wider legend
              left: -20,
              bottom: 20,
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
                      formatter={(value, name) => {
                        return (
                         <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-sm" style={{ backgroundColor: chartConfig[name]?.colour }}/>
                          <span className="font-medium">{name}:</span>
                          <span className="text-muted-foreground">{value} pts</span>
                         </div>
                      )}}
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
      <div
        className="absolute grid grid-cols-2 gap-x-4 gap-y-1"
        style={{
          right: 0,
          top: '20px',
          width: '300px', // Increased width for the legend container
          paddingLeft: '1rem',
          fontSize: '12px',
        }}
      >
        <p className="col-span-2 font-medium mb-2">Player, Score</p>
          {sortedUsers.map((user: User) => {
            const userConfig = chartConfig[user.name];
            if (!userConfig) return null;
            return (
              <div key={user.id} className="flex items-center space-x-2 truncate">
                <span
                  className="inline-block h-2 w-2 rounded-sm shrink-0"
                  style={{ backgroundColor: userConfig.colour }}
                ></span>
                <span className="truncate" title={`${user.name}, ${user.score}`}>{`${user.name}, ${user.score}`}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
