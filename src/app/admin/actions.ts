'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import historicalPlayersData from '@/lib/historical-players.json';

if (getApps().length === 0) {
  // This assumes that GOOGLE_APPLICATION_CREDENTIALS are set in the App Hosting environment
  initializeApp();
}

/**
 * Iterates through all players in historical-players.json and ensuring
 * they have a Firebase Authentication account with the password "Password".
 * It will create new accounts for missing users and reset passwords for existing ones.
 */
export async function bulkCreateAuthUsers() {
  const auth = getAuth();
  let createdCount = 0;
  let updatedCount = 0;
  const errors: { email: string; message: string }[] = [];

  for (const player of historicalPlayersData) {
    if (!player.email || !player.id) {
      continue; // Skip entries without mandatory fields
    }

    const email = player.email.trim();
    const uid = player.id.trim();
    const password = 'Password';

    try {
      // 1. Check if user exists by email
      const userRecord = await auth.getUserByEmail(email);
      
      // User exists, reset their password to the default
      await auth.updateUser(userRecord.uid, {
        password: password,
      });
      updatedCount++;
      
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 2. User not found by email, try creating a new account
        // We use the ID from the JSON as the UID to keep things canonical.
        try {
          // Check if the UID is already taken by a different email
          try {
            await auth.getUser(uid);
            // If we get here, the UID exists. Update it with this email and password.
            await auth.updateUser(uid, {
              email: email,
              password: password,
              displayName: player.name,
            });
            updatedCount++;
          } catch (uidError: any) {
            if (uidError.code === 'auth/user-not-found') {
              // UID is free, create new user
              await auth.createUser({
                uid: uid,
                email: email,
                emailVerified: true,
                password: password,
                displayName: player.name,
                disabled: false,
              });
              createdCount++;
            } else {
              throw uidError;
            }
          }
        } catch (creationError: any) {
          errors.push({ email, message: creationError.message });
        }
      } else {
        errors.push({ email, message: `Lookup error: ${error.message}` });
      }
    }
  }

  return { createdCount, updatedCount, errors };
}
