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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { teams } from '@/lib/data';
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
      predictions: teams.map(team => ({ teamId: team.id, teamName: team.name, teamLogo: team.logo })),
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
      description: 'Your final standings prediction has been saved. Good luck!',
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Predict Final Standings</h1>
        <p className="text-muted-foreground">
          Rank the teams in their predicted final standings for the season.
          Predictions must be made before the season starts to avoid penalties.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Premier League 2025-2026</CardTitle>
              <CardDescription>Drag and drop the teams to create your predicted league table.</CardDescription>
            </CardHeader>
            <CardContent>
              <Reorder.Group
                axis="y"
                values={fields}
                onReorder={(newOrder) => {
                  const newFields = newOrder.map(item => fields.find(f => f.id === item.id)!);
                  newFields.forEach((field, index) => {
                    const fromIndex = fields.findIndex(f => f.id === field.id);
                    if (fromIndex !== index) {
                      move(fromIndex, index);
                    }
                  });
                }}
                className="space-y-2"
              >
                {fields.map((field, index) => {
                  const TeamIcon = Icons[field.teamLogo as IconName] || Icons.match;
                  return (
                    <Reorder.Item
                      key={field.id}
                      value={field}
                      className="flex items-center gap-4 p-3 rounded-lg bg-background border cursor-grab active:cursor-grabbing"
                    >
                      <div className="text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</div>
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
  );
}
