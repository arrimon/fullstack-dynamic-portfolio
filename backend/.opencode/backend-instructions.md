# FastAPI Portfolio Backend — Master Development Prompt

## ROLE

You are a senior backend engineer specializing in **FastAPI, Python, PostgreSQL, SQLAlchemy, Alembic, JWT authentication, REST API design, file uploads, email systems, security, and production deployment**.

Your task is to build a complete, production-ready **Portfolio Backend API** using FastAPI.

The backend will serve a portfolio frontend and provide a secure admin panel API for managing portfolio content.

Do not unnecessarily change the requirements, architecture, database design, endpoint structure, or feature scope described below.

---

# 1. PROJECT OBJECTIVE

Build a portfolio backend with:

* Admin authentication
* Projects CRUD
* Project image gallery
* Technology/skill management
* Project ↔ technology relationships
* Experience management
* Education management
* Certifications management
* Resume upload and management
* Site settings management
* Social links management
* Public contact form
* Contact message storage
* Gmail email notification
* Spam protection/rate limiting
* Draft/published project status
* Soft deletion
* Ordering/display order
* SEO fields
* Production-ready PostgreSQL database
* Secure REST APIs
* Proper validation
* Proper error handling
* API documentation

The backend must be designed so that a React/Next.js/Vite frontend can consume it easily.

---

# 2. REQUIRED TECHNOLOGY STACK

Use:

* **Python 3.12+**
* **FastAPI**
* **PostgreSQL**
* **SQLAlchemy 2.x**
* **Alembic**
* **Pydantic v2**
* **Pydantic Settings**
* **JWT authentication**
* **bcrypt/password hashing**
* **Uvicorn**
* **python-multipart** for file uploads
* **SMTP/Gmail** for contact email notifications

Preferred supporting libraries:

* `python-jose` or an equivalent secure JWT implementation
* `passlib`/`bcrypt` or another maintained password hashing solution
* `email-validator`
* `slowapi` or an equivalent rate-limiting solution

Do not introduce unnecessary frameworks or technologies.

---

# 3. PROJECT STRUCTURE

Use a clean modular architecture similar to:

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   │   └── dependencies.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── project_image.py
│   │   ├── technology.py
│   │   ├── experience.py
│   │   ├── education.py
│   │   ├── certification.py
│   │   ├── resume.py
│   │   ├── contact_message.py
│   │   ├── site_setting.py
│   │   └── social_link.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── project.py
│   │   ├── technology.py
│   │   ├── experience.py
│   │   ├── education.py
│   │   ├── certification.py
│   │   ├── resume.py
│   │   ├── contact.py
│   │   ├── settings.py
│   │   └── social.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── experience.py
│   │   ├── education.py
│   │   ├── certifications.py
│   │   ├── resume.py
│   │   ├── contact.py
│   │   ├── settings.py
│   │   ├── social_links.py
│   │   └── admin/
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   ├── email_service.py
│   │   ├── file_service.py
│   │   └── ...
│   │
│   └── utils/
│
├── alembic/
├── uploads/
├── tests/
├── .env
├── .env.example
├── alembic.ini
├── requirements.txt
└── README.md
```

You may adjust the exact folder organization if there is a strong technical reason, but maintain clear separation between:

* API/routes
* schemas
* models
* services/business logic
* database
* authentication/security
* configuration

---

# 4. DATABASE

Use **PostgreSQL**.

Use **SQLAlchemy 2.x** for ORM/database access.

Use **Alembic** for all database migrations.

Do not manually modify the production database schema.

Every schema change must be represented through an Alembic migration.

---

# 5. DATABASE SCHEMA

Implement the following schema without removing the required fields.

## users

Admin authentication table.

Fields:

```text
id
name
email UNIQUE
password HASHED
created_at
updated_at
```

Requirements:

* No public registration.
* Only the administrator account should exist.
* Password must never be stored in plaintext.
* Email must be unique.
* Password hashing must use bcrypt or an equivalent secure algorithm.

---

# 6. PROJECTS

Table:

```text
projects
```

Fields:

```text
id
title
slug UNIQUE
short_description
description
thumbnail_url
github_link nullable
live_link nullable
status
is_featured
display_order
meta_title nullable
meta_description nullable
deleted_at nullable
created_at
updated_at
```

Requirements:

### slug

Generate a URL-friendly slug.

Example:

```text
Expense Tracker
```

becomes:

```text
expense-tracker
```

Slug must be unique.

### status

Allowed values:

```text
draft
published
```

Default:

```text
draft
```

### is_featured

Boolean.

Used to determine whether the project appears as a featured project on the homepage.

### display_order

Integer.

Used for manual project ordering.

### soft delete

Use:

```text
deleted_at
```

Do not permanently delete projects through the normal admin delete operation.

Public APIs must never return soft-deleted projects.

---

# 7. PROJECT IMAGES

Table:

```text
project_images
```

Fields:

```text
id
project_id
image_url
alt_text nullable
display_order
```

Relationship:

```text
projects 1 → many project_images
```

Requirements:

* A project can have multiple images.
* Images must not be stored as BLOBs in PostgreSQL.
* Store uploaded files externally/local storage and save the resulting URL in the database.
* Validate image type.
* Validate image size.
* Support:

  * JPG/JPEG
  * PNG
  * WEBP
* Recommended maximum size: 5MB per image.

---

# 8. TECHNOLOGIES

Table:

```text
technologies
```

Fields:

```text
id
name UNIQUE
icon_url nullable
category
```

Allowed categories:

```text
frontend
backend
database
tools
```

Examples:

```text
React
Next.js
FastAPI
Laravel
PostgreSQL
MySQL
Docker
Git
Tailwind CSS
```

---

# 9. PROJECT TECHNOLOGY

Create a many-to-many relationship:

```text
project_technology
```

Fields:

```text
project_id
technology_id
```

Relationship:

```text
projects M ↔ M technologies
```

Use a composite unique constraint to prevent duplicate project/technology relationships.

---

# 10. EXPERIENCE

Table:

```text
experience
```

Fields:

```text
id
company_name
company_logo nullable
position
employment_type
location nullable
description
start_date
end_date nullable
is_current
display_order
```

Employment types:

```text
full-time
part-time
freelance
internship
```

If:

```text
is_current = true
```

then:

```text
end_date = null
```

Experience should be returned in `display_order`.

---

# 11. EDUCATION

Table:

```text
education
```

Fields:

```text
id
institution
degree
field_of_study nullable
start_date
end_date nullable
grade nullable
description nullable
```

Support multiple education records.

Use ordering where appropriate.

---

# 12. CERTIFICATIONS

Table:

```text
certifications
```

Fields:

```text
id
title
issuing_organization
issue_date
credential_url nullable
image_url nullable
```

Certification records should be independently manageable from the admin API.

---

# 13. RESUME

Table:

```text
resume
```

Fields:

```text
id
file_url
version_label nullable
is_active
uploaded_at
```

Requirements:

* Resume file must be PDF.
* Recommended maximum size: 5MB.
* Only one resume can be active.
* When a new resume is uploaded:

  * Set previous active resume to `is_active = false`.
  * Set new resume to `is_active = true`.
* Public API must return only the active resume.

---

# 14. CONTACT MESSAGES

Table:

```text
contact_messages
```

Fields:

```text
id
name
email
subject nullable
message
ip_address nullable
is_read
created_at
```

Default:

```text
is_read = false
```

When a user submits the contact form:

1. Validate the request.
2. Apply spam/rate-limit protection.
3. Save the message to PostgreSQL.
4. Send an email notification to the configured Gmail address.
5. Return a successful response.

Do not depend only on email delivery.

The database must retain the submitted message even if email delivery fails.

---

# 15. SITE SETTINGS

Table:

```text
site_settings
```

Fields:

```text
id
key UNIQUE
value
```

Examples:

```text
hero_title
hero_subtitle
about_bio
github_url
linkedin_url
email
phone
location
```

The frontend should be able to retrieve these settings dynamically.

Admin can update them without redeploying the frontend.

---

# 16. SOCIAL LINKS

Table:

```text
social_links
```

Fields:

```text
id
platform
url
icon nullable
```

Examples:

```text
github
linkedin
twitter
facebook
```

Keep social links separate from general site settings.

---

# 17. DATABASE RELATIONSHIPS

Implement:

```text
users
  └── admin authentication only

projects
  ├── project_images
  └── project_technology
          └── technologies

experience
education
certifications
resume
contact_messages
site_settings
social_links
```

Relationships:

```text
projects (1) ──< project_images (many)

projects (M) ──< project_technology >── (M) technologies

experience → standalone
education → standalone
certifications → standalone
resume → standalone
contact_messages → standalone
site_settings → standalone
social_links → standalone
```

Users manage the content but content does not need foreign keys to the user.

---

# 18. PUBLIC API

All public endpoints must be accessible without authentication.

Implement:

```http
GET /api/projects
GET /api/projects/{slug}

GET /api/experience

GET /api/education

GET /api/certifications

GET /api/resume

GET /api/settings

GET /api/social-links

POST /api/contact
```

---

# 19. PUBLIC PROJECT API

## GET /api/projects

Return only:

```text
status = published
deleted_at IS NULL
```

Support:

* pagination
* ordering by `display_order`
* featured filtering if useful

Example response structure:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 10
}
```

---

# 20. PROJECT DETAIL API

## GET /api/projects/{slug}

Return:

* project information
* thumbnail
* GitHub link
* live link
* status
* technologies
* project images
* SEO information

Do not expose soft-deleted or draft projects publicly.

---

# 21. EXPERIENCE API

## GET /api/experience

Return experience records ordered by:

```text
display_order
```

Do not expose unnecessary database/internal fields.

---

# 22. EDUCATION API

## GET /api/education

Return education records.

Use appropriate ordering.

---

# 23. CERTIFICATION API

## GET /api/certifications

Return certification records.

---

# 24. RESUME API

## GET /api/resume

Return the currently active resume.

Expected behavior:

```text
is_active = true
```

If no active resume exists, return an appropriate 404 response.

---

# 25. SETTINGS API

## GET /api/settings

Return the public site configuration.

Do not expose private configuration values or environment variables.

---

# 26. CONTACT API

## POST /api/contact

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project."
}
```

Requirements:

* Validate name.
* Validate email.
* Validate message.
* Rate limit requests.
* Implement spam protection.
* Save message to database.
* Send Gmail notification.
* Never expose SMTP credentials.
* Return a clean success/error response.

Recommended:

```text
1 submission per IP per minute
```

Also support a honeypot field if appropriate.

---

# 27. ADMIN AUTHENTICATION

Implement:

```http
POST /api/auth/login
```

Do NOT implement:

```http
POST /api/auth/register
```

There must be no public registration.

Login should return a JWT access token.

Example:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

Use:

```text
Authorization: Bearer <token>
```

for protected endpoints.

---

# 28. ADMIN API

All admin endpoints must require JWT authentication.

Projects:

```http
POST   /api/admin/projects
GET    /api/admin/projects
GET    /api/admin/projects/{id}
PUT    /api/admin/projects/{id}
DELETE /api/admin/projects/{id}
```

Project images:

```http
POST   /api/admin/projects/{id}/images
DELETE /api/admin/project-images/{id}
```

Experience:

```http
POST   /api/admin/experience
PUT    /api/admin/experience/{id}
DELETE /api/admin/experience/{id}
```

Education:

```http
POST   /api/admin/education
PUT    /api/admin/education/{id}
DELETE /api/admin/education/{id}
```

Certifications:

```http
POST   /api/admin/certifications
PUT    /api/admin/certifications/{id}
DELETE /api/admin/certifications/{id}
```

Resume:

```http
POST /api/admin/resume
```

Contact messages:

```http
GET   /api/admin/contact-messages
PATCH /api/admin/contact-messages/{id}
```

Settings:

```http
PUT /api/admin/settings
```

Social links should also have admin CRUD endpoints.

---

# 29. FILE STORAGE

Do NOT store image or resume binary data inside PostgreSQL.

Create a file-storage abstraction.

Initial implementation may use:

```text
/uploads
```

with separate folders:

```text
/uploads/projects
/uploads/resumes
/uploads/technologies
/uploads/experience
/uploads/certifications
```

However, architecture should make it possible to replace local storage later with:

* Cloudinary
* AWS S3
* Supabase Storage

Store only the resulting URL/path in PostgreSQL.

---

# 30. FILE VALIDATION

Images:

```text
jpg
jpeg
png
webp
```

Maximum recommended size:

```text
5MB
```

Resume:

```text
pdf
```

Maximum recommended size:

```text
5MB
```

Validate both:

* MIME type
* extension
* file size

Never trust only the client-provided extension.

---

# 31. GMAIL SMTP

Use Gmail SMTP.

Environment variables:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
MAIL_TO=your-email@gmail.com
```

Use Gmail App Password.

Never use the actual Gmail account password.

Email should contain:

```text
Sender name
Sender email
Subject
Message
Submission timestamp
```

The email should be professionally formatted.

---

# 32. ENVIRONMENT VARIABLES

Create:

```text
.env
.env.example
```

Example:

```env
APP_NAME=Portfolio API
APP_ENV=development
DEBUG=true

DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/portfolio

JWT_SECRET_KEY=change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

CORS_ORIGINS=http://localhost:3000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_TO=

UPLOAD_DIR=uploads
MAX_IMAGE_SIZE_MB=5
MAX_RESUME_SIZE_MB=5
```

Never commit `.env`.

---

# 33. CORS

Only allow configured frontend origins.

Development example:

```text
http://localhost:3000
http://localhost:5173
```

Production frontend domain must be configured through environment variables.

Do not use unrestricted:

```text
*
```

in production.

---

# 34. SECURITY

Implement:

* JWT authentication
* bcrypt password hashing
* protected admin routes
* CORS restrictions
* request validation
* file validation
* upload size limits
* rate limiting
* spam protection
* secure environment variables
* proper HTTP status codes
* safe error responses
* SQLAlchemy parameterized queries
* no secret values in logs

Do not return stack traces in production.

---

# 35. SOFT DELETE

Projects must support soft deletion.

Normal delete:

```http
DELETE /api/admin/projects/{id}
```

should set:

```text
deleted_at = current timestamp
```

rather than physically deleting the record.

Public endpoints must automatically exclude:

```text
deleted_at IS NOT NULL
```

If a restore endpoint is implemented, it should be admin protected.

---

# 36. DRAFT/PUBLISHED

Admin should be able to create:

```text
draft
```

projects.

Draft projects must never appear in public APIs.

When changed to:

```text
published
```

they become visible publicly.

This allows the admin to prepare a project before publishing it.

---

# 37. ORDERING

Use:

```text
display_order
```

for:

* projects
* project images
* experience

The API should return records according to this manual order.

Do not rely only on creation date.

---

# 38. SEO

Projects should support:

```text
meta_title
meta_description
```

These fields should be returned in the project detail API.

They are optional.

---

# 39. ERROR HANDLING

Use proper HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
```

Return consistent JSON responses.

Example:

```json
{
  "detail": "Project not found"
}
```

Do not expose database exceptions directly to clients.

---

# 40. API RESPONSE DESIGN

Use Pydantic response schemas.

Do not return raw SQLAlchemy model objects without proper response validation.

Responses should contain only frontend-relevant information.

Use consistent naming conventions throughout the API.

---

# 41. PAGINATION

Admin project/message lists should support pagination.

Example:

```text
?page=1&page_size=20
```

Return:

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

Prevent unreasonable page sizes.

For example:

```text
maximum page_size = 100
```

---

# 42. ADMIN CONTACT MESSAGE MANAGEMENT

Admin should be able to:

* View messages
* View unread messages
* Mark messages as read

Example:

```http
GET /api/admin/contact-messages
```

Optional query:

```text
?is_read=false
```

Mark read:

```http
PATCH /api/admin/contact-messages/{id}
```

Request:

```json
{
  "is_read": true
}
```

---

# 43. SEED ADMIN USER

Create a secure database seed/init mechanism for the admin account.

Credentials must come from environment variables.

Example:

```env
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

Never hardcode the real production password.

Do not expose admin credentials in source code.

---

# 44. ALEMBIC MIGRATIONS

Create migrations in dependency order:

```text
users
technologies
projects
project_images
project_technology
experience
education
certifications
resume
contact_messages
site_settings
social_links
```

Ensure:

* foreign keys
* indexes
* unique constraints
* enum constraints where appropriate
* timestamps
* soft-delete support
* cascade behavior

are correctly configured.

---

# 45. INDEXES

Add appropriate indexes.

At minimum:

```text
users.email
projects.slug
projects.status
projects.deleted_at
projects.is_featured
projects.display_order
project_images.project_id
project_technology.project_id
project_technology.technology_id
contact_messages.email
contact_messages.is_read
contact_messages.created_at
site_settings.key
```

Do not add unnecessary indexes.

---

# 46. DATABASE CONSTRAINTS

Use database-level constraints where appropriate.

Examples:

```text
users.email UNIQUE
projects.slug UNIQUE
technologies.name UNIQUE
site_settings.key UNIQUE
```

Prevent duplicate:

```text
project_id + technology_id
```

relationships.

---

# 47. HEALTH CHECK

Implement:

```http
GET /health
```

Response example:

```json
{
  "status": "ok",
  "database": true
}
```

The health check should verify database connectivity appropriately.

---

# 48. ROOT ENDPOINT

Implement:

```http
GET /
```

Example:

```json
{
  "message": "Portfolio API is running"
}
```

---

# 49. API DOCUMENTATION

FastAPI's automatic documentation must work:

```text
/docs
/redoc
```

Use meaningful endpoint summaries and tags.

Suggested tags:

```text
Authentication
Projects
Technologies
Experience
Education
Certifications
Resume
Contact
Settings
Social Links
Admin
```

---

# 50. TESTING

Create tests for important functionality.

At minimum test:

### Authentication

* valid login
* invalid email
* invalid password
* protected route without token
* protected route with invalid token

### Projects

* create project
* update project
* delete project
* soft delete
* published project appears publicly
* draft project does not appear publicly
* deleted project does not appear publicly
* project slug lookup
* technology relationships

### Images

* valid image upload
* invalid file type
* oversized image
* image deletion

### Contact

* valid contact submission
* invalid email
* empty message
* rate limit
* database persistence

### Resume

* upload resume
* previous resume becomes inactive
* only active resume returned publicly
* invalid file type rejected

---

# 51. README

Create a complete README explaining:

* Project overview
* Requirements
* Installation
* Virtual environment
* Dependency installation
* PostgreSQL setup
* Environment variables
* Alembic migrations
* Admin seed
* Development server
* API documentation
* Testing
* Production deployment
* File storage
* Gmail SMTP configuration

Example commands:

```bash
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

Adjust commands if the final project structure requires it.

---

# 52. CODE QUALITY

Follow:

* PEP 8
* type hints
* clear naming
* small functions
* reusable services
* dependency injection
* clean architecture
* proper exception handling

Avoid:

* duplicated business logic
* huge route files
* database queries scattered everywhere
* hardcoded secrets
* hardcoded production URLs
* unnecessary global state

---

# 53. IMPORTANT IMPLEMENTATION RULES

Do not:

* use SQLite
* store images as BLOBs
* store passwords in plaintext
* create public registration
* expose admin endpoints without authentication
* expose drafts publicly
* expose soft-deleted projects publicly
* hardcode Gmail credentials
* hardcode production frontend URLs
* commit `.env`
* silently ignore database errors
* delete project records permanently through normal delete
* remove required schema fields
* remove required API functionality

---

# 54. DEVELOPMENT ORDER

Implement in this order:

## Phase 1 — Foundation

* FastAPI project
* PostgreSQL connection
* SQLAlchemy
* Alembic
* configuration
* environment variables
* health endpoint
* CORS

## Phase 2 — Database

Create all models and migrations:

```text
users
technologies
projects
project_images
project_technology
experience
education
certifications
resume
contact_messages
site_settings
social_links
```

## Phase 3 — Authentication

Implement:

```text
JWT
password hashing
admin login
protected dependencies
admin seed
```

## Phase 4 — Projects

Implement:

```text
Project CRUD
slug generation
soft delete
draft/published
featured
ordering
SEO
technologies
```

## Phase 5 — Project Images

Implement:

```text
multiple image upload
image validation
image deletion
display ordering
```

## Phase 6 — Portfolio Content

Implement:

```text
Experience
Education
Certifications
Technologies
```

## Phase 7 — Resume

Implement:

```text
upload
active/inactive logic
public active resume endpoint
```

## Phase 8 — Site Configuration

Implement:

```text
site settings
social links
```

## Phase 9 — Contact

Implement:

```text
contact submission
database storage
Gmail notification
rate limiting
spam protection
```

## Phase 10 — Testing

Test all critical flows.

## Phase 11 — Documentation

Complete:

```text
README
.env.example
API documentation
deployment instructions
```

---

# 55. PRODUCTION REQUIREMENTS

The final application must be suitable for deployment to:

* Render
* Railway
* similar FastAPI hosting platforms

The PostgreSQL database should be externally hosted or provided by the deployment platform.

Production must use:

```text
DEBUG=false
```

Secrets must come from environment variables.

HTTPS must be used in production.

CORS must contain only the production frontend domain.

---

# 56. CLOUD STORAGE PREPARATION

Although local storage can be used initially, create the file service in a way that allows future replacement.

Example abstraction:

```text
StorageService
├── LocalStorageService
└── CloudStorageService
```

The rest of the application should not directly depend on filesystem implementation details.

---

# 57. FINAL API STRUCTURE

The final API should approximately follow:

```text
/api
├── /auth
│   └── POST /login
│
├── /projects
│   ├── GET /
│   └── GET /{slug}
│
├── /experience
│   └── GET /
│
├── /education
│   └── GET /
│
├── /certifications
│   └── GET /
│
├── /resume
│   └── GET /
│
├── /settings
│   └── GET /
│
├── /social-links
│   └── GET /
│
├── /contact
│   └── POST /
│
└── /admin
    ├── /projects
    ├── /experience
    ├── /education
    ├── /certifications
    ├── /technologies
    ├── /resume
    ├── /contact-messages
    ├── /settings
    └── /social-links
```

---

# 58. DEFINITION OF DONE

The backend is considered complete only when:

* PostgreSQL connection works.
* Alembic migrations work from a clean database.
* Admin can log in.
* JWT authentication protects every admin endpoint.
* Public users cannot access admin APIs.
* Projects support full CRUD.
* Projects support draft/published status.
* Projects support soft deletion.
* Projects support featured status.
* Projects support display ordering.
* Projects support SEO fields.
* Projects support multiple images.
* Projects support technology tags.
* Experience CRUD works.
* Education CRUD works.
* Certifications CRUD works.
* Resume upload works.
* Only one resume is active.
* Contact form saves messages.
* Contact form sends Gmail notification.
* Contact form has rate limiting/spam protection.
* Site settings work.
* Social links work.
* File validation works.
* CORS is configured securely.
* `.env` is excluded from Git.
* `.env.example` exists.
* `/health` works.
* `/docs` works.
* Automated tests cover critical functionality.
* README contains setup and deployment instructions.
* No required functionality from this specification has been removed.

---

# 59. IMPLEMENTATION PRINCIPLE

Build this as a **real production portfolio backend**, not as a demo API.

Prioritize:

1. Security
2. Correct database relationships
3. Maintainable architecture
4. Clean API contracts
5. Validation
6. Error handling
7. Production deployment readiness
8. Easy frontend integration

Do not over-engineer the system.

Do not add unrelated features.

Do not remove or simplify the required functionality.

When there is a technical ambiguity, choose the simplest production-safe FastAPI implementation that preserves the requirements above.
