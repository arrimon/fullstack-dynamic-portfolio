# Dynamic Portfolio

A full-stack portfolio website with a **FastAPI + PostgreSQL** backend (CMS + public API) and a **Next.js (App Router)** frontend. Manage your projects, experience, education, certifications, testimonials, technologies, resume, site settings and social links through a secure admin panel — all rendered on a modern, themeable public site.

## Repo Structure

```text
dynamic-portfolio/
├── backend/    # FastAPI backend (CMS + public API) — port 8000
├── frontend/   # Next.js frontend (public site + admin panel) — port 3000
└── README.md   # This file
```

> **Note:** This is a monorepo but **not** a workspace — there is no root package.json or shared tooling. Run commands from each package directory, not the root.

---

## Backend

### Tech Stack

| Layer      | Technology |
|------------|------------|
| Framework  | FastAPI + Uvicorn |
| Database   | PostgreSQL |
| ORM        | SQLAlchemy 2.x + Alembic |
| Validation | Pydantic v2 / pydantic-settings |
| Auth       | PyJWT + bcrypt |
| Rate limit | slowapi |
| Email      | smtplib (SMTP / Gmail App Password) |

### Requirements

- Python 3.12+
- PostgreSQL 14+
- (Optional) A Gmail account with an App Password for contact notifications

### Setup & Run

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment (managed by uv, or use python -m venv)
uv venv .venv
source .venv/bin/activate

# 3. Install dependencies
uv sync                       # or: pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
```

Edit `.env` with real values — `DATABASE_URL` and `JWT_SECRET_KEY` are **required** at startup:

```env
DATABASE_URL=postgresql+psycopg://portfolio_user:a-secure-password@localhost:5432/portfolio
JWT_SECRET_KEY=generate-a-long-random-secret   # openssl rand -hex 32
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
MAIL_HOST=smtp.gmail.com        # optional
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
MAIL_TO=your-email@gmail.com
```

> **Never commit `.env`** — it is excluded via `.gitignore`.

```bash
# 5. Run database migrations
alembic upgrade head

# 6. Seed the admin account (idempotent)
python -m app.seed

# 7. Start the development server
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Key Points

- **Public API** (`/api/*`) is unauthenticated and returns published content only.
- **Admin API** (`/api/admin/*`) requires a JWT Bearer token; no public registration.
- Templates for projects are draft/published with soft delete and display ordering.
- Contact form: rate limited (`1/minute`, in-memory), honeypot-protected, and messages persist even if the email send fails.
- Uploads are validated for extension + Content-Type + size and stored under `uploads/`.

### Testing

Requires a real `portfolio_test` PostgreSQL database.

```bash
pytest
```

See `backend/AGENTS.md` for full conventions and architecture notes.

---

## Frontend

### Tech Stack

| Layer       | Technology |
|-------------|------------|
| Framework   | Next.js (App Router) |
| UI          | React, Tailwind CSS, Lucide icons, Framer Motion |
| Validation  | Zod |
| State       | Client-side admin state + SSR public pages |

### Requirements

- Node.js (LTS) + npm

### Setup & Run

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
# 4. Start the development server
npm run dev
```

The site runs at `http://localhost:3000`.

- **Public site**: `http://localhost:3000` (Home, Work, About, Resume, Contact)
- **Admin panel**: `http://localhost:3000/admin` (login with the seeded admin credentials)

### Key Points

- The browser never calls the backend admin API directly. Next.js proxy routes forward the HttpOnly `pf_admin_token` cookie as `Authorization: Bearer`.
- Public pages are SSR with `cache: "no-store"` for fresh content.
- Zod schemas in `src/lib/validators.js` mirror the backend Pydantic rules — keep both in sync when changing either side.
- Admin page protection is **client-side only** (there is no `middleware.ts`).

### Build & Lint

```bash
npm run lint   # lint + typecheck
npm run build  # production build
```

---

## Quick Start (both apps together)

```bash
# Terminal 1 — backend
cd backend
source .venv/bin/activate
alembic upgrade head && python -m app.seed
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
cp .env.example .env.local   # first time only
npm run dev
```

Then open `http://localhost:3000`.

---

## License

This is a personal project. No license is included by default.
