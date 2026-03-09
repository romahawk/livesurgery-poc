# Sprint Backlog

Active sprint issues with acceptance criteria. Update this file when issues are opened, refined, or closed.

---

## Sprint 8 — AI Production OS Adoption (Active)

**Goal:** Bring the repository fully into compliance with the AI Production OS guardrails framework.

**Sprint period:** 2026-03-04 → 2026-03-18

---

### Issue #OS-1 — Create CLAUDE.md with AI session rules

**Type:** chore | **Status:** ✅ Done

Acceptance criteria:
- [x] AI role boundary section defines what Claude can and cannot decide unilaterally
- [x] Anti-patterns table covers stack violations, commit hygiene, and scope creep
- [x] Pre-commit gate rule explicitly requires `npm run lint` AND `npm run build`
- [x] Commit format and branch naming convention documented

---

### Issue #OS-2 — Add weekly roadmap sync workflow

**Type:** chore | **Status:** ✅ Done

Acceptance criteria:
- [x] Cron schedule triggers every Monday at 09:00 UTC
- [x] Workflow has `issues: write` permission
- [x] Opens a GitHub issue titled `Weekly Roadmap Sync — YYYY-MM-DD`
- [x] Issue body links to `docs/ROADMAP.md` and `docs/SPRINT_BACKLOG.md`
- [x] `workflow_dispatch` trigger present for manual testing

---

### Issue #OS-3 — Rename docs to uppercase and fix all cross-references

**Type:** chore | **Status:** ✅ Done

Acceptance criteria:
- [x] `docs/roadmap.md` renamed to `docs/ROADMAP.md`
- [x] `docs/architecture.md` renamed to `docs/ARCHITECTURE.md`
- [x] All README doc links and internal cross-references updated to uppercase paths
- [x] `.github/PULL_REQUEST_TEMPLATE.md` normalized to lowercase `pull_request_template.md`

---

### Issue #OS-4 — Add vercel.json SPA rewrite rule

**Type:** chore | **Status:** ✅ Done

Acceptance criteria:
- [x] `vercel.json` exists in `frontend-react/`
- [x] Rewrite rule `"source": "/(.*)"` → `"destination": "/index.html"` present
- [x] Direct route access (e.g. `/archive`) returns 200, not 404

---

### Issue #OS-5 — Create NEXT_SESSION_START.md and DAILY_CHECKLIST.md

**Type:** docs | **Status:** ✅ Done

Acceptance criteria:
- [x] `docs/NEXT_SESSION_START.md` exists with "Last updated" date within 30 days
- [x] "Start Here" section has ≥ 5 ordered steps
- [x] `docs/DAILY_CHECKLIST.md` exists with pre-session and post-session sections
- [x] Both files accurately reflect the current repo workflow

---

### Issue #OS-6 — Add WORKFLOW_AUTOMATION_PLAYBOOK.md

**Type:** docs | **Status:** ✅ Done

Acceptance criteria:
- [x] `docs/WORKFLOW_AUTOMATION_PLAYBOOK.md` exists
- [x] References `ci.yml` and `weekly-sync.yml` by filename
- [x] Documents how to copy and configure each workflow for a new project
- [x] Required secrets / permissions table included

---

### Issue #OS-7 — Enforce Closes #N in commit bodies

**Type:** chore | **Status:** 🔄 In progress

Acceptance criteria:
- [x] CONTRIBUTING.md updated: `Closes #N` is documented as mandatory
- [x] CLAUDE.md anti-patterns table includes "Omitting Closes #N" as a prohibited pattern
- [ ] Next 10 commits all include `Closes #N` in the body
- [ ] Audit check 2.4 passes (≥ 70% of last 10 commits include `Closes #N`)

---

## Backlog (upcoming sprints)

| Issue | Type | Size | Notes |
|---|---|---|---|
| WebRTC SFU integration (Janus / LiveKit) | feat | L | Needs cloud infra |
| Real OIDC auth (Auth0 or Supabase Auth) | feat | M | See `docs/AUTH_MIGRATION.md` |
| Deploy backend (Railway or Fly.io) | chore | S | Unblocks live layout sync on Vercel demo |
| Frontend test coverage → 60 % | test | M | Vitest + RTL |
| Bundle splitting — chunk < 500 kB | chore | S | Recharts + Firebase bloat |
| Recording → archive storage | feat | L | Object storage (S3-compatible) |
