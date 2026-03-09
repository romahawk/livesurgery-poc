# Workflow Automation Playbook

**Project:** AlphaRhythm
**Last updated:** 2026-03-08

This document lists every automated workflow, when it runs, what it does, and how to maintain it.

---

## Workflows in this repo

### 1. CI — Build + Lint

**File:** `.github/workflows/ci.yml`
**Triggers:** `push` to any branch, `pull_request` to any branch
**Runtime:** ~60–90s on ubuntu-latest

**What it does:**
1. Checks out code
2. Installs Node 20 with npm cache
3. `npm ci` — clean install
4. `npm run lint` — ESLint v9 flat config (`eslint.config.js`)
5. `npm run build` — Vite production build

**Pass condition:** All steps exit 0.
**Failure action:** Do not merge the PR until fixed. Do not bypass with `--no-verify`.

**Maintenance:**
- If you upgrade ESLint, update `eslint.config.js` accordingly
- If you add a `test` script, add `npm test` after the lint step
- Node version pin is in the `node-version:` field — update when LTS changes

---

### 2. Weekly Roadmap Sync

**File:** `.github/workflows/weekly-sync.yml`
**Triggers:** Cron `0 8 * * 1` (Monday 08:00 UTC), or manually via `workflow_dispatch`
**Runtime:** < 10s

**What it does:**
1. Computes current week label (`Week of YYYY-MM-DD`)
2. Opens a GitHub issue titled `📅 Weekly Roadmap Sync — Week of YYYY-MM-DD`
3. Issue body is a review checklist covering: roadmap, sprint backlog, build gates, changelog, NEXT_SESSION_START

**Pass condition:** Issue opened successfully.
**Failure action:** Check GitHub Actions permissions — the workflow requires `issues: write`.

**Maintenance:**
- If you rename the repo, the `github.rest.issues.create` call continues to work via `context.repo`
- Add or remove checklist items by editing the `body` array in the `actions/github-script` step
- To add a label automatically, ensure `weekly-sync` label exists in the repo's Labels settings

---

## Policy checks (manual)

The following checks have no automation yet and are performed manually at the start of each sprint:

| Check | Frequency | How |
|---|---|---|
| Audit against AI Production OS guardrails | Per sprint | Run the full audit prompt against this repo |
| `docs/NEXT_SESSION_START.md` updated | End of session | Claude updates this file before final commit |
| `CHANGELOG.md` updated | Per PR merge | Add entry under `[Unreleased]` before merging |
| `docs/SPRINT_BACKLOG.md` triaged | Weekly | Promoted by weekly sync issue |

---

## Planned workflows (not yet implemented)

| Workflow | Priority | Trigger | Purpose |
|---|---|---|---|
| `policy-check.yml` | Medium | PR | Run the AI Production OS audit and post results as a PR comment |
| `deploy-preview.yml` | Low | PR | Trigger Vercel preview deploy and post URL in PR |

---

## Secrets required

| Secret | Used by | Purpose |
|---|---|---|
| `GITHUB_TOKEN` (auto) | `weekly-sync.yml` | Open issues |
| None currently | `ci.yml` | No secrets needed for build/lint |

For Firebase, `.env` is not committed. See `README.md` setup section for required keys.

---

## Adding a new workflow

1. Create `.github/workflows/your-name.yml`
2. Add it to this playbook (file name, triggers, what it does)
3. Test with `workflow_dispatch` before relying on the schedule trigger
4. Ensure `permissions:` block is as narrow as possible (principle of least privilege)
