'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Award, LogOut } from 'lucide-react';
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase, useResolvedUserId } from '@/firebase';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';

const navItems = [
  { href: '/leaderboard', icon: 'leaderboard', label: 'PremPred League' },
  { href: '/predict', icon: 'predict', label: 'YourPred' },
  { href: '/most-improved', icon: 'award', label: 'MiMoM' },
  { href: '/standings', icon: 'standings', label: 'Premier League' },
  { href: '/stats', icon: 'stats', label: 'PredStats' },
  { href: '/consensus', icon: 'consensus', label: 'PredConsensus' },
  { href: '/performance', icon: 'performance', label: 'PredScore Graph' },
  { href: '/rankings', icon: 'rankings', label: 'PredPosition Graph' },
  { href: '/profile', icon: 'profile', label: 'PredProfile' },
  { href: '/scoring', icon: 'scoring', label: 'PredRules' },
  { href: '/legends', icon: 'leaderboard', label: 'PredLegends' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const resolvedUserId = useResolvedUserId();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !resolvedUserId) return null;
    return doc(firestore, 'users', resolvedUserId);
  }, [firestore, resolvedUserId]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const avatarSrc = authUser?.photoURL || getAvatarUrl(userProfile?.avatar);
  
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Icons.logo className="size-8 text-primary" />
          <h1 className="text-xl font-semibold">Pred Menu</h1>
          <div className="ml-auto">
            <SidebarTrigger className="md:hidden" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons] || Award;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        {isUserLoading ? (
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarFallback />
                </Avatar>
                <div className="flex flex-col">
                    <span className="h-4 w-24 bg-muted rounded-md animate-pulse"></span>
                    <span className="h-3 w-32 bg-muted rounded-md animate-pulse mt-1"></span>
                </div>
            </div>
        ) : authUser ? (
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarImage src={avatarSrc} alt={userProfile?.name || 'User'} />
                    <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold truncate">{userProfile?.name || 'User'}</span>
                    <span className="text-sm text-muted-foreground truncate">{authUser.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-auto">
                    <LogOut className="size-4" />
                </Button>
            </div>
        ) : (
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarFallback>??</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <Link href="/profile">
                        <Button variant="link" className="p-0 h-auto">Sign In</Button>
                    </Link>
                </div>
            </div>
        )}
      </SidebarFooter>
    </>
  );
}
