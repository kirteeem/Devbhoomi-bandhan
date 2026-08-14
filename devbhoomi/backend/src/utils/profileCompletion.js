// Single source of truth for the "profile strength" percentage shown across
// the app (dashboard badge, header menu, browse-gate modal, settings page).
//
// IMPORTANT: any controller that changes a profile field (main profile save,
// photo upload, etc.) must call recalculateAndPersistCompletion() afterwards.
// Previously this logic lived only inside profileController.js, so routes
// that touched the profile through a different path (photo upload) silently
// left the stored percentage stale until the member happened to hit
// "Save Draft" again. Centralizing it here means every write path stays in
// sync automatically instead of each controller re-implementing (and
// potentially drifting from) the same weights.
//
// NOTE: keep this list in sync with the mirrored copy in
// frontend/src/lib/profileCompletion.ts, which the wizard uses to show a
// live, accurate progress bar *before* a save round-trip even happens.
export const WEIGHTED_FIELDS = [
  ["dateOfBirth", 8], ["heightCm", 5], ["maritalStatus", 5], ["district", 8], ["address", 5],
  ["education.degree", 10], ["occupation.title", 10], ["family.familyType", 5],
  ["religion", 5], ["lifestyle.diet", 5], ["aboutMe", 12], ["horoscope.rashi", 7],
  ["photos", 20],
];

const getAt = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

export const computeCompletion = (profileDoc) => {
  let score = 10; // base for having an account
  for (const [path, weight] of WEIGHTED_FIELDS) {
    const val = getAt(profileDoc, path);
    const filled = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (filled) score += weight;
  }
  return Math.min(100, score);
};

// Recomputes completion from the profile's *current* DB state and persists
// it to both the Profile and the User (User keeps a denormalized copy for
// cheap reads on things like the profile menu badge). Returns the new score
// so the caller can hand it straight back to the client in the response —
// that's what lets the frontend update its cached user immediately instead
// of showing a stale number until the next page load.
export const recalculateAndPersistCompletion = async (profile, UserModel) => {
  const completion = computeCompletion(profile.toObject());
  profile.profileCompletion = completion;
  await profile.save();
  await UserModel.findByIdAndUpdate(profile.user, { profileCompletion: completion });
  return completion;
};
