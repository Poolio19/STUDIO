'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, Trophy, Award, ShieldCheck, Loader2, Medal, Star, Upload as UploadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAvatarUrl } from '@/lib/placeholder-images';
import type { Team, User, UserHistory, MonthlyMimoM, Prediction } from '@/lib/types';
import { ProfilePerformanceChart } from '@/components/charts/profile-performance-chart';
import React from 'react';
import { Label } from '@/components/ui/label';
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
import { updatePassword, updateEmail } from 'firebase/auth';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  nickname: z.string().optional(),
  initials: z.string().optional(),
  favouriteTeam: z.string({ required_error: 'Please select a team.' }),
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
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const mimoMQuery = useMemoFirebase(() => firestore ? collection(firestore, 'monthlyMimoM') : null, [firestore]);
  const predictionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'predictions') : null, [firestore]);

  const { data: profile, isLoading: profileLoading } = useDoc<User>(userDocRef);
  const { data: userHistory, isLoading: historyLoading } = useDoc<UserHistory>(userHistoryDocRef);
  const { data: allUserHistories, isLoading: allHistoriesLoading } = useCollection<UserHistory>(allUserHistoriesQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  const { data: allUsers } = useCollection<User>(usersQuery);
  const { data: monthlyMimoM } = useCollection<MonthlyMimoM>(mimoMQuery);
  const { data: predictions } = useCollection<Prediction>(predictionsQuery);

  const isLoading = isAuthUserLoading || profileLoading || historyLoading || teamsLoading || allHistoriesLoading;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', nickname: '', initials: '', favouriteTeam: 'team_1', phoneNumber: '', },
    mode: 'onChange',
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: authUser?.email || '' }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        nickname: profile.nickname || '',
        initials: profile.initials || '',
        favouriteTeam: profile.favouriteTeam || 'none',
        phoneNumber: profile.phoneNumber || '',
      });
      emailForm.reset({
        email: profile.email || authUser?.email || '',
      });
    }
  }, [profile, form, emailForm, authUser]);

  const currentPrizes = React.useMemo(() => {
    if (!profile || !allUsers || !monthlyMimoM || !predictions) return { bagged: 0, potential: 0 };

    const activeUsers = allUsers.filter(u => u.name && predictions.some(p => (p.userId || p.id) === u.id));
    const sortedUsers = [...activeUsers]
        .sort((a,b) => {
            if (b.score !== a.score) return b.score - a.score;
            const aIsPro = a.isPro ? 1 : 0;
            const bIsPro = b.isPro ? 1 : 0;
            if (aIsPro !== bIsPro) return bIsPro - aIsPro;
            return a.name.localeCompare(b.name);
        });

    let bagged = 0;
    const awardsMap: Record<string, { winners: string[], runnersUp: string[] }> = {};
    monthlyMimoM.forEach(m => {
        const key = m.special || `${m.month}-${m.year}`;
        if (!awardsMap[key]) awardsMap[key] = { winners: [], runnersUp: [] };
        if (m.type === 'winner') awardsMap[key].winners.push(m.userId);
        else if (m.type === 'runner-up') awardsMap[key].runnersUp.push(m.userId);
    });

    Object.values(awardsMap).forEach(award => {
        if (award.winners.includes(profile.id)) bagged += 10 / award.winners.length;
        if (award.winners.length === 1 && award.runnersUp.includes(profile.id)) bagged += 5 / award.runnersUp.length;
    });

    let highestProScore = -1;
    sortedUsers.forEach(u => { if (u.isPro && u.score > highestProScore) highestProScore = u.score; });

    const pointsGroups: { score: number, players: User[], startOrdinal: number }[] = [];
    let curOrd = 1;
    sortedUsers.forEach((u, i) => {
        if (i === 0 || u.score !== sortedUsers[i-1].score) {
            pointsGroups.push({ score: u.score, players: [u], startOrdinal: curOrd });
        } else {
            pointsGroups[pointsGroups.length - 1].players.push(u);
        }
        curOrd++;
    });

    const slayers: string[] = [];
    sortedUsers.forEach((p, idx) => {
        const ord = idx + 1;
        if (!p.isPro && p.score > highestProScore && ord > 10) slayers.push(p.id);
    });

    const slayerPoolTotal = Math.min(slayers.length * 5, 55);
    const individualBounty = slayers.length > 0 ? slayerPoolTotal / slayers.length : 0;

    const calculateTopTenPrizes = (sPool: number) => {
        const netSeasonalFund = 530 - 150 - 10 - sPool;
        const p10 = netSeasonalFund * 0.030073;
        let prizes: number[] = [p10];
        for (let i = 0; i < 9; i++) prizes.push(prizes[i] * 1.25);
        return prizes.reverse();
    };

    const finalSeasonalPrizes = calculateTopTenPrizes(slayerPoolTotal);

    let potential = 0;
    pointsGroups.forEach(group => {
        const regulars = group.players.filter(p => !p.isPro);
        if (regulars.length > 0) {
            let groupRegPrizeTotal = 0;
            group.players.forEach((p, idx) => {
                const pOrd = group.startOrdinal + idx;
                if (!p.isPro && pOrd <= 10) groupRegPrizeTotal += (finalSeasonalPrizes[pOrd-1] || 0);
            });
            if (regulars.some(r => r.id === profile.id)) potential = groupRegPrizeTotal / regulars.length;
        }
    });

    if (slayers.includes(profile.id) && potential === 0) potential = individualBounty;

    return { bagged, potential };
  }, [profile, allUsers, monthlyMimoM, predictions]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userDocRef || !resolvedUserId || !firestore) return;
    setDocumentNonBlocking(userDocRef, {
        name: data.name.trim(), nickname: data.nickname?.trim(), initials: data.initials?.trim()?.toUpperCase(),
        favouriteTeam: data.favouriteTeam, phoneNumber: data.phoneNumber?.trim(),
    }, { merge: true });
    toast({ title: 'Profile Updated!' });
  }

  async function onEmailSubmit(data: EmailFormValues) {
    if (!authUser || !userDocRef) return;
    try {
      await updateEmail(authUser, data.email);
      setDocumentNonBlocking(userDocRef, { email: data.email }, { merge: true });
      toast({ title: 'Login Email Updated!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!authUser || !userDocRef) return;
    try {
      await authUser.reload();
      await updatePassword(authUser, data.password);
      setDocumentNonBlocking(userDocRef, { mustChangePassword: false }, { merge: true });
      toast({ title: 'Password Updated!' });
      passwordForm.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: "Re-authentication required." });
    }
  }

  const { chartData, yAxisDomain } = React.useMemo(() => {
    if (!allUserHistories || !userHistory || !userHistory.weeklyScores) return { chartData: [], yAxisDomain: [0, 0] };
    const allWeeks = [...new Set(allUserHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].filter(w => w > 0).sort((a, b) => a - b);
    const allScores = allUserHistories.flatMap(h => h.weeklyScores.filter(w => w.week > 0).map(w => w.score));
    if (allScores.length === 0) return { chartData: [], yAxisDomain: [0, 10] };
    const minS = Math.min(...allScores);
    const maxS = Math.max(...allScores);
    return {
      chartData: allWeeks.map(week => {
        const scoresThisWeek = allUserHistories.map(h => h.weeklyScores.find(w => w.week === week)?.score).filter((s): s is number => s !== undefined);
        return {
          week: `Wk ${week}`,
          'Your Score': userHistory.weeklyScores.find(w => w.week === week)?.score,
          'Max Score': scoresThisWeek.length > 0 ? Math.max(...scoresThisWeek) : undefined,
          'Min Score': scoresThisWeek.length > 0 ? Math.min(...scoresThisWeek) : undefined,
        };
      }),
      yAxisDomain: [minS - 5, maxS + 5] as [number, number]
    };
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
  
  if (isAuthUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  const topTenCount = (profile?.first || 0) + (profile?.second || 0) + (profile?.third || 0) + (profile?.fourth || 0) + (profile?.fifth || 0) + (profile?.sixth || 0) + (profile?.seventh || 0) + (profile?.eighth || 0) + (profile?.ninth || 0) + (profile?.tenth || 0);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-2 shadow-lg">
          <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
                  <div className="p-10 flex flex-col items-center text-center lg:items-start lg:text-left gap-6 bg-muted/10 lg:w-1/3 border-b lg:border-b-0 lg:border-r">
                      <Avatar className="h-48 w-48 rounded-xl border-4 border-primary shadow-2xl">
                          <AvatarImage src={avatarPreview || getAvatarUrl(profile?.avatar)} alt={profile?.name} className="object-cover" />
                          <AvatarFallback className="text-5xl">{(profile?.name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <h2 className="text-3xl font-black tracking-tight">{profile?.name}</h2>
                          {profile?.nickname && <p className="text-xl text-muted-foreground italic font-semibold mt-1">"{profile.nickname}"</p>}
                      </div>
                  </div>
                  
                  <div className="flex-1 p-8 flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border-2 border-primary/20 rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2 text-primary border-b pb-2"><ShieldCheck className="size-5" /> This Season's Stats</h3>
                              <div className="grid grid-cols-4 gap-x-2 text-center text-sm">
                                  <div /><div className="font-semibold text-muted-foreground text-xs uppercase">High</div><div className="font-semibold text-muted-foreground text-xs uppercase">Low</div><div className="font-semibold text-muted-foreground text-xs uppercase">Now</div>
                                  <div className="font-bold text-muted-foreground text-left py-2 border-b">Pos</div><div className="font-bold text-green-600 py-2 border-b">{profile?.minRank || '-'}</div><div className="font-bold text-red-600 py-2 border-b">{profile?.maxRank || '-'}</div><div className="font-extrabold py-2 border-b text-lg">{profile?.rank || '-'}</div>
                                  <div className="font-bold text-muted-foreground text-left py-2">Pts</div><div className="font-bold text-green-600 py-2">{profile?.maxScore || '-'}</div><div className="font-bold text-red-600 py-2">{profile?.minScore || '-'}</div><div className="font-extrabold py-2 text-lg">{profile?.score || '-'}</div>
                              </div>
                          </div>
                          <div className="border-2 border-yellow-500/20 rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2 text-yellow-600 border-b pb-2"><Star className="size-5" /> Trophy Cabinet</h3>
                               <div className="flex justify-around items-end h-20">
                                  <TooltipProvider>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-[10px] font-bold text-muted-foreground">2nd</span>
                                                  <Medal className={cn("size-8", (profile?.second ?? 0) > 0 ? "text-slate-400" : "text-slate-200")} />
                                                  <span className="text-sm font-black">{profile?.second || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Runner Up</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-xs font-black">1st</span>
                                                  <Trophy className={cn("size-10", (profile?.first ?? 0) > 0 ? "text-yellow-500" : "text-yellow-100")} />
                                                  <span className="text-base font-black">{profile?.first || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Champion</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-[10px] font-bold text-muted-foreground">3rd</span>
                                                  <Medal className={cn("size-7", (profile?.third ?? 0) > 0 ? "text-amber-700" : "text-amber-100")} />
                                                  <span className="text-sm font-black">{profile?.third || 0}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>3rd Place</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <div className="flex flex-col items-center gap-1 w-12">
                                                  <span className="text-[10px] font-bold text-muted-foreground">T10</span>
                                                  <Award className="size-7 text-primary/40" />
                                                  <span className="text-sm font-black">{topTenCount}</span>
                                              </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Top 10 Finishes</p></TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                              </div>
                          </div>
                      </div>

                      <div className="w-full border-2 border-primary/10 rounded-xl p-6 bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner">
                          <div className="flex flex-col items-center md:items-start">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Experience</span>
                              <span className="text-2xl font-black">Played: {profile?.seasonsPlayed || 0}</span>
                          </div>
                          <div className="flex flex-col items-center md:items-start">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Career Earnings</span>
                              <span className="text-2xl font-black text-green-600">All Time: £{(profile?.cashWinnings || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col items-center md:items-start">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2025-26 Bagged</span>
                              <span className="text-2xl font-black text-primary">£{currentPrizes.bagged.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col items-center md:items-start">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2025-26 Potential</span>
                              <span className="text-2xl font-black text-orange-600">£{currentPrizes.potential.toFixed(2)}</span>
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
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><UploadIcon className="mr-2 h-4 w-4" />Change Picture</Button>
                            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </div>
                  </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Real Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="nickname" render={({ field }) => (<FormItem><FormLabel>Display Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="initials" render={({ field }) => (<FormItem><FormLabel>Initials</FormLabel><FormControl><Input {...field} maxLength={4}/></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="favouriteTeam" render={({ field }) => (
                    <FormItem><FormLabel>Supported Team</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">Neutral</SelectItem>{teams?.map((team) => (<SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>))}</Select><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Account: Login Email</CardTitle></CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField control={emailForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Current Login Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={emailForm.formState.isSubmitting} variant="outline" className="w-full">{emailForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />} Update Login Email</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Account: Security</CardTitle></CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField control={passwordForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Secure Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
