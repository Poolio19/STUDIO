
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
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

export const metadata: Metadata = {
    title: `Week ${currentWeek} - Standings | PremPred 2025-2026`,
    description: 'See who is at the top of the prediction game.',
};

const getAvatarUrl = (avatarId: string) => {
  return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
};

const getRankChangeIcon = (change: number) => {
  if (change > 0) return ArrowUp;
  if (change < 0) return ArrowDown;
  return Minus;
};

const getRankChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
}

const formatPointsChange = (change: number) => {
    if (change > 0) return `+${change}`;
    return change;
}


const getRankColor = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40';
        case 2:
            return 'bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/40';
        case 3:
            return 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-100/80 dark:hover:bg-orange-900/40';
        default:
            return '';
    }
}

export default function LeaderboardPage() {
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">See who's winning the prediction game.</p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0">
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r">Week {currentWeek}, Current Standings</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r">Points</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground">Points</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[80px]">Position</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center border-r">Winnings</TableHead>
                <TableHead className="text-center">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r">Move</TableHead>
                <TableHead className="text-center">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r">Change</TableHead>
                <TableHead className="text-center">High</TableHead>
                <TableHead className="text-center border-r">Low</TableHead>
                <TableHead className="text-center">High</TableHead>
                <TableHead className="text-center">Low</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => {
                const RankIcon = getRankChangeIcon(user.rankChange);
                const ScoreIcon = getRankChangeIcon(user.scoreChange);
                const lastWeekRank = user.rank - user.rankChange;
                const lastWeekScore = user.score - user.scoreChange;
                return (
                    <TableRow key={user.id} className={cn(getRankColor(user.rank))}>
                        <TableCell className="font-medium text-center">{user.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                              <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">{user.score}</TableCell>
                        <TableCell className="text-center font-medium border-r">£0.00</TableCell>
                        <TableCell className="text-center font-medium">{lastWeekRank}</TableCell>
                        <TableCell className={cn("font-bold text-center border-r", getRankChangeColor(user.rankChange))}>
                            <div className="flex items-center justify-center gap-2">
                                <span>{Math.abs(user.rankChange)}</span>
                                <RankIcon className="size-5" />
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{lastWeekScore}</TableCell>
                        <TableCell className={cn("font-bold text-center border-r", getRankChangeColor(user.scoreChange))}>
                            <div className="flex items-center justify-center gap-2">
                                <span>{formatPointsChange(user.scoreChange)}</span>
                                <ScoreIcon className="size-5" />
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{user.maxRank}</TableCell>
                        <TableCell className="text-center font-medium border-r">{user.minRank}</TableCell>
                        <TableCell className="text-center font-medium">{user.maxScore}</TableCell>
                        <TableCell className="text-center font-medium">{user.minScore}</TableCell>
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
