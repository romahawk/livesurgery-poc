const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ─── Token cache ──────────────────────────────────────────────────────────────
// Module-level cache: one token per role, refreshed 60s before expiry.
// Replace ensureToken() with your OIDC SDK's getAccessToken() when adopting
// a real IdP — see docs/AUTH_MIGRATION.md.
let _cachedToken = null;
let _cachedRole = null;
let _cachedExpiry = 0; // unix seconds

function _normalizeRole(role) {
  return role === "viewer" ? "OBSERVER" : String(role || "surgeon").toUpperCase();
}

async function ensureToken(role) {
  const normalized = _normalizeRole(role);
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid with a 60s buffer.
  if (_cachedToken && _cachedRole === normalized && _cachedExpiry > now + 60) {
    return _cachedToken;
  }

  // Mint a new token from the backend dev auth endpoint.
  const userId = `ui-${normalized.toLowerCase()}`;
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role: normalized }),
  });

  if (!res.ok) {
    // Token fetch failed — caller will fall back to dev headers.
    return null;
  }

  const data = await res.json();
  _cachedToken = data.token;
  _cachedRole = normalized;
  _cachedExpiry = Math.floor(new Date(data.expiresAt).getTime() / 1000);
  return _cachedToken;
}

// ─── Request helpers ──────────────────────────────────────────────────────────

async function apiHeaders(role) {
  try {
    const token = await ensureToken(role);
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // Token fetch failed — fall through to dev headers below.
  }

  // Dev header fallback: used when backend is unreachable or token fetch fails.
  // Preserves backwards compatibility during development.
  const normalized = _normalizeRole(role);
  return {
    "Content-Type": "application/json",
    "X-Dev-User-Id": `ui-${normalized.toLowerCase()}`,
    "X-Dev-Role": normalized,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const error = new Error(payload?.error?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.code = payload?.error?.code || "UNKNOWN_ERROR";
    error.requestId = payload?.error?.requestId;
    throw error;
  }
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function listSessions(role) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions?limit=50`, {
    method: "GET",
    headers: await apiHeaders(role),
  });
  return handleResponse(res);
}

export async function createSession(role, title) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions`, {
    method: "POST",
    headers: await apiHeaders(role),
    body: JSON.stringify({ title, visibility: "PRIVATE" }),
  });
  return handleResponse(res);
}

export async function startSession(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/start`, {
    method: "POST",
    headers: await apiHeaders(role),
  });
  return handleResponse(res);
}

export async function endSession(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/end`, {
    method: "POST",
    headers: await apiHeaders(role),
  });
  return handleResponse(res);
}

export async function joinSession(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/participants:join`, {
    method: "POST",
    headers: await apiHeaders(role),
  });
  return handleResponse(res);
}

export async function getLayout(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/layout`, {
    method: "GET",
    headers: await apiHeaders(role),
  });
  return handleResponse(res);
}

export async function publishLayout(role, sessionId, baseVersion, layout) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/layout`, {
    method: "POST",
    headers: await apiHeaders(role),
    body: JSON.stringify({ baseVersion, layout }),
  });
  return handleResponse(res);
}
