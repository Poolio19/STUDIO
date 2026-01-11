
'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();

  // While checking auth or if there is no user, show a global loading screen.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Connecting to services...</p>
      </div>
    );
  }
  
  // If we have a user, render the main app layout.
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
