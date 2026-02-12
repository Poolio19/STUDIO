'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/utils';
import { useUser, useFirebaseConfigStatus, useFirestore, useMemoFirebase, useCollection, useDoc, useResolvedUserId } from '@/firebase';
import { Loader2, RefreshCw, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import type { Match, User } from '@/lib/types';
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

const pageInfoMap: { [key: string]: { title: string; description: string | ((seasonStarted: boolean) => string) } } = {
  '/leaderboard': { title: 'PremPred League', description: "See who's winning the prediction game." },
  '/predict': { 
      title: 'YourPred', 
      description: (seasonStarted: boolean) => seasonStarted
          ? 'The season has started. Your predictions are locked in.'
          : 'Drag and drop the teams to create your PremPred entry; then sit back and pray for glory'
  },
  '/forum': { title: 'Chat Forum', description: 'Discuss predictions and talk trash with fellow players.' },
  '/most-improved': { title: 'MiMoM', description: 'Celebrating the mid-season heroes of the PremPred.' },
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

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !resolvedUserId) return null;
    return doc(firestore, 'users', resolvedUserId);
  }, [firestore, resolvedUserId]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isAdmin = user?.email === 'jim.poole@prempred.com';
  const mustChangePassword = userProfile?.mustChangePassword === true;

  useEffect(() => {
    if (mustChangePassword && pathname !== '/profile') {
      router.push('/profile');
    }
  }, [mustChangePassword, pathname, router]);

  const matchesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'matches') : null, [firestore]);
  const { data: matchesData } = useCollection<Match>(matchesQuery);

  const currentWeek = useMemo(() => {
    if (matchesData && matchesData.length > 0) {
        const playedMatches = matchesData.filter(m => m.homeScore !== -1 && m.awayScore !== -1);
        return Math.max(...playedMatches.map(m => m.week), 0);
    }
    return 0;
  }, [matchesData]);

  const seasonStarted = currentWeek > 0;

  const pageInfo = pageInfoMap[pathname];
  const title = pageInfo ? pageInfo.title : 'PremPred 2025-2026';
  let description = '';
  if (pageInfo) {
      if (typeof pageInfo.description === 'function') {
          description = pageInfo.description(seasonStarted);
      } else {
          description = pageInfo.description;
      }
  }
  
  const handleRecalculate = async () => {
    if (!firestore) return;
    setIsRecalculating(true);
    try {
      await recalculateAllDataClientSide(firestore, (message: string) => {
        toast({ title: 'Recalculation Progress', description: message });
      });
      toast({ title: 'Recalculation Complete!' });
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Recalculation Failed', description: error.message });
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!isConfigured) return <div className="flex h-screen w-screen items-center justify-center p-4">Firebase not configured.</div>;

  if (isUserLoading || (user && isProfileLoading)) {
    return <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Connecting...</p></div>;
  }
  
  return (
    <SidebarProvider>
      {!mustChangePassword && (
        <Sidebar>
          <SidebarNav />
        </Sidebar>
      )}
      <SidebarInset className="flex flex-col">
        <header className={cn("flex h-auto min-h-14 items-center gap-4 border-b bg-card px-6 py-3", mustChangePassword && "hidden")}>
          <div className="flex items-center gap-2">
            <SidebarTrigger>
                <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-2">
            {isAdmin && !mustChangePassword && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isRecalculating}>
                        <div className="flex items-center gap-2">
                            {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="hidden sm:inline">Recalculate</span>
                        </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Run master recalculation?</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogDescription>This will update everyone's visual competition ranks and dynamic prize shares based on the latest rules.</AlertDialogDescription>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRecalculate}>Recalculate Now</AlertDialogAction></AlertDialogFooter>
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
