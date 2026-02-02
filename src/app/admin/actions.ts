'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, getApp, credential } from 'firebase-admin/app';
import historicalPlayersData from '@/lib/historical-players.json';

/**
 * Initializes the Firebase Admin SDK robustly.
 */
function getAdminAuth() {
  let app;
  if (getApps().length === 0) {
    try {
      app = initializeApp({
        credential: credential.applicationDefault(),
      });
    } catch (e: any) {
      console.error("Firebase Admin initialization error:", e);
      throw new Error(`Admin SDK init failed: ${e.message}`);
    }
  } else {
    app = getApp();
  }
  return getAuth(app);
}

/**
 * Aggressively sets every player's password to "Password" and verifies account existence.
 */
export async function bulkCreateAuthUsers() {
  let auth;
  try {
    auth = getAdminAuth();
  } catch (authInitError: any) {
    return { createdCount: 0, updatedCount: 0, errors: [{ email: 'system', message: authInitError.message }] };
  }

  let createdCount = 0;
  let updatedCount = 0;
  const errors: { email: string; message: string }[] = [];

  // Process in small batches if necessary, but 314 is manageable sequentially if individual ops are fast.
  for (const player of historicalPlayersData) {
    const email = player.email?.trim()?.toLowerCase();
    const uid = player.id?.trim();
    const password = 'Password';

    if (!email || !uid) {
      errors.push({ email: email || 'unknown', message: 'Missing email or ID in JSON.' });
      continue;
    }

    try {
      try {
        // 1. Try updating existing user by UID
        await auth.updateUser(uid, {
          email: email,
          password: password,
          displayName: player.name,
        });
        updatedCount++;
      } catch (uidError: any) {
        if (uidError.code === 'auth/user-not-found') {
          try {
            // 2. If UID not found, check if email exists with a different UID
            const userByEmail = await auth.getUserByEmail(email);
            await auth.updateUser(userByEmail.uid, {
              password: password,
              displayName: player.name,
            });
            updatedCount++;
          } catch (emailError: any) {
            if (emailError.code === 'auth/user-not-found') {
              // 3. Create new account if neither UID nor email exists
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
              throw emailError;
            }
          }
        } else {
          throw uidError;
        }
      }
    } catch (finalError: any) {
      console.error(`Error syncing user ${email}:`, finalError.message);
      errors.push({ email, message: finalError.message });
    }
  }

  return { createdCount, updatedCount, errors };
}
