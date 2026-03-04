# Daily Checklist

Use this before and after every development session to maintain quality and continuity.

---

## Pre-session (< 5 min)

- [ ] `git fetch origin && git status` — confirm branch is current, no unexpected changes
- [ ] Read the open issue / task description **fully** before writing any code
- [ ] Check GitHub Actions CI on `main` — if red, that is the first priority
- [ ] Check `CHANGELOG.md [Unreleased]` — any unreleased work that should ship first?
- [ ] Run baseline gates to confirm you start from green:
  ```bash
  cd frontend-react && npm run lint && npm run build
  cd .. && ruff check backend/app && pytest backend/tests -q
  ```

---

## During session

- [ ] Work only on what the current issue requests — note out-of-scope discoveries as new issues
- [ ] Keep commits small (≤ 200 lines of change) and single-purpose
- [ ] Every commit message follows `type(scope): description (#N)` with `Closes #N` in the body
- [ ] Do not use `--no-verify` or suppress linter errors without a documented reason
- [ ] New environment variables added to `.env.example` before the session ends

---

## Post-session (< 5 min)

- [ ] Both frontend gates pass: `npm run lint` and `npm run build`
- [ ] Backend gates pass: `ruff check` + `black --check` + `pytest -q`
- [ ] `git status` — no unintended staged files (especially `.env`, `*.db`, `*.log`)
- [ ] All commits pushed to the feature branch
- [ ] `CHANGELOG.md [Unreleased]` updated with any user-visible changes
- [ ] `docs/NEXT_SESSION_START.md` updated with where you left off and current state
- [ ] If a sprint ends this session, update `docs/SPRINT_BACKLOG.md`

---

## Weekly (Mondays)

The [weekly-sync workflow](.github/workflows/weekly-sync.yml) opens a GitHub issue automatically at 09:00 UTC.

- [ ] Review the auto-opened "Weekly Roadmap Sync" issue
- [ ] Update `docs/ROADMAP.md` if priorities have shifted
- [ ] Move completed items in `docs/SPRINT_BACKLOG.md` to Done
- [ ] Add next sprint's issues to the backlog with acceptance-criteria checkboxes
- [ ] Confirm CI is green on `main` before starting the new week
