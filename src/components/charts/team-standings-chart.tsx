
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
  ChartConfig,
} from '@/components/ui/chart';
import { Team } from '@/lib/data';
import * as React from 'react';

type TransformedChartData = {
  week: string;
  [teamName: string]: number | string;
};

interface TeamStandingsChartProps {
  chartData: TransformedChartData[];
  sortedTeams: (Team & { rank: number })[];
}

export function TeamStandingsChart({
  chartData,
  sortedTeams,
}: TeamStandingsChartProps) {
  const allWeeks = [...new Set(chartData.map(d => d.week))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Standings Tracker</CardTitle>
        <CardDescription>
          Team positions over the last 6 weeks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={{}} className="h-[700px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 130,
                  left: -20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  type="category"
                  ticks={allWeeks}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  reversed
                  domain={[1, 20]}
                  tickCount={20}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name, props) => {
                        const team = sortedTeams.find(t => t.name === name);
                        if (!team) return null;
                        const color = `hsl(var(--chart-color-${team.rank}))`;
                        return (
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2.5 rounded-sm"
                              style={{
                                backgroundColor: color,
                              }}
                            />
                            <span className="font-medium">{name}:</span>
                            <span className="text-muted-foreground">
                              Rank {value}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                {sortedTeams.map(team => (
                  <Line
                    key={team.id}
                    dataKey={team.name}
                    type="monotone"
                    stroke={`hsl(var(--chart-color-${team.rank}))`}
                    strokeWidth={3}
                    dot={false}
                    name={team.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          {/* Custom Legend */}
          <ul
            className="absolute flex flex-col justify-between text-xs"
            style={{
              right: 0,
              top: '12.5px',
              bottom: '42.5px',
              width: '120px',
              paddingLeft: '1rem',
            }}
          >
            {sortedTeams.map(team => (
              <li
                key={team.id}
                className="flex items-center space-x-2"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `hsl(var(--chart-color-${team.rank}))` }}
                ></span>
                <span>{team.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
