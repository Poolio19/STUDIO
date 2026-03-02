'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/utils';
import { useUser, useFirebaseConfigStatus, useFirestore, useMemoFirebase, useCollection, useDoc, useResolvedUserId } from '@/firebase';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import type { Match, User, UserHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { recalculateAllDataClientSide } from '@/lib/recalculate';
import { allAwardPeriods } from '@/lib/award-periods';

const pageInfoMap: { [key: string]: { title: string; description: string | ((context: any) => string) } } = {
  '/leaderboard': { title: 'PremPred League', description: "See who's winning the prediction game." },
  '/predict': { 
      title: 'YourPred', 
      description: ({ seasonStarted }: any) => seasonStarted
          ? 'The season has started. Your predictions are locked in.'
          : 'Drag and drop the teams to create your PremPred entry; then sit back and pray for glory'
  },
  '/forum': { title: 'Chat Forum', description: 'Discuss predictions and talk trash with fellow players.' },
  '/most-improved': { 
      title: 'MiMoM', 
      description: ({ isTransition, transitionMonth }: any) => isTransition 
          ? `MiMoM Final Standings for ${transitionMonth}`
          : 'Celebrating the mid-season heroes of the PremPred.' 
  },
  '/standings': { title: 'Premier League', description: 'Official league standings and form guide.' },
  '/stats': { title: 'PredStats', description: "A detailed breakdown of each player's prediction scores." },
  '/consensus': { title: 'PredConsensus', description: 'See how the community predicts the final league standings.' },
  '/performance': { title: 'PredScore Graph', description: 'Track player score progression.' },
  '/rankings': { title: 'PredPosition Graph', description: 'Track player rank progression.' },
  '/profile': { title: 'PredProfile', description: 'Pred Performance and Personal Particulars' },
  '/scoring': { title: 'PredRules', description: 'Understand how scores are calculated.' },
  '/legends': { title: 'PredLegends', description: 'A hall of fame for past champions.'},
  '/admin': { title: 'Data Administration', description: "Manage application data sources." },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isConfigured } = useFirebaseConfigStatus();
  const pathname = usePathname();
  const router = useRouter();
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();
  const { toast } = useToast();
  const [isRecalculating, setIsRecalculating] = React.useState(false);

  const userDocRef = useMemoFirebase(() => (firestore && resolvedUserId) ? doc(firestore, 'users', resolvedUserId) : null, [firestore, resolvedUserId]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isAdmin = user?.email === 'jim.poole@prempred.com' || user?.email === 'jimpoolio@hotmail.com' || user?.uid === 'usr_009';
  const mustChangePassword = userProfile?.mustChangePassword === true;

  useEffect(() => {
    if (mustChangePassword && pathname !== '/profile') {
      router.push('/profile');
    }
  }, [mustChangePassword, pathname, router]);

  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  const historiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'userHistories') : null, [firestore]);
  const { data: matchesData } = useCollection<Match>(matchesQuery);
  const { data: historiesData } = useCollection<UserHistory>(historiesQuery);

  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
        const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        const playedWeeks = new Set(playedMatches.map(m => m.week));
        let latest = 0;
        for (let i = 1; i <= 38; i++) {
            if (playedWeeks.has(i)) latest = i;
            else break;
        }
        return latest;
    }
    return 0;
  }, [matchesData]);

  const transitionContext = useMemo(() => {
    if (!historiesData || !allAwardPeriods) return { isTransition: false, transitionMonth: '' };
    const rawPeriod = allAwardPeriods.find(p => currentWeek >= p.startWeek && currentWeek < p.endWeek) || allAwardPeriods[allAwardPeriods.length - 1];
    
    const hasProgress = historiesData.some(h => {
        const currentScore = h.weeklyScores.find(ws => ws.week === currentWeek)?.score ?? 0;
        const startScore = h.weeklyScores.find(ws => ws.week === rawPeriod.startWeek)?.score ?? 0;
        return currentScore > startScore;
    });

    const isTransition = !hasProgress && currentWeek >= rawPeriod.startWeek && currentWeek > 0;
    const transitionMonth = isTransition ? (allAwardPeriods.filter(p => p.endWeek <= currentWeek).sort((a,b) => b.endWeek - a.endWeek)[0]?.month || '') : '';
    
    return { isTransition, transitionMonth };
  }, [currentWeek, historiesData]);

  const seasonStarted = useMemo(() => {
    if (!matchesData) return false;
    return matchesData.some(m => m.homeScore !== -1 && m.awayScore !== -1);
  }, [matchesData]);

  const pageInfo = pageInfoMap[pathname];
  const title = pageInfo ? pageInfo.title : 'PremPred 2025-2026';
  let description = '';
  if (pageInfo) {
      description = typeof pageInfo.description === 'function' 
        ? pageInfo.description({ seasonStarted, ...transitionContext }) 
        : pageInfo.description;
  }
  
  const handleRecalculate = async () => {
    if (!firestore) return;
    setIsRecalculating(true);
    try {
      await recalculateAllDataClientSide(firestore, (message: string) => {
        toast({ title: 'Overhaul Status', description: message });
      });
      toast({ title: 'Recalculation Complete!' });
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Process Failed', description: error.message });
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!isConfigured) return <div className="flex h-screen w-screen items-center justify-center p-4">Firebase missing configuration.</div>;
  if (isUserLoading || (user && isProfileLoading)) return <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="ml-2">Connecting...</p></div>;
  
  return (
    <SidebarProvider>
      {!mustChangePassword && (
        <Sidebar className="z-50">
          <SidebarNav />
        </Sidebar>
      )}
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className={cn("flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4 sticky top-0 z-40", mustChangePassword && "hidden")}>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="flex -ml-1" />
          </div>
          <div className="flex-1 overflow-hidden ml-2">
            <h1 className="text-lg font-semibold truncate leading-tight">{title}</h1>
            {description && <p className="text-xs text-muted-foreground truncate hidden md:block">{description}</p>}
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-2">
            {isAdmin && !mustChangePassword && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isRecalculating}>
                        {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        <span className="hidden sm:inline">Recalculate</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Run master recalculation?</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogDescription>This will restore all tables and apply strictly enforced competition ranks and prize rules.</AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRecalculate}>Recalculate Now</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
