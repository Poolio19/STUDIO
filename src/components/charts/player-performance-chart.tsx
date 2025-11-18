
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
import { users, User } from '@/lib/data';
import * as React from 'react';

interface PlayerPerformanceChartProps {
  chartData: any[];
  yAxisDomain: [number, number];
  sortedUsers: User[];
}

const CustomLegend = ({ payload, sortedUsers, chartConfig }: any) => {
  if (!payload) {
    return null;
  }

  return (
    <ul className="flex flex-col space-y-2">
      {sortedUsers.map((user: User) => {
        const userConfig = chartConfig[user.name];
        if (!userConfig) return null;
        return (
          <li key={user.id} className="flex items-center space-x-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: userConfig.colour }}
            ></span>
            <span>{`${user.name}, Rank ${user.rank}`}</span>
          </li>
        );
      })}
    </ul>
  );
};


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
    <ChartContainer config={chartConfig} className="h-[600px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 150,
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
                    formatter={(value, name) => {
                      const user = sortedUsers.find(u => u.name === name);
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
          <Legend
            content={<CustomLegend sortedUsers={sortedUsers} chartConfig={chartConfig} />}
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              width: 140,
              paddingLeft: '20px',
            }}
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
  );
}
