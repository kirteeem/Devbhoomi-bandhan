import Profile from "../models/Profile.js";
import Shortlist from "../models/Shortlist.js";
import ProfileView from "../models/ProfileView.js";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ensureProfileForUser } from "../utils/ensureProfile.js";

// Same free-tier rule used by the Browse Matches grid (see matchController.js
// FREE_BROWSE_LIMIT) — kept as its own constant here so the dashboard never
// has to import internals from another controller. If this ever needs to
// change, keep both in sync.
const FREE_BROWSE_LIMIT = 5;

// Lightweight, dashboard-only compatibility score. Mirrors the weighting in
// matchController.js's computeCompatibility so the % shown here matches what
// the member sees again on the Matches page.
const computeCompatibility = (viewerProfile, candidate) => {
  let score = 50;
  const pref = viewerProfile?.partnerPreference || {};

  if (pref.districts?.length && candidate.district) {
    score += pref.districts.includes(candidate.district) ? 15 : 0;
  }
  if (pref.education?.length && candidate.education?.degree) {
    score += pref.education.includes(candidate.education.degree) ? 15 : 0;
  }
  if (pref.maritalStatus?.length && candidate.maritalStatus) {
    score += pref.maritalStatus.includes(candidate.maritalStatus) ? 10 : 0;
  }
  if ((pref.ageMin || pref.ageMax) && candidate.dateOfBirth) {
    const age = Math.floor((Date.now() - new Date(candidate.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const minOk = !pref.ageMin || age >= pref.ageMin;
    const maxOk = !pref.ageMax || age <= pref.ageMax;
    score += minOk && maxOk ? 10 : -10;
  }
  if (pref.heightMinCm && candidate.heightCm) {
    score += candidate.heightCm >= pref.heightMinCm ? 5 : 0;
  }
  if (viewerProfile?.religion && candidate.religion && viewerProfile.religion === candidate.religion) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

// GET /api/dashboard/summary
// Single, unified read for the member dashboard: quick stats, the member's
// own profile + quotas, their current plan (free vs premium), and a small
// batch of suggested matches. Whether the viewer is Premium or Free decides
// whether suggested-match photos/details come back blurred — the frontend
// never has to guess, it just renders exactly what this endpoint says.
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const user = req.user;
  const viewerIsPremium = user.isPremium();

  await ensureProfileForUser(user._id);
  const myProfile = await Profile.findOne({ user: user._id }).lean();

  const oppositeGender = user.gender === "male" ? "female" : user.gender === "female" ? "male" : undefined;

  const suggestionQuery = { visibility: { $ne: "hidden" } };
  if (myProfile?.partnerPreference?.districts?.length) {
    suggestionQuery.district = { $in: myProfile.partnerPreference.districts };
  } else if (myProfile?.district) {
    suggestionQuery.district = myProfile.district;
  }

  const [
    candidateProfiles,
    visitorIds,
    activeSubscription,
  ] = await Promise.all([
    Profile.find(suggestionQuery)
      .populate({
        path: "user",
        match: oppositeGender ? { gender: oppositeGender, status: "active" } : { status: "active" },
        select: "fullName isProfileVerified lastActiveAt premiumUntil createdAt",
      })
      .limit(12)
      .lean(),
    ProfileView.distinct("viewer", { viewedUser: user._id }),
    Subscription.findOne({ user: user._id, status: "active" }).populate("plan").sort({ createdAt: -1 }).lean(),
  ]);

  const filteredCandidates = candidateProfiles.filter(
    (p) => p.user && String(p.user._id) !== String(user._id)
  );

  const candidateUserIds = filteredCandidates.map((p) => p.user._id);
  const shortlisted = await Shortlist.find({ user: user._id, shortlistedUser: { $in: candidateUserIds } }).select("shortlistedUser").lean();
  const shortlistedIds = new Set(shortlisted.map((s) => String(s.shortlistedUser)));

  // Photos are visible to everyone, free or premium — only full profile
  // details (unlocked via free/premium unlocks) and contact info stay
  // gated. isLocked is kept (unused by the frontend now) for compatibility
  // with any older cached client code.
  const suggestions = filteredCandidates.slice(0, 8).map((p, index) => {
    const obj = { ...p };
    obj.compatibilityScore = computeCompatibility(myProfile, obj);
    obj.isShortlisted = shortlistedIds.has(String(p.user._id));
    return obj;
  });

  ok(res, {
    stats: {
      newMatchesCount: filteredCandidates.length,
      totalVisitorsCount: visitorIds.length,
      freeUnlocksRemaining: user.freeUnlocksLeft(),
    },
    myProfile: myProfile
      ? {
          ...myProfile,
          quota: {
            profileViewsRemaining: viewerIsPremium ? null : 0,
            kundaliMatchesRemaining: user.kundaliMatchesRemaining(),
            freeUnlocksRemaining: user.freeUnlocksLeft(),
          },
        }
      : null,
    subscription: {
      isPremium: viewerIsPremium,
      planName: activeSubscription?.planSnapshot?.name || activeSubscription?.plan?.name,
    },
    suggestions,
  });
});
