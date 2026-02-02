'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import historicalPlayersData from '@/lib/historical-players.json';

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * In Firebase App Hosting, this will automatically use the environment's 
 * default service account credentials.
 */
function getAdminAuth() {
  let app;
  if (getApps().length === 0) {
    try {
      app = initializeApp();
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
 * Iterates through all players in historical-players.json and ensuring
 * they have a Firebase Authentication account with the password "Password".
 * It will create new accounts for missing users and reset passwords for existing ones.
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

  for (const player of historicalPlayersData) {
    const email = player.email?.trim()?.toLowerCase();
    const uid = player.id?.trim();
    const password = 'Password';

    if (!email || !uid) {
      errors.push({ email: email || 'unknown', message: 'Missing email or ID in JSON.' });
      continue;
    }

    try {
      // 1. Try to find/update user by UID first (canonical approach)
      try {
        await auth.updateUser(uid, {
          email: email,
          password: password,
          displayName: player.name,
        });
        updatedCount++;
      } catch (uidError: any) {
        if (uidError.code === 'auth/user-not-found') {
          // 2. UID not found, check if the email is already in use by a DIFFERENT UID
          try {
            const userByEmail = await auth.getUserByEmail(email);
            // Email exists but with a different UID. Update that user's password.
            // Note: We can't change the UID, but the app matches by email anyway.
            await auth.updateUser(userByEmail.uid, {
              password: password,
              displayName: player.name,
            });
            updatedCount++;
          } catch (emailError: any) {
            if (emailError.code === 'auth/user-not-found') {
              // 3. Neither UID nor email exists, create a fresh account
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
      errors.push({ email, message: finalError.message });
    }
  }

  return { createdCount, updatedCount, errors };
}
