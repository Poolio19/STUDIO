
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { cn } from '@/lib/utils';

const predictionSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  teamLogo: z.string(),
  iconColour: z.string().optional(),
  bgColourFaint: z.string().optional(),
  bgColourSolid: z.string().optional(),
  textColour: z.string().optional(),
  id: z.string(), // Add id to schema
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

type Prediction = z.infer<typeof predictionSchema>;

export default function PredictPage() {
  const { toast } = useToast();

  const sortedTeamsByPreviousRank = React.useMemo(() => {
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return previousSeasonStandings
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return {
          id: standing.teamId, // framer-motion needs a unique id
          teamId: standing.teamId,
          teamName: team?.name || 'Unknown Team',
          teamLogo: team?.logo || 'match',
          iconColour: team?.iconColour,
          bgColourFaint: team?.bgColourFaint,
          bgColourSolid: team?.bgColourSolid,
          textColour: team?.textColour,
        };
      });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: sortedTeamsByPreviousRank,
    },
  });

  const [items, setItems] = React.useState<Prediction[]>(form.getValues().predictions);

  React.useEffect(() => {
    form.setValue('predictions', items);
  }, [items, form]);


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
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3 flex flex-col">
                 <div className="font-medium pb-2 text-muted-foreground">Your Prediction (2025-2026)</div>
                <div className="rounded-md overflow-hidden">
                  <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={setItems}
                    className="flex-1"
                  >
                    {items.map((item, index) => {
                      const TeamIcon =
                        Icons[item.teamLogo as IconName] || Icons.match;
                      const isLiverpool = item.id === 'team_12';
                      return (
                        <Reorder.Item
                          key={item.teamId}
                          value={item}
                          className={cn(
                            "flex items-center h-[53px] cursor-grab active:cursor-grabbing rounded-md mb-1 shadow-sm",
                          )}
                           style={{
                            backgroundColor: item.bgColourFaint,
                            color: item.textColour
                          }}
                        >
                          <div className={cn("text-base font-medium w-12 text-center opacity-80")}>
                            {index + 1}
                          </div>
                          <div className="w-12 h-full p-0">
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: item.bgColourSolid }}>
                                    <TeamIcon
                                    className={cn(
                                        "size-5",
                                        isLiverpool && "scale-x-[-1]"
                                    )}
                                    style={{ color: item.iconColour }}
                                    />
                                </div>
                            </div>
                           </div>
                          <span className="font-medium text-sm pl-4">{item.teamName}</span>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col">
                 <div className="font-medium pb-2 text-muted-foreground flex justify-between">
                  <span>Last Season (2024-25)</span>
                  <div className="flex">
                    <span className="w-16 text-right">Pts</span>
                    <span className="w-16 text-right">GD</span>
                  </div>
                 </div>
                    <div className="flex-1 rounded-md overflow-hidden">
                      <Table className="h-full border-separate border-spacing-y-1">
                        <TableBody>
                          {standingsWithTeamData.map(team => {
                            if (!team) return null;
                            const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                            const isLiverpool = team.id === 'team_12';
                            return (
                              <TableRow
                                key={team.id}
                                className="h-[53px] shadow-sm"
                                style={{
                                  backgroundColor: team.bgColourFaint,
                                  color: team.textColour,
                                }}
                              >
                                <TableCell className="font-medium w-[50px] opacity-80 rounded-l-md">{team.rank}</TableCell>
                                <TableCell className="w-[48px] p-0">
                                  <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                                        <TeamIcon
                                        className={cn(
                                            "size-5",
                                            isLiverpool && "scale-x-[-1]"
                                        )}
                                        style={{ color: team.iconColour }}
                                        />
                                    </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="truncate">{team.name}</span>
                                </TableCell>
                                <TableCell className="text-right font-semibold w-16">
                                  {team.points}
                                </TableCell>
                                <TableCell className="text-right w-16 rounded-r-md">
                                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
              </div>
            </div>
            <Button type="submit">Submit Final Prediction</Button>
          </form>
        </Form>
    </div>
  );
}
