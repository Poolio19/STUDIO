
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, Trophy, Award, ShieldCheck, Loader2 } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  country: z.string().min(2, {
    message: 'Country must be at least 2 characters.',
  }),
  favouriteTeam: z.string({
    required_error: 'Please select a team.',
  }),
  championshipWins: z.number().optional(),
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

  const teamsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
  
  const mimoMQuery = useMemoFirebase(() => {
    return firestore && authUser ? collection(firestore, 'monthlyMimoM') : null
  }, [firestore, authUser]);


  const { data: user, isLoading: userLoading } = useDoc<User>(userDocRef);
  const { data: userHistory, isLoading: historyLoading } = useDoc<UserHistory>(userHistoryDocRef);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: monthlyMimoM, isLoading: mimoMLoading } = useCollection<MonthlyMimoM>(mimoMQuery);

  const isLoading = isAuthUserLoading || userLoading || historyLoading || teamsLoading || mimoMLoading;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      dob: new Date('1990-01-01'),
      country: 'United Kingdom',
      favouriteTeam: 'team_1',
      championshipWins: 0,
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        dob: user.joinDate ? new Date(user.joinDate) : new Date('1990-01-01'),
        country: user.country || 'United Kingdom',
        favouriteTeam: user.favouriteTeam || 'team_1',
        championshipWins: user.championshipWins || 0,
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
        joinDate: data.dob.toISOString(),
        country: data.country,
        favouriteTeam: data.favouriteTeam,
        championshipWins: data.championshipWins,
    };

    setDocumentNonBlocking(userDocRef, updatedData, { merge: true });
    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been saved.',
    });
  }

  const mimoMWins = React.useMemo(() => {
    if (!user || !monthlyMimoM) return 0;
    return monthlyMimoM.filter(m => m.userId === user.id && m.type === 'winner').length;
  }, [user, monthlyMimoM]);

  const pastChampionships = user?.championshipWins || 0;

  const defaultAvatarUrl = user ? PlaceHolderImages.find(img => img.id === user.avatar)?.imageUrl || '' : '';

  const { chartData, yAxisDomain } = React.useMemo(() => {
    if (!userHistory || !userHistory.weeklyScores) return { chartData: [], yAxisDomain: [0,0] };
    
    const allScores = userHistory.weeklyScores.filter(w => w.week > 0).map(w => w.score);
    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0,10] };
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const yAxisDomain: [number, number] = [minScore - 5, maxScore + 5];

    const weeks = [...new Set(userHistory.weeklyScores.map(w => w.week))].sort((a, b) => a - b);

    const transformedData = weeks.map(week => {
      const weekData: { [key: string]: number | string } = { week: `Wk ${week}` };
      const weekInfo = userHistory.weeklyScores.find(w => w.week === week);

      if (weekInfo) {
        weekData['Min Score'] = weekInfo.score - (Math.random() * 10);
        weekData['Max Score'] = weekInfo.score + (Math.random() * 10);
        weekData['Your Score'] = weekInfo.score;
      }
      return weekData;
    });

    return { chartData: transformedData, yAxisDomain };
  }, [userHistory]);

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


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage
                  src={avatarPreview || user?.avatar?.startsWith('data:') ? user.avatar : defaultAvatarUrl}
                  alt={user?.name}
                  data-ai-hint="person portrait"
                />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{form.watch('name')}</h2>
                <p className="text-muted-foreground font-semibold">Rank: #{user?.rank}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
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
              <Separator className="my-4" />
              <div className="w-full text-center">
                <h3 className="text-lg font-semibold mb-2">Season Stats</h3>
                <div className="flex justify-around text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{user?.maxRank}</span>
                    <span className="text-muted-foreground">High</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{user?.minRank}</span>
                    <span className="text-muted-foreground">Low</span>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="w-full text-center">
                <h3 className="text-lg font-semibold mb-2">Trophy Cabinet</h3>
                <div className="flex justify-center gap-4 text-muted-foreground">
                  <TooltipProvider>
                    {pastChampionships > 0 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex flex-col items-center">
                            <Trophy className="text-yellow-500" />
                            <span className="text-xs font-bold">{pastChampionships}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{pastChampionships}x Past Champion</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-col items-center">
                          <Award className={cn(mimoMWins > 0 ? "text-yellow-600" : "text-gray-400")} />
                          <span className="text-xs font-bold">{mimoMWins}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{mimoMWins}x MiMoM Winner</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-col items-center">
                          <ShieldCheck className="text-gray-400" />
                          <span className="text-xs font-bold">0</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Past Glories - TBC</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <ProfilePerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-[240px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown-buttons"
                              fromYear={1930}
                              toYear={new Date().getFullYear() - 10}
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. United Kingdom" {...field} />
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
                   <FormField
                    control={form.control}
                    name="championshipWins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Championships</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
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
    </div>
  );
}
