'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, Trophy, Award, ShieldCheck, Loader2, Users, Medal, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAvatarUrl } from '@/lib/placeholder-images';
import type { Team, User, UserHistory, MonthlyMimoM } from '@/lib/types';
import { ProfilePerformanceChart } from '@/components/charts/profile-performance-chart';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, useResolvedUserId } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AuthForm } from '@/components/auth/auth-form';


const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  favouriteTeam: z.string({
    required_error: 'Please select a team.',
  }),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !resolvedUserId) return null;
    return doc(firestore, 'users', resolvedUserId);
  }, [firestore, resolvedUserId]);

  const userHistoryDocRef = useMemoFirebase(() => {
    if (!firestore || !resolvedUserId) return null; 
    return doc(firestore, 'userHistories', resolvedUserId);
  }, [firestore, resolvedUserId]);

  const allUserHistoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);
  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  
  const mimoMQuery = useMemoFirebase(() => {
    return firestore && authUser ? collection(firestore, 'monthlyMimoM') : null
  }, [firestore, authUser]);


  const { data: user, isLoading: userLoading } = useDoc<User>(userDocRef);
  const { data: userHistory, isLoading: historyLoading } = useDoc<UserHistory>(userHistoryDocRef);
  const { data: allUserHistories, isLoading: allHistoriesLoading } = useCollection<UserHistory>(allUserHistoriesQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: monthlyMimoM, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);

  const isLoading = isAuthUserLoading || userLoading || historyLoading || teamsLoading || mimoMLoading || allHistoriesLoading;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      favouriteTeam: 'team_1',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        favouriteTeam: user.favouriteTeam || 'none',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
      return;
    }

    const updatedData = {
        name: data.name,
        email: data.email,
        favouriteTeam: data.favouriteTeam,
        phoneNumber: data.phoneNumber,
    };

    setDocumentNonBlocking(userDocRef, updatedData, { merge: true });
    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been saved.',
    });
  }

  const { chartData, yAxisDomain } = React.useMemo(() => {
    if (!allUserHistories || !userHistory || !userHistory.weeklyScores) {
      return { chartData: [], yAxisDomain: [0, 0] };
    }

    const allWeeks = [...new Set(allUserHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].filter(w => w > 0).sort((a, b) => a - b);
    
    const allScores = allUserHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    if (allScores.length === 0) {
        return { chartData: [], yAxisDomain: [0, 10] };
    }
    const overallMinScore = Math.min(...allScores);
    const overallMaxScore = Math.max(...allScores);
    const yAxisDomain: [number, number] = [overallMinScore - 5, overallMaxScore + 5];

    const transformedData = allWeeks.map(week => {
      const scoresThisWeek = allUserHistories
        .map(h => h.weeklyScores.find(w => w.week === week)?.score)
        .filter((score): score is number => score !== undefined);

      const currentUserWeekInfo = userHistory.weeklyScores.find(w => w.week === week);

      return {
        week: `Wk ${week}`,
        'Your Score': currentUserWeekInfo?.score,
        'Max Score': scoresThisWeek.length > 0 ? Math.max(...scoresThisWeek) : undefined,
        'Min Score': scoresThisWeek.length > 0 ? Math.min(...scoresThisWeek) : undefined,
      };
    });

    return { chartData: transformedData, yAxisDomain };
  }, [allUserHistories, userHistory]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userDocRef) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setDocumentNonBlocking(userDocRef, { avatar: result }, { merge: true });

        toast({
            title: 'Avatar Updated!',
            description: 'Your new avatar has been set.',
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isAuthUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!authUser) {
     return (
        <div className="flex h-full w-full items-center justify-center">
            <AuthForm />
        </div>
    )
  }

  if (!user && !isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-destructive">Could not load user profile. It might not be created yet.</p>
      </div>
    );
  }

  const firstPlaceClass = (user?.first ?? 0) > 0 ? "text-yellow-500" : "text-gray-300 dark:text-gray-600";
  const secondPlaceClass = (user?.second ?? 0) > 0 ? "text-slate-400" : "text-gray-300 dark:text-gray-600";
  const thirdPlaceClass = (user?.third ?? 0) > 0 ? "text-amber-700" : "text-gray-300 dark:text-gray-600";
  const mimoMClass = (user?.mimoM ?? 0) > 0 ? "text-yellow-600" : "text-gray-300 dark:text-gray-600";
  const joMimoMClass = (user?.joMimoM ?? 0) > 0 ? "text-yellow-600/80" : "text-gray-300 dark:text-gray-600";
  const ruMimoMClass = (user?.ruMimoM ?? 0) > 0 ? "text-slate-400" : "text-gray-300 dark:text-gray-600";
  const joRuMimoMClass = (user?.joRuMimoM ?? 0) > 0 ? "text-slate-400/80" : "text-gray-300 dark:text-gray-600";

  return (
    <div className="space-y-8">
      <Card>
          <CardContent className="pt-6 flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage
                      src={avatarPreview || getAvatarUrl(user?.avatar)}
                      alt={user?.name}
                      data-ai-hint="person portrait"
                      />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-muted-foreground">Seasons Played: {user?.seasonsPlayed || 0}</p>
                      <p className="text-sm text-muted-foreground">All Time Winnings: £{(user?.cashWinnings || 0).toFixed(2)}</p>
                  </div>
              </div>

              <Separator orientation="vertical" className="h-auto hidden lg:block" />
              <Separator className="w-full lg:hidden" />

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="w-full">
                      <h3 className="text-lg font-semibold mb-2 text-center">Season Stats</h3>
                      <div className="grid grid-cols-4 gap-x-2 text-center text-sm px-2">
                          <div />
                          <div className="font-medium text-muted-foreground">High</div>
                          <div className="font-medium text-muted-foreground">Low</div>
                          <div className="font-medium text-muted-foreground">Current</div>

                          <div className="font-medium text-muted-foreground text-left">Position</div>
                          <div className="font-bold">{user?.minRank}</div>
                          <div className="font-bold">{user?.maxRank}</div>
                          <div className="font-bold">{user?.rank}</div>

                          <div className="font-medium text-muted-foreground text-left">Points</div>
                          <div className="font-bold">{user?.maxScore}</div>
                          <div className="font-bold">{user?.minScore}</div>
                          <div className="font-bold">{user?.score}</div>
                      </div>
                  </div>
                  <div className="w-full">
                      <h3 className="text-lg font-semibold mb-2 text-center">Trophy Cabinet</h3>
                       <div className="space-y-4">
                          <div>
                              <p className="text-xs font-semibold text-muted-foreground text-center mb-2 uppercase">Best Finishes</p>
                              <div className="flex justify-around items-end">
                                  <TooltipProvider>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-xs font-semibold">2nd</span>
                                                  <Medal className={cn("size-7", secondPlaceClass)} />
                                                  <span className="text-sm font-bold">{user?.second || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.second || 0}x Runner Up</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-sm font-bold">1st</span>
                                                  <Trophy className={cn("size-8", firstPlaceClass)} />
                                                  <span className="text-base font-bold">{user?.first || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.first || 0}x League Champion</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-xs font-semibold">3rd</span>
                                                  <Medal className={cn("size-6", thirdPlaceClass)} />
                                                  <span className="text-sm font-bold">{user?.third || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.third || 0}x 3rd Place</p></TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                              </div>
                          </div>
                          <div>
                              <p className="text-xs font-semibold text-muted-foreground text-center mb-2 uppercase">Monthly Awards</p>
                              <div className="flex justify-around">
                                  <TooltipProvider>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1">
                                                  <Award className={cn("size-7", mimoMClass)} />
                                                  <span className="text-xs font-bold">{user?.mimoM || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.mimoM || 0}x MiMoM</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1">
                                                  <Award className={cn("size-6", joMimoMClass)} />
                                                  <span className="text-xs font-bold">{user?.joMimoM || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.joMimoM || 0}x JoMiMoM</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1">
                                                  <Award className={cn("size-7", ruMimoMClass)} />
                                                  <span className="text-xs font-bold">{user?.ruMimoM || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.ruMimoM || 0}x RuMiMoM</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <div className="flex flex-col items-center gap-1">
                                                  <Award className={cn("size-6", joRuMimoMClass)} />
                                                  <span className="text-xs font-bold">{user?.joRuMimoM || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{user?.joRuMiMoM || 0}x JoRuMiMoM</p></TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <ProfilePerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Image
                          </Button>
                            <Input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                          />
                      </div>
                  </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="favouriteTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favourite Premier League Team</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your favourite team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {teams && teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Profile</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Choose which emails you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="weekly-progress" className="text-base font-medium">Weekly Progress Emails</Label>
                <p className="text-sm text-muted-foreground">Receive a summary of your performance and rank every week.</p>
              </div>
              <Switch id="weekly-progress" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="new-events" className="text-base font-medium">New Event Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when new games are available for prediction.</p>
              </div>
              <Switch id="new-events" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="prediction-reminders" className="text-base font-medium">Prediction Reminders</Label>
                <p className="text-sm text-muted-foreground">Get a reminder before the prediction deadline for a game.</p>
              </div>
              <Switch id="prediction-reminders" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    