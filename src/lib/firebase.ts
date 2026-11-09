import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
// Workspace scopes configured via set_up_oauth
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleAuthProvider.addScope('https://www.googleapis.com/auth/documents');
googleAuthProvider.addScope('https://www.googleapis.com/auth/forms.body');

let cachedIdToken: string | null = null;
let cachedAccessToken: string | null = null;

export async function signInWithGoogle(): Promise<{
  user: User;
  idToken: string;
  accessToken?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const idToken = await result.user.getIdToken();
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedIdToken = idToken;
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    // Sync user with backend Cloud SQL
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName,
          photoUrl: result.user.photoURL,
        }),
      });
    } catch (e) {
      console.warn('Backend Cloud SQL sync failed, continuing locally:', e);
    }

    return { user: result.user, idToken, accessToken: cachedAccessToken || undefined };
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  cachedIdToken = null;
  cachedAccessToken = null;
}

export async function getCurrentIdToken(): Promise<string | null> {
  if (cachedIdToken) return cachedIdToken;
  if (auth.currentUser) {
    cachedIdToken = await auth.currentUser.getIdToken();
    return cachedIdToken;
  }
  return null;
}

export function getCachedWorkspaceToken(): string | null {
  return cachedAccessToken;
}

export function subscribeToAuth(callback: (user: User | null, idToken: string | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      cachedIdToken = token;
      callback(user, token);
    } else {
      cachedIdToken = null;
      cachedAccessToken = null;
      callback(null, null);
    }
  });
}
