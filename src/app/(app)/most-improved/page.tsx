
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
import { users, monthlyMimoM, currentStandings } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons, IconName } from '@/components/icons';
import type { Metadata } from 'next';
import { Award, Star } from 'lucide-react';
import { useMemo } from 'react';

export const metadata: Metadata = {
    title: 'MiMoM | PremPred 2025-2026',
    description: 'See who is improving the most month on month.',
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

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

export default function MostImprovedPage() {
  const sortedByImprovement = [...users].sort((a, b) => b.rankChange - a.rankChange);
  const mostImprovedPlayer = sortedByImprovement[0];
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const mimoMWithDetails = useMemo(() => {
    const groupedByMonth: { [key: string]: any[] } = {};
    
    monthlyMimoM.forEach(m => {
      const key = `${m.month}-${m.year}`;
      if (!groupedByMonth[key]) {
        groupedByMonth[key] = [];
      }
      const user = users.find(u => u.id === m.userId);
      if (user) {
        groupedByMonth[key].push({ ...m, ...user });
      } else if (m.userId === 'special_christmas') {
         // This is a placeholder for a real user in the future
        const christmasWinner = users.find(u => u.rank === 1);
        if (christmasWinner) {
            groupedByMonth[key].push({ ...m, ...christmasWinner, name: christmasWinner.name, avatar: christmasWinner.avatar, month: 'Christmas No. 1' });
        }
      }
    });

    const displayOrder = ['August', 'September', 'October', 'November', 'December', 'Christmas No. 1', 'January', 'February', 'March', 'April', 'May'];
    const sortedGrouped = Object.values(groupedByMonth).sort((a, b) => {
        const monthA = a[0].month;
        const monthB = b[0].month;
        const yearA = a[0].year;
        const yearB = b[0].year;

        if (yearA !== yearB) return yearA - yearB;
        
        return displayOrder.indexOf(monthA) - displayOrder.indexOf(monthB);
    });

    return sortedGrouped;
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Most Improved Manager of the Month (MiMoM)</h1>
          <p className="text-muted-foreground">Celebrating the sharpest climbers in the ranks.</p>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>MiMoM Hall of Fame</CardTitle>
            <CardDescription>A list of the previous winners of the "Most Improved Manager of the Month" award.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mimoMWithDetails.map((group, index) => (
                <div key={index} className="p-4 border rounded-lg flex flex-col">
                    <p className="font-bold text-center mb-2">{group[0].month} {group[0].year !== 9999 ? group[0].year : ''}</p>
                    <div className="flex flex-col items-center justify-center gap-4 flex-grow">
                        {group.map(winner => (
                            <div key={winner.userId} className="flex flex-col items-center gap-2">
                                <Avatar className="h-16 w-16">
                                <AvatarImage src={getAvatarUrl(winner.avatar || '')} alt={winner.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{winner.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium text-center">{winner.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>


      <Card className="bg-primary/10 border-primary/50">
        <CardHeader className="flex-row items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20">
            <Star className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle>Manager of the Month - {currentMonth}</CardTitle>
            <CardDescription>Currently in the lead for this month's most improved!</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Improvement Rankings</CardTitle>
          <CardDescription>Current rankings based on position change in Week {currentWeek}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Position Change</TableHead>
                <TableHead className="text-center">Points Change</TableHead>
                <TableHead className="text-right">Current Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByImprovement.map((user, index) => {
                const RankIcon = Icons[getRankChangeIcon(user.rankChange) as IconName];
                return (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
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
                            <div className="flex items-center justify-center gap-1 font-bold text-lg">
                               <RankIcon className="size-5" />
                               <span>{Math.abs(user.rankChange)}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{formatPointsChange(user.scoreChange)}</TableCell>
                        <TableCell className="text-right font-bold">{user.score}</TableCell>
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
