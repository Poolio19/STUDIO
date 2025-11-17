
'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Customized,
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
import { teams, WeeklyTeamStanding, Team } from '@/lib/data';
import * as React from 'react';

interface TeamStandingsChartProps {
  chartData: WeeklyTeamStanding[];
  sortedTeams: (Team & { rank: number })[];
}

const CustomLegend = ({ yAxis, sortedTeams, chartConfig }: any) => {
    if (!yAxis || !yAxis.scale) {
      return null;
    }
  
    return (
      <g>
        {sortedTeams.map((team: Team & { rank: number }) => {
          const y = yAxis.scale(team.rank);
          const color = chartConfig[team.name]?.color;
          if (y === undefined) return null;
          
          return (
            <g key={team.id} transform={`translate(740, ${y})`}>
              <circle cx="0" cy="0" r="5" fill={color} />
              <text x="10" y="4" textAnchor="start" fill="hsl(var(--foreground))" fontSize="12">
                {team.name}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

export function TeamStandingsChart({ chartData, sortedTeams }: TeamStandingsChartProps) {
    const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    sortedTeams.forEach((team, index) => {
      config[team.name] = {
        label: team.name,
        color: `hsl(var(--chart-color-${index + 1}))`,
      };
    });
    return config;
  }, [sortedTeams]);


  const transformedData = React.useMemo(() => {
    const weeks = [...new Set(chartData.map(d => d.week))].sort((a,b) => a-b);
    return weeks.map(week => {
      const weekData: {[key: string]: number | string} = { week: `Wk ${week}` };
      chartData.filter(d => d.week === week).forEach(d => {
        const team = teams.find(t => t.id === d.teamId);
        if (team) {
          weekData[team.name] = d.rank;
        }
      });
      return weekData;
    });
  }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Standings Tracker</CardTitle>
        <CardDescription>
          Team positions over the last 6 weeks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[600px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={transformedData}
              margin={{
                top: 20,
                right: 200, 
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
                            <div className="size-2.5 rounded-sm" style={{ backgroundColor: chartConfig[name as string]?.color }}/>
                            <span className="font-medium">{name}:</span>
                            <span className="text-muted-foreground">Rank {value}</span>
                           </div>
                        )}
                    />
                }
              />
              <Customized component={(props: any) => <CustomLegend {...props} sortedTeams={sortedTeams} chartConfig={chartConfig} />} />
              {sortedTeams.map((team) => (
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
      </CardContent>
    </Card>
  );
}
