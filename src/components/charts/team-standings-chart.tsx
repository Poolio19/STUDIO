
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
  ChartContainer
} from '@/components/ui/chart';
import { Team } from '@/lib/data';
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
    return sortedTeams.reduce((config, team) => {
      config[team.name] = {
        label: team.name,
        colour: team.bgColourSolid || `hsl(var(--chart-color-${team.rank}))`,
        secondaryColour: team.iconColour || team.textColour || '#FFFFFF',
      };
      return config;
    }, {} as any);
  }, [sortedTeams]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // The payload will contain both lines for each team, so we need to filter them.
      const uniquePayload = payload.reduce((acc, p) => {
        if (!acc.some((item: any) => item.name === p.name)) {
          acc.push(p);
        }
        return acc;
      }, []);

      const sortedPayload = [...uniquePayload].sort(
        (a, b) => a.value - b.value
      );

      const week = `Wk ${label}`;

      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-xl">
          <p className="mb-2 font-medium">{week}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {sortedPayload.map((pld: any, index: number) => {
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: chartConfig[pld.name]?.colour }}
                  ></div>
                  <span className="font-medium">{pld.name}:</span>
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
        <CardTitle>Team Movement 2025-2026</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[700px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{
                  top: 30,
                  right: 130,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={value => `Wk ${value}`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  orientation="top"
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
                {/* Render the solid background lines first */}
                {sortedTeams.map(team => (
                  <Line
                    key={`${team.id}-solid`}
                    dataKey={team.name}
                    type="monotone"
                    stroke={chartConfig[team.name]?.colour}
                    strokeWidth={4}
                    dot={false}
                    name={team.name}
                    legendType="none"
                  />
                ))}
                {/* Render the dashed foreground lines on top */}
                {sortedTeams.map(team => (
                  <Line
                    key={`${team.id}-dashed`}
                    dataKey={team.name}
                    type="monotone"
                    stroke={chartConfig[team.name]?.secondaryColour}
                    strokeWidth={4}
                    strokeDasharray="9 12"
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
              <li key={team.id} className="flex items-center space-x-2">
                <div className="relative w-4 shrink-0 flex items-center justify-center" style={{ height: '4px' }}>
                  <div 
                    className="absolute w-full h-full" 
                    style={{ backgroundColor: chartConfig[team.name]?.colour }}
                  ></div>
                  <div 
                    className="absolute w-2"
                    style={{ 
                      backgroundColor: chartConfig[team.name]?.secondaryColour,
                      height: '2px'
                    }}
                  ></div>
                </div>
                <span>{team.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
