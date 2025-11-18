
'use client';

import { TrendingUp } from 'lucide-react';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { UserChartData } from '@/lib/user-history';

interface UserHistoryChartProps {
  chartData: UserChartData[];
}

const chartConfig = {
  Score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
  Rank: {
    label: 'Rank',
    color: 'hsl(var(--chart-2))',
  },
};

export function UserHistoryChart({ chartData }: UserHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Performance</CardTitle>
        <CardDescription>
          Your weekly score and rank progress.
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
                tickFormatter={(value) => `Wk ${value}`}
              />
              <YAxis
                yAxisId="left"
                stroke="var(--color-Score)"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                orientation="left"
              />
              <YAxis
                yAxisId="right"
                stroke="var(--color-Rank)"
                orientation="right"
                reversed
                domain={['dataMin', 'dataMax']}
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
                yAxisId="left"
                dataKey="Score"
                type="monotone"
                stroke="var(--color-Score)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                dataKey="Rank"
                type="monotone"
                stroke="var(--color-Rank)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Your performance has been trending up! <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing your score and rank for the past 5 weeks.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
