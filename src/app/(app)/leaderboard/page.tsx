
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

const getRankColor = (rank: number, hasWinnings: boolean) => {
    if (rank <= 5) {
        switch (rank) {
            case 1:
                return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40';
            case 2:
                return 'bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/40';
            case 3:
                return 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-100/80 dark:hover:bg-orange-900/40';
            default:
                return 'bg-green-100 dark:bg-green-900/30 hover:bg-green-100/80 dark:hover:bg-green-900/40';
        }
    }
    if (hasWinnings) {
        return 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40';
    }
    return '';
}

export default function LeaderboardPage() {
  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.rank - b.rank), []);

  const totalWinningsMap = useMemo(() => {
    const regularPlayers = sortedUsers.filter(u => !u.isPro);
    const proPlayers = sortedUsers.filter(u => u.isPro);

    // 1. Calculate MiMoM Winnings
    const mimoMWinnings = new Map<string, number>();
    const monthlyAwards: { [key: string]: { winners: string[], runnersUp: string[] } } = {};

    monthlyMimoM.forEach(m => {
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
    
    // 2. Calculate Leaderboard Winnings
    const leaderboardWinnings = new Map<string, number>();
    const prizeTiers = [45, 36, 28, 23, 18];
    
    let userIndex = 0;
    while (userIndex < regularPlayers.length) {
      const currentUser = regularPlayers[userIndex];
      const currentRank = currentUser.rank;

      if (currentRank > 5) {
        userIndex++;
        continue;
      }
      
      const tiedUsers = regularPlayers.filter(u => u.rank === currentRank);
      const numTied = tiedUsers.length;
      
      if (numTied > 0) {
        const ranksCovered = Array.from({ length: numTied }, (_, i) => currentRank + i);
        
        let prizePool = 0;
        ranksCovered.forEach(rank => {
          if (rank - 1 < prizeTiers.length) {
            prizePool += prizeTiers[rank - 1];
          }
        });
        
        const individualWinnings = prizePool / numTied;
        
        tiedUsers.forEach(user => {
          leaderboardWinnings.set(user.id, individualWinnings);
        });
        
        userIndex += numTied;
      } else {
        userIndex++;
      }
    }

    // 3. "Beat THE PROs" Prize
    const proWinnings = new Map<string, number>();
    const worstProRank = Math.max(...proPlayers.map(p => p.rank));
    regularPlayers.forEach(player => {
        if (player.rank < worstProRank) {
            proWinnings.set(player.id, 5);
        }
    });


    // 4. Combine all winnings
    const totalWinnings = new Map<string, number>();
    regularPlayers.forEach(user => {
        const lbWinnings = leaderboardWinnings.get(user.id) || 0;
        const mmWinnings = mimoMWinnings.get(user.id) || 0;
        const pWinnings = proWinnings.get(user.id) || 0;
        totalWinnings.set(user.id, lbWinnings + mmWinnings + pWinnings);
    });

    return totalWinnings;
  }, [sortedUsers]);


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
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r">Prem Pred 2025-2026 League</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground border-r">Changes in the past week</TableHead>
                <TableHead colSpan={4} className="text-center text-lg font-bold text-foreground">Seasons Highs & Lows</TableHead>
              </TableRow>
              <TableRow>
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
                const userWinnings = totalWinningsMap.get(user.id) || 0;
                
                return (
                    <TableRow key={user.id} className={cn(getRankColor(user.rank, userWinnings > 0 && !user.isPro))}>
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
