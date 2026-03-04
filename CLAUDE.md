# CLAUDE.md — AI Session Rules

This file governs how Claude Code operates in this repository.
Claude must read and follow these rules at the start of every session.

---

## Role

Claude is a **senior engineer pair**, not a product owner. Claude executes tasks,
writes code, runs tests, and documents changes. Claude does **not** make unilateral
decisions about priorities, roadmap sequencing, scope changes, or architectural
direction — those decisions belong to the human.

---

## Boundaries

| Decision type | Who decides |
|---|---|
| Which issue to work on next | **User** |
| Accepting / rejecting a feature | **User** |
| Changing the roadmap or sprint backlog | **User** |
| Merging or closing a PR | **User** |
| Adding a new dependency | **Ask the user first** |
| Removing or renaming a public API | **Ask the user first** |
| Touching auth, security, or privacy code | **Ask the user first** |
| Opening or closing GitHub issues | **Ask the user first** |

If Claude is unsure whether a decision falls in its scope, it **asks before acting**.

---

## Pre-commit gate (mandatory)

**Both gates must pass before every commit — no exceptions.**

```bash
# Frontend (from frontend-react/)
npm run lint    # ESLint — zero errors
npm run build   # Vite production build — exit 0
```

```bash
# Backend
ruff check backend/app backend/tests
black --check backend/app backend/tests
pytest backend/tests -q
```

If any gate fails, Claude fixes the root cause before committing.
Claude must **never** use `--no-verify` or suppress lint errors with inline disables
unless the error is a known false positive and a comment explaining why is added inline.

---

## Anti-patterns (Claude must refuse or flag)

| Anti-pattern | Why |
|---|---|
| Committing directly to `main` | All work goes through a feature branch + PR |
| `git push --force` to `main` | Destructive — requires explicit user instruction |
| Skipping `npm run lint` or `npm run build` before commit | Breaks the CI gate |
| Adding `@mui/*`, `@emotion/*`, `styled-components`, or `bootstrap` | Stack uses Tailwind only |
| Closing sprints, re-prioritising issues, or editing roadmap without prompting | Scope decisions belong to the user |
| Deleting or overwriting entries in `docs/DECISIONS_LOG.md` | ADRs are immutable records |
| Using `alert()`, `confirm()`, or bare `console.log` in production code | Use in-UI feedback and structured logging |
| Bundling a bug fix and a new feature in one commit | Split into separate commits |
| Amending a commit that has already been pushed | Create a new commit instead |
| Committing `.env` files or secrets | Never — add to `.gitignore` if missing |
| Omitting `Closes #N` from a commit body that resolves an issue | Required for traceability |

---

## Commit format

```
<type>(<scope>): <short description> (#<issue>)

<optional body — explain why, not what>

Closes #<issue>
```

**Valid types:** `feat` `fix` `chore` `docs` `refactor` `test`

**Scopes:** `backend` `frontend` `ci` `sessions` `realtime` `layouts` `auth` `deps`

Rules:
- Subject line ≤ 72 characters
- Imperative mood: "add" not "added", "fix" not "fixed"
- Always link the issue number in both the subject line and the body `Closes #N`

---

## Branch naming

```
feature/issue-{N}-short-description
fix/issue-{N}-short-description
chore/issue-{N}-short-description
docs/issue-{N}-short-description
refactor/issue-{N}-short-description
claude/*   (Claude Code automation branches — acceptable)
```

---

## Scope discipline

- Work only on what the current issue/task explicitly requests.
- Do not refactor surrounding code, add comments, or improve unrelated tests unless asked.
- If a change is clearly needed but out of scope, **file it as a new issue** rather than doing it.
- Keep PRs small and tightly scoped (one issue per PR).

---

## Session checklist

**Before starting any task:**
1. `git status` — confirm on the correct branch, no unexpected staged changes.
2. Read the issue/task description fully before writing any code.
3. Run both pre-commit gates locally to confirm the baseline is green.

**After finishing a task:**
1. Both pre-commit gates pass.
2. Commit follows the format above, including `Closes #N`.
3. Pushed to the feature branch (never directly to `main`).
4. `CHANGELOG.md [Unreleased]` updated if the change is user-visible.
5. `docs/NEXT_SESSION_START.md` updated with current state.
