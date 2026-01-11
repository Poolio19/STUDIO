
'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
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
import { Award, Database, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

const navItems = [
  { href: '/standings', icon: 'standings', label: 'Premier League' },
  { href: '/leaderboard', icon: 'leaderboard', label: 'PremPred League' },
  { href: '/most-improved', icon: 'award', label: 'MiMoM' },
  { href: '/stats', icon: 'stats', label: 'PredStats' },
  { href: '/consensus', icon: 'consensus', label: 'Consensus' },
  { href: '/performance', icon: 'performance', label: 'Player Score Graph' },
  { href: '/rankings', icon: 'rankings', label: 'Player Position Graph' },
  { href: '/scoring', icon: 'scoring', label: 'Rules & Scoring' },
  { href: '/predict', icon: 'predict', label: 'Your Prediction' },
  { href: '/profile', icon: 'profile', label: 'Your Pred Profile' },
  { href: '/admin', icon: 'database', label: 'Data Admin' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const getAvatarUrl = (avatarId: string | undefined) => {
    if (!avatarId) return '';
    // Use a simple hashing function to get a consistent avatar from UID
    const hash = avatarId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageId = (hash % 50) + 1; // 50 is the number of placeholder images
    const image = PlaceHolderImages.find((img) => img.id === String(imageId));
    return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };
  
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
        ) : user ? (
            <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={user.photoURL || getAvatarUrl(user.uid)} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{user.displayName}</span>
                <span className="text-sm text-muted-foreground truncate">{user.email}</span>
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
                    <span className="font-semibold">Not signed in</span>
                </div>
            </div>
        )}
      </SidebarFooter>
    </>
  );
}
