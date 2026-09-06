# AGENTS.md

## Project

FastAPI backend (Python 3.12) for the dynamic portfolio: a CMS + public API
with a secure single-admin JWT auth model.

## Setup

```bash
# Activate venv
source .venv/bin/activate

# Install (managed by uv)
uv sync

# Configure environment
cp .env.example .env   # then fill in DATABASE_URL, JWT_SECRET_KEY, etc.

# Run database migrations
alembic upgrade head

# Start the API
uvicorn app.main:app --reload
```

## Tests

```bash
pytest
```

## Conventions

- **Env-driven configuration only.** Never hardcode credentials in code —
  everything comes from `.env` via `app/core/config.py` (pydantic-settings),
  which validates that `DATABASE_URL` and `JWT_SECRET_KEY` are set at startup.
- **Auth**: admin routes live under `/api/admin` and require a JWT Bearer
  token via `Depends(get_current_user)`.
- **Schemas**: public project schemas MUST NOT expose `testing_email` /
  `testing_password`. Use `ProjectAdminRead`/`ProjectAdminDetailResponse`
  (admin) vs `ProjectRead`/`ProjectListResponse`/`ProjectDetailResponse`
  (public).
- **Uploads**: use `app/services/file_service.py` (validates type/size) and
  never trust raw extensions.
- **Security headers** and **request logging** are applied centrally in
  `app/main.py` — new security headers go in `app/core/security_headers.py`.

## Tech Stack

- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.x + Alembic + PostgreSQL
- Pydantic v2 / pydantic-settings
- PyJWT + bcrypt, slowapi (rate limiting)

## CI / Quality

- `ruff` for linting
- `pytest` for the test suite (see `tests/`)