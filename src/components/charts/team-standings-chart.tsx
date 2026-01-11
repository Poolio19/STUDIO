
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
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  ChartContainer
} from '@/components/ui/chart';
import type { Team } from '@/lib/types';
import * as React from 'react';

interface TeamStandingsChartProps {
  chartData: any[];
  sortedTeams: (Team & { rank: number })[];
}

export function TeamStandingsChart({
  chartData,
  sortedTeams,
}: TeamStandingsChartProps) {

  const chartConfig = React.useMemo(() => {
    if (!sortedTeams) return {};
    return sortedTeams.reduce((config, team) => {
      config[team.name] = {
        label: team.name,
        colour: team.bgColourSolid || `hsl(var(--chart-color-${team.rank}))`,
      };
      return config;
    }, {} as any);
  }, [sortedTeams]);

    const legendTeams = React.useMemo(() => {
        const numRows = 4;
        const numCols = 5;
        const columnOrderedTeams: (typeof sortedTeams[0] | undefined)[] = new Array(numCols * numRows).fill(undefined);
    
        sortedTeams.forEach((team, i) => {
            const col = Math.floor(i / numRows);
            const row = i % numRows;
            const newIndex = row * numCols + col;
            columnOrderedTeams[newIndex] = team;
        });
        return columnOrderedTeams;
    }, [sortedTeams])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const filteredPayload = payload.filter((p: any) => !p.dataKey.endsWith('-inner') && !p.dataKey.endsWith('-outer'));
      
      const sortedPayload = [...filteredPayload].sort(
        (a, b) => a.value - b.value
      );

      const week = `Wk ${label}`;

      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-xl">
          <p className="mb-2 font-medium">{week}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {sortedPayload.map((pld: any, index: number) => {
              const teamName = pld.dataKey;
              const team = sortedTeams.find(t => t.name === teamName);

              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: team?.bgColourSolid }}
                  ></div>
                  <span className="font-medium">{teamName}:</span>
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
      <CardHeader className="items-center">
        <CardTitle className="bg-black text-yellow-400 p-2 rounded-md">Team Movement 2025-2026</CardTitle>
        <CardDescription>Team league position changes over the season.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-x-4 gap-y-1 text-xs mb-6 px-4">
            {legendTeams.map((team, index) => {
            if (!team) return <div key={`empty-${index}`} />;
            return (
                <div key={team.id} className="flex items-center space-x-2 truncate py-0">
                <span
                    className="inline-block h-2 w-2 rounded-sm shrink-0"
                    style={{ backgroundColor: team.bgColourSolid }}
                ></span>
                <span className="truncate" title={`${team.name}`}>{team.name}</span>
                </div>
            );
            })}
        </div>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[700px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: -20,
                  bottom: 50,
                }}
              >
                <CartesianGrid vertical={true} horizontal={true} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={value => `Wk ${value}`}
                  angle={-90}
                  textAnchor="end"
                  tickMargin={10}
                  interval={0}
                  allowDuplicatedCategory={false}
                  ticks={chartData.map(d => d.week)}
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
                {sortedTeams.map(team => (
                  <React.Fragment key={team.id}>
                    <Line
                      dataKey={`${team.name}-outer`}
                      type="monotone"
                      stroke={team.bgColourFaint || '#ccc'}
                      strokeWidth={10}
                      dot={false}
                      legendType="none"
                      tooltipType="none"
                    />
                     <Line
                      dataKey={`${team.name}-inner`}
                      type="monotone"
                      stroke={team.bgColourSolid || '#000'}
                      strokeWidth={3}
                      dot={false}
                      name={team.name}
                      legendType="none"
                      tooltipType="none"
                    />
                  </React.Fragment>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
