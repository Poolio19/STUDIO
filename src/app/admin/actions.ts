'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';

/**
 * Initializes the Firebase Admin SDK robustly.
 */
function getAdminAuth() {
  let app;
  if (getApps().length === 0) {
    try {
      // In Firebase App Hosting/Functions, initializeApp() without arguments 
      // automatically uses the environment's service account.
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
 * Force-resets the primary admin account to ensure access.
 * Sets email to jim.poole@prempred.com, UID to usr_009, and password to 'Password'.
 * Handles existing account cleanup if UIDs mismatch.
 */
export async function emergencyAdminReset() {
  let auth;
  try {
    auth = getAdminAuth();
  } catch (e: any) {
    return { success: false, message: `Auth Init Failed: ${e.message}` };
  }

  const adminEmail = 'jim.poole@prempred.com';
  const adminUid = 'usr_009';
  const adminPassword = 'Password';

  try {
    // 1. Check if UID exists
    try {
      await auth.getUser(adminUid);
      // UID exists, update email and password to be sure
      await auth.updateUser(adminUid, {
        email: adminEmail,
        password: adminPassword,
        emailVerified: true
      });
    } catch (uidError: any) {
      if (uidError.code === 'auth/user-not-found') {
        // 2. UID not found, check if email exists at a different UID
        try {
          const userByEmail = await auth.getUserByEmail(adminEmail);
          // CRITICAL: email found but UID is wrong. Delete fork and recreate.
          await auth.deleteUser(userByEmail.uid);
        } catch (emailError) {}

        // 3. Create the clean canonical account
        await auth.createUser({
          uid: adminUid,
          email: adminEmail,
          password: adminPassword,
          displayName: 'Jim Poole',
          emailVerified: true,
        });
      } else {
        throw uidError;
      }
    }
    return { success: true, message: 'Admin account reset to jim.poole@prempred.com / Password' };
  } catch (error: any) {
    console.error("Emergency reset error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Aggressively sets every player's password to "Password" and verifies account existence.
 * If a UID mismatch is detected, it recreates the account to ensure canonical IDs are used.
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
        
        // Update user to ensure email matches and password is reset
        await auth.updateUser(uid, { 
            email, 
            password,
            emailVerified: true 
        });
        updatedCount++;
      } catch (uidError: any) {
        if (uidError.code === 'auth/user-not-found') {
          try {
            // 2. UID not found, check if email exists with a DIFFERENT UID
            const userByEmail = await auth.getUserByEmail(email);
            
            // CRITICAL: email found but UID is wrong. Delete fork and recreate.
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
