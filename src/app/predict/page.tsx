
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Icons, IconName } from '@/components/icons';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Team, PreviousSeasonStanding, CurrentStanding, Prediction as PredictionType, Match } from '@/lib/types';
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Loader2, Minus, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

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

const RankDifference = ({ diff }: { diff: number }) => {
  const Icon = diff > 0 ? ArrowDown : diff < 0 ? ArrowUp : Minus;
  const color = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400';

  return (
    <div className={cn("flex flex-col items-center justify-center h-full w-full", color)}>
      <Icon className="size-4" />
      <span className="text-xs font-bold">{Math.abs(diff)}</span>
    </div>
  );
};

export default function PredictPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  const prevStandingsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'previousSeasonStandings') : null, [firestore]);
  const currentStandingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'standings')) : null, [firestore]);
  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  
  const userPredictionDocRef = useMemoFirebase(() => {
    if (!firestore || !resolvedUserId) return null;
    return doc(firestore, 'predictions', resolvedUserId);
  }, [firestore, resolvedUserId]);

  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: previousSeasonStandings, isLoading: prevStandingsLoading } = useCollection<PreviousSeasonStanding>(prevStandingsQuery);
  const { data: currentStandings, isLoading: currentStandingsLoading } = useCollection<CurrentStanding>(currentStandingsQuery);
  const { data: matchesData, isLoading: matchesLoading } = useCollection<Match>(matchesQuery);
  const { data: userPrediction, isLoading: predictionLoading } = useDoc<PredictionType>(userPredictionDocRef);

  const [items, setItems] = React.useState<PredictionItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: [],
    },
  });

  const isLoading = isUserLoading || teamsLoading || prevStandingsLoading || predictionLoading || currentStandingsLoading || matchesLoading;

  React.useEffect(() => {
    if (isLoading || !teams || !previousSeasonStandings) {
      return;
    }
  
    let initialItems: PredictionItem[] = [];
    const teamMap = new Map(teams.map(team => [team.id, {
        id: team.id,
        teamId: team.id,
        teamName: team.name || 'Unknown Team',
        teamLogo: team.logo || 'match',
        iconColour: team.iconColour,
        bgColourFaint: team.bgColourFaint,
        bgColourSolid: team.bgColourSolid,
        textColour: team.textColour,
    }]));
  
    if (userPrediction?.rankings && userPrediction.rankings.length > 0) {
      initialItems = userPrediction.rankings
        .map(teamId => teamMap.get(teamId))
        .filter((item): item is PredictionItem => !!item);
    } 
    else {
      const prevStandingsMap = new Map(previousSeasonStandings.map(s => [s.teamId, s.rank]));
      initialItems = [...teams]
        .sort((a, b) => (prevStandingsMap.get(a.id) ?? 21) - (prevStandingsMap.get(b.id) ?? 21))
        .map(team => teamMap.get(team.id))
        .filter((item): item is PredictionItem => !!item);
    }
  
    // Only update if the form is clean, to avoid overwriting user's drag-and-drop changes
    if (!form.formState.isDirty && initialItems.length > 0) {
        setItems(initialItems);
        form.setValue('predictions', initialItems);
    }

  }, [isLoading, teams, previousSeasonStandings, userPrediction, form, user]);

  const handleReorder = (newOrder: PredictionItem[]) => {
    setItems(newOrder);
    form.setValue('predictions', newOrder, { shouldDirty: true });
  }

  const sortedPreviousStandings = React.useMemo(() => {
    if (!teams || !previousSeasonStandings) return [];

    const teamMap = new Map(teams.map(t => [t.id, t]));

    return previousSeasonStandings
      .map(standing => {
        const team = teamMap.get(standing.teamId);
        return team ? { ...standing, ...team, teamLogo: team.logo } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.rank - b.rank);
  }, [teams, previousSeasonStandings]);

  const currentStandingsWithTeamData = React.useMemo(() => {
    if (!teams || !currentStandings) return [];

    const teamMap = new Map(teams.map(t => [t.id, t]));
    
    return currentStandings
        .map(standing => {
            const team = teamMap.get(standing.teamId);
            return team ? { ...standing, teamLogo: team.logo, ...team } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.rank - b.rank);
  }, [teams, currentStandings]);


  const currentWeek = React.useMemo(() => {
    if (matchesData && matchesData.length > 0) {
        const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        return Math.max(...playedMatches.map(m => m.week), 0);
    }
    return 0;
  }, [matchesData]);
  
  const seasonStarted = currentWeek > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !resolvedUserId) {
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
      userId: resolvedUserId,
      rankings: values.predictions.map(p => p.teamId),
      createdAt: new Date().toISOString(),
    };

    const predictionRef = doc(firestore, 'predictions', resolvedUserId);
    setDocumentNonBlocking(predictionRef, predictionData, { merge: true });
    toast({
        title: 'Season Predictions Submitted!',
        description: 'Your final standings prediction has been saved. Good luck!',
    });
  }
  
  const getRankMap = (standings: any[]) => new Map(standings.map((s, i) => [s.teamId || s.id, i + 1]));

  const predRankMap = getRankMap(items);
  const currentRankMap = getRankMap(currentStandingsWithTeamData);
  const prevRankMap = getRankMap(sortedPreviousStandings);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading your predictions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_auto_3fr_auto_3fr] gap-4 items-start">
             {/* Your Prediction */}
            <div className="flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground text-center">
                Your Pred 25-26
              </div>
              <Card>
                <CardContent className="p-0">
                  {!user ? (
                      <div className="h-[1060px] flex flex-col items-center justify-center gap-4 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-md">
                          <UserIcon className="size-16" />
                          <p className="font-medium">You are not signed in.</p>
                          <Button asChild variant="outline">
                              <Link href="/profile">Sign In to Predict</Link>
                          </Button>
                      </div>
                  ) : (
                    <div className='p-1'>
                      {seasonStarted ? (
                        items.map((item, index) => {
                          const TeamIcon = Icons[item.teamLogo as IconName] || Icons.match;
                          const isLiverpool = item.id === 'team_12';
                          return (
                            <div
                              key={item.teamId}
                              className={cn("flex items-center h-[53px] rounded-md mb-1 shadow-sm")}
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
                            </div>
                          );
                        })
                      ) : (
                        <Reorder.Group axis="y" values={items} onReorder={handleReorder}>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Difference 1 */}
            <div className="flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground invisible">Diff</div>
              <div className="relative p-1">
                {items.map((item) => {
                  const predRank = predRankMap.get(item.teamId);
                  const currentRank = currentRankMap.get(item.teamId);
                  const diff = (predRank !== undefined && currentRank !== undefined) ? currentRank - predRank : 0;
                  return <div key={`${item.teamId}-diff1`} className="h-[53px] mb-1"><RankDifference diff={diff} /></div>;
                })}
              </div>
            </div>
            
            {/* Current Standings */}
            <div className="flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground flex justify-between">
                <span>Current 25-26</span>
                <div className="flex">
                  <span className="w-16 text-right">Pts</span>
                  <span className="w-16 text-right">GD</span>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                   <div className="p-1">
                      {currentStandingsWithTeamData.map(team => {
                        const TeamIcon = Icons[team.teamLogo as IconName] || Icons.match;
                        const isLiverpool = team.id === 'team_12';
                        return (
                          <div
                            key={team.id}
                            className={cn("flex items-center h-[53px] rounded-md mb-1 shadow-sm")}
                            style={{ backgroundColor: team.bgColourFaint, color: team.textColour }}
                          >
                            <div className={cn("text-base font-medium w-12 text-center opacity-80")}>{team.rank}</div>
                            <div className="w-12 h-full p-0">
                              <div className="flex items-center justify-center h-full">
                                <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                                  <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: team.iconColour }} />
                                </div>
                              </div>
                            </div>
                            <span className="font-medium text-sm pl-4 flex-grow">{team.name}</span>
                            <span className="text-right font-semibold w-16 pr-2 tabular-nums">{team.points}</span>
                            <span className="text-right w-16 pr-4 tabular-nums">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</span>
                          </div>
                        );
                      })}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Difference 2 */}
             <div className="flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground invisible">Diff</div>
              <div className="relative p-1">
                {currentStandingsWithTeamData.map((team) => {
                  const currentRank = currentRankMap.get(team.teamId);
                  const prevRank = prevRankMap.get(team.teamId);
                  const diff = (currentRank !== undefined && prevRank !== undefined) ? prevRank - currentRank : 0;
                  return <div key={`${team.teamId}-diff2`} className="h-[53px] mb-1"><RankDifference diff={diff} /></div>;
                })}
              </div>
            </div>

            {/* Last Season */}
            <div className="flex flex-col">
              <div className="font-medium pb-2 text-muted-foreground flex justify-between">
                <span>Last Year 24-25</span>
                <div className="flex">
                  <span className="w-16 text-right">Pts</span>
                  <span className="w-16 text-right">GD</span>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="p-1">
                      {sortedPreviousStandings.map(team => {
                        const TeamIcon = Icons[team.teamLogo as IconName] || Icons.match;
                        const isLiverpool = team.id === 'team_12';
                        return (
                          <div
                            key={team.id}
                            className={cn("flex items-center h-[53px] rounded-md mb-1 shadow-sm")}
                            style={{ backgroundColor: team.bgColourFaint, color: team.textColour }}
                          >
                            <div className={cn("text-base font-medium w-12 text-center opacity-80")}>{team.rank}</div>
                            <div className="w-12 h-full p-0">
                              <div className="flex items-center justify-center h-full">
                                <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: team.bgColourSolid }}>
                                  <TeamIcon className={cn("size-5", isLiverpool && "scale-x-[-1]")} style={{ color: team.iconColour }} />
                                </div>
                              </div>
                            </div>
                            <span className="font-medium text-sm pl-4 flex-grow">{team.name}</span>
                            <span className="text-right font-semibold w-16 pr-2 tabular-nums">{team.points}</span>
                            <span className="text-right w-16 pr-4 tabular-nums">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
          {user && !seasonStarted && (
            <Button type="submit">Submit Final Prediction</Button>
          )}
        </form>
      </Form>
    </div>
  );
}
