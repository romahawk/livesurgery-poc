# Workflow Automation Playbook

Describes every automated workflow in `.github/workflows/` and how to configure them for a new project.

---

## Workflows in this repository

| File | Trigger | Purpose |
|---|---|---|
| [`ci.yml`](../.github/workflows/ci.yml) | Push (main, develop, feature/\*\*, claude/\*\*), PR | Lint + build + test (frontend + backend) |
| [`weekly-sync.yml`](../.github/workflows/weekly-sync.yml) | Cron (Monday 09:00 UTC), manual | Opens a "Weekly Roadmap Sync" GitHub issue |

---

## ci.yml

**Purpose:** Enforce code quality gates on every push and every pull request.

**Jobs:**

| Job | Steps |
|---|---|
| `frontend` | `npm ci` → `npm run lint` → `npm test` → `npm run build` |
| `backend` | `pip install` → `ruff check` → `black --check` → `pytest -q` |

**Key config:**
```yaml
on:
  push:
    branches: [main, develop, feature/**, claude/**]
  pull_request:
```

**How to copy to a new project:**
1. Copy `.github/workflows/ci.yml` to the new repo.
2. Update `working-directory` under `frontend:` to match the new frontend directory.
3. Update `ruff check` / `black --check` paths to match the new backend directory.
4. If the project is frontend-only, delete the `backend:` job.
5. Adjust `node-version` and `python-version` to match the project's toolchain.

**Required repository settings:**
- Branch protection on `main` → require status checks `frontend` and `backend` to pass.
- No direct pushes to `main` without a passing CI run.

---

## weekly-sync.yml

**Purpose:** On every Monday morning, open a GitHub issue as a structured weekly planning prompt.

**Trigger:** `cron: '0 9 * * 1'` — 09:00 UTC every Monday. Also supports `workflow_dispatch` for manual testing.

**Permissions required:** `issues: write` (declared at job level — uses default `GITHUB_TOKEN`).

**What it creates:**
- Title: `Weekly Roadmap Sync — YYYY-MM-DD`
- Body: review checklist linking to `docs/ROADMAP.md`, `docs/SPRINT_BACKLOG.md`, `CHANGELOG.md`, `docs/NEXT_SESSION_START.md`
- Labels: `chore`, `weekly-sync`

**How to copy to a new project:**
1. Copy `.github/workflows/weekly-sync.yml` to the new repo.
2. Update the issue body's file paths to match the new project's doc structure.
3. Create `chore` and `weekly-sync` labels in GitHub: **Settings → Labels → New label**.
4. Optionally change the cron time (`0 9 * * 1` = Monday 09:00 UTC).
5. Confirm `issues: write` is set — GitHub requires this explicitly for issue creation via `GITHUB_TOKEN`.

**Label note:** If `chore` or `weekly-sync` labels don't exist in the target repo, the issue is still created but label assignment fails silently. Create labels first, or remove the `labels:` field from the script.

---

## Required secrets / permissions

| Workflow | Secret | Permission | Notes |
|---|---|---|---|
| `ci.yml` | None | Default `GITHUB_TOKEN` (read) | No extra config needed |
| `weekly-sync.yml` | None | `issues: write` | Declared in workflow — no repo secret required |

---

## Adding a new workflow

1. Create `.github/workflows/<name>.yml`.
2. Define `on:` triggers, `permissions:`, and `jobs:`.
3. Add a row to the table at the top of this file.
4. Add any required labels in GitHub Settings → Labels.
5. Document any required secrets in `.env.example` and in the table above.
6. If the workflow requires manual follow-up, add a step to `docs/DAILY_CHECKLIST.md`.
