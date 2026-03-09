# Next Session Start

**Last updated:** 2026-03-04
**Branch:** `claude/audit-ai-production-os-97QCl`
**Current sprint:** Sprint 8 — AI Production OS Adoption

---

## Start Here

1. **Pull latest from the branch you left off on:**
   ```bash
   git fetch origin
   git checkout claude/audit-ai-production-os-97QCl
   git pull origin claude/audit-ai-production-os-97QCl
   ```

2. **Confirm baseline is green before touching any code:**
   ```bash
   cd frontend-react && npm run lint && npm run build
   cd .. && ruff check backend/app backend/tests && pytest backend/tests -q
   ```

3. **Open the current sprint backlog:**
   → [`docs/SPRINT_BACKLOG.md`](SPRINT_BACKLOG.md) — check what is In Progress vs Done

4. **Check GitHub Actions CI on `main`:**
   → If any job is red, fix that before starting new feature work.

5. **Re-read the open issue fully before writing any code.**
   → Then update `docs/DAILY_CHECKLIST.md` as you work.

---

## Current State (as of 2026-03-04)

### What's working

- Frontend deployed at <https://livesurgery.vercel.app> (simulated video, no live backend)
- FastAPI backend runs locally on port 8000 (SQLite, WebSocket realtime layout sync)
- CI pipeline (`ci.yml`): ESLint + Vite build + Vitest + Ruff + Black + Pytest on every push and PR
- RBAC: Surgeon / Admin / Viewer roles; keyboard shortcuts S / P / X / I / C / ?
- Layout sync over WebSocket with optimistic concurrency conflict resolution
- Sprint 8 AI Production OS compliance pass complete:
  - `CLAUDE.md` created (AI boundary, anti-patterns, pre-commit gates)
  - `weekly-sync.yml` workflow added (Monday 09:00 UTC, opens GitHub issue)
  - `docs/roadmap.md` → `docs/ROADMAP.md`, `docs/architecture.md` → `docs/ARCHITECTURE.md`
  - `vercel.json` SPA rewrite rule added to `frontend-react/`
  - `docs/SPRINT_BACKLOG.md`, `docs/DAILY_CHECKLIST.md`, `docs/NEXT_SESSION_START.md`, `docs/WORKFLOW_AUTOMATION_PLAYBOOK.md` created
  - CHANGELOG ISO dates added; README Current Status and Deploy sections fixed

### Known gaps (intentional for PoC)

- Auth is a header-based scaffold — no real OIDC / JWT in production
- No WebRTC — video uses simulated HTML5 assets
- Backend not deployed (frontend-only live demo on Vercel)
- Analytics and Archive tabs use mock data
- Chat is client-local only (no backend persistence)

### Where I left off

Sprint 8 AI Production OS compliance pass — all fixes committed and pushed to `claude/audit-ai-production-os-97QCl`. Next step: open a PR from this branch into `main`.

---

## Quick Reference

| Command | Purpose |
|---|---|
| `./scripts/dev.sh` | Start frontend + backend concurrently (macOS/Linux) |
| `cd frontend-react && npm run dev` | Frontend only — port 5173 |
| `cd backend && uvicorn app.main:app --reload` | Backend only — port 8000 |
| `npm run lint` | ESLint (must pass before commit) |
| `npm run build` | Vite production build (must pass before commit) |
| `npm test` | Vitest test suite |
| `curl -s -X POST http://localhost:8000/auth/token -H "Content-Type: application/json" -d '{"userId":"u1","role":"SURGEON"}' \| jq .` | Mint a dev bearer token |

---

## Environment

Copy `.env.example` → `.env` and set:
- `WS_JWT_SECRET` — any random string for local dev
- `ALLOWED_ORIGINS` — defaults to `http://localhost:5173`

---

## Key Files

| File | Purpose |
|---|---|
| `frontend-react/src/App.jsx` | Root component — keyboard handlers, session state, WebSocket |
| `frontend-react/src/components/OnboardingModal.jsx` | 6-step onboarding guide |
| `backend/app/services/realtime_hub.py` | WebSocket layout sync hub |
| `backend/app/routes/realtime.py` | `/ws/sessions/{id}` endpoint |
| `docs/DECISIONS_LOG.md` | ADR log — read before any major architectural change |
| `docs/ROADMAP.md` | Weekly outcome-based delivery plan |
| `CLAUDE.md` | AI session rules — read at the start of every session |
