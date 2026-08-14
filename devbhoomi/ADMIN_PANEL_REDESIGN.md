# Admin Panel Redesign — Identity Verification & Priest Management

## What was built

### Feature 1 — User Identity Verification (Blue Tick)
- **New model** `VerificationRequest` (userId, documentType, documentImage, status, submittedAt,
  reviewedAt/By, rejectionReason) — a proper audit trail per submission, rather than flat fields
  overwritten on every resubmit.
- **User-facing**: `Settings → Verify My Profile` — benefits list, choose Aadhaar or PAN, upload
  (reuses your existing hardened image pipeline: mimetype + magic-byte content check + 5MB limit),
  submit. Shows Pending / Rejected-with-reason-and-resubmit / Verified states. One pending request
  at a time is enforced both in the controller and via a partial unique DB index (belt-and-braces
  against a race between two near-simultaneous submits).
- **Admin-facing**: `Admin → Verification Requests` — filterable/searchable table, a document
  review modal with an image-zoom overlay and the member's profile info side-by-side, Approve /
  Reject (with preset + free-text rejection reasons). Approve sets `User.isProfileVerified` (your
  existing flag — reused, not duplicated) + `verifiedAt`/`verifiedBy`.
- **Emails**: submitted / approved / rejected, using your existing `sendEmail` transport. Also
  fires an in-app notification (reusing the existing `profile_verified` type, plus a new
  `verification_rejected` type) via your existing `notifyUser` helper.
- **Blue Tick badge**: new shared `VerifiedBadge` component (Instagram/X-style blue check) — this
  replaces three *different*, inconsistent ad-hoc badges (forest green, gold, emerald) that
  already existed scattered across the app, and adds the badge to search/match cards, which
  previously had none at all. Now consistent across: profile page, dashboard, search results,
  match cards, shortlists, visitors, interests. (No dedicated "Messages" feature exists yet in
  this codebase, so there was nothing to wire there.)
- **"Get Verified" banner**: shown on the Dashboard for unverified members, linking to
  `Settings → Verify My Profile`. Note: it links there rather than to the admin panel — members
  don't have access to the admin panel (reviewer-only); this takes them to the one place they can
  actually act.
- **Audit log**: new lightweight `AuditLog` model records every approve/reject action (who, when,
  what).

### Feature 2 — Priest Management & Kundali History
Your codebase already had a solid `Priest` / `KundaliRequest` / `KundaliReport` foundation — this
extends it rather than replacing it:
- Added `languages` to `Priest`, `notes` + `timeTakenMinutes` to `KundaliReport`.
- **Admin → Priests**: card grid with live stats (Active Jobs, Completed Kundalis — the latter
  reuses your existing `totalMatchesReviewed` counter), Enable/Disable (reuses the existing
  `isAvailable` flag, which already gates auto-assignment of new kundalis — so disabling a priest
  here immediately stops new work reaching them, not just a cosmetic label).
- Priest detail view: qualification/bio, pending/in-review/completed/cancelled counts, full kundali
  history. Income History is explicitly shown as **not applicable** — there's no per-kundali
  payment/commission model anywhere in this app (kundali matching is a free member benefit, not a
  marketplace), so I didn't fabricate one.
- **Admin → Kundali History**: global, filterable/searchable table (customer, bride, groom, priest,
  date, compatibility score, status) with a full detail view per request.

### Admin panel — what was removed
Per your instructions, the analytics/stat-card **Overview** tab (member counts, verified-profile
counts, etc. with no actual charts, but still "dashboard-heavy") was removed entirely. The default
landing tab is now **Verification Requests**.

**What was deliberately kept**: Members, Team, and Reports tabs remain, simplified (no stat cards),
as secondary tabs after the three new primary ones. These weren't in your requested page list, but
removing them outright would have deleted real, currently-used functionality — the ability to
suspend abusive accounts, moderate member reports, and promote a user to priest/admin (there's no
other way to create a second admin account once the initial seed script has run). Let me know if
you'd like these folded away further or moved somewhere else.

## Also fixed along the way
This re-uploaded zip had regressed two things from an earlier security pass (OTP email error
handling, and a partial-SMTP-password console.log) — both restored.

## Dependency audit
- **Backend**: 0 vulnerabilities.
- **Frontend**: 1 vulnerability fixed (`postcss`); 1 left **deliberately unfixed** —
  `react-router` has a disclosed CSRF-bypass advisory, but it only affects **RSC Mode**, which this
  app doesn't use anywhere (it's a standard client-side SPA). The available fix is a v7→v8 major
  bump that removes `react-router-dom` entirely (every import across the app would need to change)
  and raises the Node/Vite floor. Forcing that silently as a side effect of this feature request
  was too risky — flagging it here as a deliberate, informed decision rather than an oversight.

## Verified
- `npx tsc --noEmit`: clean (only 3 pre-existing, unrelated errors remain elsewhere in the app,
  same as before this pass).
- Backend boots cleanly with no warnings.
- `npm audit`: 0 vulnerabilities (backend), 1 known-and-explained item (frontend).
