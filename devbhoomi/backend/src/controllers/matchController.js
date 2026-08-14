import Profile from "../models/Profile.js";
import Shortlist from "../models/Shortlist.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { getBlockedUserIds } from "../utils/blockList.js";
import { containsRegex } from "../utils/regexEscape.js";

// Simple, transparent rule-based compatibility score (0-100) — no ML model,
// just weighted overlap between the viewer's stated partner preferences and
// the candidate's actual profile. Every factor is something the viewer
// themselves set, so the score is explainable rather than a magic number.
const computeCompatibility = (viewerProfile, candidate) => {
  let score = 50; // neutral baseline
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

// Browsing is unlimited for every member, free or premium — premium's edge
// is elsewhere (contact unlocks, priority placement, etc.), not how many
// profiles someone can even look at.
const FREE_BROWSE_LIMIT = Infinity;

// "New member" badge window — profiles created within the last N days.
const NEW_MEMBER_DAYS = 14;
// "Online now" badge window — last activity within the last N minutes.
const ONLINE_WINDOW_MINUTES = 10;

// GET /api/matches?district=&tehsil=&minAge=&maxAge=&minHeight=&maxHeight=&education=
//   &profession=&income=&religion=&community=&subCaste=&gotra=&maritalStatus=&manglik=
//   &smoking=&drinking=&familyType=&sortBy=&page=&limit=
// Smart filter + infinite-scroll friendly pagination for the Browse Matches grid.
export const searchMatches = asyncHandler(async (req, res) => {
  const {
    district, tehsil, minAge, maxAge, minHeight, maxHeight, education, profession, income,
    religion, community, subCaste, gotra, maritalStatus, manglik, smoking, drinking, familyType, diet,
    sortBy = "newest", page = 1, limit = 12,
  } = req.query;

  const currentProfile = await Profile.findOne({ user: req.user._id });
  const oppositeGender = req.user.gender === "male" ? "female" : "male";
  const viewerIsPremium = req.user.isPremium();

  const blockedUserIds = await getBlockedUserIds(req.user._id);

  const query = { visibility: { $ne: "hidden" } };
  if (blockedUserIds.size) query.user = { $nin: [...blockedUserIds] };

  if (district) query.district = { $in: String(district).split(",") };
  if (tehsil) query.tehsil = { $in: String(tehsil).split(",") };
  if (education) query["education.degree"] = { $in: String(education).split(",") };
  if (profession) query["occupation.title"] = containsRegex(profession);
  if (income) query["occupation.annualIncomeRange"] = { $in: String(income).split(",") };
  if (religion) query.religion = { $in: String(religion).split(",") };
  if (community) query.caste = { $in: String(community).split(",") };
  if (subCaste) query.subCaste = containsRegex(subCaste);
  if (gotra) query.gotra = containsRegex(gotra);
  if (maritalStatus) query.maritalStatus = { $in: String(maritalStatus).split(",") };
  if (manglik) query.manglik = { $in: String(manglik).split(",") };
  if (smoking) query["lifestyle.smoking"] = { $in: String(smoking).split(",") };
  if (drinking) query["lifestyle.drinking"] = { $in: String(drinking).split(",") };
  if (familyType) query["family.familyType"] = { $in: String(familyType).split(",") };
  if (diet) query["lifestyle.diet"] = diet;

  if (minHeight || maxHeight) {
    query.heightCm = {};
    if (minHeight) query.heightCm.$gte = Number(minHeight);
    if (maxHeight) query.heightCm.$lte = Number(maxHeight);
  }

  if (minAge || maxAge) {
    const now = new Date();
    query.dateOfBirth = {};
    if (maxAge) query.dateOfBirth.$gte = new Date(now.getFullYear() - Number(maxAge) - 1, now.getMonth(), now.getDate());
    if (minAge) query.dateOfBirth.$lte = new Date(now.getFullYear() - Number(minAge), now.getMonth(), now.getDate());
  }

  // Mongo-level sort for fields that live on Profile itself. Fields that
  // depend on the populated User (premium, verified, last active, "highest
  // match") are re-sorted in-memory after populate below, since Mongoose
  // can't sort on a populated path in the same query.
  const dbSort = sortBy === "newest" ? { createdAt: -1, _id: 1 } : { updatedAt: -1, _id: 1 };

  const userSelect = "fullName gender isProfileVerified lastActiveAt premiumUntil createdAt";

  // Sorts that depend on populated user/compatibility fields need the full
  // (unpaginated) filtered set fetched first so the ordering is correct
  // before we slice the page window.
  const needsInMemorySort = ["recentlyActive", "highestMatch", "premium", "verified"].includes(sortBy);

  let filtered, total;
  const skip = (Number(page) - 1) * Number(limit);

  if (needsInMemorySort) {
    // Only pull the handful of slim fields the sort actually needs (not
    // photos/aboutMe/family/etc — that's most of a profile's weight) so
    // sorting the whole filtered set doesn't mean transferring and
    // hydrating every matching profile's full document on every request.
    const sortFields =
      sortBy === "highestMatch"
        ? "district education.degree maritalStatus dateOfBirth heightCm religion"
        : "";
    const all = await Profile.find(query)
      .populate({ path: "user", match: { gender: oppositeGender, status: "active" }, select: userSelect })
      .select(sortFields)
      .sort(dbSort)
      .lean();
    let allFiltered = all.filter((p) => p.user && String(p.user._id) !== String(req.user._id));

    if (sortBy === "recentlyActive") {
      allFiltered.sort((a, b) => new Date(b.user.lastActiveAt || 0) - new Date(a.user.lastActiveAt || 0));
    } else if (sortBy === "premium") {
      allFiltered.sort((a, b) => {
        const aP = a.user.premiumUntil && new Date(a.user.premiumUntil) > new Date() ? 1 : 0;
        const bP = b.user.premiumUntil && new Date(b.user.premiumUntil) > new Date() ? 1 : 0;
        return bP - aP;
      });
    } else if (sortBy === "verified") {
      allFiltered.sort((a, b) => Number(b.user.isProfileVerified) - Number(a.user.isProfileVerified));
    } else if (sortBy === "highestMatch") {
      allFiltered = allFiltered
        .map((p) => ({ p, score: computeCompatibility(currentProfile, p) }))
        .sort((a, b) => b.score - a.score)
        .map(({ p }) => p);
    }

    total = allFiltered.length;
    const pageIds = allFiltered.slice(skip, skip + Number(limit)).map((p) => p._id);

    // Now hydrate the full documents, but only for this one page of results.
    const pageDocs = await Profile.find({ _id: { $in: pageIds } })
      .populate({ path: "user", select: userSelect })
      .lean();
    const byId = new Map(pageDocs.map((p) => [String(p._id), p]));
    filtered = pageIds.map((id) => byId.get(String(id))).filter(Boolean);
  } else {
    const [results, count] = await Promise.all([
      Profile.find(query)
        .populate({ path: "user", match: { gender: oppositeGender, status: "active" }, select: userSelect })
        .skip(skip)
        .limit(Number(limit))
        // Secondary sort by _id keeps ordering stable across pages/requests —
        // required for "first N profiles" to mean the same N profiles every
        // time rather than shifting whenever someone else's profile updates.
        .sort(dbSort)
        .lean(),
      Profile.countDocuments(query),
    ]);
    filtered = results.filter((p) => p.user && String(p.user._id) !== String(req.user._id));
    total = count;
  }

  const candidateUserIds = filtered.map((p) => p.user._id);
  const shortlisted = await Shortlist.find({ user: req.user._id, shortlistedUser: { $in: candidateUserIds } }).select("shortlistedUser").lean();
  const shortlistedIds = new Set(shortlisted.map((s) => String(s.shortlistedUser)));

  const now = Date.now();

  // Enforce free-tier visibility: blur photos + flag anything past the
  // free browse limit. The backend is the source of truth here — the
  // frontend never decides this on its own.
  const enforced = filtered.map((p, i) => {
    const globalIndex = skip + i;
    const isLocked = !viewerIsPremium && globalIndex >= FREE_BROWSE_LIMIT;
    const obj = { ...p };

    obj.compatibilityScore = computeCompatibility(currentProfile, obj);
    obj.isShortlisted = shortlistedIds.has(String(p.user._id));
    obj.isPremiumMember = Boolean(obj.user?.premiumUntil && new Date(obj.user.premiumUntil).getTime() > now);
    obj.isOnline = Boolean(obj.user?.lastActiveAt && now - new Date(obj.user.lastActiveAt).getTime() < ONLINE_WINDOW_MINUTES * 60 * 1000);
    obj.isNewMember = Boolean(obj.user?.createdAt && now - new Date(obj.user.createdAt).getTime() < NEW_MEMBER_DAYS * 24 * 60 * 60 * 1000);
    obj.hasHoroscope = Boolean(obj.horoscope?.rashi || obj.horoscope?.nakshatra || obj.horoscope?.birthPlace);

    if (isLocked) {
      obj.photos = (obj.photos || []).map((photo) => ({ ...photo, blurred: true }));
      obj.isLocked = true;
    }
    return obj;
  });

  ok(res, {
    results: enforced,
    viewerIsPremium,
    freeBrowseLimit: FREE_BROWSE_LIMIT,
    page: Number(page),
    limit: Number(limit),
    total,
    hasMore: skip + filtered.length < total,
  });
});

// GET /api/matches/suggested — rule-based suggestions for the dashboard,
// each annotated with a real compatibility score, and whether the current
// user has already shortlisted them (so the UI can disable/relabel that
// button instead of guessing).
export const getSuggestedMatches = asyncHandler(async (req, res) => {
  const currentProfile = await Profile.findOne({ user: req.user._id }).lean();
  const oppositeGender = req.user.gender === "male" ? "female" : "male";
  const viewerIsPremium = req.user.isPremium();

  const blockedUserIds = await getBlockedUserIds(req.user._id);

  const query = { visibility: { $ne: "hidden" } };
  if (blockedUserIds.size) query.user = { $nin: [...blockedUserIds] };
  if (currentProfile?.partnerPreference?.districts?.length) {
    query.district = { $in: currentProfile.partnerPreference.districts };
  } else if (currentProfile?.district) {
    query.district = currentProfile.district;
  }

  const suggestions = await Profile.find(query)
    .populate({
      path: "user",
      match: { gender: oppositeGender, status: "active" },
      select: "fullName isProfileVerified lastActiveAt premiumUntil createdAt",
    })
    .limit(12)
    .lean();

  const filtered = suggestions.filter((p) => p.user && String(p.user._id) !== String(req.user._id));

  const candidateUserIds = filtered.map((p) => p.user._id);
  const shortlisted = await Shortlist.find({ user: req.user._id, shortlistedUser: { $in: candidateUserIds } }).select("shortlistedUser").lean();
  const shortlistedIds = new Set(shortlisted.map((s) => String(s.shortlistedUser)));
  const now = Date.now();

  const enriched = filtered.slice(0, 8).map((p, i) => {
    const obj = { ...p };
    obj.compatibilityScore = computeCompatibility(currentProfile, obj);
    obj.isShortlisted = shortlistedIds.has(String(p.user._id));
    obj.isPremiumMember = Boolean(obj.user?.premiumUntil && new Date(obj.user.premiumUntil).getTime() > now);
    obj.isOnline = Boolean(obj.user?.lastActiveAt && now - new Date(obj.user.lastActiveAt).getTime() < ONLINE_WINDOW_MINUTES * 60 * 1000);
    obj.isNewMember = Boolean(obj.user?.createdAt && now - new Date(obj.user.createdAt).getTime() < NEW_MEMBER_DAYS * 24 * 60 * 60 * 1000);
    obj.hasHoroscope = Boolean(obj.horoscope?.rashi || obj.horoscope?.nakshatra || obj.horoscope?.birthPlace);
    // Same free-tier rule as the main browse grid: first FREE_BROWSE_LIMIT
    // suggestions are shown in full, the rest are blurred/locked.
    if (!viewerIsPremium && i >= FREE_BROWSE_LIMIT) {
      obj.photos = (obj.photos || []).map((photo) => ({ ...photo, blurred: true }));
      obj.isLocked = true;
    }
    return obj;
  });

  ok(res, { suggestions: enriched, viewerIsPremium });
});
