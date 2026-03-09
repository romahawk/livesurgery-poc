# Contributing

Thanks for contributing to LiveSurgery PoC.

## Prerequisites
- Node.js 20+
- Python 3.13+

## Local Setup
1. Backend
   - `cd backend`
   - `python -m venv venv`
   - `venv\\Scripts\\activate` (Windows) or `source venv/bin/activate` (Unix)
   - `pip install -r requirements.txt`
2. Frontend
   - `cd frontend-react`
   - `npm install`

## Quality Checks
- Frontend:
  - `cd frontend-react`
  - `npm run lint`
  - `npm run build`
- Backend:
  - `cd backend`
  - `venv\\Scripts\\python -m ruff check app tests`
  - `venv\\Scripts\\python -m black --check app tests`
  - `venv\\Scripts\\python -m pytest tests -q`

## Branching and PRs
- Create focused branches from `main`.
- Keep PRs small and scoped.
- Add screenshots/GIFs for UI changes.
- Ensure CI is green before requesting review.

## Commit Style
Use clear conventional prefixes, for example:
- `feat:` new functionality
- `fix:` bug fix
- `chore:` tooling/docs/maintenance