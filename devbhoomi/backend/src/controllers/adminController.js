import { z } from "zod";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Testimonial from "../models/Testimonial.js";
import AdminLog from "../models/AdminLog.js";
import Report from "../models/Report.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { containsRegex } from "../utils/regexEscape.js";

// Same "recently active" window used across the site (see matchController.js
// ONLINE_WINDOW_MINUTES) so the admin overview's "Online Now" figure matches
// the isOnline badges members see on each other's cards.
const ONLINE_WINDOW_MINUTES = 10;

export const changeRoleSchema = z.object({
  role: z.enum(["user", "priest", "admin"]),
});

// GET /api/admin/analytics
// Powers the admin/priest "Overview" tab — a small set of numbers that
// answer "how is the site doing right now", distinct from anything a
// regular member's own dashboard shows.
export const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MINUTES * 60 * 1000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    onlineNow,
    loggedInToday,
    newSignupsToday,
    verifiedProfiles,
    pendingVerificationRequests,
    totalPriests,
    pendingReports,
    suspendedUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: { $in: ["user", "priest", "admin"] }, lastActiveAt: { $gte: onlineSince } }),
    User.countDocuments({ role: "user", lastLoginAt: { $gte: startOfDay } }),
    User.countDocuments({ role: "user", createdAt: { $gte: startOfDay } }),
    User.countDocuments({ isProfileVerified: true }),
    VerificationRequest.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "priest" }),
    Report.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "user", status: "suspended" }),
  ]);

  ok(res, {
    totalUsers,
    onlineNow,
    loggedInToday,
    newSignupsToday,
    verifiedProfiles,
    pendingVerificationRequests,
    // Kept for backwards compatibility with the legacy verify/unverify
    // (non-document-based) flow still used on the Members/Team tabs.
    pendingVerification: pendingVerificationRequests,
    totalPriests,
    pendingReports,
    suspendedUsers,
  });
});

// GET /api/admin/users?status=&page=&limit=&verified=
export const listUsers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, verified, search } = req.query;
  const query = {};
  const ALLOWED_STATUSES = new Set(["active", "suspended", "deactivated", "deleted"]);
  if (status && ALLOWED_STATUSES.has(String(status))) query.status = status;
  if (verified === "true") query.isProfileVerified = true;
  if (verified === "false") query.isProfileVerified = false;
  if (search) {
    const safe = containsRegex(search, { maxLength: 100 });
    query.$or = [
      { fullName: safe },
      { email: safe },
      { phone: safe },
      { profileCode: safe },
    ];
  }
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const users = await User.find(query)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(query);
  ok(res, { users, total });
});

// GET /api/admin/users/pending-verification
// Members who have (optionally) filled in an ID card name and are waiting
// on a manual review from the admin/priest team.
export const listPendingVerification = asyncHandler(async (req, res) => {
  const users = await User.find({ isProfileVerified: false, role: "user", status: "active" })
    .sort({ verificationRequestedAt: -1, createdAt: -1 });

  const userIds = users.map((u) => u._id);
  const profiles = await Profile.find({ user: { $in: userIds } }).select("user photos profileCompletion");
  const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

  const enriched = users.map((u) => {
    const p = profileByUser.get(String(u._id));
    return {
      ...u.toObject(),
      photos: p?.photos || [],
      profileCompletion: p?.profileCompletion ?? u.profileCompletion,
    };
  });

  ok(res, { users: enriched, total: enriched.length });
});

// PATCH /api/admin/users/:id/verify
export const verifyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isProfileVerified: true, verifiedBy: req.user._id, verifiedAt: new Date() },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "verify_profile", targetType: "User", targetId: user._id });
  ok(res, { user }, "Profile verified");
});

// PATCH /api/admin/users/:id/unverify
export const unverifyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isProfileVerified: false, verifiedBy: null, verifiedAt: null },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "unverify_profile", targetType: "User", targetId: user._id });
  ok(res, { user }, "Verification revoked");
});

// PATCH /api/admin/users/:id/suspend
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: "suspended" }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "suspend_user", targetType: "User", targetId: user._id });
  ok(res, { user }, "User suspended");
});

// PATCH /api/admin/users/:id/role  { role }
export const changeUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await AdminLog.create({ admin: req.user._id, action: "change_role", targetType: "User", targetId: user._id, meta: { role: req.body.role } });
  ok(res, { user }, "Role updated");
});

// GET /api/admin/team — everyone who can review & verify profiles
// (admins + priest/"team member" accounts), for the Team tab of the panel.
export const listTeamMembers = asyncHandler(async (req, res) => {
  const members = await User.find({ role: { $in: ["admin", "priest"] } }).sort({ createdAt: -1 });
  ok(res, { members });
});

// GET/POST /api/admin/testimonials — content moderation for success stories
export const listPendingTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isApproved: false }).sort({ createdAt: -1 });
  ok(res, { testimonials });
});

export const approveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found");
  }
  ok(res, { testimonial }, "Testimonial approved");
});
