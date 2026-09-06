# Dynamic Portfolio — Technical Documentation

A full-stack personal portfolio CMS: a FastAPI backend manages content (projects,
experience, resume, settings…) in PostgreSQL and exposes a public REST API plus a
JWT-protected admin API. A Next.js 16 frontend server-renders the public site from
that API and provides an admin dashboard through a cookie-authenticated proxy.

```
┌─────────────────────┐         ┌──────────────────────────┐
│  Next.js frontend   │  fetch  │   FastAPI backend        │
│  localhost:3000     │────────▶│   localhost:8000         │
│                     │         │                          │
│ • SSR public pages ─┼─ direct ─▶ GET /api/*  (no auth)   │
│ • Admin dashboard ──┼─ proxy ──▶ /api/admin/* (JWT Bearer)│
│   (HttpOnly cookie →│         │                          │
│    Bearer injected) │         │ PostgreSQL + /uploads    │
└─────────────────────┘         └──────────────────────────┘
```

## Repositories in this workspace

| Path       | Stack                                                              | Version control |
|------------|--------------------------------------------------------------------|-----------------|
| `backend/` | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, PyJWT, bcrypt, slowapi | none |
| `frontend/`| Next.js 16.3.1 (App Router, Turbopack), React 19, Tailwind v4, react-hook-form + zod, axios | own git repo |

## Backend

### Structure

```
backend/app/
├── main.py               # app factory: CORS, rate-limit handler, /uploads mount, health
├── seed.py               # creates the single admin user from env vars
├── core/
│   ├── config.py         # pydantic-settings, reads .env
│   ├── database.py       # engine, SessionLocal, Base, health check
│   ├── security.py       # bcrypt hashing, JWT encode/decode
│   ├── dependencies.py   # get_current_user (HTTPBearer)
│   └── rate_limit.py     # slowapi limiter (in-memory storage)
├── models/               # SQLAlchemy 2.0 typed models (users, projects, …)
├── schemas/              # Pydantic request/response models
├── api/                  # public routers (/api/projects, /api/contact, …)
│   └── admin/            # JWT-protected routers (/api/admin/*)
├── services/
│   ├── auth_service.py   # authenticate_user, ensure_admin_exists
│   ├── project_service.py# unique slug generation
│   ├── file_service.py   # upload validation (extension/MIME/size)
│   ├── email_service.py  # Gmail SMTP notification for contact form
│   └── storage.py        # StorageService abstraction (local impl; cloud stub)
└── utils/slugify.py
```

### Key design decisions

- **Auth**: no registration. One seeded admin (`ADMIN_*` env vars). `POST /api/auth/login`
  returns a JWT (HS256, `sub = user id`, default expiry 60 min). All `/api/admin/*`
  routes depend on `get_current_user`, which validates signature, expiry and that
  the user still exists.
- **Projects**: `draft`/`published` status, soft delete via `deleted_at`
  (+ `POST /api/admin/projects/{id}/restore`), manual `display_order`,
  `is_featured`, SEO fields, M↔M technologies with composite-unique join table.
  Public endpoints always filter `status == published AND deleted_at IS NULL`.
- **Files**: never stored as BLOBs. Local driver writes to `uploads/<folder>/` with
  UUID-prefixed names and serves them at `/uploads/**`; URLs are stored in the DB.
  A `StorageService` ABC exists so a cloud driver can be swapped in.
- **Contact**: validates payload, honeypot field (`website`) silently accepted-and-dropped,
  slowapi rate limit (default `1/minute` per IP), message committed to DB first,
  then SMTP notification attempted (failure only logged — DB record survives).
- **Pagination**: `{ items, total, page, page_size, total_pages }`, `page_size ≤ 100`.

### Environment variables (see `.env.example`)

`DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`,
`CORS_ORIGINS`, `MAIL_HOST/PORT/USERNAME/PASSWORD/FROM/TO/TLS`, `UPLOAD_DIR`,
`MAX_IMAGE_SIZE_MB`, `MAX_RESUME_SIZE_MB`, `ADMIN_NAME/EMAIL/PASSWORD`,
`CONTACT_RATE_LIMIT`, `STORAGE_DRIVER`, `DEBUG`.

> Note: emails are skipped unless **both** `MAIL_USERNAME` and `MAIL_PASSWORD` are set.

### Running

```bash
cd backend
source .venv/bin/activate
alembic upgrade head          # apply migrations
python -m app.seed            # create admin from ADMIN_* env vars
uvicorn app.main:app --reload # http://127.0.0.1:8000 (docs at /docs)
```

### Tests

```bash
.venv/bin/python -m pytest    # 41 tests, real Postgres DB "portfolio_test" via Alembic
```

Tests truncate all tables between cases, reset the limiter, and cover auth,
projects (draft/soft-delete/slug), images, resume active-swap, and contact.

## Frontend

### Routes

| Route                        | Type      | Description                                        |
|------------------------------|-----------|----------------------------------------------------|
| `/` `(public)`               | SSR async | Hero, featured projects, tech marquee, about, experience, resume CTA, certifications, contact CTA |
| `/projects`, `/projects/[slug]` | SSR    | Listing + detail (published only)                  |
| `/about`, `/resume`, `/contact` | SSR    | Static content pages fed by settings/resume API    |
| `/admin/login`               | client    | Login form                                         |
| `/admin/(dashboard)/*`       | client    | Dashboard, projects (+new/[id]), experience, education, certifications, technologies, resume, messages, settings, social links |
| `/api/auth/login\|logout\|session` | route handlers | Set/clear/read the `pf_admin_token` HttpOnly cookie |
| `/api/admin/[...path]`       | route handler | Auth proxy → backend with injected `Authorization: Bearer` |

### Data flow

- Public pages call `src/lib/data.js` helpers (`fetchJson`, `cache: "no-store"`)
  directly against `NEXT_PUBLIC_API_URL`.
- The admin panel never talks to the backend directly: `src/lib/admin.js` calls
  same-origin `/api/admin/**`; the route handler attaches the Bearer token from the
  HttpOnly cookie and forwards to the backend. Non-multipart bodies are streamed as
  text; multipart uploads (images, resume) are re-built as FormData.
- Session state: `useAuth()` hook polls `/api/auth/session`, which decodes the JWT
  and checks `exp`. `AdminShell` redirects unauthenticated users to `/admin/login`.
- Media: `mediaUrl()` prefixes relative `/uploads/...` paths with the API origin.

### Running

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL
npm run dev                   # http://localhost:3000
npm run build && npm start    # production build (verified passing)
```

## Cross-cutting notes

- CORS on the backend is restricted to `CORS_ORIGINS` (dev: localhost:3000/5173).
- robots.txt disallows `/admin` and `/api`; sitemap includes static routes plus
  published projects (first 100).
- See [`STATUS_REPORT.md`](./STATUS_REPORT.md) for verified-working behaviour and open issues.
