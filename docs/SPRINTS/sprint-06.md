# Sprint 6 — Stabilization + Hardening

**Roadmap reference:** Month 1 · Week 1–2

## Sprint Goal

Clean the remaining PoC gaps identified in the Sprint 5 audit:
add production-realistic hardening, CI coverage, and observability primitives
without touching the UI or application logic.

---

## Delivered

### Backend

- `GET /healthz` endpoint — returns `{status: "ok", db: "connected"}` (200) or `{status: "degraded", db: "disconnected"}` (503)
- `backend/Dockerfile` — `python:3.13-slim`, non-root user (`appuser`), `HEALTHCHECK` instruction
- `docker-compose.yml` — backend + frontend services, `depends_on` with health check, volume mounts
- CORS `allow_origins` now reads from `ALLOWED_ORIGINS` env var (comma-separated list); falls back to `http://localhost:5173`
- `WS_JWT_SECRET` startup guard — raises `RuntimeError` if the default dev secret is used when `APP_ENV=production`
- `backend/app/data/livesurgery.db` added to `.gitignore`

### Frontend

- Vitest test suite added:
  - `BrandLogo.test.jsx` — component renders without crashing
  - `sessions-api.test.js` — `buildSessionUrl`, `devHeaders`, `parseSessionStatus` unit tests
  - 4 tests passing in CI
- `npm test` step added to frontend CI job (`ci.yml`)

### Repo

- `.env.example` — documents all required and optional env vars:
  `DB_PATH`, `WS_JWT_SECRET`, `ALLOWED_ORIGINS`, `APP_ENV`, `VITE_API_BASE_URL`
- `CHANGELOG.md` — created; full history from Sprint 1 to present
- `docs/DECISIONS_LOG.md` — ADR-style log; 6 initial decisions recorded
- `docs/SPRINTS/sprint-05.md` — Sprint 5 retrospective added retroactively
- `.github/ISSUE_TEMPLATE/chore.yml` — new issue template for maintenance work
- `.github/PULL_REQUEST_TEMPLATE.md` — enhanced with scope check, demo artifact, CHANGELOG reminder

---

## Definition of Done — Status

- [x] `livesurgery.db` is in `.gitignore` and not tracked by git
- [x] Backend CORS reads from `ALLOWED_ORIGINS` env var with `http://localhost:5173` fallback
- [x] Frontend: 4 Vitest tests pass in CI
- [x] `/healthz` returns 200 JSON and is called by Docker HEALTHCHECK
- [x] CI passes on all checks (ESLint + Vite build + Vitest + ruff + black + pytest)

---

## Not Completed / Moved

- Backend deployment (Railway / Render / Fly.io) — moved to Roadmap Week 5–6
- Real analytics + archive API endpoints — moved to Roadmap Week 7–8
- `git filter-repo` to purge `livesurgery.db` from history — manual step; requires user to run locally

---

## Demo Summary

- `docker compose up` starts full stack; `http://localhost:8000/healthz` returns `{"status":"ok"}`
- CI badge green on all 5 job types (ESLint · Vite · Vitest · ruff · pytest)
- Frontend demo at `livesurgery.vercel.app` unaffected (static build still passes)

---

## Retrospective

### What went well
- Docker + healthz gave the project a "production-realistic" baseline without refactoring the app
- Vitest onboarding was fast — existing JS utility functions were easy to unit-test
- `.env.example` removed all ambiguity about required config

### What can improve
- `livesurgery.db` history removal is a manual step — should have used `git filter-repo` earlier
- CI `npm test` step was missing since project start — should be day-one standard

### Action for Sprint 7
- Make auth boundary explicit: add `POST /auth/token`, wire Bearer tokens in frontend
- Write `docs/AUTH_MIGRATION.md` as a clear path from dev-mode auth to OIDC
