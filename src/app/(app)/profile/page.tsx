'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Metadata } from 'next';
import { teams } from '@/lib/data';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  country: z.string().min(2, {
    message: 'Country must be at least 2 characters.',
  }),
  favoriteTeam: z.string({
    required_error: 'Please select a team.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can be fetched from an API in a real app
const defaultValues: Partial<ProfileFormValues> = {
  name: 'Alex',
  email: 'alex@example.com',
  country: 'United Kingdom',
  dob: new Date('1990-05-20'),
  favoriteTeam: 'team_1',
};

// Since we can't have metadata on a 'use client' component,
// you would typically handle this in a parent layout or a server component.
// For this example, we'll keep it but note it won't work in this file directly.
// export const metadata: Metadata = {
//     title: 'Profile | PremPred 2025-2026',
//     description: 'Manage your profile settings.',
// };

export default function ProfilePage() {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been saved.',
    });
    console.log(data);
  }

  const user = {
    name: 'Alex',
    avatarId: '1',
    rank: 1,
  };

  const avatarUrl =
    PlaceHolderImages.find(img => img.id === user.avatarId)?.imageUrl || '';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Here's a look at your prediction performance.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage
                  src={avatarUrl}
                  alt={user.name}
                  data-ai-hint="person portrait"
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{form.watch('name')}</h2>
                <p className="text-muted-foreground">Rank #{user.rank}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-[240px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. United Kingdom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="favoriteTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favorite Premier League Team</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your favorite team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
