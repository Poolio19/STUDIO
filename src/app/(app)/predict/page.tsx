
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { teams, previousSeasonStandings } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { Reorder } from 'framer-motion';

const predictionSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  teamLogo: z.string(),
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

export default function PredictPage() {
  const { toast } = useToast();

  const sortedTeamsByPreviousRank = React.useMemo(() => {
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return previousSeasonStandings
      .slice() // Create a copy to avoid mutating original data
      .sort((a, b) => a.rank - b.rank)
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return {
          teamId: standing.teamId,
          teamName: team?.name || 'Unknown Team',
          teamLogo: team?.logo || 'match',
        };
      });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: sortedTeamsByPreviousRank,
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: 'predictions',
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Season Predictions Submitted!',
      description:
        'Your final standings prediction has been saved. Good luck!',
    });
  }

  const standingsWithTeamData = previousSeasonStandings
    .map(standing => {
      const team = teams.find(t => t.id === standing.teamId);
      return team ? { ...standing, ...team } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.rank - b!.rank);

  return (
    <div className="flex flex-col gap-8">
       <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Predict Final Standings
          </h1>
          <p className="text-muted-foreground">
            Drag and drop the teams to create your predicted league table for the 2025-2026 season.
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                 <div className="font-medium pb-2 text-muted-foreground">Your Prediction (2025-2026)</div>
                <Reorder.Group
                  axis="y"
                  values={fields}
                  onReorder={(newOrder) => {
                    newOrder.forEach((item, index) => {
                      update(index, item);
                    });
                  }}
                >
                  {fields.map((field, index) => {
                    const TeamIcon =
                      Icons[field.teamLogo as IconName] || Icons.match;
                    return (
                      <Reorder.Item
                        key={field.id}
                        value={field}
                        className="flex items-center gap-4 h-[53px] px-4 rounded-md bg-card border cursor-grab active:cursor-grabbing shadow-sm"
                      >
                        <div className="text-base font-medium w-6 text-center text-muted-foreground">
                          {index + 1}
                        </div>
                        <TeamIcon className="size-5" />
                        <span className="font-medium text-sm">{field.teamName}</span>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
              <div className="lg:col-span-2">
                 <div className="font-medium pb-2 text-muted-foreground flex justify-between">
                  <span>Last Season (2024-25)</span>
                  <div className="flex">
                    <span className="w-16 text-right">Pts</span>
                    <span className="w-16 text-right">GD</span>
                  </div>
                 </div>
                    <Table>
                      <TableBody>
                        {standingsWithTeamData.map(team => {
                          if (!team) return null;
                          const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                          return (
                            <TableRow key={team.id} className="h-[53px]">
                              <TableCell className="font-medium w-[50px]">{team.rank}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TeamIcon className="size-5" />
                                  <span className="truncate">{team.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold w-16">
                                {team.points}
                              </TableCell>
                              <TableCell className="text-right w-16">
                                {team.goalDifference}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
              </div>
            </div>
            <Button type="submit">Submit Final Prediction</Button>
          </form>
        </Form>
    </div>
  );
}
