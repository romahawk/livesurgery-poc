# LiveSurgery — Decisions Log (ADR-style)

This log records architectural and process decisions made during the project.
Each entry captures context, the decision made, and consequences.

---

## ADR-001 — Frontend-only PoC start

**Date:** 2025-Q1
**Status:** Superseded (backend added; see ADR-002, ADR-003)

**Context:**
Needed to validate the OR workspace UX quickly as a solo developer without standing up infrastructure. Speed-to-demo was the primary goal.

**Decision:**
Build a React + Tailwind SPA with HTML5 video assets only. No backend, no auth, no persistence.

**Consequences:**
+ Zero infra cost; deployed on Vercel in minutes.
+ Very fast feedback loop on layout/UX concepts.
- App.jsx grew monolithic (990 LOC) with all state in one component.
- Had to be partially invalidated once backend was added.

---

## ADR-002 — SQLite for MVP persistence (not Postgres)

**Date:** 2025-Q2
**Status:** Active (review at 10+ concurrent users)

**Context:**
Solo developer, no ops capacity, need persistent sessions and layouts without managing a cloud DB service. The data model is simple: users, sessions, participants, layouts.

**Decision:**
Use SQLite (via Python stdlib `sqlite3`) with a file at `backend/app/data/livesurgery.db`. Path is overridable via `LIVESURGERY_DB_PATH` env var.

**Consequences:**
+ Zero external dependencies; runs fully locally.
+ Schema is in `database.py` as `CREATE TABLE IF NOT EXISTS` — easy to read.
- Single writer bottleneck; not suitable for concurrent writes at scale.
- `livesurgery.db` must be excluded from git (add to `.gitignore`) — risk of committing development data.
- Migration path: swap `get_conn()` implementation for asyncpg/psycopg + Alembic when traffic warrants.

**Action required:** Add `backend/app/data/livesurgery.db` to `.gitignore`.

---

## ADR-003 — Header-based auth scaffold (not real JWT/OIDC)

**Date:** 2025-Q2
**Status:** Active (temporary; replace before any multi-user public exposure)

**Context:**
Auth infrastructure (OIDC provider, JWT issuance) adds significant scope and cost for a PoC/MVP demonstration. The team is one person.

**Decision:**
Accept `x-dev-user-id` and `x-dev-role` HTTP headers as identity claims. All callers are trusted. The `get_current_principal()` function is clearly labeled "temporary auth scaffold" in the codebase.

**Consequences:**
+ Allows full RBAC flow to be built and tested without a real IdP.
+ Enables real multi-user scenarios in local/controlled demos.
- **Security risk if exposed publicly** — any caller can claim any role.
- Must be replaced with JWT validation (e.g., Auth0, Supabase Auth, or self-hosted) before production.

**Migration path:** Replace `get_current_principal()` with a JWT bearer-token validator. The `Principal` dataclass interface is stable — callers won't change.

---

## ADR-004 — Custom HMAC tokens for WebSocket auth

**Date:** 2025-Q2
**Status:** Active

**Context:**
WebSocket connections need short-lived, scoped tokens (session-specific) without pulling in a JWT library dependency. The token is minted server-side after REST auth succeeds.

**Decision:**
Implement a minimal custom token: base64url(JSON claims) + "." + HMAC-SHA256 signature. Secret in `WS_JWT_SECRET` env var (default `dev-ws-secret` for dev). TTL default 900s.

**Consequences:**
+ No additional dependencies; transparent implementation.
+ Claims include `sessionId`, `userId`, `role`, `exp` — sufficient for access control.
- Non-standard format; tooling (e.g., jwt.io) won't decode it.
- Default secret `dev-ws-secret` **must be overridden in any deployed environment**.

---

## ADR-005 — CORS allow_origins=["*"] in development

**Date:** 2025-Q2
**Status:** Active (dev only — must tighten before any shared deployment)

**Context:**
During local development the frontend (Vite dev server at `localhost:5173`) and backend (uvicorn at `localhost:8000`) are on different origins. CORS must be configured.

**Decision:**
Set `allow_origins=["*"]` in FastAPI middleware with a clear in-code comment: "tighten in production". `allow_credentials=False` is set, which limits cookie-based credential exposure.

**Consequences:**
+ No friction during local development.
- **Must be restricted** to the deployed frontend origin before any shared environment. Use `ALLOWED_ORIGINS` env var pattern (see `.env.example`).

---

## ADR-006 — Retroactive AI Production OS v1 adoption (Feb 2026)

**Date:** 2026-02-25
**Status:** Active

**Context:**
Solo founder transitioning to remote-first agile employment needs this repo to function as credible proof-of-work. The codebase had grown organically through 4 sprints but lacked: outcome-based roadmap, DECISIONS_LOG, CHANGELOG, weekly DoD discipline, and .env documentation.

**Decision:**
Apply the AI Production OS v1 audit framework retroactively. Produce: updated roadmap (outcome-based, weekly DoD), DECISIONS_LOG, CHANGELOG, .env.example, enhanced Issue/PR templates, and sprint-05 backlog. No code refactors — docs and workflow discipline only.

**Consequences:**
+ Repo now matches professional portfolio expectations.
+ Issues and PRs will follow a traceable Issue → PR → Deploy loop.
+ Critical gaps (committed DB, wildcard CORS, fake auth exposure) are documented with mitigation paths.
- Docs require ongoing maintenance as the codebase evolves — risk of doc drift.

---

## Template for future decisions

```markdown
## ADR-NNN — Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Active | Superseded | Deprecated

**Context:**
What situation forced this decision?

**Decision:**
What was decided?

**Consequences:**
+ Positive outcomes
- Negative outcomes / risks

**Migration path (if applicable):**
How to reverse or evolve this decision later.
```
