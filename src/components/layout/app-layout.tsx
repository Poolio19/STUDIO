
'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    // Allow access to the login page itself to avoid a redirect loop.
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [isUserLoading, user, pathname, router]);

  // While checking auth, show a global loading screen.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If on the login page (and not loading), render only the login page content.
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // If we have a user and are not on the login page, render the main app layout.
  if (user) {
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

  // Fallback for the brief moment before redirect happens. This prevents rendering children that might rely on a user.
  return null;
}
