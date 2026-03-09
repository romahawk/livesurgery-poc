# LiveSurgery Roadmap

Outcome-based delivery plan for a solo developer.
Each week has a clear outcome statement, 3–6 issues, and a Definition of Done (DoD).

---

## Current state (PoC — Sprint 1–4 complete)

### Done
- Vite + React 19 + Tailwind SPA
- Multi-panel OR workspace (2x2, 3x1, 1x3, 1x1)
- HTML5 video assets with source selection + drag-and-drop
- Layout presets (Quad, Focus, Teaching) + undo history
- Simulated RBAC personas (Surgeon / Observer / Viewer)
- FastAPI backend: session CRUD, WebSocket realtime hub, layout versioning
- Header-based dev auth scaffold + RBAC enforcement
- SQLite persistence (users, sessions, participants, layouts)
- CI: lint, build, ruff, black, pytest
- Docs: PRD, Architecture, Roadmap, DECISIONS_LOG, CHANGELOG, Sprint 1–4

### Known gaps (intentional for PoC)
- Auth is a header-based scaffold (not real JWT/OIDC)
- No WebRTC / real streaming
- Backend not deployed (local only)
- Analytics and Archive tabs use mock data
- Chat is client-local (no backend persistence)
- No frontend tests

---

## Freeze list (do NOT change during sprints 5–8)

- Architecture docs/prd.md core structure
- Backend data model (users/sessions/participants/layouts schema)
- Frontend component API surface (Navbar, Sidebar, DisplayGrid, SessionControls)
- CI workflow (`.github/workflows/ci.yml`)

---

## Week 1–2: Stabilize + ship 1 visible improvement

**Outcome:** Repo is clean, testable, and has one user-visible quality win deployed.

**Issues:**
1. `chore`: Add `backend/app/data/livesurgery.db` to `.gitignore` (sensitive dev data in git)
2. `chore`: Replace `allow_origins=["*"]` with `ALLOWED_ORIGINS` env var (read from `.env`)
3. `chore`: Add Vitest to frontend with 2 basic component smoke tests
4. `feat`: Add `/healthz` endpoint to backend (returns `{status: "ok", version: "0.4.x"}`)
5. `docs`: Update sprint-04 retrospective to reflect what's actually done vs stated

**Definition of Done:**
- [ ] `livesurgery.db` is in `.gitignore` and removed from git history (`git filter-repo` or `git rm --cached`)
- [ ] Backend CORS reads from `ALLOWED_ORIGINS` env var with fallback to `http://localhost:5173`
- [ ] Frontend: at least 2 Vitest tests pass in CI
- [ ] `/healthz` returns 200 JSON response
- [ ] CI passes on all checks (lint, build, ruff, black, pytest, vitest)

**Demo artifact required:** Screenshot of CI passing all 5 check types (frontend: lint + build + vitest; backend: ruff + black + pytest).

---

## Week 3–4: Add one "signal" feature (auth layer)

**Outcome:** Auth is no longer a header toy — WS tokens are rotatable, and the auth boundary is clearly enforced and documented.

**Issues:**
1. `feat`: Add `POST /auth/token` endpoint (accepts role + user_id, returns signed token — still dev-mode but explicit)
2. `feat`: Update frontend `api/sessions.js` to use Bearer token instead of raw headers
3. `chore`: Add `WS_JWT_SECRET` validation on startup — raise error if default value used in non-dev environment
4. `docs`: Write `docs/AUTH_MIGRATION.md` — step-by-step plan for replacing dev auth with OIDC (Auth0 or Supabase)
5. `fix`: Fix chat messages being lost on re-render (use useReducer or stable ref)

**Definition of Done:**
- [ ] Frontend sends `Authorization: Bearer <token>` to all API calls
- [ ] Backend rejects requests without valid token (401) in any non-dev mode
- [ ] `WS_JWT_SECRET` defaults to error if `APP_ENV=production` is set
- [ ] `docs/AUTH_MIGRATION.md` exists with OIDC integration steps
- [ ] Chat messages persist across tab switches within a session

**Demo artifact required:** Loom or GIF showing role-switching (Surgeon → Viewer) with visible RBAC enforcement in the UI.

---

## Month 2 — Milestone: Backend deployment + Analytics real data

### Week 5–6: Deploy backend

**Outcome:** Backend is reachable from a public URL; frontend demo no longer requires local backend.

**Issues:**
1. `chore`: Add `Dockerfile` for backend (uvicorn + non-root user)
2. `chore`: Add `docker-compose.yml` for local full-stack (frontend + backend)
3. `feat`: Add `/healthz` liveness + readiness endpoints (with DB ping)
4. `chore`: Document deployment to Railway/Render/Fly.io in `docs/DEPLOY.md`
5. `chore`: Update Vercel frontend env to point to deployed backend URL

**Definition of Done:**
- [ ] Backend runs in Docker with `docker-compose up`
- [ ] Backend deployed to a public URL (Railway / Render / Fly.io)
- [ ] Frontend demo at `livesurgery.vercel.app` connects to deployed backend
- [ ] `/healthz` returns DB connectivity status
- [ ] `docs/DEPLOY.md` documents the deployment steps

**Demo artifact required:** Screenshot of Vercel + deployed backend both online, CI green.

### Week 7–8: Real analytics + archive endpoints

**Outcome:** Analytics and Archive tabs show real session data from the database.

**Issues:**
1. `feat`: Add `GET /v1/sessions/{id}/analytics` endpoint (duration, participant count, layout changes)
2. `feat`: Replace `analyticsMock.js` with real API calls in `AnalyticsTab.jsx`
3. `feat`: Add `GET /v1/sessions?status=ENDED` to power Archive tab
4. `feat`: Replace `archiveMock.js` with real API calls in `ArchiveTab.jsx`
5. `feat`: Add session duration tracking (store `started_at`, `ended_at` on session)

**Definition of Done:**
- [ ] AnalyticsTab shows real session count, avg duration from DB
- [ ] ArchiveTab lists real ENDED sessions from backend
- [ ] New backend tests cover analytics and archive endpoints
- [ ] Mock data files remain but are clearly labeled as fallbacks

**Demo artifact required:** Screenshot of Analytics tab with real data (at least 3 completed sessions).

---

## Month 3 — Milestone: WebRTC MVP proof

### Week 9–10: SFU integration (LiveKit or Daily.co managed)

**Outcome:** A surgeon can publish a camera track; an observer can subscribe to it. HTML5 video is bypassed for live streams.

**Issues:**
1. `spike`: Research and decide on managed SFU (LiveKit Cloud vs Daily.co) — document in DECISIONS_LOG
2. `feat`: Add `sfuToken` to `/participants:join` response (minted from SFU provider)
3. `feat`: Frontend: replace HTML5 `<video>` in panels with WebRTC track subscribe when `sfuToken` available
4. `feat`: Add "Publish camera" button for Surgeon role
5. `docs`: Document WebRTC architecture decisions in `docs/architecture.md`

**Definition of Done:**
- [ ] Surgeon can publish webcam track to SFU
- [ ] Observer subscribes and renders live track in a panel
- [ ] Fallback to HTML5 video when no live track present
- [ ] SFU choice documented in DECISIONS_LOG

**Demo artifact required:** Loom recording showing real webcam → SFU → observer browser.

### Week 11–12: Hardening + portfolio polish

**Outcome:** Repo is demo-ready for job applications and accelerator submissions.

**Issues:**
1. `chore`: Add `CHANGELOG.md` v1.0.0-beta entry
2. `docs`: Write "Demo script" in `docs/DEMO_SCRIPT.md` (5-minute walkthrough steps)
3. `feat`: Add "Demo mode" seed data script (`scripts/seed_demo.py`)
4. `chore`: Add `og-livesurgery.png` update with current screenshot
5. `docs`: Write contributor guide update for WebRTC integration path

**Definition of Done:**
- [ ] `docs/DEMO_SCRIPT.md` exists with step-by-step demo instructions
- [ ] Seed script creates 3 sessions with participants and layouts
- [ ] OG image reflects current UI
- [ ] All docs cross-referenced from README

**Demo artifact required:** 5-minute Loom demo of full flow: login → create session → join → layout sync → WebRTC (or HTML5 fallback) → archive.

---

## FUTURE (Production) — Themes (non-roadmap)

- Real OIDC authentication (Auth0 / Supabase Auth / self-hosted)
- Multi-tenant org model + SSO/SCIM
- Audit-grade event trails + retention governance
- HIPAA-adjacent compliance posture (if clinical use intended)
- Advanced annotations (drawing layers, measurements)
- Device interoperability layer (OR camera ingest adapters)
- Enterprise deployment (multi-region, Kubernetes)

---

## Release readiness checklist (MVP)

- [ ] Auth + RBAC verified with integration tests
- [ ] WebSocket state sync stable under reconnects (tested with network throttling)
- [ ] TURN coverage tested across networks (4G, VPN)
- [ ] Recording pipeline verified end-to-end
- [ ] No sensitive data stored unintentionally
- [ ] Backend deployed at stable public URL
- [ ] `WS_JWT_SECRET` rotated from default
- [ ] CORS restricted to deployed frontend origin
