
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
import { Loader2, ShieldAlert } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from '@/lib/types';
import historicalPlayersData from '@/lib/historical-players.json';
import { emergencyAdminReset } from '@/app/admin/actions';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function AuthForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const createInitialUserProfile = async (firebaseAuthUid: string, email: string) => {
    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', firebaseAuthUid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) return;

    const historicalUser = historicalPlayersData.find(p => p.email.toLowerCase() === email.toLowerCase());
    const isCanonicalUid = firebaseAuthUid.startsWith('usr_');
    
    if (historicalUser && !isCanonicalUid) {
        console.warn(`User ${email} logged in with random UID ${firebaseAuthUid}. Account sync required.`);
        return;
    }

    if (!historicalUser) {
        const profileData: Omit<User, 'id'> = {
            name: email.split('@')[0],
            nickname: '', initials: '', email: email, avatar: '1',
            score: 0, rank: 0, previousRank: 0, previousScore: 0, maxRank: 0,
            minRank: 0, maxScore: 0, minScore: 0, rankChange: 0, scoreChange: 0,
            joinDate: new Date().toISOString(), mustChangePassword: true,
        };
        setDocumentNonBlocking(userDocRef, profileData);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsLoading(true);
    setAuthError(null);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        await createInitialUserProfile(userCredential.user.uid, values.email);
        toast({ title: 'Signed in successfully!' });
    } catch (error: any) {
        setAuthError("Invalid credentials. Please contact the administrator.");
    } finally {
        setIsLoading(false);
    }
  }

  const handleEmergencyReset = async () => {
    setIsResetting(true);
    try {
      const result = await emergencyAdminReset();
      if (result.success) {
        toast({ title: 'Admin Access Reset', description: result.message });
        form.setValue('email', 'jim.poole@prempred.com');
        form.setValue('password', 'Password');
      } else {
        toast({ variant: 'destructive', title: 'Reset Failed', description: result.message });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter details to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-destructive"
          onClick={handleEmergencyReset}
          disabled={isResetting}
        >
          {isResetting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <ShieldAlert className="mr-2 h-3 w-3" />}
          Emergency Admin Reset
        </Button>
      </div>
    </div>
  );
}
