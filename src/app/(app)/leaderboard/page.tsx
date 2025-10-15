
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { users, currentStandings } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { TrendingUp, TrendingDown } from 'lucide-react';

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

export const metadata: Metadata = {
    title: `Week ${currentWeek} - Standings | PremPred 2025-2026`,
    description: 'See who is at the top of the prediction game.',
};

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

const getRankChangeIcon = (change: number) => {
  if (change > 0) return 'rankUp';
  if (change < 0) return 'rankDown';
  return 'rankSame';
};

const formatPointsChange = (change: number) => {
    if (change > 0) return <span className="text-green-500">+{change}</span>;
    if (change < 0) return <span className="text-red-500">{change}</span>;
    return <span>{change}</span>;
}

const getRankColor = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40';
        case 2:
            return 'bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/40';
        case 3:
            return 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-100/80 dark:hover:bg-orange-900/40';
        case 4:
            return 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40';
        case 5:
            return 'bg-green-100 dark:bg-green-900/30 hover:bg-green-100/80 dark:hover:bg-green-900/40';
        default:
            return '';
    }
}

export default function LeaderboardPage() {
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Week {currentWeek} - Standings</h1>
          <p className="text-muted-foreground">See who's winning the prediction game this week.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>PremPred Current Standings</CardTitle>
          <CardDescription>Week {currentWeek} of 38</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Position Change</TableHead>
                <TableHead className="text-center">Points Change</TableHead>
                <TableHead className="text-center">Highest Rank</TableHead>
                <TableHead className="text-center">Lowest Rank</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => {
                const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                return (
                    <TableRow key={user.id} className={cn(getRankColor(user.rank))}>
                        <TableCell className="font-medium">{user.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                              <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                               <RankIcon className="size-4" />
                               <span>{Math.abs(user.rankChange)}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{formatPointsChange(user.scoreChange)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="size-4 text-green-500"/>{user.maxRank}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingDown className="size-4 text-red-500"/>{user.minRank}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">{user.score}</TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
