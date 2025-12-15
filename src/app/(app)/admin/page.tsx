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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';


export default function AdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDataImport = async () => {
    setIsLoading(true);
    toast({
      title: 'Simulating Data Import...',
      description: 'In a real app, this would populate the database.',
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
        title: 'Simulation Complete!',
        description:
          'The database has been populated with the latest data.',
      });
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
            Use this tool to fetch the latest data and populate your database. This action will overwrite existing data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Local Data Mode</AlertTitle>
                <AlertDescription>
                    The application is currently running in local data mode. The data import functionality is disabled as it requires a server connection.
                </AlertDescription>
            </Alert>
          <Button onClick={handleDataImport} disabled={true}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Live Data (Disabled)'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
