'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { importData } from '@/ai/flows/import-data-flow';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDataImport = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available.',
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: 'Starting Data Import...',
      description: 'Please wait while we populate the database.',
    });

    try {
      const dataToImport = await importData();
      const batch = writeBatch(firestore);

      // Users
      dataToImport.users.forEach((user) => {
        const userRef = doc(firestore, 'users', user.id);
        batch.set(userRef, user);
      });

      // Teams
      dataToImport.teams.forEach((team) => {
        const teamRef = doc(firestore, 'teams', team.id);
        batch.set(teamRef, team);
      });
      
      // Standings
      dataToImport.currentStandings.forEach((standing) => {
        const standingRef = doc(collection(firestore, 'standings'), standing.teamId);
        batch.set(standingRef, standing);
      });

      // Previous Season Standings
      dataToImport.previousSeasonStandings.forEach((standing) => {
        const prevStandingRef = doc(collection(firestore, 'previousSeasonStandings'), standing.teamId);
        batch.set(prevStandingRef, standing);
      });

      // Predictions
      dataToImport.predictions.forEach((prediction) => {
        const predRef = doc(firestore, 'predictions', prediction.userId);
        batch.set(predRef, prediction);
      });

      // Player Team Scores
      dataToImport.playerTeamScores.forEach((score) => {
        const scoreRef = doc(collection(firestore, 'playerTeamScores'));
        batch.set(scoreRef, {...score, id: scoreRef.id });
      });

      // User Histories
      dataToImport.userHistories.forEach((history) => {
          const historyRef = doc(firestore, 'userHistories', history.userId);
          batch.set(historyRef, history);
      });
      
      // Weekly Team Standings
      dataToImport.weeklyTeamStandings.forEach((item) => {
          const itemRef = doc(collection(firestore, 'weeklyTeamStandings'));
          batch.set(itemRef, {...item, id: itemRef.id});
      });

      // Team Recent Results
      dataToImport.teamRecentResults.forEach((item) => {
          const itemRef = doc(collection(firestore, 'teamRecentResults'));
          batch.set(itemRef, {...item, id: itemRef.id});
      });
      
      // Monthly MiMoM
      dataToImport.monthlyMimoM.forEach((item) => {
          const itemRef = doc(collection(firestore, 'monthlyMimoM'));
          batch.set(itemRef, {...item, id: itemRef.id});
      });

      // Season Months
      dataToImport.seasonMonths.forEach((item) => {
          const itemRef = doc(collection(firestore, 'seasonMonths'));
          batch.set(itemRef, {...item, id: itemRef.id});
      });

      await batch.commit();

      toast({
        title: 'Import Successful!',
        description:
          'The database has been populated with the latest data.',
      });
    } catch (error) {
      console.error('Data import failed:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description:
          'Something went wrong during the data import. Check the console for details.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">Data Administration</h1>
        <p className="text-slate-400">
          Manage your application's data sources and imports.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Data Import</CardTitle>
          <CardDescription>
            Use this tool to fetch the latest data and populate your Firestore
            database. This action will overwrite existing data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDataImport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Live Data'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
