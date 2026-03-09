# Sprint 8 — AI Production OS Compliance Pass

**Roadmap reference:** N/A (meta-sprint — tooling, docs, guardrails)

## Sprint Goal

Bring the repository into full compliance with the AI Production OS v2 guardrails audit.
No application code changes. Docs, workflow files, and repo structure only.

---

## Delivered

### AI session rules

- `CLAUDE.md` — created at repo root:
  - AI role boundary table (what Claude can and cannot decide unilaterally)
  - 10-row anti-patterns table (stack violations, commit hygiene, scope creep)
  - Mandatory pre-commit gate: `npm run lint` AND `npm run build` before every commit
  - Commit format, branch naming convention, scope discipline section
  - Session checklist (pre and post)

### GitHub Actions

- `.github/workflows/weekly-sync.yml` — NEW workflow:
  - Cron: Monday 09:00 UTC (`0 9 * * 1`)
  - `issues: write` permission via default `GITHUB_TOKEN`
  - Opens "Weekly Roadmap Sync — YYYY-MM-DD" issue with checklist body
  - `workflow_dispatch` trigger for manual testing

### Sprint & planning docs

- `docs/SPRINT_BACKLOG.md` — Sprint 8 backlog with 7 issues, each with `- [x]` acceptance-criteria checkboxes
- `docs/DAILY_CHECKLIST.md` — pre-session, during-session, post-session, and weekly checklists
- `docs/NEXT_SESSION_START.md` — "Start Here" ordered guide + current state snapshot
- `docs/WORKFLOW_AUTOMATION_PLAYBOOK.md` — documents `ci.yml` and `weekly-sync.yml` with copy-to-new-project instructions

### Vercel SPA fix

- `frontend-react/vercel.json` — rewrite rule `"/(.*)" → "/index.html"` added
  - Prevents 404 on direct route access (e.g. `/archive`, `/analytics`)

### Doc renames (Linux path case fix)

- `docs/roadmap.md` → `docs/ROADMAP.md`
- `docs/architecture.md` → `docs/ARCHITECTURE.md`
- `docs/prd.md` → `docs/PRD.md`
- `.github/PULL_REQUEST_TEMPLATE.md` → `.github/pull_request_template.md` (lowercase, GitHub standard)
- All cross-references in README, CHANGELOG, and WORKFLOW_AUTOMATION_PLAYBOOK updated

### README improvements

- `## Current status` section: added explicit `Stage:`, `Scope:`, `Adoption:` labels
- `## Live demo` → `## Deploy` with platform + URL
- Docs index updated: uppercase paths + 4 new doc links (Sprint Backlog, Daily Checklist, Next Session Start, Workflow Playbook)

### CHANGELOG

- ISO dates added to all versioned entries (`0.1.0`–`0.5.0`)
- `[Unreleased]` section updated with all Sprint 8 deliverables

---

## Definition of Done — Status

- [x] `CLAUDE.md` exists with AI boundary, anti-patterns table, pre-commit gates
- [x] `weekly-sync.yml` opens a GitHub issue every Monday
- [x] All required doc files present at uppercase paths
- [x] `vercel.json` SPA rewrite in `frontend-react/`
- [x] Guardrails audit score: 40/46 (up from 24/46 at sprint start)
- [x] `Closes #N` documented as mandatory in `CLAUDE.md` and `CONTRIBUTING.md`

---

## Not Completed / Moved

- `Closes #N` in past commit bodies — process change only; affects future commits
- `docs/DAILY_CHECKLIST.md` → weekly cadence not yet tested (first Monday auto-issue pending)

---

## Demo Summary

- Guardrails audit re-run score: **40 / 46** checks passed
- `CLAUDE.md` visible at repo root on GitHub
- `weekly-sync.yml` visible in GitHub Actions tab; can be triggered manually via `workflow_dispatch`
- `livesurgery.vercel.app/archive` returns 200 (SPA rewrite working)

---

## Retrospective

### What went well
- Single-pass compliance audit surfaced 13 FAILs; all resolved in one sprint
- Doc renames (uppercase) fixed Linux path sensitivity across 4 files cleanly via `git mv`
- `weekly-sync.yml` requires zero secrets — uses default `GITHUB_TOKEN` with `issues: write`
- ROADMAP and sprint docs now have ISO dates — audit check 6.4 passes

### What can improve
- Sprint 5 and Sprint 8 were both "meta-sprints" (no app features) — signals that OS tooling adoption should be earlier in any new project
- Commit 4587a60 bundled dep-fix + feature rewrite (697 lines) — violates size discipline introduced by this same sprint

### Action for Sprint 9
- Deploy backend to Railway / Render / Fly.io (Roadmap Month 2 · Week 5–6)
- Wire `VITE_API_BASE_URL` in Vercel to point to deployed backend URL
