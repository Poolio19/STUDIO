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

    // Use the Firebase Auth UID as the canonical document ID for all users.
    const userDocRef = doc(firestore, 'users', userId);

    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // If a profile already exists for this UID, do nothing.
      console.log(`User profile for ${userId} already exists. Skipping creation.`);
      return;
    }

    // Find the historical user by converting their name from the JSON
    // into the expected email format and matching it.
    const historicalUser = historicalPlayersData.find(p => {
        if (!p.name) return false;
        const expectedEmail = `${p.name.toLowerCase().replace(/ /g, '.')}@prempred.com`;
        return expectedEmail === email.toLowerCase();
    });

    let profileData: Omit<User, 'id'>;

    if (historicalUser) {
      // If historical data is found, use it to create the new profile.
      const { id, ...historicalData } = historicalUser;
      profileData = {
        name: historicalUser.name,
        nickname: historicalUser.nickname || '',
        email: email,
        avatar: String(Math.floor(Math.random() * 49) + 1), // Assign a random avatar on creation
        score: 0, rank: 0, previousRank: 0, previousScore: 0, maxRank: 0,
        minRank: 0, maxScore: 0, minScore: 0, rankChange: 0, scoreChange: 0,
        isPro: historicalUser.isPro ?? false,
        joinDate: new Date().toISOString(),
        country: historicalUser.country || '',
        favouriteTeam: historicalUser.favouriteTeam || '',
        phoneNumber: historicalUser.phoneNumber || '',
        // Use historical trophy data
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
      // If this user is not in the historical file, it's an error for this private league.
      // We will prevent the profile from being created.
      console.error(`Attempted to create profile for non-historical user: ${email}`);
      // Throw an error that will be caught in the onSubmit handler.
      throw new Error("This user is not registered for the league. Please contact the administrator.");
    }
    
    // Create the document using the secure Firebase Auth UID.
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
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        // On successful sign-in, ensure the user profile exists or is created from historical data.
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
