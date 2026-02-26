import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * True when all required Firebase env vars are present.
 * When false the app falls back to the local FastAPI backend.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let _db = null;
let _auth = null;
let _authInitPromise = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  _db = getFirestore(app);
  _auth = getAuth(app);
}

export const db = _db;
export const auth = _auth;

export async function ensureFirebaseAuth() {
  if (!isFirebaseConfigured || !auth) return null;
  if (auth.currentUser) return auth.currentUser;

  if (!_authInitPromise) {
    _authInitPromise = signInAnonymously(auth)
      .then((cred) => cred.user)
      .catch((err) => {
        _authInitPromise = null;
        throw err;
      });
  }

  return _authInitPromise;
}
