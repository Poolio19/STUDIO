'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, Trophy, Award, ShieldCheck, Database } from 'lucide-react';
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
import { teams, userHistories, users as allUsers, monthlyMimoM, playerTeamScores, currentStandings } from '@/lib/data';
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
import { useFirestore } from '@/firebase';

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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can be fetched from an API in a real app
const defaultValues: Partial<ProfileFormValues> = {
  name: 'Alex',
  email: 'alex@example.com',
  country: 'United Kingdom',
  dob: new Date('1990-05-20'),
  favouriteTeam: 'team_1',
};

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  // Hardcoded user for now
  const user = allUsers.find(u => u.id === 'usr_1')!;

  const mimoMWins = React.useMemo(() => {
    return monthlyMimoM.filter(m => m.userId === user.id && m.type === 'winner').length;
  }, [user.id]);

  const pastChampionships = 0; // Replace with actual data if available

  const defaultAvatarUrl =
    PlaceHolderImages.find(img => img.id === user.avatar)?.imageUrl || '';

  const { chartData, yAxisDomain } = React.useMemo(() => {
    const allScores = userHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const yAxisDomain: [number, number] = [minScore - 5, maxScore + 5];

    const weeks = [...new Set(userHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].sort((a,b) => a-b);
    
    const transformedData = weeks.map(week => {
      const weekData: { [key: string]: number | string } = { week: `Wk ${week}` };
      const weeklyScores = userHistories.map(h => h.weeklyScores.find(w => w.week === week)?.score).filter(s => s !== undefined) as number[];

      const currentUserHistory = userHistories.find(h => h.userId === user.id);
      const currentUserScore = currentUserHistory?.weeklyScores.find(w => w.week === week)?.score;

      weekData['Min Score'] = Math.min(...weeklyScores);
      weekData['Max Score'] = Math.max(...weeklyScores);
      if (currentUserScore !== undefined) {
        weekData['Your Score'] = currentUserScore;
      }
      return weekData;
    });

    return { chartData: transformedData, yAxisDomain };
  }, [user.id]);
  
  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been saved.',
    });
    console.log(data);
  }
  
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
       toast({
        title: 'Avatar Updated!',
        description: 'Your new avatar has been set.',
      });
    }
  };


  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Personal Pred Profile</h1>
        <p className="text-slate-400">
          Pred Performance and Personal Particulars
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage
                      src={avatarPreview || defaultAvatarUrl}
                      alt={user.name}
                      data-ai-hint="person portrait"
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                      <h2 className="text-2xl font-bold">{form.watch('name')}</h2>
                      <p className="text-muted-foreground font-semibold">Rank: #{user.rank}</p>
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
                              <span className="font-bold text-lg">{user.maxRank}</span>
                              <span className="text-muted-foreground">High</span>
                          </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-lg">{user.minRank}</span>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your favourite team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams.map((team) => (
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
