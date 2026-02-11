const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function devHeaders(role) {
  const normalizedRole = role === "viewer" ? "OBSERVER" : String(role || "surgeon").toUpperCase();
  return {
    "Content-Type": "application/json",
    "X-Dev-User-Id": `ui-${normalizedRole.toLowerCase()}`,
    "X-Dev-Role": normalizedRole,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const message = payload?.error?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function listSessions(role) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions?limit=50`, {
    method: "GET",
    headers: devHeaders(role),
  });
  return handleResponse(res);
}

export async function createSession(role, title) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions`, {
    method: "POST",
    headers: devHeaders(role),
    body: JSON.stringify({ title, visibility: "PRIVATE" }),
  });
  return handleResponse(res);
}

export async function startSession(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/start`, {
    method: "POST",
    headers: devHeaders(role),
  });
  return handleResponse(res);
}

export async function endSession(role, sessionId) {
  const res = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}/end`, {
    method: "POST",
    headers: devHeaders(role),
  });
  return handleResponse(res);
}
