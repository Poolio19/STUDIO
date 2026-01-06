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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import {
  teams,
  standings,
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
import { collection, doc, writeBatch, getDocs, QuerySnapshot, DocumentData, Firestore } from 'firebase/firestore';

async function importClientSideData(db: Firestore | null): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  try {
    const batch = writeBatch(db);

    const collectionNames = [
        'teams', 'standings', 'users', 'predictions', 'matches', 
        'previousSeasonStandings', 'seasonMonths', 'monthlyMimoM', 
        'userHistories', 'playerTeamScores', 'weeklyTeamStandings', 'teamRecentResults'
    ];
    
    // Helper function to delete all documents in a collection
    const deleteCollection = async (collectionName: string) => {
        const collectionRef = collection(db, collectionName);
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        console.log(`Queued deletion for all ${snapshot.size} documents in '${collectionName}'.`);
    };

    // Queue delete operations for all documents in all collections first
    for (const name of collectionNames) {
        await deleteCollection(name);
    }
    
    // Now, queue the set operations to add the new data
    // Teams
    teams.forEach(item => {
      const docRef = doc(db, 'teams', item.id);
      batch.set(docRef, item);
    });

    // Standings
    standings.forEach(item => {
      if (item.teamId) {
        const docRef = doc(db, 'standings', item.teamId);
        batch.set(docRef, item);
      }
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

    // Atomically commit all deletions and additions
    await batch.commit();

    return { success: true, message: 'All application data has been purged and re-imported successfully.' };

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
      title: 'Purging and Importing Data...',
      description: `Wiping and repopulating database with initial application data. This may take a moment.`,
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

    // Always show the alert because this is a destructive action
    setIsAlertOpen(true);
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
              <CardTitle>Import Application Data</CardTitle>
              <CardDescription>
                  Click the button below to purge and repopulate your Firestore database with all the required application data. This is a destructive action and cannot be undone.
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
                    'Purge and Import All Data'
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
              You are about to delete all data in the collections and replace it with the initial application data. This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setIsAlertOpen(false);
              await performImport();
            }}>
              Purge and Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
