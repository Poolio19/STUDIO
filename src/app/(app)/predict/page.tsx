
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
import type { Team, PreviousSeasonStanding, CurrentStanding, Prediction as PredictionType } from '@/lib/data';
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, getDoc, query } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent } from '@/components/ui/card';

const predictionSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  teamLogo: z.string(),
  iconColour: z.string().optional(),
  bgColourFaint: z.string().optional(),
  bgColourSolid: z.string().optional(),
  textColour: z.string().optional(),
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

type PredictionItem = z.infer<typeof predictionSchema>;

export default function PredictPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const teamsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'teams') : null, [firestore, isUserLoading]);
  const prevStandingsQuery = useMemoFirebase(() => !isUserLoading && firestore ? collection(firestore, 'previousSeasonStandings') : null, [firestore, isUserLoading]);
  const currentStandingsQuery = useMemoFirebase(() => !isUserLoading && firestore ? query(collection(firestore, 'standings')) : null, [firestore, isUserLoading]);
  const userPredictionDocRef = useMemoFirebase(() => user && firestore ? doc(firestore, 'predictions', user.uid) : null, [user, firestore]);

  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: previousSeasonStandings, isLoading: prevStandingsLoading } = useCollection<PreviousSeasonStanding>(prevStandingsQuery);
  const { data: currentStandings, isLoading: currentStandingsLoading } = useCollection<CurrentStanding>(currentStandingsQuery);
  const { data: userPrediction, isLoading: predictionLoading } = useDoc<PredictionType>(userPredictionDocRef);

  const { sortedPreviousStandings } = React.useMemo(() => {
    if (!teams || !previousSeasonStandings) return { sortedPreviousStandings: [] };
    
    const allTeamsMap = new Map(teams.map(t => [t.id, t]));
    
    const fullStandingsWithData = previousSeasonStandings
      .map(standing => {
        const team = allTeamsMap.get(standing.teamId);
        return team ? { ...standing, ...team } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a!.rank - b!.rank);

    return { sortedPreviousStandings: fullStandingsWithData };
  }, [teams, previousSeasonStandings]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: [],
    },
  });

  const [items, setItems] = React.useState<PredictionItem[]>([]);

  const defaultSortedItems = React.useMemo(() => {
      if (!teams) return [];
      const prevStandingsMap = new Map(previousSeasonStandings?.map(s => [s.teamId, s.rank]));
      return teams.map(team => ({
        id: team.id,
        teamId: team.id,
        teamName: team.name || 'Unknown Team',
        teamLogo: team.logo || 'match',
        iconColour: team.iconColour,
        bgColourFaint: team.bgColourFaint,
        bgColourSolid: team.bgColourSolid,
        textColour: team.textColour,
        sortRank: prevStandingsMap.get(team.id) ?? 21,
      })).sort((a, b) => a.sortRank - b.sortRank);
  }, [teams, previousSeasonStandings]);


  React.useEffect(() => {
      if (predictionLoading || teamsLoading) return;
  
      if (userPrediction && userPrediction.rankings && teams) {
          const teamMap = new Map(defaultSortedItems.map(t => [t.teamId, t]));
          const orderedItems = userPrediction.rankings
              .map((teamId: string) => teamMap.get(teamId))
              .filter(Boolean) as PredictionItem[];
          setItems(orderedItems);
      } else if (!predictionLoading && !userPrediction && defaultSortedItems.length > 0) {
          setItems(defaultSortedItems);
      }
  }, [userPrediction, predictionLoading, teams, teamsLoading, defaultSortedItems]);


  React.useEffect(() => {
    form.setValue('predictions', items);
  }, [items, form]);
  
  const currentWeek = React.useMemo(() => {
    if (!currentStandings || currentStandings.length === 0) return 0;
    return Math.max(...currentStandings.map(s => s.gamesPlayed), 0);
  }, [currentStandings]);
  
  const seasonStarted = currentWeek > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit a prediction.',
      });
      return;
    }
    
    if (seasonStarted) {
      toast({
        variant: 'destructive',
        title: 'Predictions Locked',
        description: 'The season has started, so predictions can no longer be changed.',
      });
      return;
    }

    const predictionData = {
      userId: user.uid,
      rankings: values.predictions.map(p => p.teamId),
      createdAt: new Date().toISOString(),
    };

    const predictionRef = doc(firestore, 'predictions', user.uid);
    setDocumentNonBlocking(predictionRef, predictionData, { merge: true });
    toast({
        title: 'Season Predictions Submitted!',
        description: 'Your final standings prediction has been saved. Good luck!',
    });
  }
  
  const isLoading = isUserLoading || teamsLoading || prevStandingsLoading || predictionLoading || currentStandingsLoading;

  if (isLoading && items.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading your predictions...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Your Pred Your Choice!</h1>
        <p className="text-slate-400">
            {seasonStarted
            ? 'The season has started. Your predictions are locked in.'
            : 'Drag and drop the teams to create your PremPred entry; then sit back and pray for glory'}
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground">
                {seasonStarted ? 'Your Submitted Prediction (2025-26)' : 'Your Prediction (2025-26)'}
              </div>
              <Card>
                <CardContent className="p-0">
                  {seasonStarted ? (
                    <Table>
                      <TableBody>
                        {items.map((item, index) => {
                          const TeamIcon = Icons[item.teamLogo as IconName] || Icons.match;
                          const isLiverpool = item.id === 'team_12';
                          return (
                            <TableRow
                              key={item.teamId}
                              className="h-[53px]"
                              style={{ backgroundColor: item.bgColourFaint, color: item.textColour }}
                            >
                              <TableCell className="font-medium w-12 text-center opacity-80 rounded-l-md">{index + 1}</TableCell>
                              <TableCell className="w-12 p-0">
                                <div className="flex items-center justify-center h-full">
                                  <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: item.bgColourSolid }}>
                                    <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: item.iconColour }} />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-sm rounded-r-md pl-4">{item.teamName}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex-1 p-1">
                      {items.map((item, index) => {
                        const TeamIcon = Icons[item.teamLogo as IconName] || Icons.match;
                        const isLiverpool = item.id === 'team_12';
                        return (
                          <Reorder.Item
                            key={item.teamId}
                            value={item}
                            className={cn("flex items-center h-[53px] cursor-grab active:cursor-grabbing rounded-md mb-1 shadow-sm")}
                            style={{ backgroundColor: item.bgColourFaint, color: item.textColour }}
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
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground flex justify-between">
                <span>Last Season (2024-25)</span>
                <div className="flex">
                  <span className="w-16 text-right">Pts</span>
                  <span className="w-16 text-right">GD</span>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table className="h-full">
                    <TableBody>
                      {sortedPreviousStandings.map(team => {
                        if (!team) return null;
                        const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                        const isLiverpool = team.id === 'team_12';
                        return (
                          <TableRow
                            key={team.id}
                            className="h-[53px]"
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
                </CardContent>
              </Card>
            </div>
          </div>
          {!seasonStarted && (
            <Button type="submit">Submit Final Prediction</Button>
          )}
        </form>
      </Form>
    </div>
  );
}
