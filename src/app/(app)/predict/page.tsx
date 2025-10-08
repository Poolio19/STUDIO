'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { games } from '@/lib/data';
import { Icons, IconName } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const predictionSchema = z.object({
  scoreA: z.coerce.number().min(0, "Score can't be negative"),
  scoreB: z.coerce.number().min(0, "Score can't be negative"),
});

const formSchema = z.object({
  predictions: z.array(predictionSchema),
});

export default function PredictPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: games.map(() => ({ scoreA: 0, scoreB: 0 })),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Predictions Submitted!',
      description: 'Your predictions have been saved. Good luck!',
    });
  }

  return (
    <div className="space-y-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Make Your Predictions</h1>
          <p className="text-muted-foreground">Submit your scores for the upcoming games.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle>Upcoming Games</CardTitle>
                <CardDescription>Enter your predicted score for each match.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {games.map((game, index) => {
                    const TeamAIcon = Icons[game.teamALogo as IconName];
                    const TeamBIcon = Icons[game.teamBLogo as IconName];
                    return (
                        <div key={game.id}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm text-muted-foreground">{new Date(game.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {game.time}</p>
                                    <div className="flex items-center justify-between text-lg md:text-xl font-bold mt-2">
                                        <div className="flex items-center gap-3">
                                            <TeamAIcon className="size-6 text-primary" />
                                            <span>{game.teamA}</span>
                                        </div>
                                        <span className="text-muted-foreground">vs</span>
                                        <div className="flex items-center gap-3">
                                            <span>{game.teamB}</span>
                                            <TeamBIcon className="size-6 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 flex items-center gap-2 justify-center">
                                    <FormField
                                        control={form.control}
                                        name={`predictions.${index}.scoreA`}
                                        render={({ field }) => (
                                            <FormItem className="w-20">
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} className="text-center text-lg h-12" />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <span className="text-2xl font-bold text-muted-foreground">-</span>
                                    <FormField
                                        control={form.control}
                                        name={`predictions.${index}.scoreB`}
                                        render={({ field }) => (
                                            <FormItem className="w-20">
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} className="text-center text-lg h-12" />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            {index < games.length - 1 && <Separator className="mt-6" />}
                        </div>
                    );
                })}
            </CardContent>
          </Card>
          <Button type="submit">Submit Predictions</Button>
        </form>
      </Form>
    </div>
  );
}
