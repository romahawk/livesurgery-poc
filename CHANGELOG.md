# Changelog

All notable changes to LiveSurgery are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `POST /auth/token` endpoint — dev-mode token minting (userId + role → signed HMAC token)
- Bearer token validation in `get_current_principal()` — primary auth path; dev headers kept as fallback
- `mint_api_token()` and `_verify_api_token()` in `backend/app/core/auth.py`
- `backend/app/routes/auth.py` — new auth router
- Token cache in `frontend-react/src/api/sessions.js` — `ensureToken()` with 60s buffer auto-refresh
- All frontend API calls now send `Authorization: Bearer <token>`; fallback to dev headers if unavailable
- `docs/AUTH_MIGRATION.md` — step-by-step OIDC migration guide (Auth0 + Supabase Auth options)
- `docs/SPRINTS/sprint-07.md`

---

## [0.5.0] — Sprint 6 — Stabilization + Hardening

### Added
- `GET /healthz` endpoint — liveness + DB readiness check (200 ok / 503 disconnected)
- Vitest test suite: `BrandLogo.test.jsx` + `sessions-api.test.js` (4 tests)
- `backend/Dockerfile` — python:3.13-slim, non-root user, HEALTHCHECK
- `docker-compose.yml` — backend + frontend services, health dependency
- `docs/DECISIONS_LOG.md` — ADR-style log of architectural decisions
- `docs/SPRINTS/sprint-05.md` — Sprint 5 backlog (AI Production OS adoption)
- `.env.example` — documents required/optional env vars for backend
- `CHANGELOG.md` — this file
- Updated `docs/roadmap.md` — outcome-based weekly roadmap with DoD
- Enhanced `.github/PULL_REQUEST_TEMPLATE.md` — added demo artifact + scope fields
- Added `.github/ISSUE_TEMPLATE/chore.yml` — template for maintenance/housekeeping issues

---

## [0.4.0] — Sprint 4 — Docs + Backend Integration (2025)

### Added
- Full `README.md` rewrite with architecture overview and deploy links
- `docs/architecture.md` — C4-style diagrams (system, container, component, sequence)
- `docs/prd.md` — PRD with MoSCoW requirements and success metrics
- `docs/roadmap.md` — PoC → MVP → Production roadmap
- `docs/agile_case_study.md` — Agile process documentation
- `docs/SPRINTS/sprint-01.md` through `sprint-04.md`
- `CONTRIBUTING.md` — local setup, quality checks, commit style
- `SECURITY.md` — vulnerability disclosure process
- `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml` — GitHub Actions (lint, build, ruff, black, pytest)
- `.editorconfig` — editor consistency settings
- `scripts/dev.sh` and `scripts/dev.ps1` — combined startup scripts

### Changed
- `/backend/app/routes/video.py` — finalized `/video/simulate` endpoint
- Backend video_stream service improvements

---

## [0.3.0] — Sprint 3 — Collaboration + Realtime (2025)

### Added
- `backend/app/services/realtime_hub.py` — WebSocket hub with HMAC token auth
- `backend/app/routes/realtime.py` — `/ws/sessions/{id}` WebSocket endpoint
- Layout versioning + optimistic concurrency (`publish_layout` with conflict detection)
- Presence broadcast (`presence.updated` messages)
- `frontend-react/src/components/OnboardingModal.jsx`
- `frontend-react/src/components/ArchiveTab.jsx` with mock archive data
- `frontend-react/src/components/AnalyticsTab.jsx` with Recharts visualizations
- `frontend-react/src/data/analyticsMock.js` and `archiveMock.js`
- `@dnd-kit/core` drag-and-drop for panel source assignment and panel swapping

### Changed
- `App.jsx` — WebSocket reconnect with exponential backoff (1s → 10s cap)
- `App.jsx` — Layout undo stack (up to 20 steps)
- `App.jsx` — Viewer "presenter-follow" toggle and queued sync

---

## [0.2.0] — Sprint 2 — OR Workspace UI (2025)

### Added
- `frontend-react/src/components/Navbar.jsx` — tabs, role selector, theme toggle
- `frontend-react/src/components/Sidebar.jsx` — video source catalog with drag handles
- `frontend-react/src/components/DisplayGrid.jsx` — multi-panel grid with layout modes
- `frontend-react/src/components/SessionControls.jsx` — start/pause/stop + timer
- `frontend-react/src/components/PatientInfoPanel.jsx` — slide-out patient metadata form
- `frontend-react/src/components/LiveChatPanel.jsx` — in-session chat
- `frontend-react/src/theme/ThemeProvider.jsx` — dark/light mode context
- `frontend-react/src/components/ThemeToggle.jsx` and `BrandLogo.jsx`
- Layout presets: Quad, Focus, Teaching, Clear
- Layout grid modes: 2x2, 3x1, 1x3, 1x1
- Keyboard shortcuts: S (start), P (pause), X (stop), I (patient info), C (chat)
- Responsive mobile layout

### Changed
- `backend/app/main.py` — CORS middleware, request-id middleware, AppError handler

---

## [0.1.0] — Sprint 1 — Project Skeleton (2025)

### Added
- `backend/` — FastAPI project with `app/core/`, `app/routes/`, `app/services/`, `app/models/`
- `backend/app/core/auth.py` — Role enum, Principal, header-based dev auth scaffold
- `backend/app/core/database.py` — SQLite init with users/sessions/participants/layouts schema
- `backend/app/core/errors.py` — AppError exception
- `backend/app/routes/sessions.py` — Session CRUD, join, layout CRUD, participant management
- `backend/app/models/session.py` — VideoSession Pydantic model
- `backend/requirements.txt` — FastAPI, Uvicorn, Pydantic, WebSockets
- `backend/tests/test_smoke.py` — app bootstrap + root route smoke tests
- `frontend-react/` — Vite + React 19 + Tailwind CSS project scaffold
- `frontend-react/src/api/sessions.js` — typed fetch client for all session API calls
- `public/videos/` — HTML5 video assets (endoscope, microscope, ptz, vital_signs)
- `LICENSE` (MIT), `.gitignore`
