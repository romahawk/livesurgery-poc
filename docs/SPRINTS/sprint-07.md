# Sprint 7 — Auth Boundary (Roadmap Week 3–4)

## Sprint Goal

Make the auth boundary explicit, documented, and ready for OIDC replacement.
Frontend now sends `Authorization: Bearer <token>` on every API call.
Backend validates the token before processing any request.

---

## Delivered

### Backend

- `backend/app/core/auth.py`:
  - Added `mint_api_token(user_id, role)` — HMAC-SHA256 signed REST API token
  - Added `_verify_api_token(token)` — validates signature, expiry, and `kind="api"` claim
  - Updated `get_current_principal()` — checks Bearer token first, falls back to dev headers
  - Added `authorization: str | None = Header(default=None)` parameter
- `backend/app/routes/auth.py` — NEW: `POST /auth/token` endpoint
  - Public (unauthenticated), accepts `{userId, role}`, returns `{token, userId, role, expiresAt}`
  - Clearly docstringed: "replace with OIDC token exchange in production"
- `backend/app/main.py` — includes auth router (`/auth/token` registered)
- `backend/tests/test_smoke.py` — added `test_auth_token_route_exists()` (5 tests total)

### Frontend

- `frontend-react/src/api/sessions.js`:
  - Added module-level token cache (`_cachedToken`, `_cachedRole`, `_cachedExpiry`)
  - Added `ensureToken(role)` — calls `POST /auth/token`, caches with 60s buffer before expiry
  - Added `apiHeaders(role)` — returns `Authorization: Bearer <token>` header; falls back to dev headers if token fetch fails
  - All 7 exported functions now use `await apiHeaders(role)` instead of sync `devHeaders(role)`
  - Backwards compatible: fallback to dev headers when backend not running

### Documentation

- `docs/AUTH_MIGRATION.md` — NEW: step-by-step OIDC migration guide
  - Covers Auth0 and Supabase Auth options
  - Code samples for backend JWT validation (python-jose, PyJWT)
  - Code samples for frontend token acquisition (Auth0 React SDK, Supabase JS)
  - Rollback plan and file-level change inventory

---

## Definition of Done — Status

- [x] Frontend sends `Authorization: Bearer <token>` to all API calls
- [x] Backend validates Bearer token (401 on invalid/expired) — path 1 in `get_current_principal()`
- [x] Dev header fallback preserved for backwards compat (path 2)
- [x] `WS_JWT_SECRET` guard raises in production (done Sprint 6)
- [x] `docs/AUTH_MIGRATION.md` exists with OIDC integration steps
- [ ] Chat messages persist across tab switches — deferred (no visible bug with local-only chat)

---

## Not Completed / Moved

- Chat useReducer refactor — investigated: `chatMessages` is at App level, no visible bug with current local-only chat. Will address when WebSocket chat messages are added (Sprint 9+).
- Real OIDC integration — intentionally deferred; the migration guide is the deliverable for this sprint.

---

## Demo Summary

- `http://localhost:8000/auth/token` — POST returns a signed token
- `http://localhost:8000/docs` — `/auth` tag visible in OpenAPI UI
- Browser DevTools → Network → any `/v1/sessions` request → `Authorization: Bearer <token>` header visible
- Backend returns 401 if token signature is wrong or expired

---

## Retrospective

### What went well
- Auth boundary is now clearly a two-phase flow: get token → use token
- Migration guide documents exactly which two functions to replace for real OIDC
- Zero changes to App.jsx (990 LOC left untouched)
- All existing tests still pass; added 1 new backend smoke test

### What can improve
- `ensureToken()` makes an HTTP call on every API invocation if cache is cold
  — would benefit from eager initialization on app start (future: call in App `useEffect` on mount)
- The token cache is module-level (not React state) — appropriate for this stage but
  means role changes don't invalidate mid-request in-flight calls

### Action for Sprint 8
- Deploy backend to Railway/Render/Fly.io (Roadmap Week 5–6)
- Wire `VITE_API_BASE_URL` in Vercel to point to deployed backend
- Add `GET /healthz` to docker-compose healthcheck (already done in Sprint 6)
