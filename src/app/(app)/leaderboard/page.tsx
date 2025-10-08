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
import { users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons, IconName } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard | Predictatron',
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

export default function LeaderboardPage() {
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);
  const topThree = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">See who's winning the prediction game this week.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topThree.map((user, index) => {
            const RankIcon = (
                <div className="absolute -top-3 -left-3 flex size-8 items-center justify-center rounded-full border-2 border-background bg-card text-lg font-bold">
                    {user.rank}
                </div>
            );
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
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map((user) => {
                const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                return (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                               <span>{user.rank}</span>
                               <RankIcon className="size-4" />
                            </div>
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                        </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{user.score}</TableCell>
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
