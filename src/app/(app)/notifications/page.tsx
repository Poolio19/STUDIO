import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notifications | PremPred 2025-2026',
    description: 'Manage your notification settings.',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <header className="bg-slate-900 text-slate-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-slate-400">Manage how you receive updates from PremPred 2025-2026.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose which emails you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="weekly-progress" className="text-base font-medium">Weekly Progress Emails</Label>
              <p className="text-sm text-muted-foreground">Receive a summary of your performance and rank every week.</p>
            </div>
            <Switch id="weekly-progress" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="new-events" className="text-base font-medium">New Event Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when new games are available for prediction.</p>
            </div>
            <Switch id="new-events" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="prediction-reminders" className="text-base font-medium">Prediction Reminders</Label>
                <p className="text-sm text-muted-foreground">Get a reminder before the prediction deadline for a game.</p>
            </div>
            <Switch id="prediction-reminders" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage real-time alerts on your devices (coming soon).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50 opacity-60">
            <div>
              <Label htmlFor="score-updates" className="text-base font-medium">Score Updates</Label>
              <p className="text-sm text-muted-foreground">Get a push notification when scores are updated.</p>
            </div>
            <Switch id="score-updates" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
