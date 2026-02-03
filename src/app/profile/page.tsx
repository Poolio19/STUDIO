'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, Upload, Trophy, Award, ShieldCheck, Loader2, Users, Medal, DollarSign, Star, ShieldAlert, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, useResolvedUserId, useAuth } from '@/firebase';
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AuthForm } from '@/components/auth/auth-form';
import { updatePassword, updateEmail } from 'firebase/auth';


const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  nickname: z.string().optional(),
  initials: z.string().optional(),
  favouriteTeam: z.string({
    required_error: 'Please select a team.',
  }),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});
type EmailFormValues = z.infer<typeof emailFormSchema>;

const passwordFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function ProfilePage() {
  const { toast } = useToast();
  const auth = useAuth();
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

  const { data: user, isLoading: userLoading } = useDoc<User>(userDocRef);
  const { data: userHistory, isLoading: historyLoading } = useDoc<UserHistory>(userHistoryDocRef);
  const { data: allUserHistories, isLoading: allHistoriesLoading } = useCollection<UserHistory>(allUserHistoriesQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);

  const isLoading = isAuthUserLoading || userLoading || historyLoading || teamsLoading || allHistoriesLoading;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      nickname: '',
      initials: '',
      favouriteTeam: 'team_1',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: authUser?.email || '',
    }
  });

   const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        nickname: user.nickname || '',
        initials: user.initials || '',
        favouriteTeam: user.favouriteTeam || 'none',
        phoneNumber: user.phoneNumber || '',
      });
      emailForm.reset({
        email: user.email || authUser?.email || '',
      });
    }
  }, [user, form, emailForm, authUser]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userDocRef || !resolvedUserId || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication failed.' });
      return;
    }

    // ONLY check for duplicate names if the name has actually changed
    if (data.name !== user?.name) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("name", "==", data.name));
        const querySnapshot = await getDocs(q);

        let isNameTaken = false;
        querySnapshot.forEach((doc) => {
            if (doc.id !== resolvedUserId) {
                isNameTaken = true;
            }
        });

        if (isNameTaken) {
          toast({
            variant: 'destructive',
            title: 'Name already taken',
            description: `The name "${data.name}" is already in use by another account. Please run Bulk Sync in Admin to resolve identity conflicts.`,
          });
          return;
        }
    }

    const updatedData = {
        name: data.name,
        nickname: data.nickname,
        initials: data.initials,
        favouriteTeam: data.favouriteTeam,
        phoneNumber: data.phoneNumber,
    };

    setDocumentNonBlocking(userDocRef, updatedData, { merge: true });
    toast({ title: 'Profile Updated!' });
  }

  async function onEmailSubmit(data: EmailFormValues) {
    if (!authUser || !userDocRef) return;
    try {
      await updateEmail(authUser, data.email);
      setDocumentNonBlocking(userDocRef, { email: data.email }, { merge: true });
      toast({ title: 'Login Email Updated!' });
    } catch (error: any) {
      console.error("Email update error:", error);
      let description = "Failed to update email. Re-authentication may be required.";
      if (error.code === 'auth/email-already-in-use') description = "Email already in use.";
      toast({ variant: 'destructive', title: 'Update Failed', description });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!authUser || !userDocRef) return;
    try {
      await updatePassword(authUser, data.password);
      setDocumentNonBlocking(userDocRef, { mustChangePassword: false }, { merge: true });
      toast({ title: 'Password Updated!' });
      passwordForm.reset();
    } catch (error: any) {
      console.error("Password update error:", error);
      let description = "Update failed. Re-authentication may be required.";
      if (error.code === 'auth/requires-recent-login') description = "Please sign out and sign back in to change your password.";
      toast({ variant: 'destructive', title: 'Update Failed', description });
    }
  }

  const { chartData, yAxisDomain } = React.useMemo(() => {
    if (!allUserHistories || !userHistory || !userHistory.weeklyScores) {
      return { chartData: [], yAxisDomain: [0, 0] };
    }
    const allWeeks = [...new Set(allUserHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].filter(w => w > 0).sort((a, b) => a - b);
    const allScores = allUserHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0, 10] };
    const yAxisDomain: [number, number] = [Math.min(...allScores) - 5, Math.max(...allScores) + 5];
    const transformedData = allWeeks.map(week => {
      const scoresThisWeek = allUserHistories.map(h => h.weeklyScores.find(w => w.week === week)?.score).filter((s): s is number => s !== undefined);
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
        toast({ title: 'Avatar Updated!' });
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (isAuthUserLoading) return <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /><p>Loading profile...</p></div>;
  if (!authUser) return <div className="flex h-full w-full items-center justify-center"><AuthForm /></div>;

  if (user?.mustChangePassword) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-2 border-destructive shadow-lg">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="size-6" />Security Update Required</CardTitle>
            <CardDescription className="text-destructive-foreground/80">Set a new password to access the application.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField control={passwordForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Set Password & Continue</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
        <ShieldAlert className="size-16 text-destructive" />
        <div className="text-center space-y-2">
          <p className="text-xl font-bold">Profile Not Found</p>
          <p className="text-muted-foreground">Your account may need to be synchronized with the historical database.</p>
        </div>
        <Button variant="outline" onClick={() => auth?.signOut()}>
          <LogOut className="mr-2 size-4" /> Sign Out & Reconnect
        </Button>
      </div>
    );
  }

  const topTenCount = (user?.first || 0) + (user?.second || 0) + (user?.third || 0) + (user?.fourth || 0) + (user?.fifth || 0) + (user?.sixth || 0) + (user?.seventh || 0) + (user?.eighth || 0) + (user?.ninth || 0) + (user?.tenth || 0);

  return (
    <div className="space-y-8">
      <Card>
          <CardContent className="pt-6 flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage src={avatarPreview || getAvatarUrl(user?.avatar)} alt={user?.name} />
                      <AvatarFallback>{(user?.name || '?').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      {user?.nickname && <p className="text-lg text-muted-foreground">"{user.nickname}"</p>}
                      <p className="text-sm text-muted-foreground">Seasons Played: {user?.seasonsPlayed || 0}</p>
                      <p className="text-sm text-muted-foreground">All Time Winnings: £{(user?.cashWinnings || 0).toFixed(2)}</p>
                  </div>
              </div>
              <Separator orientation="vertical" className="h-auto hidden lg:block" />
              <Separator className="w-full lg:hidden" />
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div>
                      <h3 className="text-lg font-semibold mb-2 text-center">Season Stats</h3>
                      <div className="grid grid-cols-4 gap-x-2 text-center text-sm px-2">
                          <div /><div className="font-medium text-muted-foreground">High</div><div className="font-medium text-muted-foreground">Low</div><div className="font-medium text-muted-foreground">Current</div>
                          <div className="font-medium text-muted-foreground text-left">Pos</div><div className="font-bold">{user?.minRank}</div><div className="font-bold">{user?.maxRank}</div><div className="font-bold">{user?.rank}</div>
                          <div className="font-medium text-muted-foreground text-left">Pts</div><div className="font-bold">{user?.maxScore}</div><div className="font-bold">{user?.minScore}</div><div className="font-bold">{user?.score}</div>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold mb-2 text-center">Trophy Cabinet</h3>
                       <div className="space-y-4">
                          <div className="flex justify-around items-end">
                              <TooltipProvider>
                                  <Tooltip><TooltipTrigger><div className="flex flex-col items-center gap-1 w-12"><span className="text-xs font-semibold">2nd</span><Medal className={cn("size-7", (user?.second ?? 0) > 0 ? "text-slate-400" : "text-gray-300")} /><span className="text-sm font-bold">{user?.second || 0}</span></div></TooltipTrigger><TooltipContent><p>Runner Up</p></TooltipContent></Tooltip>
                                  <Tooltip><TooltipTrigger><div className="flex flex-col items-center gap-1 w-12"><span className="text-sm font-bold">1st</span><Trophy className={cn("size-8", (user?.first ?? 0) > 0 ? "text-yellow-500" : "text-gray-300")} /><span className="text-base font-bold">{user?.first || 0}</span></div></TooltipTrigger><TooltipContent><p>Champion</p></TooltipContent></Tooltip>
                                  <Tooltip><TooltipTrigger><div className="flex flex-col items-center gap-1 w-12"><span className="text-xs font-semibold">3rd</span><Medal className={cn("size-6", (user?.third ?? 0) > 0 ? "text-amber-700" : "text-gray-300")} /><span className="text-sm font-bold">{user?.third || 0}</span></div></TooltipTrigger><TooltipContent><p>3rd Place</p></TooltipContent></Tooltip>
                                  <Tooltip><TooltipTrigger><div className="flex flex-col items-center gap-1 w-12"><span className="text-xs font-semibold">Top 10</span><Star className="size-6 text-yellow-400" /><span className="text-sm font-bold">{topTenCount}</span></div></TooltipTrigger><TooltipContent><p>Top 10 Finishes</p></TooltipContent></Tooltip>
                              </TooltipProvider>
                          </div>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <ProfilePerformanceChart chartData={chartData} yAxisDomain={yAxisDomain} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
                            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </div>
                  </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="nickname" render={({ field }) => (<FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="initials" render={({ field }) => (<FormItem><FormLabel>Initials</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="favouriteTeam" render={({ field }) => (
                    <FormItem><FormLabel>Favourite Team</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem>{teams?.map((team) => (<SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Profile</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Security: Login Email</CardTitle></CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField control={emailForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>New Login Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={emailForm.formState.isSubmitting}>{emailForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />} Update Email</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Security: Password</CardTitle></CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField control={passwordForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
