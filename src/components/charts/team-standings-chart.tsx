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
import { WeeklyTeamStanding, Team } from '@/lib/data';
import * as React from 'react';

interface TeamStandingsChartProps {
  chartData: WeeklyTeamStanding[];
  sortedTeams: (Team & { rank: number })[];
}

const CustomLegend = ({
  payload,
}: {
  payload: { value: string; color: string }[];
}) => {
  return (
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
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center space-x-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function TeamStandingsChart({
  chartData,
  sortedTeams,
}: TeamStandingsChartProps) {
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    sortedTeams.forEach(team => {
      config[team.name] = {
        label: team.name,
        color: `hsl(var(--chart-color-${team.rank}))`,
      };
    });
    return config;
  }, [sortedTeams]);

  const transformedData = React.useMemo(() => {
    const weeks = [...new Set(chartData.map(d => d.week))].sort(
      (a, b) => a - b
    );
    return weeks.map(week => {
      const weekData: { [key: string]: number | string } = {
        week: `Wk ${week}`,
      };
      const teamsForWeek = chartData.filter(d => d.week === week);
      sortedTeams.forEach(team => {
        const teamDataForWeek = teamsForWeek.find(t => t.teamId === team.id);
        if (teamDataForWeek) {
          weekData[team.name] = teamDataForWeek.rank;
        }
      });
      return weekData;
    });
  }, [chartData, sortedTeams]);

  const legendPayload = sortedTeams.map(team => ({
    value: team.name,
    type: 'line',
    color: chartConfig[team.name].color,
  }));

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
          <ChartContainer config={chartConfig} className="h-[700px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={transformedData}
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
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2.5 rounded-sm"
                            style={{
                              backgroundColor: chartConfig[name as string]?.color,
                            }}
                          />
                          <span className="font-medium">{name}:</span>
                          <span className="text-muted-foreground">
                            Rank {value}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                {sortedTeams.map(team => (
                  <Line
                    key={team.id}
                    dataKey={team.name}
                    type="monotone"
                    stroke={chartConfig[team.name]?.color}
                    strokeWidth={3}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <CustomLegend payload={legendPayload} />
        </div>
      </CardContent>
    </Card>
  );
}
