
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
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from '@/lib/types';

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

  const createInitialUserProfile = (userId: string, email: string) => {
    if (!firestore) return;
    
    // Special case for jim.poole@prempred.com to use 'Usr_009' as the document ID
    const docId = email === 'jim.poole@prempred.com' ? 'Usr_009' : userId;
    
    const userDocRef = doc(firestore, 'users', docId);
    
    // Create a default user profile object
    const newUserProfile: Omit<User, 'id'> = {
      name: email.split('@')[0] || 'New User',
      email: email,
      avatar: String(Math.floor(Math.random() * 49) + 1), // Random avatar ID from 1 to 49
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
      championshipWins: 0
    };

    // Use setDoc with the specific docId
    setDocumentNonBlocking(userDocRef, newUserProfile);
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
      // First, try to sign in.
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Signed in successfully!' });
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found') {
        // If user doesn't exist, create a new account.
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            // Pass the generated UID and email to the profile creation function
            createInitialUserProfile(userCredential.user.uid, values.email);
            toast({ title: 'Account created successfully!' });
        } catch (signUpError: any) {
            console.error('Account creation failed:', signUpError);
            setAuthError(signUpError.message || 'Failed to create account.');
            toast({
                variant: 'destructive',
                title: 'Sign up failed',
                description: signUpError.message,
            });
        }
      } else {
        console.error('Sign in failed:', signInError);
        setAuthError(signInError.message || 'An unknown error occurred during sign-in.');
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: signInError.message,
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
