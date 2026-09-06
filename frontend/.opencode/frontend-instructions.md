You are working on the `dynamic-portfolio` codebase (FastAPI backend + Next.js frontend). 
A QA pass found two confirmed bugs. Fix both, add regression tests, and do not break 
any of the existing 46 passing pytest tests.

=====================================================
BUG 1 — Magic-byte / content-sniffing validation missing (file_service.py:39)
=====================================================
CURRENT BEHAVIOR:
File uploads (project images, tech icons, testimonial images, settings logo/profile pic, 
resume PDFs) are validated only by:
  - file extension, and/or
  - the client-supplied Content-Type header
Both of these are attacker-controlled and can be spoofed. A file named "fake.png" whose 
actual bytes are HTML/SVG/script content is currently ACCEPTED and stored under /uploads.

REQUIRED FIX:
1. Add real content-based file type detection (magic-byte / file signature sniffing) 
   BEFORE saving any uploaded file to disk — do this in the shared upload/file_service 
   module so every endpoint that accepts uploads benefits (project images, tech icons, 
   testimonial images, settings images, resume PDFs).
2. Use a proper library for this (e.g. `python-magic` or a pure-Python magic-byte checker 
   like `filetype`) — do NOT trust `file.content_type` from the client, and do NOT trust 
   the extension alone.
3. Validate the SNIFFED type against an explicit allowlist per upload context:
     - images: image/png, image/jpeg, image/webp only
     - resume: application/pdf only
4. If the sniffed type does not match the allowlist, reject with 400 
   "Invalid file type" (or similarly descriptive message) — regardless of what 
   extension or Content-Type header was sent.
5. Also reject files where the sniffed type doesn't match the claimed extension 
   (e.g. .png extension but sniffed as text/html or image/svg+xml), since SVG can 
   carry embedded scripts and is a common bypass vector — SVG must NOT be allowed 
   even though its extension patterns can resemble images.
6. Keep existing size limits and rate limits intact — this is an additive check, 
   not a replacement of existing validation.
7. Make sure this doesn't reject genuinely valid PNG/JPEG/WEBP/PDF uploads (avoid 
   false positives) — test with real sample files of each allowed type.

ACCEPTANCE TESTS TO ADD (pytest):
- Upload a file named "fake.png" containing plain text/HTML bytes → expect 400, 
  file NOT written to /uploads.
- Upload a real valid PNG → expect 200/201, file IS written.
- Upload a real valid JPEG and WEBP → expect 200/201.
- Upload an SVG disguised as .png → expect 400.
- Upload a valid PDF as resume → expect 200/201.
- Upload a fake PDF (text file renamed .pdf) as resume → expect 400.
- Confirm existing image/resume upload tests still pass unmodified.

=====================================================
BUG 2 — Honeypot submissions consume a rate-limit slot (contact.py)
=====================================================
CURRENT BEHAVIOR:
The slowapi rate-limit decorator (1 request/minute per IP) runs BEFORE the honeypot 
("website" field) check inside the /api/contact endpoint. This means a bot (or a bad 
actor) submitting a honeypot-triggering request still consumes the real user's 
rate-limit slot for that IP, causing legitimate contact submissions from the same IP 
to get wrongly 429'd shortly after.

REQUIRED FIX:
1. Ensure honeypot-triggering requests do NOT consume the same rate-limit bucket as 
   genuine submissions. Two acceptable approaches — pick whichever fits the existing 
   slowapi setup with the least complexity:
   a) Check the honeypot field FIRST, before the rate-limiter decorator logic executes 
      (may require restructuring the endpoint so the honeypot check happens in a 
      dependency or manual check ahead of the @limiter.limit decorator's counted logic), OR
   b) Give honeypot-triggered "fake success" responses their own separate/unlimited 
      rate-limit key or exempt path, so they don't decrement the real visitor's quota.
2. Preserve current external behavior exactly for real users:
   - Genuine submissions still return 201 and persist to DB.
   - Genuine submissions still hit 429 after exceeding 1/minute.
   - Honeypot submissions still return 200 fake-success, still do NOT persist to DB, 
     still do NOT send email.
3. Do not weaken the rate limiter for genuine abuse — only exempt the honeypot path.

ACCEPTANCE TESTS TO ADD (pytest):
- Submit 1 honeypot-triggering request, then immediately submit 1 genuine valid 
  request from the same IP → genuine request should succeed with 201, NOT 429.
- Submit 2 genuine valid requests within 1 minute from the same IP → 2nd should 
  still correctly return 429 (rate limiter still works for real traffic).
- Confirm honeypot request itself still returns 200 fake-ok and does not persist 
  a row or send an email (regression check on existing behavior).

=====================================================
GENERAL REQUIREMENTS
=====================================================
- Do not change public API response shapes/contracts for any endpoint.
- Do not touch unrelated code paths.
- Run the full existing pytest suite (all 7 test files) after your changes and 
  confirm 46/46 (plus your new tests) still pass.
- Run `npm run lint` and `npm run build` on the frontend afterward if you touched 
  any frontend upload validation (e.g. zod schemas) to confirm no new build errors.
- Summarize exactly which files you changed and why, and list the new test cases 
  you added with their IDs (suggest TC-198-fix and TC-91-fix to match the existing 
  TESTPLAN.md numbering).
- Do NOT modify or delete any real project/contact-message data in the database — 
  only add/modify code and tests.