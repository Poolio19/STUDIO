'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ShieldCheck, Loader2, Medal, Upload as UploadIcon, Trophy } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvatarUrl } from '@/lib/placeholder-images';
import type { Team, User, UserHistory, MonthlyMimoM, Prediction } from '@/lib/types';
import { ProfilePerformanceChart } from '@/components/charts/profile-performance-chart';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, useResolvedUserId } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AuthForm } from '@/components/auth/auth-form';
import { updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  nickname: z.string().optional(),
  initials: z.string().optional(),
  favouriteTeam: z.string({ required_error: 'Please select a team.' }),
  phoneNumber: z.string().optional(),
});

const emailFormSchema = z.object({ email: z.string().email("Invalid email address.") });
const passwordFormSchema = z.object({
  password: z.string().min(6, "Must be at least 6 chars."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, { message: "Match error", path: ["confirmPassword"] });

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();
  
  const userDocRef = useMemoFirebase(() => (firestore && resolvedUserId) ? doc(firestore, 'users', resolvedUserId) : null, [firestore, resolvedUserId]);
  const userHistoryDocRef = useMemoFirebase(() => (firestore && resolvedUserId) ? doc(firestore, 'userHistories', resolvedUserId) : null, [firestore, resolvedUserId]);
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
  const { data: monthlyMimoMAwards } = useCollection<MonthlyMimoM>(mimoMQuery);
  const { data: predictions } = useCollection<Prediction>(predictionsQuery);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', nickname: '', initials: '', favouriteTeam: 'none', phoneNumber: '' },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: authUser?.email || '' }
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name || '', nickname: profile.nickname || '', initials: profile.initials || '', favouriteTeam: profile.favouriteTeam || 'none', phoneNumber: profile.phoneNumber || '' });
      emailForm.reset({ email: profile.email || authUser?.email || '' });
    }
  }, [profile, authUser, form, emailForm]);

  const awardCerts = React.useMemo(() => {
    if (!profile || !monthlyMimoMAwards) return [];
    return monthlyMimoMAwards
        .filter(a => a.userId === profile.id)
        .map(a => {
            const shortYear = String(a.year).slice(-2);
            const m = a.month.slice(0, 3);
            const monthMap: Record<string, string> = { 'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12' };
            const monthPad = monthMap[m] || '00';
            let code = 'MiM';
            if (a.special === 'Winner') code = 'MiM';
            else if (a.special === 'Runner-Up') code = 'RuM';
            else if (a.type === 'winner') code = 'MiM';
            else if (a.type === 'runner-up') code = 'RuM';
            
            // Check for Joint awards
            if (a.special && a.special.toLowerCase().includes('jo')) code = 'J' + code;

            return {
                id: a.id,
                label: `${code}: ${monthPad}/${shortYear}`,
                isWinner: a.type === 'winner'
            };
        });
  }, [profile, monthlyMimoMAwards]);

  const currentPrizes = React.useMemo(() => {
    if (!profile || !allUsers || !monthlyMimoMAwards || !predictions) return { bagged: 0, potential: 0 };
    const activeUsers = allUsers.filter(u => u.name && predictions.some(p => (p.userId || (p as any).id) === u.id));
    const sortedList = [...activeUsers].sort((a, b) => b.score - a.score || (a.isPro ? -1 : 1) || (a.name || '').localeCompare(b.name || ''));

    let baggedAmount = 0;
    const awardsMap: Record<string, { winners: string[], runnersUp: string[] }> = {};
    monthlyMimoMAwards.forEach(m => {
        const key = m.special || `${m.month}-${m.year}`;
        if (!awardsMap[key]) awardsMap[key] = { winners: [], runnersUp: [] };
        if (m.type === 'winner') awardsMap[key].winners.push(m.userId);
        else if (m.type === 'runner-up') awardsMap[key].runnersUp.push(m.userId);
    });
    Object.values(awardsMap).forEach(award => {
        if (award.winners.includes(profile.id)) baggedAmount += 10 / (award.winners.length || 1);
        if (award.winners.length === 1 && award.runnersUp.includes(profile.id)) baggedAmount += 5 / (award.runnersUp.length || 1);
    });

    let highestProScoreVal = -1;
    sortedList.forEach(u => { if (u.isPro && u.score > highestProScoreVal) highestProScoreVal = u.score; });
    const slayersList = sortedList.filter((p, idx) => !p.isPro && p.score > highestProScoreVal && (idx + 1) > 10).map(p => p.id);
    const totalSlayerBounty = Math.min(slayersList.length * 5, 55);
    const indBounty = slayersList.length > 0 ? totalSlayerBounty / slayersList.length : 0;

    const netSFund = 530 - 150 - 10 - totalSlayerBounty;
    let pArr: number[] = [netSFund / 33.2529];
    for (let i = 0; i < 9; i++) pArr.push(pArr[i] * 1.25);
    const finalSeasonalPrizes = pArr.reverse();

    let potentialAmount = 0;
    const myOrd = sortedList.findIndex(u => u.id === profile.id) + 1;
    if (!profile.isPro && myOrd <= 10 && myOrd > 0) potentialAmount = finalSeasonalPrizes[myOrd - 1] || 0;
    if (slayersList.includes(profile.id) && potentialAmount === 0) potentialAmount = indBounty;

    return { bagged: baggedAmount, potential: potentialAmount };
  }, [profile, allUsers, monthlyMimoMAwards, predictions]);

  const cInfo = React.useMemo(() => {
    if (!allUserHistories || !userHistory?.weeklyScores) return { chartData: [], yAxisDomain: [0, 10] as [number, number] };
    const aWeeks = [...new Set(allUserHistories.flatMap(h => h.weeklyScores.map(w => w.week)))].filter(w => w >= 0).sort((a, b) => a - b);
    const aScores = allUserHistories.flatMap(h => h.weeklyScores.map(w => w.score));
    if (aScores.length === 0) return { chartData: [], yAxisDomain: [0, 10] as [number, number] };
    return {
      chartData: aWeeks.map(week => {
        const s = allUserHistories.map(h => h.weeklyScores.find(w => w.week === week)?.score).filter((v): v is number => v !== undefined);
        return { week: `Wk ${week}`, 'Your Score': userHistory.weeklyScores.find(w => w.week === week)?.score, 'Max Score': s.length > 0 ? Math.max(...s) : undefined, 'Min Score': s.length > 0 ? Math.min(...s) : undefined };
      }),
      yAxisDomain: [Math.min(...aScores) - 5, Math.max(...aScores) + 5] as [number, number]
    };
  }, [allUserHistories, userHistory]);

  const onProfileSave = (values: z.infer<typeof profileFormSchema>) => { if (userDocRef) { setDocumentNonBlocking(userDocRef, values, { merge: true }); toast({ title: 'Profile Updated!' }); } };
  const onEmailUpdate = async (values: z.infer<typeof emailFormSchema>) => { if (authUser) { try { await verifyBeforeUpdateEmail(authUser, values.email); toast({ title: 'Verification Sent', description: 'Please check your new inbox to verify the change.' }); } catch (e: any) { toast({ variant: 'destructive', title: 'Fail', description: e.message }); } } };
  const onPasswordUpdate = async (values: z.infer<typeof passwordFormSchema>) => { if (authUser) { try { await updatePassword(authUser, values.password); if (userDocRef) setDocumentNonBlocking(userDocRef, { mustChangePassword: false }, { merge: true }); toast({ title: 'Security Updated!' }); passwordForm.reset(); } catch (e: any) { toast({ variant: 'destructive', title: 'Fail', description: e.message }); } } };
  
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userDocRef) {
      const reader = new FileReader();
      reader.onloadend = () => { const res = reader.result as string; setAvatarPreview(res); setDocumentNonBlocking(userDocRef, { avatar: res }, { merge: true }); toast({ title: 'Avatar Updated!' }); };
      reader.readAsDataURL(file);
    }
  };
  
  if (isAuthUserLoading || profileLoading || historyLoading || teamsLoading || allHistoriesLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="ml-2 text-lg">Connecting to PredCentral...</p></div>;
  if (!authUser) return <div className="flex h-full w-full items-center justify-center"><AuthForm /></div>;

  const ttCount = (profile?.first || 0) + (profile?.second || 0) + (profile?.third || 0) + (profile?.fourth || 0) + (profile?.fifth || 0) + (profile?.sixth || 0) + (profile?.seventh || 0) + (profile?.eighth || 0) + (profile?.ninth || 0) + (profile?.tenth || 0);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-2 shadow-2xl">
          <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
                  {/* Gaudy Gold Frame Section */}
                  <div className="p-1 lg:w-1/3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r bg-muted/5">
                      <div className="relative p-6 rounded-xl shadow-2xl bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 border-[16px] border-yellow-700 w-full h-full flex flex-col items-center justify-center min-h-[400px]">
                          <Avatar className="h-60 w-60 rounded-lg border-8 border-yellow-900 shadow-inner bg-card">
                              <AvatarImage src={avatarPreview || getAvatarUrl(profile?.avatar)} alt={profile?.name} className="object-cover" />
                              <AvatarFallback className="text-6xl">{(profile?.name || '?').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="mt-6 text-center text-yellow-950">
                              <h2 className="text-3xl font-black tracking-tight drop-shadow-md uppercase">{profile?.name}</h2>
                              {profile?.nickname && <p className="text-xl italic font-bold mt-1 opacity-90">"{profile.nickname}"</p>}
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 p-8 flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                              <div className="border-2 border-primary/20 rounded-xl p-6 bg-card shadow-sm">
                                  <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2 text-primary border-b pb-2"><ShieldCheck className="size-5" /> This Season's Stats</h3>
                                  <div className="grid grid-cols-4 gap-x-2 text-center text-sm">
                                      <div /><div className="font-semibold text-muted-foreground text-xs uppercase">High</div><div className="font-semibold text-muted-foreground text-xs uppercase">Low</div><div className="font-semibold text-muted-foreground text-xs uppercase">Now</div>
                                      <div className="font-bold text-muted-foreground text-left py-2 border-b">Pos</div><div className="font-bold text-green-600 py-2 border-b">{profile?.minRank || '-'}</div><div className="font-bold text-red-600 py-2 border-b">{profile?.maxRank || '-'}</div><div className="font-extrabold py-2 border-b text-lg">{profile?.rank || '-'}</div>
                                      <div className="font-bold text-muted-foreground text-left py-2">Pts</div><div className="font-bold text-green-600 py-2">{profile?.maxScore || '-'}</div><div className="font-bold text-red-600 py-2">{profile?.minScore || '-'}</div><div className="font-extrabold py-2 text-lg">{profile?.score || '-'}</div>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Wood & Glass Trophy Cabinet */}
                          <div className="border-[12px] border-amber-950 bg-amber-900 rounded-xl shadow-2xl p-1 relative h-full">
                              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded h-full p-6 shadow-inner overflow-hidden flex flex-col gap-6">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-10" />
                                  <h3 className="text-sm font-black text-center flex items-center justify-center gap-2 text-white/90 border-b border-white/20 pb-2 relative z-20 uppercase">Trophy Cabinet</h3>
                                  
                                  <div className="flex justify-around items-end h-20 relative z-20">
                                      <TooltipProvider>
                                          <Tooltip>
                                              <TooltipTrigger asChild><div className="flex flex-col items-center gap-1 w-12"><span className="text-[10px] font-black text-yellow-400">1st</span><Trophy className={cn("size-10 transition-all", (profile?.first ?? 0) > 0 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] scale-110" : "text-white/10")} /><span className="text-sm font-black text-white">{profile?.first || 0}</span></div></TooltipTrigger>
                                              <TooltipContent><p>Champion</p></TooltipContent>
                                          </Tooltip>
                                          <Tooltip>
                                              <TooltipTrigger asChild><div className="flex flex-col items-center gap-1 w-12"><span className="text-[10px] font-bold text-slate-300">2nd</span><Medal className={cn("size-8 transition-all", (profile?.second ?? 0) > 0 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)] scale-105" : "text-white/10")} /><span className="text-sm font-black text-white">{profile?.second || 0}</span></div></TooltipTrigger>
                                              <TooltipContent><p>Runner Up</p></TooltipContent>
                                          </Tooltip>
                                          <Tooltip>
                                              <TooltipTrigger asChild><div className="flex flex-col items-center gap-1 w-12"><span className="text-[10px] font-bold text-amber-600">3rd</span><Medal className={cn("size-7 transition-all", (profile?.third ?? 0) > 0 ? "text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]" : "text-white/10")} /><span className="text-sm font-black text-white">{profile?.third || 0}</span></div></TooltipTrigger>
                                              <TooltipContent><p>3rd Place</p></TooltipContent>
                                          </Tooltip>
                                          <Tooltip>
                                              <TooltipTrigger asChild><div className="flex flex-col items-center gap-1 w-12"><span className="text-[10px] font-bold text-primary/60">T10</span><Medal className={cn("size-7 transition-all", ttCount > 0 ? "text-primary/40" : "text-white/10")} /><span className="text-sm font-black text-white">{ttCount}</span></div></TooltipTrigger>
                                              <TooltipContent><p>Top 10 Finishes</p></TooltipContent>
                                          </Tooltip>
                                      </TooltipProvider>
                                  </div>

                                  <div className="relative z-20 border-t border-white/10 pt-4">
                                      <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto pr-1">
                                          {awardCerts.length > 0 ? awardCerts.map((cert) => (
                                              <div key={cert.id} className={cn(
                                                  "px-2 py-1 rounded border-2 text-[10px] font-black uppercase tracking-tighter shadow-sm whitespace-nowrap",
                                                  cert.isWinner 
                                                    ? "bg-yellow-100 border-yellow-500 text-yellow-900" 
                                                    : "bg-slate-100 border-slate-400 text-slate-900"
                                              )}>
                                                  {cert.label}
                                              </div>
                                          )) : (
                                              <p className="text-[10px] text-white/20 italic">No certificates yet.</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="w-full border-2 border-primary/10 rounded-xl p-6 bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner">
                          <div className="flex flex-col items-center md:items-start"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Experience</span><span className="text-2xl font-black">Played: {profile?.seasonsPlayed || 0}</span></div>
                          <div className="flex flex-col items-center md:items-start"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Career Earnings</span><span className="text-2xl font-black text-green-600">All Time: £{(profile?.cashWinnings || 0).toFixed(2)}</span></div>
                          <div className="flex flex-col items-center md:items-start"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2025-26 Bagged</span><span className="text-2xl font-black text-primary">£{currentPrizes.bagged.toFixed(2)}</span></div>
                          <div className="flex flex-col items-center md:items-start"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2025-26 Potential</span><span className="text-2xl font-black text-orange-600">£{currentPrizes.potential.toFixed(2)}</span></div>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <ProfilePerformanceChart chartData={cInfo.chartData} yAxisDomain={cInfo.yAxisDomain} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onProfileSave)} className="space-y-4">
                  <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><UploadIcon className="mr-2 h-4 w-4" />Change Picture</Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
                      </div>
                  </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Real Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="nickname" render={({ field }) => (<FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="initials" render={({ field }) => (<FormItem><FormLabel>Initials</FormLabel><FormControl><Input {...field} maxLength={4}/></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Mobile</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="favouriteTeam" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supported Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">Neutral</SelectItem>
                        {teams?.map((team) => (<SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Account: Login Email</CardTitle></CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailUpdate)} className="space-y-4">
                  <FormField control={emailForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Login Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={emailForm.formState.isSubmitting} variant="outline" className="w-full">Update Email</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Account: Security</CardTitle></CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordUpdate)} className="space-y-4">
                  <FormField control={passwordForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
