
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

    const docId = email === 'jim.poole@prempred.com' ? 'usr_009' : userId;
    const userDocRef = doc(firestore, 'users', docId);

    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log(`User profile for ${docId} already exists. Skipping creation.`);
      return;
    }

    const historicalUser = historicalPlayersData.find(u => u.id === docId);

    let profileData: Omit<User, 'id'>;

    if (historicalUser) {
      const { id, ...historicalData } = historicalUser;
      profileData = {
        name: historicalUser.name || email.split('@')[0] || 'New User',
        nickname: historicalUser.nickname || '',
        email: email,
        avatar: String(Math.floor(Math.random() * 49) + 1), // Assign a random avatar for now
        score: 0,
        rank: 0,
        previousRank: 0,
        previousScore: 0,
        maxRank: 0,
        minRank: 0,
        maxScore: 0,
        minScore: 0,
        rankChange: 0,
        scoreChange: 0,
        isPro: historicalUser.isPro ?? false,
        joinDate: new Date().toISOString(),
        country: historicalUser.country || '',
        favouriteTeam: historicalUser.favouriteTeam || '',
        phoneNumber: historicalUser.phoneNumber || '',
        seasonsPlayed: historicalUser.seasonsPlayed || 0,
        first: historicalUser.first || 0,
        second: historicalUser.second || 0,
        third: historicalUser.third || 0,
        fourth: historicalUser.fourth || 0,
        fifth: historicalUser.fifth || 0,
        sixth: historicalUser.sixth || 0,
        seventh: historicalUser.seventh || 0,
        eighth: historicalUser.eighth || 0,
        ninth: historicalUser.ninth || 0,
        tenth: historicalUser.tenth || 0,
        mimoM: historicalUser.mimoM || 0,
        ruMimoM: historicalUser.ruMimoM || 0,
        joMimoM: historicalUser.joMimoM || 0,
        joRuMimoM: historicalUser.joRuMimoM || 0,
        xmasNo1: historicalUser.xmasNo1 || 0,
        cashWinnings: historicalUser.cashWinnings || 0,
      };
    } else {
      // Create a brand new, default profile
      profileData = {
        name: email.split('@')[0] || 'New User',
        nickname: '',
        email: email,
        avatar: String(Math.floor(Math.random() * 49) + 1),
        score: 0,
        rank: 0,
        previousRank: 0,
        previousScore: 0,
        maxRank: 0,
        minRank: 0,
        maxScore: 0,
        minScore: 0,
        rankChange: 0,
        scoreChange: 0,
        isPro: false,
        joinDate: new Date().toISOString(),
        country: '',
        favouriteTeam: '',
        phoneNumber: '',
        seasonsPlayed: 0,
        first: 0,
        second: 0,
        third: 0,
        fourth: 0,
        fifth: 0,
        sixth: 0,
        seventh: 0,
        eighth: 0,
        ninth: 0,
        tenth: 0,
        mimoM: 0,
        ruMimoM: 0,
        joMimoM: 0,
        joRuMimoM: 0,
        xmasNo1: 0,
        cashWinnings: 0,
      };
    }
    setDocumentNonBlocking(userDocRef, profileData);
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
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await createInitialUserProfile(userCredential.user.uid, values.email);
        toast({ title: 'Account created successfully!' });
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                await createInitialUserProfile(userCredential.user.uid, values.email);
                toast({ title: 'Signed in successfully!' });
            } catch (signInError: any) {
                console.error('Sign in failed:', signInError);
                setAuthError(signInError.message || 'An unknown error occurred during sign-in.');
                toast({
                    variant: 'destructive',
                    title: 'Sign in failed',
                    description: signInError.message,
                });
            }
        } else {
            console.error('Account creation failed:', error);
            setAuthError(error.message || 'Failed to create account.');
            toast({
                variant: 'destructive',
                title: 'Sign up failed',
                description: error.message,
            });
        }
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account or Sign In</CardTitle>
        <CardDescription>
          Enter your details to create an account or sign in to an existing one.
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
                {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
