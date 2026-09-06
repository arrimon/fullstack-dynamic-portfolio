# AGENTS.md

## Repo layout

- Monorepo but **not a workspace**: `backend/` (FastAPI + PostgreSQL) and `frontend/` (Next.js App Router) are independent apps; there is **no root package.json or shared tooling**. Run commands from each package, not the root.
- `docs/STATUS_REPORT.md` is the verified list of what works/what doesn't (e.g. email notifications are off, uploads aren't magic-byte sniffed, `/health` returns 200 when DB down, spread across known bugs). Read it before changing backend behavior.
- The repo root and `backend/` have **no git history**; only `frontend/` is a repo. Don't assume `git` operates across the tree.
- Per-package instructions already exist: `backend/AGENTS.md` and `frontend/AGENTS.md`. The frontend one contains an auto-generated block re-added by `next dev` — preserve it verbatim, and heed its warning: Next 16.3.1 / React 19 have breaking changes vs training data; read `frontend/node_modules/next/dist/docs/` before writing components.

## Setup / run (both apps expected to run together)

Backend (`backend/`, port 8000):

```bash
source .venv/bin/activate   # managed by uv
uv sync                      # or: pip install -r requirements.txt
cp .env.example .env         # then fill in real values
alembic upgrade head
python -m app.seed           # idempotent: seeds admin + tech catalog + settings
uvicorn app.main:app --reload
```

- `DATABASE_URL` and `JWT_SECRET_KEY` are required at startup and the placeholder dev secret is rejected (`app/core/config.py`).

Frontend (`frontend/`, port 3000):

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL defaults to http://127.0.0.1:8000
npm run dev
```

## Verification commands

- Backend tests: `pytest` (from `backend/`). Requires a real PostgreSQL `portfolio_test` DB. `tests/conftest.py` hardcodes local creds (`pgsql_user` / `User@@123`) unless `TEST_DATABASE_URL` is set, runs `alembic upgrade head`, truncates all tables per test, and resets the rate limiter. 41 tests; no test markers.
- Frontend: `npm run lint` and `npm run build`. **There is no frontend test suite** (no test script/deps in `package.json`).
- `ruff` is referenced in `backend/AGENTS.md` but is **not installed** in the venv or `requirements.txt` — don't run it as a gate.

## Architecture (non-obvious wiring)

- The browser never calls the backend admin API directly. Next.js proxy routes (`frontend/src/app/api/admin/[...path]/route.js`, `api/auth/*`) convert the HttpOnly `pf_admin_token` cookie into `Authorization: Bearer` and forward to `NEXT_PUBLIC_API_URL`. Admin page protection is **client-side only** (no `middleware.ts`).
- `frontend/src/app/uploads/[...path]/route.js` proxies backend static `/uploads` with immutable cache headers.
- Public pages are SSR with `cache:"no-store"` (`frontend/src/lib/data.js`) and fan out one project-detail request per project (N+1, known tradeoff).
- Backend: `app/services/reorder_service.apply_reorder` is shared by projects/experience/education/technologies/testimonials; `project_service._unique_slug` dedupes slugs (`<slug>`, `<slug>-2`, …); resume endpoint enforces single-active (`admin/resume.py` deactivates the rest).

## Contracts & conventions (don't break)

- **Public project schemas must never expose `testing_email` / `testing_password`** — only admin schemas may (`backend/app/schemas/project.py`).
- Draft and soft-deleted (`deleted_at IS NOT NULL`) projects are never returned by public APIs.
- No public registration: single seeded admin; every `/api/admin/*` route requires `Depends(get_current_user)`.
- All uploads must go through `app/services/file_service.py` (validates extension + Content-Type + size). Note: it does **not** sniff magic bytes yet, so a fake `.pdf`/`.png` is currently accepted (docs/STATUS_REPORT.md issue #1).
- Contact form: honeypot `website` field silently drops the submission; rate limit is `1/minute` and **in-memory** (`memory://`); the message must persist in DB even if the email send fails.
- Frontend zod schemas in `src/lib/validators.js` deliberately mirror backend Pydantic rules — keep them in sync when changing either side.
- Any schema/model change requires a Alembic migration in `backend/alembic/versions/` — don't hand-edit the DB.