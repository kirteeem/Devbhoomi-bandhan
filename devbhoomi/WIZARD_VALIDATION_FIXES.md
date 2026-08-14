# Profile Wizard Validation Audit — Changes Applied

## Source of truth established
- **Backend `updateProfileSchema` (Zod, `profileController.js`) intentionally
  treats every field as optional** — "Save Draft" must always succeed with a
  half-filled profile. So the backend was never meant to define
  *required-ness*; it only enforces **format/range** (e.g. height 100–250cm,
  18+ years old, district must be a real enum value).
- **Required-ness is a UI decision**, and now lives in exactly one place:
  `frontend/src/lib/wizardValidation.ts`. Every step component reads its
  required/error state from there — none validate independently.

## The central bug (root cause of "filled everything, still get errors")
Selecting **"Other / Outside Himachal"** — an option the wizard itself
offers and requires a follow-up field for — was **guaranteed to be
rejected** by the backend:
- `district` was a strict 12-value Mongoose/Zod enum with no `"Other"`.
- `customDistrict` wasn't a real field anywhere — it was only accessed via
  `(data as any).customDistrict` in one component, so the value a member
  typed was silently discarded and never even reached the backend to fail
  gracefully.

**Fixed end-to-end:**
- `backend/src/models/Profile.js` — added `"Other"` to the `district` enum,
  added a real `customDistrict` field.
- `backend/src/controllers/profileController.js` — mirrored both in
  `updateProfileSchema`.
- `frontend/src/types/wizard.ts` — `customDistrict` is now a real, typed
  field (removed the `as any` casts).
- `frontend/src/lib/wizardMapping.ts` — maps it back when loading an
  existing profile.
- `frontend/src/components/wizard/steps/Step9Review.tsx` — shows the custom
  value on the final review screen instead of the literal string "Other".

## Other real bugs found and fixed
- **`wizardMapping.ts` had an actual TypeScript compile error** (confirmed
  via `tsc --noEmit`): `tehsil` and `village` were missing from
  `profileToWizardData`, so re-opening an existing profile silently wiped
  those two fields on load. Fixed.
- **Range mismatches**: the backend enforces `heightCm` 100–250,
  `family.siblings` 0–20, and partner-preference age 18–100 / height
  100–250 — but the frontend only checked "is it filled in," never "is it
  in range." A member could pass the Next-button check with, say,
  `heightCm: 50` and only find out it was invalid after Submit, with a raw
  backend message. Added matching range validators (mirroring the backend
  exactly) that fire immediately on Next, with plain-language messages
  (e.g. *"Height must be between 100cm and 250cm."*).
- **Two step components silently dropped the `errors` prop entirely**
  (`Step4Family`, `Step7PartnerPreference`) — so even with the range checks
  above, nothing would have displayed the error inline. Wired `errors`
  through both; extended `RangeField` to support error display.

## What was already good (verified, left alone)
- The overall wizard architecture — validate only the current step on Next,
  full re-validation only right before final submit, scroll-to-error,
  clear-error-on-edit, single `validateStep`/`validateAllRequiredSteps`
  source of truth — was already well built. No duplicate validation layers
  were found in the step components themselves.
- Frontend (`lib/profileCompletion.ts`) and backend
  (`utils/profileCompletion.js`) profile-strength weighting were already
  byte-for-byte in sync.
- Photos are intentionally optional in both the UI copy and the backend
  schema — no mismatch there; nothing needed to change.

## Rewritten `wizardValidation.ts`
- Replaced the one-size-fits-all `"This field is required"` with specific,
  human messages per field (`"Please select your district."`,
  `"Date of birth is required."`, `"Please enter your full address."`,
  etc.), matching the style requested (§6 of the brief).
- Extracted two small reusable helpers — `required()` and
  `optionalNumberInRange()` — used everywhere instead of repeating inline
  conditionals per field (§7/§10).
- `validateAllRequiredSteps` now scans **every** step (not just the ones
  with asterisked/required fields), because the new optional-but-bounded
  checks (siblings, partner preference) can also fail on their own step and
  must be caught before submit, not after.

## Verified
- `npx tsc --noEmit`: 0 errors from any file touched in this pass (3
  pre-existing, unrelated errors remain elsewhere — `NotificationBell.tsx`,
  `RefundAndCancellation.tsx`, `TermsAndPolicies.tsx`).
- `node --check` passes on both edited backend files.
- Directly exercised the updated Zod schema: `district: "Other"` +
  `customDistrict` now validates successfully (previously guaranteed to
  fail); an out-of-range `heightCm` is still correctly rejected server-side
  as a defense-in-depth safety net, matching what the frontend now also
  catches pre-submit.
- `npm audit`: 0 vulnerabilities, backend and frontend (unchanged from the
  prior security pass).

## Final-verification checklist (from the brief)
- ✅ Filling only required fields lets a member complete the wizard.
- ✅ Optional fields (tehsil, village, family details, lifestyle, partner
  preference, photos, etc.) can be left empty without blocking progress.
- ✅ No false validation errors — required-ness lives in one file, matched
  field-for-field against what each step component actually marks required.
- ✅ Next button validates only the current step's fields.
- ✅ Submit re-validates every step (required AND range) before publishing,
  dropping the member back on the exact step that needs attention.
- ✅ Error messages are specific and human ("Please select your district."
  instead of "Validation failed").
- ✅ Frontend/backend required-and-range rules are synchronized — the
  concrete gaps found (district "Other", height/siblings/partner-preference
  ranges) are closed.
