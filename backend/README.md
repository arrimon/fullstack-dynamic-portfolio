# Portfolio Backend API

A production-ready **FastAPI** backend for a personal portfolio website. It exposes a public API for the portfolio frontend and a JWT-protected admin panel API for managing content.

## Features

- Admin authentication (JWT, bcrypt password hashing, no public registration)
- Projects CRUD with slug generation, draft/published status, soft delete, featured flag, display ordering and SEO fields
- Project image gallery (multi-upload, validation, deletion)
- Technology tags with many-to-many project relationships
- Experience, Education and Certifications management
- Resume upload with single-active logic
- Site settings and social links
- Public contact form with Gmail notification, rate limiting and honeypot spam protection
- Contact message storage and admin inbox management
- Alembic migrations, PostgreSQL, Pydantic v2 validation, automatic API docs

## Requirements

- Python 3.12+
- PostgreSQL 14+
- (Optional) A Gmail account with an App Password for contact notifications

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | FastAPI + Uvicorn                             |
| Database   | PostgreSQL                                    |
| ORM        | SQLAlchemy 2.x + Alembic                      |
| Validation | Pydantic v2 + Pydantic Settings               |
| Auth       | PyJWT + bcrypt                                |
| Rate limit | slowapi                                       |
| Email      | smtplib (SMTP / Gmail App Password)           |

## Project Structure

```text
backend/
├── app/
│   ├── main.py              # App entry point, CORS, static uploads, routes
│   ├── seed.py              # Admin seed script (python -m app.seed)
│   ├── core/                # config, database, security, dependencies, rate limit
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── api/                 # Public routes + admin routes
│   ├── services/            # Business logic (auth, email, files, storage, projects)
│   └── utils/               # Helpers (slugify)
├── alembic/                 # Alembic migrations
├── uploads/                 # Local file storage (git-ignored)
├── tests/                   # Automated tests
├── .env                     # Local environment variables (never committed)
├── .env.example             # Example environment file
├── alembic.ini
├── requirements.txt
└── README.md
```

## Installation

### 1. Virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

If you use `uv`, the virtual environment is already managed by it:

```bash
uv venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Or with `uv`:

```bash
uv pip install -r requirements.txt
```

### 3. PostgreSQL setup

Create a database and a user:

```sql
CREATE USER portfolio_user WITH PASSWORD 'a-secure-password';
CREATE DATABASE portfolio OWNER portfolio_user;
```

If your password contains special characters (e.g. `@`), it must be URL-encoded in `DATABASE_URL` (`@` becomes `%40`).

### 4. Environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DATABASE_URL=postgresql+psycopg://portfolio_user:a-secure-password@localhost:5432/portfolio
JWT_SECRET_KEY=generate-a-long-random-secret   # e.g. openssl rand -hex 32
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

**Never commit `.env`.** It is already excluded via `.gitignore`.

### 5. Run migrations

```bash
alembic upgrade head
```

Migrations are created in dependency order and configure all tables, foreign keys, indexes, unique constraints, enum constraints and soft-delete support.

### 6. Seed the admin account

```bash
python -m app.seed
```

The admin credentials come from `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. The seed is idempotent — it will not overwrite an existing admin.

### 7. Start the development server

```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running:

- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

## Public API

All public endpoints are unauthenticated:

```http
GET  /api/projects            # Published projects (pagination, ordering, featured filter)
GET  /api/projects/{slug}     # Project detail (technologies, images, SEO)
GET  /api/experience          # Experience ordered by display_order
GET  /api/education           # Education records
GET  /api/certifications      # Certifications
GET  /api/resume              # Active resume
GET  /api/settings            # Public site settings
GET  /api/social-links        # Social links
POST /api/contact             # Submit contact message (rate limited + honeypot)
```

## Admin API

All admin endpoints require a JWT:

```http
POST /api/auth/login          # Login -> { access_token, token_type: "bearer" }
```

Send the token as `Authorization: Bearer <token>`.

```http
# Projects
POST   /api/admin/projects
GET    /api/admin/projects
GET    /api/admin/projects/{id}
PUT    /api/admin/projects/{id}
DELETE /api/admin/projects/{id}          # Soft delete (sets deleted_at)
POST   /api/admin/projects/{id}/restore  # Restore a soft-deleted project
POST   /api/admin/projects/{id}/images   # Upload project images (multi-file)
DELETE /api/admin/project-images/{id}    # Delete a project image

# Technologies
GET    /api/admin/technologies
POST   /api/admin/technologies
PUT    /api/admin/technologies/{id}
DELETE /api/admin/technologies/{id}
POST   /api/admin/technologies/{id}/icon # Upload a technology icon

# Experience / Education / Certifications
POST   /api/admin/experience          POST   /api/admin/education          POST   /api/admin/certifications
PUT    /api/admin/experience/{id}     PUT    /api/admin/education/{id}     PUT    /api/admin/certifications/{id}
DELETE /api/admin/experience/{id}     DELETE /api/admin/education/{id}     DELETE /api/admin/certifications/{id}

# Resume
POST /api/admin/resume                 # Upload PDF, previous active resume is deactivated

# Contact messages
GET   /api/admin/contact-messages      # ?is_read=true|false, paginated
PATCH /api/admin/contact-messages/{id} # { "is_read": true }

# Settings & Social links
PUT    /api/admin/settings             # { "settings": { "hero_title": "..." } }
GET/POST/PUT/DELETE /api/admin/social-links...
```

## Testing

```bash
pytest
```

The tests use a dedicated `portfolio_test` database. Create it before running tests:

```sql
CREATE DATABASE portfolio_test;
```

The test suite covers authentication, project CRUD/soft delete/visibility, image upload validation, contact submission + rate limiting, resume lifecycle and the admin inbox.

## Gmail SMTP Configuration

The contact form sends a notification email via Gmail SMTP.

1. Enable **2-Step Verification** on your Google account.
2. Create an **App Password** at https://myaccount.google.com/apppasswords.
3. Configure in `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
MAIL_TO=your-email@gmail.com
MAIL_TLS=true
```

If `MAIL_PASSWORD` is empty, email sending is skipped (logged as a warning) but the message is still saved to the database — the contact form never depends on email delivery.

## File Storage

Files are stored locally under `uploads/` (with subfolders for projects, resumes, technologies, experience and certifications). Only the resulting URL (`/uploads/...`) is stored in PostgreSQL — never the binary data.

Storage is abstracted behind a `StorageService` interface (`LocalStorageService` today). To switch to Cloudinary, AWS S3 or Supabase Storage later, implement a `CloudStorageService` and set `STORAGE_DRIVER=cloud`.

Validation rules:

- Images: JPG/JPEG, PNG, WEBP — max 5 MB
- Resumes: PDF — max 5 MB
- Both MIME type and extension are validated.

## Production Deployment

The app is designed for platforms such as Render, Railway or any FastAPI-compatible host.

1. Set `DEBUG=false` and use a strong `JWT_SECRET_KEY`.
2. Point `DATABASE_URL` at your hosted PostgreSQL database.
3. Set `CORS_ORIGINS` to your production frontend domain only (comma-separated). Never use `*` in production.
4. Provide `MAIL_*` credentials for contact notifications.
5. Run migrations on deploy: `alembic upgrade head`.
6. Seed the admin: `python -m app.seed`.
7. Serve behind HTTPS.

Example start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## License

This is a personal project. No license is included by default.