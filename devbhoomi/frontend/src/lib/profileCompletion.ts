import type { WizardFormData, ProfilePhoto } from "../types/wizard";

// Mirrors WEIGHTED_FIELDS in backend/backend/src/utils/profileCompletion.js
// EXACTLY. Keep the two in sync.
//
// Why this exists: the wizard used to show `(currentStep / totalSteps) * 100`
// as its own "progress" — which has nothing to do with the real,
// weighted-by-field percentage the rest of the app shows (dashboard badge,
// header menu, browse gate). A member could sit at "Step 9 of 9" (100% by
// step count) while the actual profile-strength score sat at 96% because an
// optional-but-weighted field (like horoscope details) was still empty —
// producing exactly the "4% left... 2% left..." confusion. Computing the
// real score locally, live, as the member types, means the number the
// wizard shows always matches what they'll see everywhere else, with no
// surprises at the end.
const WEIGHTED_FIELDS: [string, number][] = [
  ["dateOfBirth", 8], ["heightCm", 5], ["maritalStatus", 5], ["district", 8], ["address", 5],
  ["education.degree", 10], ["occupation.title", 10], ["family.familyType", 5],
  ["religion", 5], ["lifestyle.diet", 5], ["aboutMe", 12], ["horoscope.rashi", 7],
  ["photos", 20],
];

const getAt = (obj: any, path: string) =>
  path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

/**
 * Computes the same 0-100 profile-strength score the backend stores,
 * directly from the wizard's in-progress form state (before it's even been
 * saved). Use this anywhere the wizard needs to show live progress.
 */
export const computeLiveCompletion = (
  data: Partial<WizardFormData>,
  photos: ProfilePhoto[] = []
): number => {
  const profileLike = { ...data, photos };
  let score = 10; // base for having an account, matches backend
  for (const [path, weight] of WEIGHTED_FIELDS) {
    const val = getAt(profileLike, path);
    const filled = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (filled) score += weight;
  }
  return Math.min(100, score);
};
