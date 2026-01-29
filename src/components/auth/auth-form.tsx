
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from '@/lib/types';
import historicalPlayersData from '@/lib/historical-players.json';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function AuthForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const createInitialUserProfile = async (userId: string, email: string) => {
    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log(`User profile for ${userId} already exists. Skipping creation.`);
      return;
    }

    const historicalUser = historicalPlayersData.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (historicalUser) {
      const { id, ...historicalData } = historicalUser;
      const profileData: Omit<User, 'id'> = {
        name: historicalUser.name,
        nickname: historicalUser.nickname || '',
        initials: historicalUser.initials || '',
        email: email,
        avatar: String(Math.floor(Math.random() * 49) + 1),
        score: 0, rank: 0, previousRank: 0, previousScore: 0, maxRank: 0,
        minRank: 0, maxScore: 0, minScore: 0, rankChange: 0, scoreChange: 0,
        isPro: historicalData.isPro ?? false,
        joinDate: new Date().toISOString(),
        country: historicalData.country || '',
        favouriteTeam: historicalData.favouriteTeam || '',
        phoneNumber: historicalData.phoneNumber || '',
        seasonsPlayed: historicalData.seasonsPlayed || 0,
        first: historicalData.first || 0,
        second: historicalData.second || 0,
        third: historicalData.third || 0,
        fourth: historicalData.fourth || 0,
        fifth: historicalData.fifth || 0,
        sixth: historicalData.sixth || 0,
        seventh: historicalData.seventh || 0,
        eighth: historicalData.eighth || 0,
        ninth: historicalData.ninth || 0,
        tenth: historicalData.tenth || 0,
        mimoM: historicalData.mimoM || 0,
        ruMimoM: historicalData.ruMimoM || 0,
        joMimoM: historicalData.joMimoM || 0,
        joRuMimoM: historicalData.joRuMimoM || 0,
        xmasNo1: historicalData.xmasNo1 || 0,
        cashWinnings: historicalData.cashWinnings || 0,
      };
      setDocumentNonBlocking(userDocRef, profileData);
    } else {
      console.error(`Attempted to create profile for non-historical user: ${email}`);
      throw new Error("This user is not registered for the league. Please contact the administrator.");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Authentication not ready',
            description: 'Please wait a moment and try again.'
        });
        return;
    };
    setIsLoading(true);
    setAuthError(null);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        await createInitialUserProfile(userCredential.user.uid, values.email);
        toast({ title: 'Signed in successfully!' });
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
             errorMessage = "Invalid credentials. If you believe you should have access, please contact the administrator.";
        } else {
            errorMessage = error.message || errorMessage;
        }
        setAuthError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Sign In Failed',
            description: errorMessage,
        });
        console.error('Sign in failed:', error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your details to sign in. Please contact the administrator if you need an account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Processing...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
