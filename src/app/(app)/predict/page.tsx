
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Icons, IconName } from '@/components/icons';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Team, PreviousSeasonStanding } from '@/lib/data';
import { useUser } from '@/firebase';

const predictionSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  teamLogo: z.string(),
  iconColour: z.string().optional(),
  bgColourFaint: z.string().optional(),
  bgColourSolid: z.string().optional(),
  textColour: z.string().optional(),
  id: z.string(),
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

type Prediction = z.infer<typeof predictionSchema>;

export default function PredictPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const teamsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const previousStandingsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'previousSeasonStandings') : null, [firestore]);
  
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsCollectionRef);
  const { data: previousSeasonStandings, isLoading: prevStandingsLoading } = useCollection<PreviousSeasonStanding>(previousStandingsCollectionRef);

  const isLoading = teamsLoading || prevStandingsLoading;

  const sortedTeamsByPreviousRank = React.useMemo(() => {
    if (!teams || !previousSeasonStandings) return [];
    const teamMap = new Map(teams.map(t => [t.id, t]));
    return previousSeasonStandings
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return {
          id: standing.teamId,
          teamId: standing.teamId,
          teamName: team?.name || 'Unknown Team',
          teamLogo: team?.logo || 'match',
          iconColour: team?.iconColour,
          bgColourFaint: team?.bgColourFaint,
          bgColourSolid: team?.bgColourSolid,
          textColour: team?.textColour,
        };
      });
  }, [teams, previousSeasonStandings]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: [],
    },
  });

  const [items, setItems] = React.useState<Prediction[]>([]);

  React.useEffect(() => {
    if (sortedTeamsByPreviousRank.length > 0) {
      setItems(sortedTeamsByPreviousRank);
      form.reset({ predictions: sortedTeamsByPreviousRank });
    }
  }, [sortedTeamsByPreviousRank, form]);

  React.useEffect(() => {
    form.setValue('predictions', items);
  }, [items, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ title: "Error", description: "You must be logged in to make a prediction."});
        return;
    }

    const predictionData = {
        userId: user.uid,
        rankings: values.predictions.map(p => p.teamId),
        createdAt: new Date(),
    };

    try {
        const predictionDocRef = doc(firestore, 'predictions', user.uid);
        await setDoc(predictionDocRef, predictionData, { merge: true });
        toast({
            title: 'Season Predictions Submitted!',
            description: 'Your final standings prediction has been saved. Good luck!',
        });
    } catch (error) {
        console.error("Error saving prediction: ", error);
        toast({
            variant: "destructive",
            title: 'Submission Failed',
            description: 'There was an error saving your prediction. Please try again.',
        });
    }
  }

  const standingsWithTeamData = React.useMemo(() => {
      if (!teams || !previousSeasonStandings) return [];
      return previousSeasonStandings
        .map(standing => {
          const team = teams.find(t => t.id === standing.teamId);
          return team ? { ...standing, ...team } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a!.rank - b!.rank);
  }, [teams, previousSeasonStandings]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading teams...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Your Pred Your Choice!</h1>
        <p className="text-slate-400">Drag and drop the teams to create your PremPred entry; then sit back and pray for glory</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground">Your Prediction (2025-2026)</div>
              <div className="rounded-md">
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex-1">
                  {items.map((item, index) => {
                    const TeamIcon = Icons[item.teamLogo as IconName] || Icons.match;
                    const isLiverpool = item.id === 'team_12';
                    return (
                      <Reorder.Item
                        key={item.teamId}
                        value={item}
                        className={cn("flex items-center h-[53px] cursor-grab active:cursor-grabbing rounded-md mb-1 shadow-sm")}
                        style={{
                          backgroundColor: item.bgColourFaint,
                          color: item.textColour,
                        }}
                      >
                        <div className={cn("text-base font-medium w-12 text-center opacity-80")}>{index + 1}</div>
                        <div className="w-12 h-full p-0">
                          <div className="flex items-center justify-center h-full">
                            <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: item.bgColourSolid }}>
                              <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: item.iconColour }} />
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
              <div className="flex-1 rounded-md">
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
                          style={{ backgroundColor: team.bgColourFaint, color: team.textColour }}
                        >
                          <TableCell className="font-medium w-[50px] opacity-80 rounded-l-md">{team.rank}</TableCell>
                          <TableCell className="w-[48px] p-0">
                            <div className="flex items-center justify-center h-full">
                              <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                                <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: team.iconColour }} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="truncate">{team.name}</span>
                          </TableCell>
                          <TableCell className="text-right font-semibold w-16">{team.points}</TableCell>
                          <TableCell className="text-right w-16 rounded-r-md">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
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
