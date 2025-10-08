'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { teams, previousSeasonStandings } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { Reorder } from 'framer-motion';

const predictionSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  teamLogo: z.string(),
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

export default function PredictPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
      })),
    },
  });

  const { fields, move } = useFieldArray({
    control: form.control,
    name: 'predictions',
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Season Predictions Submitted!',
      description:
        'Your final standings prediction has been saved. Good luck!',
    });
  }

  const standingsWithTeamData = previousSeasonStandings
    .map(standing => {
      const team = teams.find(t => t.id === standing.teamId);
      return team ? { ...standing, ...team } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.rank - b!.rank);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Predict Final Standings
          </h1>
          <p className="text-muted-foreground">
            Rank the teams in their predicted final standings for the season.
            Predictions must be made before the season starts to avoid
            penalties.
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Premier League 2025-2026</CardTitle>
                <CardDescription>
                  Drag and drop the teams to create your predicted league table.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Reorder.Group
                  axis="y"
                  values={fields}
                  onReorder={newOrder => {
                    const from = fields.findIndex(f => f.id === newOrder[0].id);
                    const to = fields.findIndex(
                      f => f.id === newOrder[newOrder.length - 1].id
                    );

                    // This logic seems complex, Framer-motion has some issues with react-hook-form's `move`
                    // A simpler re-implementation that works more reliably
                    const newFields = [...fields];
                    const [moved] = newFields.splice(from, 1);
                    newFields.splice(to, 0, moved);

                    // We need to tell react-hook-form about the moves
                    // but we do it based on what's visible, not by their internal array.
                    // This is a bit of a hack around framer-motion and RHF `move`
                    // by detecting the original and new positions and moving them.
                    const fromIndex = fields.findIndex(
                      field => field.id === newOrder[0].id
                    );
                    const toIndex =
                      fields.length -
                      1 -
                      [...fields]
                        .reverse()
                        .findIndex(field => field.id === newOrder[0].id);
                    if (fromIndex !== toIndex) {
                      move(fromIndex, toIndex);
                    }
                  }}
                  className="space-y-2"
                >
                  {fields.map((field, index) => {
                    const TeamIcon =
                      Icons[field.teamLogo as IconName] || Icons.match;
                    return (
                      <Reorder.Item
                        key={field.id}
                        value={field}
                        className="flex items-center gap-4 p-3 rounded-lg bg-background border cursor-grab active:cursor-grabbing"
                      >
                        <div className="text-lg font-bold w-6 text-center text-muted-foreground">
                          {index + 1}
                        </div>
                        <TeamIcon className="size-6 text-primary" />
                        <span className="font-medium">{field.teamName}</span>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </CardContent>
            </Card>
            <Button type="submit">Submit Final Prediction</Button>
          </form>
        </Form>
      </div>
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Previous Season</CardTitle>
            <CardDescription>Final standings from 2024-2025.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Pts</TableHead>
                  <TableHead className="text-right">GD</TableHead>
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
                        <div className="flex items-center gap-2">
                          <TeamIcon className="size-5" />
                          <span className="truncate">{team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {team.points}
                      </TableCell>
                      <TableCell className="text-right">
                        {team.goalDifference}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
