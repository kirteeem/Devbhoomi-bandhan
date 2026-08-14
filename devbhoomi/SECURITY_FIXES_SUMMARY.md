# Security Review — Changes Applied

## 🚨 Action required from you (not fixable in code)
Real credentials were found committed in this codebase and are now exposed
in this chat/upload. **Rotate these immediately**, regardless of the code
fixes below:
- MongoDB Atlas user password (`backend/backend/.env`)
- Cloudinary API secret (`backend/backend/.env` **and** hardcoded in
  `cloudinary-test.ts`)
- Brevo/SMTP password (`backend/backend/.env`)

## 1. Rate limiting
- Existing tiered per-IP limits (`src/config/rateLimits.js`) were already
  well-configured and env-driven — left as-is.
- **Added:** per-account exponential-backoff lockout on password login
  (`src/utils/accountLockout.js`, wired into `authController.login`).
  5 free attempts, then 30s → 60s → 120s... capped at 15 min, self-clearing
  (not a hard lockout), tracked independently of IP. All thresholds are env
  vars (`LOGIN_LOCKOUT_FREE_ATTEMPTS`, `LOGIN_LOCKOUT_BASE_MS`,
  `LOGIN_LOCKOUT_MAX_MS`).

## 2. Input validation
- Found and fixed **unescaped user input passed into MongoDB `$regex`**
  (ReDoS + unintended-match risk) in `matchController.js` and
  `adminController.js` — wired in the pre-existing but unused
  `regexEscape.js` utility.
- Added a strict Zod query schema for `GET /api/matches` (bounds on
  page/limit, enum `sortBy`, capped string lengths) — was previously
  unvalidated `req.query`.
- Added enum whitelisting + bounded pagination to the admin user-list
  endpoint.

## 3. Secrets
- Removed hardcoded Cloudinary credentials from `cloudinary-test.ts` → now
  reads from `process.env`.
- Removed console logging of partial SMTP password/host/user from
  `src/utils/email.js` and consolidated two duplicate debug scripts
  (`smtpTest.js`, `src/smtpTest.js`) into one clean `smtp-test.js` that
  never logs credential material.
- Confirmed `.gitignore` already excludes `.env`; confirmed no secrets are
  bundled into the frontend build (Vite only exposes `VITE_`-prefixed vars,
  none of which are sensitive here).

## 4. Dependency vulnerabilities
- `npm audit` before: 1 high (nodemailer — SSRF/arbitrary file read via the
  `raw` message option) + 1 low (body-parser DoS).
- Fixed: bumped `nodemailer` 6.10.1 → 9.0.3, added an `overrides` entry
  pinning `body-parser` to 1.20.6.
- `npm audit` after: **0 vulnerabilities** (backend and frontend).

## 5. Error handling & information leakage
- Central `errorHandler.js` was already solid (generic client messages,
  hides stack traces in prod, logs full detail server-side).
- Found and fixed one endpoint that bypassed it: `uploadController.js` was
  catching errors itself and returning raw `err.message` (e.g. internal
  Cloudinary/Mongo error text) directly to the client. Rewritten with
  `asyncHandler` so it goes through the same centralized, generic handling
  as everything else.

## 6. File upload safety
- Found one upload route (`profileRoutes.js` `/upload-photo`) whose multer
  instance had **no file-type filter at all** — any file type was accepted.
- All three upload endpoints previously only checked the client-supplied
  MIME type header, which is trivially spoofable. Added a shared
  `middleware/imageUpload.js` with a magic-byte (file signature) check on
  the actual buffer contents for every upload, before anything is sent to
  Cloudinary.
- Pinned Cloudinary uploads to `resource_type: "image"` and
  `allowed_formats: ["jpg","jpeg","png","webp"]` so a disguised non-image
  file can't be stored/served back with an executable content-type.
- Removed dead legacy code: `middleware/upload.js` (local disk storage,
  unused) and the local `/uploads` static-file serving in `server.js`
  (nothing writes to that directory anymore — everything goes through
  Cloudinary).

## Verified
- `npm audit`: 0 vulnerabilities (backend + frontend).
- All edited files pass `node --check`.
- `server.js` imports and boots cleanly (fails only on DB connection, as
  expected without a real Mongo URI in this sandbox).
