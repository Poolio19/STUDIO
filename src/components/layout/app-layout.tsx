
'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useUser, useFirebaseConfigStatus } from '@/firebase';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const { isConfigured } = useFirebaseConfigStatus();


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
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Connecting to services...</p>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className={cn("flex h-14 items-center gap-4 border-b bg-card px-6", { "hidden": isMobile })}>
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">PremPred 2025-2026</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
