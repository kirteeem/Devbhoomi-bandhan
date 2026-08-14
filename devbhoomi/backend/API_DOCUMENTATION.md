# Devbhoomi Bandhan — Backend API Documentation

Base URL (local): `http://localhost:5000/api`
All responses use the envelope: `{ success, message, data }` (or `{ success: false, message }` on error).

Auth: send `Authorization: Bearer <accessToken>` on protected routes. Access tokens expire
(default 15m); use `POST /auth/refresh` with the stored `refreshToken` to get a new one.

## Auth — `/api/auth`
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/signup` | — | `fullName, phoneNumber, email, password, gender, createdFor?` | Creates user + empty profile, returns tokens |
| POST | `/login` | — | `identifier (phone or email), password` | |
| POST | `/otp/request` | — | `phone` | Dev-mode OTP (logged to console, not sent via SMS) |
| POST | `/otp/verify` | — | `phone, code, fullName?` | Logs in or creates account |
| POST | `/google` | — | `googleId, email, fullName?` | ⚠️ does not verify the Google ID token server-side — see Known Gaps |
| POST | `/refresh` | — | `refreshToken` | Returns new access token |
| POST | `/logout` | ✅ | `refreshToken` | Revokes that refresh token |
| GET | `/me` | ✅ | — | Current user |
| PATCH | `/change-password` | ✅ | `currentPassword, newPassword` | Also revokes all other sessions |
| PATCH | `/preferences` | ✅ | `preferredLanguage?: "en"\|"hi"` | Powers the Settings page language toggle |
| DELETE | `/me` | ✅ | — | Self-service account deactivation (`status: "deactivated"`) |

## Profiles — `/api/profiles`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/me` | ✅ | Own profile |
| PATCH | `/me` | ✅ | Partial update, whitelisted fields only |
| GET | `/:userId` | ✅ | Another member's profile (hidden ones 404) |
| POST | `/upload-photo` | ✅ | multipart field name **`image`**, max 5MB, jpg/png/webp only |

## Matches — `/api/matches`
| Method | Path | Auth | Query |
|---|---|---|---|
| GET | `/` | ✅ | `district, minAge, maxAge, education, maritalStatus, diet, page, limit` |
| GET | `/suggested` | ✅ | dashboard widget suggestions |

## Interests — `/api/interests`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/` | ✅ | `receiverId, message?` |
| PATCH | `/:id` | ✅ | `status: accepted \| declined` |
| GET | `/?direction=sent\|received` | ✅ | |

## Chats — `/api/chats`
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/` | ✅ | list of unlocked conversations |
| GET | `/:chatId/messages` | ✅ | |
| POST | `/:chatId/messages` | ✅ | `text` |

Real-time delivery also happens via Socket.IO (`message:new`, `notification:new` events on room `user:<id>`).

## Kundali — `/api/kundali`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/request` | ✅ | `profileB?, requestType?` |
| GET | `/my-requests` | ✅ | |
| GET | `/report/:requestId` | ✅ | Returns `{ report, request }`; 403 if you didn't create the request |

## Priest — `/api/priest` (role: priest, admin)
| Method | Path | Body |
|---|---|---|
| GET | `/queue` | — |
| PATCH | `/requests/:id/status` | `status, notes?` |
| POST | `/requests/:id/report` | `gunMilanScore?, manglikDosha?, summary?, recommendation?, reportFileUrl?` |

## Admin — `/api/admin` (role: admin)
| Method | Path | Body |
|---|---|---|
| GET | `/analytics` | — |
| GET | `/users?status=&page=&limit=` | — |
| PATCH | `/users/:id/verify` | — |
| PATCH | `/users/:id/suspend` | — |
| PATCH | `/users/:id/role` | `role: user\|priest\|admin` |
| GET | `/testimonials/pending` | — |
| PATCH | `/testimonials/:id/approve` | — |

## Notifications — `/api/notifications`
| Method | Path |
|---|---|
| GET | `/` |
| PATCH | `/:id/read` |

## Testimonials — `/api/testimonials` (public)
| Method | Path | Body |
|---|---|---|
| GET | `/` | — |
| POST | `/` | `coupleNames, district?, story, photoUrl?, marriedOn?` |

## Upload (secondary, Cloudinary-based, not used by current frontend) — `/api/upload`
| Method | Path |
|---|---|
| POST | `/photo` (field `photo`) |

---

## This pass: 3 new pages + supporting backend

Per your request, three previously-missing pages were designed and wired up — matching the existing
cream/maroon/forest/gold design system exactly (same `.card`, `.input`, `btn-*` classes, `font-display`,
same motion patterns). No existing UI, routing, or components were touched or redesigned.

1. **Kundli Milan Report** (`/kundali/report/:requestId`) — a Gun Milan score ring, Manglik dosha badge,
   priest's recommendation, and notes. Linked from a new "View Report" action on completed requests in
   the existing Kundali page (one line added, nothing else on that page changed).
   - Also fixed a real authorization gap: `GET /kundali/report/:requestId` previously had no ownership
     check — anyone with a valid request id could view someone else's report. Now 403s if you're not
     the requester.
2. **Success Stories** (`/success-stories`) — the nav link already pointed here (it existed in `Navbar.tsx`
   and `locales/*/common.json` already) but the route was missing, so it 404'd. Built a full page: grid of
   approved testimonials plus a "Share Your Story" form wired to the existing (now-secured) `POST /testimonials`.
3. **Settings** (`/settings`) — same story: `UserProfileMenu.tsx`'s dropdown already linked here, but the
   page didn't exist. Built account info, profile visibility (uses the existing `visibility` field on
   `PATCH /profiles/me`), language preference, change password, logout, and account deactivation.
   Added 3 small, real endpoints to support it — `PATCH /auth/change-password`, `PATCH /auth/preferences`,
   `DELETE /auth/me` (soft-deactivate, adds a `deactivated` status distinct from admin `suspended`).

Verified: `npx tsc --noEmit` and `npm run build` both pass clean on the frontend; every backend file passes
`node --check`; a full import/export cross-check found no broken imports; no duplicate routes, schemas,
models, or controllers were introduced.

## Fixes applied in the first pass

The backend already existed (previously built) and was largely solid. This review found and fixed:

1. **Signup was completely broken.** `Signup.tsx` posts `phoneNumber`, but the backend schema required `phone`, so every signup request failed Zod validation. Fixed the schema/controller to match the frontend's actual field name.
2. **Photo upload was silently broken.** `profileApi.ts` uploads the file under field name `image`; the route was configured for `multer.single("photo")`, so uploads always came back as "No file uploaded." Fixed the field name and added a 5MB size limit + strict image-type allowlist (previously unlimited).
3. **Leaked database credentials.** `backend/.env.example` (which is *not* gitignored, unlike `.env`) contained a real MongoDB Atlas username/password. Replaced with a placeholder — **you should rotate that Atlas password now**, since this file was likely already pushed to a repo.
4. **Plaintext password logging.** Signup logged the full request body (including the raw password) to the console. Removed.
5. **Mass-assignment risk on two endpoints.** `POST /testimonials` (public, unauthenticated) and the priest's `submitReport` both spread raw `req.body` into `Model.create(...)`, letting a caller set arbitrary fields (e.g. self-approve a testimonial). Both now whitelist fields explicitly.
6. **Weak/inconsistent input validation.** Added Zod schemas + validation middleware to every remaining mutating endpoint that lacked one (profile update, interests, kundali requests, chat messages, admin role changes, priest status/report, testimonials).
7. **No ObjectId validation on route params.** A bad `:id` (e.g. `/profiles/abc`) previously caused an unhandled Mongoose `CastError` → generic 500. Added an `validateObjectId` middleware and a centralized error handler that maps `CastError` → 400, `ValidationError` → 400, duplicate-key (11000) → 409, and JWT errors → 401, instead of leaking stack-shaped 500s.
8. **Password strength.** Bumped minimum to 8 characters (matches the frontend's own check) and now requires at least one letter and one number.
9. **CORS + rate limiting hardening.** `origin: "*"` combined with `credentials: true` is invalid (browsers reject it) and was a fallback default; replaced with an explicit origin whitelist (supports a comma-separated `CLIENT_URL`). Added `app.set("trust proxy", 1)` so rate limiting sees real client IPs behind a reverse proxy, and added a stricter rate limit specifically on `/api/auth` (20 req/15min) to slow down brute-forcing.
10. **Defensive null checks** added in a few admin/priest controllers that would previously throw if an `:id` didn't resolve to a document.

## Known gaps worth knowing about (not fixed, by design/scope)

- **OTP is in-memory only** (`utils/otp.js` — a `Map`, not Redis), so it resets on server restart and won't work across multiple server instances. Fine for a single-instance dev/demo deployment; swap for Redis + a real SMS provider before scaling.
- **Google login doesn't verify the ID token server-side** — it trusts whatever `googleId`/`email` the client sends. If you wire up real Google Sign-In, verify the token with `google-auth-library` before trusting it.
- **Refresh tokens are stored in plaintext** in the User document (capped at last 5). Acceptable for now; consider hashing them if you want defense-in-depth against a DB read exposing valid sessions.
- There's a second, unused upload path (`/api/upload/photo`, Cloudinary-based) that the current frontend doesn't call — the frontend only uses `/api/profiles/upload-photo` (local disk storage). Left both in place since removing code wasn't requested, but worth knowing there are two photo-upload code paths.

## Running locally

```bash
cd backend
npm install
cp .env.example .env
# then fill in real values in .env: MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
# generate strong secrets, e.g.: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
npm run dev        # nodemon, http://localhost:5000
npm run seed        # optional: seed sample data
```

```bash
cd frontend
npm install
npm run dev          # Vite, proxies /api to the backend — check vite.config.ts for the proxy target
```
