import { initializeApp } from "firebase/app";
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

// DEBUG — remove once Firebase is confirmed working
console.log("[firebase] isFirebaseConfigured:", isFirebaseConfigured);
console.log("[firebase] apiKey present:", Boolean(firebaseConfig.apiKey));
console.log("[firebase] projectId:", firebaseConfig.projectId);

let _db = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  _db = getFirestore(app);
}

export const db = _db;
