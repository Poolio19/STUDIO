'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/leaderboard');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span className="text-lg">Loading your dashboard...</span>
      </div>
    </div>
  );
}
