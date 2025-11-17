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
import { teams, currentStandings } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Premier League Standings | PremPred 2025-2026',
    description: 'The current Premier League standings.',
};

export default function StandingsPage() {
    const standingsWithTeamData = currentStandings
    .map(standing => {
      const team = teams.find(t => t.id === standing.teamId);
      return team ? { ...standing, ...team } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
        if (b!.points !== a!.points) {
            return b!.points - a!.points;
        }
        return b!.goalsFor - a!.goalsFor;
    })
    .map((team, index) => ({ ...team!, rank: index + 1 }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Premier League Standings</h1>
        <p className="text-muted-foreground">The official Premier League table as it stands.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Premier League Table 2025-2026</CardTitle>
          <CardDescription>Live standings updated weekly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Plyd</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-right">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standingsWithTeamData.map(team => {
                if (!team) return null;
                const TeamIcon = Icons[team.logo as IconName] || Icons.match;
                return (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <TeamIcon className="size-5" />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{team.gamesPlayed}</TableCell>
                    <TableCell className="text-center">{team.wins}</TableCell>
                    <TableCell className="text-center">{team.draws}</TableCell>
                    <TableCell className="text-center">{team.losses}</TableCell>
                    <TableCell className="text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-right font-bold">{team.points}</TableCell>
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
