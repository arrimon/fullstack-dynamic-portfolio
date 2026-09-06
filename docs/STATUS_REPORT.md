# Status Report — What Works, What Doesn't

Findings below were verified by running both apps locally (FastAPI on :8000,
Next.js on :3000 against the real PostgreSQL database), exercising endpoints with
curl, and running the test suites. Last verified: 2026-08-23.

## Backend — verified working ✅

| Area | Evidence |
|------|----------|
| Boot & health | `GET /health` → `{"status":"ok","database":true}` |
| Admin login | Valid credentials → JWT; wrong password → 401 |
| Admin protection | Every `/api/admin/*` route requires Bearer token (401 without); all 40 protections present across admin routers |
| Project CRUD | Create/list/get/update/soft-delete/restore exercised live; slug auto-generated (`Review Test Project` → `review-test-project`) |
| Draft/published | Draft project **not** returned by public API (404 by slug) |
| Soft delete | After DELETE, project hidden from public API; `restore` brings it back |
| Pagination shape | `{items,total,page,page_size,total_pages}` returned correctly |
| Image uploads | Bad extension rejected (400); valid PNG stored under `/uploads/projects/` with display_order continuation |
| Resume active-swap | Second upload deactivates first; public `/api/resume` returns only the active one; non-`.pdf` extension rejected |
| Contact form | Message persisted (201); second submission within a minute → 429; honeypot field accepted and dropped |
| Email failure isolation | SMTP not configured in current `.env`, yet contact messages still save to DB (spec requirement) |
| CORS | Restricted to configured localhost origins only |
| Tests | **41/41 pytest tests pass** against a real Postgres `portfolio_test` DB via Alembic |

## Backend — issues found ⚠️

### 1. File content validation trusts client-declared type (Medium)
`app/services/file_service.py:39-54` checks only extension and the
client-controlled `Content-Type` header — never the actual bytes. Verified live:
a file named `fake.pdf` containing `not a pdf` was accepted and stored.
The spec explicitly says "Never trust only the client-provided extension."
Fix: sniff magic bytes (`%PDF-`, PNG/JPEG/WEBP signatures) before saving.
Severity is moderate for a single-admin site, but any stored content is later
served from `/uploads/**`.

### 2. Email notifications are effectively off with current config (Config bug)
`.env` has `MAIL_PASSWORD` set but `MAIL_USERNAME` empty.
`app/services/email_service.py:27` skips sending when *either* is empty, so every
contact submission silently skips notification (only a log warning).
Also unset: `MAIL_FROM`, `MAIL_TO` (they fall back to `MAIL_USERNAME`, which is
empty). The "Gmail notification" feature does not work until all three are set.

### 3. Synchronous SMTP inside the request handler (Low-Medium)
`app/api/contact.py:40` calls `send_contact_email` inline. When SMTP credentials
are misconfigured or Gmail is slow, this adds up to the 15 s socket timeout to
the user's POST response. Consider a background task / queue.

### 4. In-memory rate-limit storage (Low)
`app/core/rate_limit.py` uses `memory://` — counters reset on restart and are
**per worker process** when uvicorn runs multiple workers, so the effective limit
is `N × configured`. Acceptable for dev; use Redis storage for production.

### 5. `/health` returns HTTP 200 even when the DB is down (Low)
`app/main.py:62` always returns 200 with `"database": false`. Load balancers /
orchestrators keying off status codes will route traffic to an unhealthy instance.

### Minor / nits
- Honeypot-filled submissions consume the per-IP rate-limit slot before being
  discarded (limiter decorator runs before the handler check).
- `app/core/database.py:33` uses an odd inline `__import__("sqlalchemy")`
  instead of a normal import.
- `tests/conftest.py:2-6` hardcodes local DB credentials rather than reading env.

## Frontend — verified working ✅

| Area | Evidence |
|------|----------|
| Production build | `npm run build` succeeds; 25 routes compiled (static + dynamic as intended) |
| Lint | `npm run lint`: 0 errors, 9 warnings (see nits) |
| Homepage SSR | Settings-driven content renders server-side (name/role/eyebrow from DB), featured projects, tech marquee built from project technologies, resume CTA conditionally rendered |
| Fallback logic | If no featured projects exist, homepage falls back to latest published projects (verified with empty featured set) |
| Project detail SSR | `/projects/[slug]` renders published project; soft-deleted/draft projects 404 (backend enforced) |
| Login flow | `POST /api/auth/login` sets `pf_admin_token` HttpOnly cookie (Max-Age 3600); bad creds surface backend error message |
| Session | `/api/auth/session` validates JWT expiry → `{authenticated:true/false}` |
| Admin proxy | Cookie→Bearer injection works; unauthenticated `/api/admin/*` → 401; logout clears cookie |
| Admin dashboard | All 10 sections render; CRUD modals wired to zod schemas matching backend constraints |
| Upload UX | Client-side pre-validation (type + 5 MB) mirrors backend rules; drag-and-drop with progress bar for images |

## Frontend — issues found ⚠️

### 1. N+1 fetching on public pages (Performance, Medium at scale)
- Homepage fetches the list, then up to 5 individual `getProjectBySlug` calls.
- `/projects` page hydrates **every** project individually (`data.js:40`,
  used in `projects/page.js`); `/about` hydrates up to 8.
All requests use `cache:"no-store"`, so each visitor triggers ~7–11 upstream
calls per page view. Fine at portfolio scale, but it serialises latency into
SSR and multiplies backend load. A list endpoint that embeds technologies/images
would remove the fan-out entirely.

### 2. Admin protection is client-side only (Low, documented tradeoff)
There is no Next.js `middleware.ts`; `/admin/*` pages are statically prerendered
and gated by `AdminShell`'s redirect after the session check. No data leaks (the
API proxy enforces auth server-side), but unauthenticated visitors can briefly
load the shell before being redirected, and admin JS bundles are public.

### 3. Broad image-optimization allowlist (Low, hardening nit)
`next.config.mjs` allows `remotePatterns: https://**` for next/image. Since most
content images actually use plain `<img>` tags, this mostly widens the
optimization proxy surface unnecessarily. Restrict to your deployment domain(s).

### Minor / nits
- `CrudManager.jsx:89-91`: redundant duplicate `end_date = null` branch (dead code).
- `lib/admin.js:19`: success path returns hardcoded `status: 200` regardless of
  the real response status (e.g. 201) — currently unused by callers, but misleading.
- `ProjectEditor.jsx`: tab switchers use raw `<a href>` → full page reload;
  `next/link` would preserve SPA behaviour.
- Lint warnings (9): `no-img-element` ×5 (admin galleries — acceptable for dynamic
  uploads), react-hook-form `watch()` incompatible-library ×2, etc.
- Repo hygiene: `frontend/.gitignore` pattern `.env*` also excludes
  `.env.example` (add `!.env.example` if you want it versioned). The backend and
  repo root have no git repository at all — no history for anything except frontend.

## Spec-compliance snapshot (vs `backend/.opencode/backend-instructions.md`)

Implemented and verified: single seeded admin, no registration, JWT-protected
admin API, projects CRUD + draft/published + soft delete + restore + featured +
ordering + SEO + technologies M↔M + gallery, experience/education/certifications/
technologies/social-links CRUD, resume PDF with single-active rule, settings
key/value store, contact persistence + rate limiting + honeypot + DB-survives-
email-failure, file-type/size validation (extension/MIME only — see issue #1),
CORS restriction, pagination cap, Alembic migration, `/health`, `/docs`, tests,
README-level docs.

Not yet satisfied: magic-byte file validation (issue #1), email delivery in the
current environment (issue #2), production-grade rate-limit storage (issue #4),
cloud storage driver (`CloudStorageService` raises NotImplementedError — stub only).

## Recommended fix order

1. Set `MAIL_USERNAME`/`MAIL_FROM`/`MAIL_TO` (or blank the password deliberately)
   — one-line config change restoring email notifications.
2. Add magic-byte sniffing in `file_service.py`.
3. Move SMTP send off the request path (`BackgroundTasks`).
4. Return HTTP 503 from `/health` when `database` is false.
5. Add a backend list serializer embedding technologies/images to kill the N+1.
