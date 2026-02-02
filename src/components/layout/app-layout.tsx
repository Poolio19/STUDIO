'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useUser, useFirebaseConfigStatus, useFirestore, useMemoFirebase, useCollection, useDoc, useResolvedUserId } from '@/firebase';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
  '/most-improved': { title: 'MiMoM', description: 'Celebrating the meek, rarely-vaunted, mid-season heroes of the PremPred - with cash!' },
  '/standings': { title: 'Premier League', description: 'Official league standings, results, and form guide for the 2025-26 season.' },
  '/stats': { title: 'PredStats', description: "A detailed breakdown of each player's prediction scores for every team." },
  '/consensus': { title: 'PredConsensus', description: 'See how the community predicts the final league standings.' },
  '/performance': { title: 'PredScore Graph', description: 'Track player score progression over the season.' },
  '/rankings': { title: 'PredPosition Graph', description: 'Track player rank progression over the season.' },
  '/profile': { title: 'PredProfile', description: 'Pred Performance and Personal Particulars' },
  '/scoring': { title: 'PredRules', description: 'Understand how scores are calculated and other important rules.' },
  '/legends': { title: 'PredLegends', description: 'A hall of fame for past champions.'},
  '/admin': { title: 'Data Administration', description: "Manage your application's data sources and imports." },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
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
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    setIsRecalculating(true);
    toast({ title: 'Kicking off master recalculation...', description: 'This may take a minute. The page will refresh upon completion.' });
    try {
      await recalculateAllDataClientSide(firestore, (message: string) => {
        toast({ title: 'Recalculation Progress', description: message });
      });
      toast({ title: 'Recalculation Complete!', description: 'All data has been updated. Refreshing page...' });
      window.location.reload();
    } catch (error: any) {
      console.error('Recalculation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Recalculation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsRecalculating(false);
    }
  };


  if (!isConfigured) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Card className="max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="mt-4">Firebase Not Configured</CardTitle>
                <CardDescription>
                    The application cannot connect to Firebase because a valid API key has not been provided.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-4">
                    To fix this, please open the following file in your editor:
                </p>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground">
                    src/firebase/config.ts
                </code>
                <p className="mt-4">
                    Replace the placeholder <code className="font-mono text-xs">AIzaSyB-...</code> with your actual Firebase web app API key.
                </p>
            </CardContent>
        </Card>
      </div>
    );
  }

  // While checking auth, show a global loading screen.
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Connecting to services...</p>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      {!mustChangePassword && (
        <Sidebar>
          <SidebarNav />
        </Sidebar>
      )}
      <SidebarInset className="flex flex-col">
        <header className={cn("flex h-auto min-h-14 items-center gap-4 border-b bg-card px-6 py-3", { "hidden": isMobile })}>
          {!mustChangePassword && <SidebarTrigger />}
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="ml-auto">
            {isAdmin && !mustChangePassword && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isRecalculating}>
                          {isRecalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                          Recalculate Data
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will run the full data recalculation process. This can take up to a minute.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRecalculate}>Yes, Recalculate</AlertDialogAction>
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