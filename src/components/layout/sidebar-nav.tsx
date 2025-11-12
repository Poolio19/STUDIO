'use client';

import { usePathname } from 'next/navigation';
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
import { Award } from 'lucide-react';

const navItems = [
  { href: '/leaderboard', icon: 'leaderboard', label: 'Current PremPred Standings' },
  { href: '/most-improved', icon: 'award', label: 'MiMoM' },
  { href: '/predict', icon: 'predict', label: 'Your Prediction' },
  { href: '/stats', icon: 'stats', label: 'Stats' },
  { href: '/standings', icon: 'standings', label: 'Premier League Standings' },
  { href: '/scoring', icon: 'scoring', label: 'Rules & Scoring' },
  { href: '/profile', icon: 'profile', label: 'Profile' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Icons.logo className="size-8 text-primary" />
          <h1 className="text-xl font-semibold">PremPred 2025-2026</h1>
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
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/1/100/100" alt="@user" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">Alex</span>
            <span className="text-sm text-muted-foreground">alex@example.com</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
