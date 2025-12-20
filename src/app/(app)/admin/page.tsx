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
import { Loader2 } from 'lucide-react';
import { importData } from '@/ai/flows/import-data-flow';

export default function AdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDataImport = async () => {
    setIsLoading(true);
    toast({
      title: 'Importing Data...',
      description:
        'Populating the Firestore database with initial data. This may take a moment.',
    });

    try {
      await importData();
      toast({
        title: 'Import Complete!',
        description:
          'The Firestore database has been populated successfully.',
      });
    } catch (error) {
      console.error('Data import failed:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description:
          'There was an error populating the database. Check the console for details.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Administration
        </h1>
        <p className="text-slate-400">
          Manage your application's data sources and imports.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Data Import</CardTitle>
          <CardDescription>
            Use this tool to fetch the latest data and populate your database.
            This action will overwrite existing data in the collections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
