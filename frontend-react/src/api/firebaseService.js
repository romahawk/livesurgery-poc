/**
 * Firebase Firestore service layer.
 * Mirrors the REST API surface of sessions.js so App.jsx can swap
 * implementations with minimal changes.
 *
 * Firestore schema:
 *   sessions/{id}                      – session document
 *   sessions/{id}/meta/layout          – versioned layout document
 *   sessions/{id}/participants/{uid}   – per-user presence document
 */
import {
  collection,
  doc,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, ensureFirebaseAuth } from "../lib/firebase";

// ─── Stable user ID (persisted to localStorage per-role) ──────────────────────
export function getLocalUserId(role) {
  const key = `ls_uid_${role}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${role}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function fbListSessions() {
  await ensureFirebaseAuth();
  const snap = await getDocs(
    query(collection(db, "sessions"), orderBy("createdAt", "desc"))
  );
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    // Normalize status for the frontend (backend uses uppercase)
    status: (d.data().status || "DRAFT").toLowerCase(),
  }));
  return { items };
}

export async function fbCreateSession(title) {
  await ensureFirebaseAuth();
  const ref = await addDoc(collection(db, "sessions"), {
    title,
    status: "DRAFT",
    createdAt: serverTimestamp(),
    startedAt: null,
    endedAt: null,
  });
  // Seed the layout document so onSnapshot fires immediately
  await setDoc(doc(db, "sessions", ref.id, "meta", "layout"), {
    version: 0,
    layout: { panels: [] },
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, title, status: "draft" };
}

export async function fbStartSession(sessionId) {
  await ensureFirebaseAuth();
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "ACTIVE",
    startedAt: serverTimestamp(),
  });
}

export async function fbPauseSession(sessionId) {
  await ensureFirebaseAuth();
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "PAUSED",
  });
}

export async function fbEndSession(sessionId) {
  await ensureFirebaseAuth();
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "ENDED",
    endedAt: serverTimestamp(),
  });
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export async function fbGetLayout(sessionId) {
  await ensureFirebaseAuth();
  const snap = await getDoc(
    doc(db, "sessions", sessionId, "meta", "layout")
  );
  if (!snap.exists()) return { version: 0, layout: { panels: [] } };
  return snap.data();
}

/**
 * Write a new layout version. Uses setDoc (overwrite) so there is
 * no version-conflict concept — last writer wins, which is fine for a PoC.
 */
export async function fbPublishLayout(sessionId, baseVersion, layout) {
  await ensureFirebaseAuth();
  const newVersion = baseVersion + 1;
  await setDoc(doc(db, "sessions", sessionId, "meta", "layout"), {
    version: newVersion,
    layout,
    updatedAt: serverTimestamp(),
  });
  return { version: newVersion };
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────

/**
 * Subscribe to layout changes for a session.
 * @param {string} sessionId
 * @param {(data: {version: number, layout: object}) => void} callback
 * @returns Unsubscribe function
 */
export function fbSubscribeLayout(sessionId, callback) {
  return onSnapshot(
    doc(db, "sessions", sessionId, "meta", "layout"),
    (snap) => {
      if (snap.exists()) callback(snap.data());
    }
  );
}

/**
 * Subscribe to participant count for a session.
 * @param {string} sessionId
 * @param {(count: number) => void} callback
 * @returns Unsubscribe function
 */
export function fbSubscribeParticipants(sessionId, callback) {
  return onSnapshot(
    collection(db, "sessions", sessionId, "participants"),
    (snap) => callback(snap.size)
  );
}

/**
 * Register the current user as a participant.
 */
export async function fbJoinSession(sessionId, userId, role) {
  await ensureFirebaseAuth();
  await setDoc(
    doc(db, "sessions", sessionId, "participants", userId),
    { role, joinedAt: serverTimestamp(), lastSeenAt: serverTimestamp() },
    { merge: true }
  );
}
