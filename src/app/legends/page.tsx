
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Trophy, Gem, ShieldCheck, TrendingUp, Star, DollarSign, Loader2 } from 'lucide-react';
import type { User, RollOfHonourEntry } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { getAvatarUrl } from '@/lib/placeholder-images';
import rollOfHonourData from '@/lib/roll-of-honour.json';

const StatCard = ({ title, icon: Icon, winners }: { title: string, icon: React.ElementType, winners: { user: User, value: string }[] }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            {winners.length > 0 ? (
                winners.map(({ user, value }) => (
                    <div key={user.id} className="flex items-center gap-4 mt-2">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{user.name ? user.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{user.name}</p>
                            <p className="text-muted-foreground font-semibold">{value}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground pt-4">No winner found for this category yet.</p>
            )}
        </CardContent>
    </Card>
);


export default function LegendsPage() {
    const firestore = useFirestore();
    
    const usersQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users'), where('isPro', '==', false)) : null, 
    [firestore]);

    const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
    
    const accolades = React.useMemo(() => {
        if (!users || users.length === 0) return null;

        const findWinners = (getValue: (u: User) => number, formatValue: (v: number) => string) => {
            const validUsers = users.filter(u => u.name);
            if (validUsers.length === 0) return [];
            
            const values = validUsers.map(u => getValue(u));
            const maxValue = Math.max(...values);
            
            // If the max value is <= 0 and all values are <= 0, there are no "winners".
            if (maxValue <= 0 && values.every(v => v <= 0)) {
                return [];
            }

            if (maxValue === -Infinity) return [];

            return validUsers
                .filter(u => getValue(u) === maxValue)
                .map(user => ({ user, value: formatValue(maxValue) }));
        };

        const topTenFinishes = (u: User) => (u.first || 0) + (u.second || 0) + (u.third || 0) + (u.fourth || 0) + (u.fifth || 0) + (u.sixth || 0) + (u.seventh || 0) + (u.eighth || 0) + (u.ninth || 0) + (u.tenth || 0);
        const totalMiMoMs = (u: User) => (u.mimoM || 0) + (u.ruMimoM || 0) + (u.joMimoM || 0) + (u.joRuMimoM || 0);

        return {
            mostWins: findWinners(u => u.first || 0, v => `${v} win${v > 1 ? 's' : ''}`),
            highestWinnings: findWinners(u => u.cashWinnings || 0, v => `£${v.toFixed(2)}`),
            mostTopTens: findWinners(topTenFinishes, v => `${v} finishes`),
            highestAverage: findWinners(u => (u.seasonsPlayed || 0) > 1 ? (u.cashWinnings || 0) / u.seasonsPlayed : -1, v => `£${v.toFixed(2)} / season`),
            mostMiMoMs: findWinners(totalMiMoMs, v => `${v} awards`),
        };
    }, [users]);
    
    const rollOfHonour: RollOfHonourEntry[] = rollOfHonourData;


    if (usersLoading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>All-Time All-Stars</CardTitle>
                <CardDescription>The best of the best from across the years.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accolades && <StatCard title="Most Overall Wins" icon={Crown} winners={accolades.mostWins} />}
                {accolades && <StatCard title="Highest Cumulative Cash" icon={DollarSign} winners={accolades.highestWinnings} />}
                {accolades && <StatCard title="Most Top 10 Finishes" icon={Star} winners={accolades.mostTopTens} />}
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>The Consistent &amp; The Climbers</CardTitle>
                <CardDescription>Recognizing sustained excellence and monthly brilliance.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accolades && <StatCard title="Highest Average Returns" icon={TrendingUp} winners={accolades.highestAverage} />}
                {accolades && <StatCard title="Most Magnificent MiMoMMer" icon={Gem} winners={accolades.mostMiMoMs} />}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>PremPred Roll of Honour</CardTitle>
                <CardDescription>The champions and runners-up from every season.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px] py-2">Season</TableHead>
                            <TableHead className="py-2">
                                <div className="flex items-center gap-2"><Trophy className="text-yellow-500 size-5" /> Champion</div>
                            </TableHead>
                            <TableHead className="text-right py-2">Points</TableHead>
                            <TableHead className="text-right py-2">Winnings</TableHead>
                            <TableHead className="py-2 border-l">
                                <div className="flex items-center gap-2 pl-4"><ShieldCheck className="text-slate-500 size-5" /> Runner Up</div>
                            </TableHead>
                            <TableHead className="text-right py-2">Points</TableHead>
                            <TableHead className="text-right py-2">Winnings</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rollOfHonour.map((entry) => (
                            <TableRow key={entry.season}>
                                <TableCell className="font-medium py-2 align-top">{entry.season}</TableCell>
                                <TableCell className="py-2 align-top">
                                    {entry.winners.map(p => <div key={p.name}>{p.name}</div>)}
                                </TableCell>
                                <TableCell className="text-right py-2 font-medium align-top">
                                    {entry.winners.map(p => <div key={p.name}>{p.points || ''}</div>)}
                                </TableCell>
                                <TableCell className="text-right py-2 font-medium align-top">
                                    {entry.winners.map(p => <div key={p.name}>{p.winnings && p.winnings > 0 ? `£${p.winnings.toFixed(2)}` : ''}</div>)}
                                </TableCell>
                                <TableCell className="py-2 border-l pl-4 align-top">
                                    {entry.runnersUp && entry.runnersUp.map(p => <div key={p.name}>{p.name}</div>)}
                                </TableCell>
                                <TableCell className="text-right py-2 font-medium align-top">
                                    {entry.runnersUp && entry.runnersUp.map(p => <div key={p.name}>{p.points || ''}</div>)}
                                </TableCell>
                                <TableCell className="text-right py-2 font-medium align-top">
                                    {entry.runnersUp && entry.runnersUp.map(p => <div key={p.name}>{p.winnings && p.winnings > 0 ? `£${p.winnings.toFixed(2)}`: ''}</div>)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}

