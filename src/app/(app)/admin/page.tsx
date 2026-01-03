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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import {
  teams,
  fullUsers,
  fullPredictions,
  matches,
  previousSeasonStandings,
  seasonMonths,
  monthlyMimoM,
  fullUserHistories,
  playerTeamScores,
  weeklyTeamStandings,
  teamRecentResults,
} from '@/lib/data';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

async function importClientSideData(db: any): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  try {
    const batch = writeBatch(db);

    // Teams
    teams.forEach(item => {
      const docRef = doc(db, 'teams', item.id);
      batch.set(docRef, item);
    });
    
    // Users
    fullUsers.forEach(item => {
        const docRef = doc(db, 'users', item.id);
        batch.set(docRef, item);
    });

    // Predictions
    fullPredictions.forEach(item => {
      if (item.userId) {
        const docRef = doc(db, 'predictions', item.userId);
        batch.set(docRef, item);
      }
    });

    // Matches
    matches.forEach(item => {
      const matchId = `${item.week}-${item.homeTeamId}-${item.awayTeamId}`;
      const docRef = doc(db, 'matches', matchId);
      batch.set(docRef, item);
    });

    // Previous Season Standings
    previousSeasonStandings.forEach(item => {
      const docRef = doc(db, 'previousSeasonStandings', item.teamId);
      batch.set(docRef, item);
    });

    // Season Months
    seasonMonths.forEach(item => {
      const docRef = doc(db, 'seasonMonths', item.id);
      batch.set(docRef, item);
    });

    // Monthly MimoM
    monthlyMimoM.forEach(item => {
      const docRef = doc(db, 'monthlyMimoM', item.id);
      batch.set(docRef, item);
    });

    // User Histories
    fullUserHistories.forEach(item => {
      const docRef = doc(db, 'userHistories', item.userId);
      batch.set(docRef, item);
    });
    
    // Player Team Scores
    playerTeamScores.forEach(item => {
        const docId = `${item.userId}_${item.teamId}`;
        const docRef = doc(db, 'playerTeamScores', docId);
        batch.set(docRef, item);
    });

    // Weekly Team Standings
    weeklyTeamStandings.forEach(item => {
        const docId = `${item.week}_${item.teamId}`;
        const docRef = doc(db, 'weeklyTeamStandings', docId);
        batch.set(docRef, item);
    });

    // Team Recent Results
    teamRecentResults.forEach(item => {
        const docRef = doc(db, 'teamRecentResults', item.teamId);
        batch.set(docRef, item);
    });

    await batch.commit();

    return { success: true, message: 'All sample data has been imported successfully.' };

  } catch (error: any) {
    console.error('Client-side data import failed:', error);
    return { success: false, message: `Import failed: ${error.message}` };
  }
}

export default function AdminPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isImporting, setIsImporting] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const performImport = async () => {
    setIsImporting(true);
    toast({
      title: 'Importing Data...',
      description: `Populating database with initial sample data. This may take a moment.`,
    });

    const result = await importClientSideData(firestore);
    
    toast({
      variant: result.success ? 'default' : 'destructive',
      title: result.success ? 'Import Complete!' : 'Import Failed',
      description: result.message,
    });
    
    setIsImporting(false);
  }

  const handleDataImport = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }

    setIsImporting(true);

    // Check if data already exists
    try {
      const teamsCollectionRef = collection(firestore, 'teams');
      const snapshot = await getDocs(teamsCollectionRef);
      if (!snapshot.empty) {
        setIsAlertOpen(true);
        setIsImporting(false);
        return;
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Checking Data',
            description: `Could not check for existing data: ${error.message}`,
        });
        setIsImporting(false);
        return;
    }
    
    // If no data exists, import directly
    await performImport();
  };

  return (
    <>
      <div className="space-y-8">
        <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">
            Data Administration
          </h1>
          <p className="text-slate-400">
            Manage your application's data sources and imports.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
              <CardHeader>
              <CardTitle>Import Sample Data</CardTitle>
              <CardDescription>
                  Click the button below to populate your Firestore database with all the required sample data for the application. This process runs entirely in your browser.
              </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <Button onClick={handleDataImport} disabled={isImporting || !firestore}>
                    {isImporting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing Data...
                    </>
                    ) : (
                    'Import All Data'
                    )}
                </Button>
              </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite Existing Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Your database already contains data. Continuing will overwrite the existing data with the sample data from the application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setIsAlertOpen(false);
              await performImport();
            }}>
              Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
