'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import historicalPlayersData from '@/lib/historical-players.json';

if (getApps().length === 0) {
  // This assumes that GOOGLE_APPLICATION_CREDENTIALS are set in the App Hosting environment
  initializeApp();
}

export async function bulkCreateAuthUsers() {
  const auth = getAuth();
  let createdCount = 0;
  let skippedCount = 0;
  const errors: { email: string; message: string }[] = [];

  for (const player of historicalPlayersData) {
    if (!player.email || !player.id) {
      continue; // Skip players without an email or ID
    }

    try {
      // Check if user already exists by either UID or email
      await auth.getUser(player.id);
      skippedCount++;
      continue;
    } catch (error: any) {
      // If user not found by UID, that's good. Check by email.
      if (error.code !== 'auth/user-not-found') {
        errors.push({ email: player.email, message: `Error checking UID ${player.id}: ${error.message}` });
        continue;
      }
    }
      
    try {
      await auth.getUserByEmail(player.email);
      skippedCount++;
      continue;
    } catch (error: any) {
        // If user not found by email, we can create it.
        if (error.code !== 'auth/user-not-found') {
            errors.push({ email: player.email, message: `Error checking email ${player.email}: ${error.message}` });
            continue;
        }
    }

    // If we get here, the user doesn't exist by UID or email, so create them.
    try {
      await auth.createUser({
        uid: player.id,
        email: player.email,
        emailVerified: true,
        password: 'Password123!', // A secure-enough temporary password
        displayName: player.name,
        disabled: false,
      });
      createdCount++;
    } catch (creationError: any) {
      errors.push({ email: player.email, message: creationError.message });
    }
  }

  return { createdCount, skippedCount, errors };
}
