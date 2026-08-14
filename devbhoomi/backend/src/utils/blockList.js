import Block from "../models/Block.js";

// Returns the set of user ids that should be invisible to / unreachable by
// `userId` because of a block in EITHER direction — if A blocks B, neither
// should see the other in Browse Matches, or
// view each other's full profile. Used by matchController, profileController,
// so the rule is enforced consistently everywhere.
export const getBlockedUserIds = async (userId) => {
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  }).select("blocker blocked");

  const ids = new Set();
  for (const b of blocks) {
    const other = String(b.blocker) === String(userId) ? b.blocked : b.blocker;
    ids.add(String(other));
  }
  return ids;
};

// Quick pairwise check (either direction) — used on single-profile /
// endpoints where fetching the whole list would be overkill.
export const isBlockedEitherWay = async (userIdA, userIdB) => {
  const block = await Block.findOne({
    $or: [
      { blocker: userIdA, blocked: userIdB },
      { blocker: userIdB, blocked: userIdA },
    ],
  });
  return Boolean(block);
};
