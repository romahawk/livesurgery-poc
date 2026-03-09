# Contributing

Thanks for contributing to LiveSurgery PoC.

## Prerequisites

- Node.js 20+
- Python 3.13+

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp ../.env.example .env         # review WS_JWT_SECRET and ALLOWED_ORIGINS
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend-react
npm install
npm run dev
```

### Combined (Docker Compose)

```bash
cp .env.example .env    # set WS_JWT_SECRET
docker compose up
```

---

## Quality Checks

Run these locally before pushing — CI enforces all of them.

### Frontend (from `frontend-react/`)

```bash
npm run lint          # ESLint
npm test              # Vitest
npm run build         # production build
npm run format:check  # Prettier
```

### Backend (from `backend/`)

```bash
ruff check app tests
black --check app tests
pytest tests -q
```

---

## Branching and PRs

- Create focused branches from `main`:
  ```
  feature/<short-description>
  fix/<short-description>
  chore/<short-description>
  docs/<short-description>
  ```
- Keep PRs small and tightly scoped to one issue.
- Add screenshots or GIFs for any UI change.
- Ensure CI is green before requesting review.
- Use the PR template — fill in every section.

---

## Commit Style

Use conventional commit format with a scope and the linked issue number:

```
<type>(<scope>): <short description> (#<issue-number>)
```

**Types:** `feat` | `fix` | `chore` | `docs` | `refactor`

**Scopes:** `backend` | `frontend` | `ci` | `sessions` | `realtime` | `layouts` | `auth`

**Examples:**

```
feat(sessions): add /healthz endpoint (#4)
fix(frontend): persist chat messages across tab switch (#6)
chore(ci): add Vitest step to frontend job (#5)
docs(arch): document WebRTC SFU decision in DECISIONS_LOG (#7)
```

**Rules:**
- Keep the subject line under 72 characters
- Use imperative mood: "add" not "added", "fix" not "fixed"
- Always link the issue number

---

## Changelog

Update `CHANGELOG.md` [Unreleased] section in every PR that ships a user-visible change.
