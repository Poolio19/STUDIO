'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/leaderboard');
  }, [router]);

  // Return a loading state or null while the redirect is happening
  return null;
}
