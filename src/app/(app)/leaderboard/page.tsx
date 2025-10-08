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
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

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

export default function LeaderboardPage() {
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);
  const topThree = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  const mostImprovedPlayer = [...users].sort((a, b) => b.rankChange - a.rankChange)[0];
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });


  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Week {currentWeek} - Standings</h1>
          <p className="text-muted-foreground">See who's winning the prediction game this week.</p>
      </header>

      <Card className="bg-primary/10 border-primary/50">
        <CardHeader className="flex-row items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20">
            <Star className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle>Most Improved Manager of the Month</CardTitle>
            <CardDescription>MiMoM for {currentMonth}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={getAvatarUrl(mostImprovedPlayer.avatar)} alt={mostImprovedPlayer.name} data-ai-hint="person portrait" />
              <AvatarFallback>{mostImprovedPlayer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{mostImprovedPlayer.name}</h3>
              <p className="text-muted-foreground">Jumped <span className="font-bold text-green-600">{mostImprovedPlayer.rankChange}</span> spots this month!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topThree.map((user, index) => {
            return (
              <Card key={user.id} className={cn("relative", 
                index === 0 && "border-yellow-400 border-2 shadow-yellow-200/50 shadow-lg",
                index === 1 && "border-slate-400 border-2 shadow-slate-200/50 shadow-lg",
                index === 2 && "border-orange-400 border-2 shadow-orange-200/50 shadow-lg"
              )}>
                {index === 0 && <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">1st</Badge>}
                {index === 1 && <Badge className="absolute top-2 right-2 bg-slate-400 text-slate-900 hover:bg-slate-400">2nd</Badge>}
                {index === 2 && <Badge className="absolute top-2 right-2 bg-orange-400 text-orange-900 hover:bg-orange-400">3rd</Badge>}
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <Avatar className="h-20 w-20 border-2">
                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-3xl font-bold text-primary">{user.score} pts</p>
                  </div>
                </CardContent>
              </Card>
            )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Standings</CardTitle>
          <CardDescription>The current ranking of all players.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Pos. Change</TableHead>
                <TableHead className="text-center">Points Change</TableHead>
                <TableHead className="text-center">Max Pos.</TableHead>
                <TableHead className="text-center">Min Pos.</TableHead>
                <TableHead className="text-right">Max Pts.</TableHead>
                <TableHead className="text-right">Min Pts.</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => {
                const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                return (
                    <TableRow key={user.id}>
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
                        <TableCell className="text-right">{user.maxScore}</TableCell>
                        <TableCell className="text-right">{user.minScore}</TableCell>
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
