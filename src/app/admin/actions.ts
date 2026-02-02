
'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, getApp, credential } from 'firebase-admin/app';

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
 * If a UID mismatch is detected, it recreates the account to ensure canonical IDs are used.
 * Processes a provided chunk of players to prevent server timeouts.
 */
export async function bulkCreateAuthUsersChunk(players: any[]) {
  let auth;
  try {
    auth = getAdminAuth();
  } catch (authInitError: any) {
    return { createdCount: 0, updatedCount: 0, errors: [{ email: 'system', message: authInitError.message }] };
  }

  let createdCount = 0;
  let updatedCount = 0;
  const errors: { email: string; message: string }[] = [];

  for (const player of players) {
    const email = player.email?.trim()?.toLowerCase();
    const uid = player.id?.trim();
    const password = 'Password';

    if (!email || !uid) {
      errors.push({ email: email || 'unknown', message: 'Missing email or ID in JSON.' });
      continue;
    }

    try {
      try {
        // 1. Try to fetch user by UID
        const userByUid = await auth.getUser(uid);
        
        // If email matches, just update password
        if (userByUid.email?.toLowerCase() === email) {
            await auth.updateUser(uid, { password });
            updatedCount++;
        } else {
            // If email differs, update both (this ensures canonical link)
            await auth.updateUser(uid, { email, password });
            updatedCount++;
        }
      } catch (uidError: any) {
        if (uidError.code === 'auth/user-not-found') {
          try {
            // 2. UID not found, check if email exists with a DIFFERENT UID
            const userByEmail = await auth.getUserByEmail(email);
            
            // CRITICAL: We found the email but it has a non-canonical UID.
            // We must delete the random UID and recreate with the canonical usr_XXX ID.
            await auth.deleteUser(userByEmail.uid);
            await auth.createUser({
                uid: uid,
                email: email,
                emailVerified: true,
                password: password,
                displayName: player.name,
            });
            createdCount++;
          } catch (emailError: any) {
            if (emailError.code === 'auth/user-not-found') {
              // 3. Neither UID nor Email exists - clean create
              await auth.createUser({
                uid: uid,
                email: email,
                emailVerified: true,
                password: password,
                displayName: player.name,
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
