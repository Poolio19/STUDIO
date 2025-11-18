
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import * as React from 'react';

interface ProfilePerformanceChartProps {
  chartData: any[];
  yAxisDomain: [number, number];
}

const chartConfig = {
  'Your Score': {
    label: 'Your Score',
    colour: 'hsl(var(--chart-color-1))',
  },
  'Max Score': {
    label: 'Max Score',
    colour: 'hsl(var(--chart-color-2))',
  },
  'Min Score': {
    label: 'Min Score',
    colour: 'hsl(var(--chart-color-3))',
  },
};


export function ProfilePerformanceChart({ chartData, yAxisDomain }: ProfilePerformanceChartProps) {
  return (
     <Card>
      <CardHeader>
        <CardTitle>Season Performance</CardTitle>
        <CardDescription>
          Your weekly score compared to the max and min scores in the league.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: -10,
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
                domain={yAxisDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Line
                dataKey="Your Score"
                type="monotone"
                stroke={chartConfig['Your Score'].colour}
                strokeWidth={3}
                dot={true}
              />
               <Line
                dataKey="Max Score"
                type="monotone"
                stroke={chartConfig['Max Score'].colour}
                strokeWidth={2}
                strokeDasharray="3 4"
                dot={false}
              />
               <Line
                dataKey="Min Score"
                type="monotone"
                stroke={chartConfig['Min Score'].colour}
                strokeWidth={2}
                strokeDasharray="3 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    