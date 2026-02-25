# Sprint 5 — AI Production OS Adoption + Repo Stabilization

## Sprint Goal

Apply AI Production OS v1 audit framework retroactively.
Make the repo credible as solo-founder proof-of-work:
clear scope, up-to-date docs, disciplined workflow, defined roadmap.

**No code refactors in this sprint.** Docs and workflow discipline only.

---

## Delivered

### Documentation
- `docs/DECISIONS_LOG.md` — ADR-style record of 6 key architectural decisions
- `docs/roadmap.md` — Full rewrite: outcome-based weekly roadmap with DoD (Weeks 1–12)
- `CHANGELOG.md` — Full history from Sprint 1 to present
- `.env.example` — Documents all backend env vars (DB path, WS secret, CORS, Vite API URL)
- `README.md` — Major update: removed "frontend-only" language, added accurate tech stack table, full local setup, docs index, 30-second pitch

### Workflow templates
- `.github/PULL_REQUEST_TEMPLATE.md` — Enhanced with scope check, demo artifact, CHANGELOG reminder
- `.github/ISSUE_TEMPLATE/chore.yml` — New template for maintenance/housekeeping issues

### Sprint docs
- `docs/SPRINTS/sprint-05.md` — This file

---

## Not Completed / Moved to Sprint 6

- `livesurgery.db` removal from git history (requires `git filter-repo` — destructive, user must run manually)
- Vitest frontend tests (moved to Week 1–2 roadmap)
- CORS `ALLOWED_ORIGINS` env var wiring (moved to Week 1–2 roadmap)
- `/healthz` endpoint (moved to Week 1–2 roadmap)

---

## Audit Findings (AI Production OS v1)

### Critical gaps identified
1. `backend/app/data/livesurgery.db` committed to git — must be removed + gitignored
2. `allow_origins=["*"]` — must be env-var driven before any shared deployment
3. `WS_JWT_SECRET` default `dev-ws-secret` — must be changed and validated on startup
4. README described app as "frontend-only" — now fixed, but was misleading
5. Sprint-04 doc said "Sessions API not done" — it was done; doc was stale

### Gap classification (will not fix in this sprint — see roadmap)
- Auth: header-based scaffold is intentional PoC decision (ADR-003), documented with migration path
- SQLite: intentional PoC decision (ADR-002), documented with migration path
- No frontend tests: added to Week 1–2 roadmap
- Analytics/Archive mock data: added to Month 2 roadmap

---

## Demo Summary
- Repo docs now reflect actual codebase state
- All gaps are documented, prioritized, and tracked in roadmap
- PR/Issue discipline templates in place for future sprints

---

## Retrospective

### What went well
- Audit surfaced concrete, actionable gaps — not vague "improve tests"
- Decisions Log gives future readers (employers, collaborators) a transparent architecture history
- Roadmap is now weekly + outcome-based, not milestone-only

### What can improve
- Sprint docs were lagging behind code reality (sprint-04 said Sessions API was not done)
- Commit discipline: too many "Update README.md" commits without linked issues
- Need to start using issue numbers in commit messages: `feat(sessions): add layout endpoint (#42)`

### Action for Sprint 6
1. Remove `livesurgery.db` from git history
2. Wire CORS `ALLOWED_ORIGINS` from env
3. Add Vitest to frontend + CI
4. Add `/healthz` endpoint
