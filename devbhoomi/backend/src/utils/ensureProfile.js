import Profile from "../models/Profile.js";

/**
 * Guarantees a single profile document exists for the given user.
 * This is intentionally idempotent so it can be used on signup, login,
 * or profile reads without risking duplicate documents.
 */
export const ensureProfileForUser = async (userId) => {
  if (!userId) return null;

  return Profile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { upsert: true, new: true }
  );
};
