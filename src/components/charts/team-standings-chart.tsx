
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
} from '@/components/ui/chart';
import { Team, WeeklyTeamStanding } from '@/lib/data';
import * as React from 'react';

type ChartData = WeeklyTeamStanding;

interface TeamStandingsChartProps {
  chartData: ChartData[];
  sortedTeams: (Team & { rank: number })[];
}

export function TeamStandingsChart({
  chartData,
  sortedTeams,
}: TeamStandingsChartProps) {
  const allWeeks = [...new Set(chartData.map(d => d.week))].sort((a, b) => a - b);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const week = `Wk ${label}`;
      const sortedPayload = [...payload].sort(
        (a, b) => a.payload.rank - b.payload.rank
      );

      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-xl">
          <p className="mb-2 font-medium">{week}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {sortedPayload.map((pld: any, index: number) => {
              const team = sortedTeams.find(t => t.id === pld.payload.teamId);
              if (!team) return null;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--chart-color-${team.rank}))` }}
                  ></div>
                  <span className="font-medium">{team.name}:</span>
                  <span className="text-muted-foreground">Rank {pld.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Standings Tracker</CardTitle>
        <CardDescription>Team positions over the last {allWeeks.length} weeks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={{}} className="h-[700px] w-full">
            <ResponsiveContainer>
              <LineChart
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
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  ticks={allWeeks}
                  tickFormatter={value => `Wk ${value}`}
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
                <Tooltip content={<CustomTooltip />} />
                {sortedTeams.map(team => {
                  const teamData = chartData.filter(
                    d => d.teamId === team.id
                  );
                  return (
                    <Line
                      key={team.id}
                      data={teamData}
                      dataKey="rank"
                      type="monotone"
                      stroke={`hsl(var(--chart-color-${team.rank}))`}
                      strokeWidth={3}
                      dot={false}
                      name={team.name}
                    />
                  );
                })}
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
              <li key={team.id} className="flex items-center space-x-2">
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
