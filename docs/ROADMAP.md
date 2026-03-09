# LiveSurgery Roadmap

Outcome-based delivery plan for a solo developer.
Each week has a clear outcome statement, 3–6 issues, and a Definition of Done (DoD).

---

## Current state (PoC — Sprints 1–8 complete)

### Done
- Vite + React 19 + Tailwind SPA
- Multi-panel OR workspace (2×2, 3×1, 1×3, 1×1) with layout presets + undo history
- HTML5 video assets with source selection + drag-and-drop (dnd-kit)
- Simulated RBAC personas (Surgeon / Admin / Viewer) with keyboard shortcuts
- FastAPI backend: session CRUD, WebSocket realtime hub, layout versioning + conflict resolution
- Explicit dev-auth: `POST /auth/token` → signed HMAC token; `Authorization: Bearer` on all API calls
- SQLite persistence (users, sessions, participants, layouts)
- `GET /healthz` liveness + DB readiness endpoint
- `backend/Dockerfile` (python:3.13-slim, non-root user, HEALTHCHECK) + `docker-compose.yml`
- CI: ESLint + Vite build + Vitest (4 tests) + ruff + black + pytest — all passing
- Archive tab (mock data) + Analytics dashboard (mock data, last 7 days)
- Dark / light theme; onboarding modal + keyboard shortcuts (S / P / X / I / C / ?)
- Docs: PRD, Architecture, Roadmap, DECISIONS_LOG, CHANGELOG, Sprint 1–7, AUTH_MIGRATION
- AI Production OS compliance: CLAUDE.md, weekly-sync workflow, SPRINT_BACKLOG, DAILY_CHECKLIST,
  NEXT_SESSION_START, WORKFLOW_AUTOMATION_PLAYBOOK, vercel.json SPA rewrite

### Known gaps (intentional for PoC)
- Auth is still a dev-mode scaffold (no real OIDC/JWT in production)
- No WebRTC — video uses simulated HTML5 assets
- Backend not deployed (frontend-only live demo on Vercel)
- Analytics and Archive tabs use mock data (no real DB queries wired)
- Chat is client-local only (no backend persistence)

---

## Freeze list (do NOT change during active sprints without an ADR)

- `docs/PRD.md` core structure
- Backend data model (users/sessions/participants/layouts schema)
- Frontend component API surface (Navbar, Sidebar, DisplayGrid, SessionControls)
- CI workflow (`.github/workflows/ci.yml`)

---

## Month 1 — Stabilise + Auth layer ✅ Complete

### Week 1–2: Stabilise + ship 1 visible improvement ✅

**Outcome:** Repo is clean, testable, and has one user-visible quality win deployed.

**Definition of Done:**
- [x] `livesurgery.db` is in `.gitignore` and removed from git history
- [x] Backend CORS reads from `ALLOWED_ORIGINS` env var with fallback to `http://localhost:5173`
- [x] Frontend: at least 2 Vitest tests pass in CI
- [x] `/healthz` returns 200 JSON response
- [x] CI passes on all checks (lint, build, ruff, black, pytest, vitest)

---

### Week 3–4: Auth layer ✅

**Outcome:** Auth is no longer a header toy — tokens are explicit and the boundary is documented.

**Definition of Done:**
- [x] Frontend sends `Authorization: Bearer <token>` to all API calls
- [x] Backend rejects requests without valid token (401)
- [x] `docs/AUTH_MIGRATION.md` exists with OIDC integration steps
- [x] `WS_JWT_SECRET` env var documented in `.env.example`

---

## Month 2 — Backend deployment + Real data

### Week 5–6: Deploy backend

**Outcome:** Backend is reachable from a public URL; frontend demo no longer requires local backend.

**Issues:**
1. `chore`: Deploy backend to Railway / Render / Fly.io
2. `chore`: Update Vercel frontend env to point to deployed backend URL
3. `chore`: Document deployment steps in `docs/DEPLOY.md`
4. `chore`: Add smoke test against the deployed `/healthz` endpoint in CI

**Definition of Done:**
- [x] Backend runs in Docker with `docker-compose up`
- [ ] Backend deployed to a public URL (Railway / Render / Fly.io)
- [ ] Frontend demo at `livesurgery.vercel.app` connects to deployed backend
- [ ] `/healthz` returns DB connectivity status from the deployed instance
- [ ] `docs/DEPLOY.md` documents the deployment steps

**Demo artifact required:** Screenshot of Vercel + deployed backend both online, CI green.

---

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
- [ ] Mock data files remain but are clearly labelled as fallbacks

**Demo artifact required:** Screenshot of Analytics tab with real data (≥ 3 completed sessions).

---

## Month 3 — WebRTC MVP proof

### Week 9–10: SFU integration (LiveKit or Daily.co managed)

**Outcome:** A surgeon can publish a camera track; an observer can subscribe to it. HTML5 video is bypassed for live streams.

**Issues:**
1. `spike`: Research and decide on managed SFU (LiveKit Cloud vs Daily.co) — document in DECISIONS_LOG
2. `feat`: Add `sfuToken` to `/participants:join` response (minted from SFU provider)
3. `feat`: Frontend — replace HTML5 `<video>` in panels with WebRTC track subscribe when `sfuToken` available
4. `feat`: Add "Publish camera" button for Surgeon role
5. `docs`: Document WebRTC architecture decisions in `docs/ARCHITECTURE.md`

**Definition of Done:**
- [ ] Surgeon can publish webcam track to SFU
- [ ] Observer subscribes and renders live track in a panel
- [ ] Fallback to HTML5 video when no live track present
- [ ] SFU choice documented in DECISIONS_LOG

**Demo artifact required:** Loom recording showing real webcam → SFU → observer browser.

---

### Week 11–12: Hardening + portfolio polish

**Outcome:** Repo is demo-ready for job applications and accelerator submissions.

**Issues:**
1. `chore`: Add `CHANGELOG.md` v1.0.0-beta entry
2. `docs`: Write "Demo script" in `docs/DEMO_SCRIPT.md` (5-minute walkthrough steps)
3. `feat`: Add "Demo mode" seed data script (`scripts/seed_demo.py`)
4. `chore`: Update `og-livesurgery.png` with current screenshot

**Definition of Done:**
- [ ] `docs/DEMO_SCRIPT.md` exists with step-by-step demo instructions
- [ ] Seed script creates 3 sessions with participants and layouts
- [ ] OG image reflects current UI
- [ ] All docs cross-referenced from README

**Demo artifact required:** 5-minute Loom demo — login → create session → join → layout sync → WebRTC (or HTML5 fallback) → archive.

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
