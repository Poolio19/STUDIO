
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { users, currentStandings, monthlyMimoM, type User } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useMemo } from 'react';

const currentWeek = currentStandings[0]?.gamesPlayed || 1;

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

const getRankColor = (user: User, allUsers: User[], hasWinnings: boolean) => {
    const userNonProRank = users.filter(u => !u.isPro).findIndex(u => u.id === user.id);
    const nonProUsers = allUsers.filter(u => !u.isPro);
    const tiedUsers = nonProUsers.filter(u => u.rank === user.rank);
    const firstTiedUserIndex = nonProUsers.findIndex(u => u.id === tiedUsers[0]?.id);

    if (user.isPro) {
        return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-700/80';
    }

    if (firstTiedUserIndex === 0) return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40';
    if (firstTiedUserIndex === 1) return 'bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/40';
    if (firstTiedUserIndex === 2) return 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-100/80 dark:hover:bg-orange-900/40';
    
    if (userNonProRank < 5) {
        return 'bg-green-100 dark:bg-green-900/30 hover:bg-green-100/80 dark:hover:bg-green-900/40';
    }

    if (hasWinnings) {
        return 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40';
    }
    return '';
}

export default function LeaderboardPage() {
  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.rank - b.rank), []);
  const proPlayers = useMemo(() => sortedUsers.filter(u => u.isPro), [sortedUsers]);
  const regularPlayers = useMemo(() => sortedUsers.filter(u => !u.isPro), [sortedUsers]);

  const totalWinningsMap = useMemo(() => {
    const mimoMWinnings = new Map<string, number>();
    const monthlyAwards: { [key: string]: { winners: string[], runnersUp: string[] } } = {};

    monthlyMimoM.forEach(m => {
        if (m.type !== 'winner' && m.type !== 'runner-up') return;

        const key = m.special ? m.special : `${m.month}-${m.year}`;
        if (!monthlyAwards[key]) {
            monthlyAwards[key] = { winners: [], runnersUp: [] };
        }
        if (m.type === 'winner') {
            monthlyAwards[key].winners.push(m.userId);
        } else if (m.type === 'runner-up') {
            monthlyAwards[key].runnersUp.push(m.userId);
        }
    });

    Object.values(monthlyAwards).forEach(award => {
        const winnerPrize = 10 / (award.winners.length || 1);
        award.winners.forEach(userId => {
            mimoMWinnings.set(userId, (mimoMWinnings.get(userId) || 0) + winnerPrize);
        });

        if (award.winners.length === 1 && award.runnersUp.length > 0) {
            const runnerUpPrize = 5 / award.runnersUp.length;
            award.runnersUp.forEach(userId => {
                mimoMWinnings.set(userId, (mimoMWinnings.get(userId) || 0) + runnerUpPrize);
            });
        }
    });
    
    const leaderboardWinnings = new Map<string, number>();
    const prizeTiers = [50, 41, 33, 26, 20];
    
    let playerIndex = 0;
    while(playerIndex < regularPlayers.length) {
        const player = regularPlayers[playerIndex];
        const playersAtSameRank = regularPlayers.filter(p => p.rank === player.rank);
        
        const prizePoolRanks = Array.from({ length: playersAtSameRank.length }, (_, i) => playerIndex + i);
        const prizePool = prizePoolRanks.reduce((sum, rankIndex) => {
            return sum + (prizeTiers[rankIndex] || 0);
        }, 0);

        const individualWinnings = prizePool > 0 ? prizePool / playersAtSameRank.length : 0;

        playersAtSameRank.forEach(tiedPlayer => {
            leaderboardWinnings.set(tiedPlayer.id, individualWinnings);
        });

        playerIndex += playersAtSameRank.length;
    }

    const proWinnings = new Map<string, number>();
    if (proPlayers.length > 0) {
      const bestProRank = Math.min(...proPlayers.map(p => p.rank));
      regularPlayers.forEach(player => {
          if (player.rank > 0 && player.rank < bestProRank) {
              proWinnings.set(player.id, 5);
          }
      });
    }

    const totalWinnings = new Map<string, number>();
    [...regularPlayers, ...proPlayers].forEach(user => {
      if (user.isPro) {
        totalWinnings.set(user.id, 0);
      } else {
        const lbWinnings = leaderboardWinnings.get(user.id) || 0;
        const mmWinnings = mimoMWinnings.get(user.id) || 0;
        const pWinnings = proWinnings.get(user.id) || 0;
        totalWinnings.set(user.id, lbWinnings + mmWinnings + pWinnings);
      }
    });

    return totalWinnings;
  }, [regularPlayers, proPlayers]);


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
               <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-200/50 dark:bg-blue-800/30">PremPredStandings</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-green-200/50 dark:bg-green-800/30">ChangesInThePastWeek</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground bg-purple-200/50 dark:bg-purple-800/30">SeasonsHighsAndLows</TableHead>
              </TableRow>
              <TableRow>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r bg-blue-100/50 dark:bg-blue-900/20">Week {currentWeek}, CurrentStandings</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-green-900/20">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-green-100/50 dark:bg-green-900/20">Points</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground border-r bg-purple-100/50 dark:bg-purple-900/20">Position</TableHead>
                <TableHead colSpan={2} className="text-center text-lg font-bold text-foreground bg-purple-100/50 dark:bg-purple-900/20">Points</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[80px] bg-blue-50/50 dark:bg-blue-900/10">Position</TableHead>
                <TableHead className="bg-blue-50/50 dark:bg-blue-900/10">Player</TableHead>
                <TableHead className="text-center bg-blue-50/50 dark:bg-blue-900/10">Points</TableHead>
                <TableHead className="text-center border-r bg-blue-50/50 dark:bg-blue-900/10">Winnings</TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10">Move</TableHead>
                <TableHead className="text-center bg-green-50/50 dark:bg-green-900/10">Was</TableHead>
                <TableHead className="w-[130px] text-center border-r bg-green-50/50 dark:bg-green-900/10">Change</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10">High</TableHead>
                <TableHead className="text-center border-r bg-purple-50/50 dark:bg-purple-900/10">Low</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10">High</TableHead>
                <TableHead className="text-center bg-purple-50/50 dark:bg-purple-900/10">Low</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user, index) => {
                const RankIcon = getRankChangeIcon(user.rankChange);
                const ScoreIcon = getRankChangeIcon(user.scoreChange);
                const userWinnings = totalWinningsMap.get(user.id) || 0;
                
                return (
                    <TableRow key={user.id} className={cn(getRankColor(user, sortedUsers, userWinnings > 0))}>
                        <TableCell className="font-medium text-center">{user.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                              <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.isPro ? user.name.toUpperCase() : user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">{user.score}</TableCell>
                        <TableCell className="text-center font-medium border-r">
                           {user.isPro ? '-' : (userWinnings > 0 ? `£${userWinnings.toFixed(2)}` : '£0.00')}
                        </TableCell>
                        <TableCell className="text-center font-medium">{user.previousRank}</TableCell>
                        <TableCell className={cn("font-bold text-center border-r", getRankChangeColor(user.rankChange))}>
                            <div className="flex items-center justify-center gap-2">
                                <span>{Math.abs(user.rankChange)}</span>
                                <RankIcon className="size-5" />
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{user.previousScore}</TableCell>
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

    
