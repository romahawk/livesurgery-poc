## What

<!-- One sentence: what does this PR change? Link to the issue it closes. -->
Closes #

## Why

<!-- Why is this change needed? What problem does it solve? -->

## How

<!-- Brief description of the approach taken. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] chore — maintenance, config, dependency update
- [ ] docs — documentation only
- [ ] refactor — internal restructure, no behavior change

## Scope check

<!-- Does this PR do ONLY what the linked issue describes? -->
- [ ] Yes, this PR is tightly scoped to the issue
- [ ] No — explain what extra changes are included and why:

## Validation

**Frontend** (run in `frontend-react/`):
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run format:check` passes
- [ ] Vitest tests pass (if applicable)

**Backend** (run in `backend/`):
- [ ] `ruff check app tests` passes
- [ ] `black --check app tests` passes
- [ ] `pytest tests -q` passes

## Demo artifact

<!-- Screenshot, GIF, or Loom link showing the change in action. Required for feat/fix PRs. -->
N/A for chore/docs — OR paste screenshot/link here:

## Risks

<!-- Migration needs? Config changes? Backward-compat issues? DB schema changes? -->
None — OR describe risk here:

## Checklist

- [ ] No unintended behavior changes outside the stated scope
- [ ] `.env.example` updated if new env vars were added
- [ ] `CHANGELOG.md` [Unreleased] section updated
- [ ] Docs updated if public API or workflow changed
- [ ] CI passes (all jobs green)
