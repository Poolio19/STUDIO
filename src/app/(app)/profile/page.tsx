import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { userPredictionHistory, weeklyPerformance } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile | Predictatron',
    description: 'Track your prediction history and performance.',
};

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ProfilePage() {
  const user = {
    name: 'Alex',
    avatarId: '1',
    rank: 1,
    score: 1250,
    predictionsMade: 42,
    correctOutcomes: 25,
  };

  const accuracy = user.predictionsMade > 0 ? ((user.correctOutcomes / user.predictionsMade) * 100).toFixed(1) : 0;
  
  const avatarUrl = PlaceHolderImages.find((img) => img.id === user.avatarId)?.imageUrl || '';

  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">Here's a look at your prediction performance.</p>
        </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">Rank #{user.rank}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Score</span>
                        <span className="font-bold text-lg text-primary">{user.score} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Predictions Made</span>
                        <span className="font-bold">{user.predictionsMade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Correct Outcomes</span>
                        <span className="font-bold">{user.correctOutcomes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Prediction Accuracy</span>
                        <span className="font-bold text-green-600">{accuracy}%</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Performance</CardTitle>
                    <CardDescription>Your score progression over the last 5 weeks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart accessibilityLayer data={weeklyPerformance}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="week"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prediction History</CardTitle>
                    <CardDescription>A log of your recent predictions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Game</TableHead>
                            <TableHead>Prediction</TableHead>
                            <TableHead>Actual</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {userPredictionHistory.map((p, index) => (
                            <TableRow key={index}>
                            <TableCell className="font-medium">{p.game}</TableCell>
                            <TableCell>{p.prediction}</TableCell>
                            <TableCell>{p.actual}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={p.points > 0 ? 'default' : 'secondary'} className={p.points > 0 ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : ''}>
                                {p.points > 0 ? `+${p.points}` : p.points}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
