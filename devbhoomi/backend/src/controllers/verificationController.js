import { z } from "zod";
import VerificationRequest from "../models/VerificationRequest.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { assertValidImageBuffer } from "../middleware/imageUpload.js";
import { uploadBuffer } from "../utils/cloudinary.js";
import { notifyUser } from "../utils/notify.js";
import {
  sendVerificationSubmittedEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
} from "../utils/email.js";

export const rejectVerificationSchema = z.object({
  rejectionReason: z.string().trim().min(5, "Please provide a reason (at least 5 characters).").max(500),
});

// ---------------------------------------------------------------------
// MEMBER-FACING
// ---------------------------------------------------------------------

// POST /api/verification/submit  (multipart: document, body: documentType)
export const submitVerification = asyncHandler(async (req, res) => {
  const documentType = req.body.documentType === "pan" ? "pan" : req.body.documentType === "aadhaar" ? "aadhaar" : null;
  if (!documentType) {
    res.status(400);
    throw new Error("Please select whether you're uploading an Aadhaar Card or a PAN Card.");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Please choose a document image to upload.");
  }
  // The multer fileFilter only checks the client-supplied mimetype header
  // (spoofable); this checks the actual file bytes.
  assertValidImageBuffer(req.file.buffer);

  // One user can only ever have one PENDING request at a time — this is
  // also enforced by a partial unique index on the model as a second line
  // of defense (e.g. against a race between two near-simultaneous submits),
  // but checking here first lets us give a clear, specific message instead
  // of a generic duplicate-key error.
  const existingPending = await VerificationRequest.findOne({ userId: req.user._id, status: "pending" });
  if (existingPending) {
    res.status(409);
    throw new Error("You already have a verification request pending review. Please wait for it to be reviewed before submitting another.");
  }

  const alreadyVerified = await User.findById(req.user._id).select("isProfileVerified");
  if (alreadyVerified?.isProfileVerified) {
    res.status(409);
    throw new Error("Your profile is already verified.");
  }

  const result = await uploadBuffer(req.file.buffer, `devbhoomi-bandhan/verification/${req.user._id}`);

  const request = await VerificationRequest.create({
    userId: req.user._id,
    documentType,
    documentImage: result.secure_url,
    documentImagePublicId: result.public_id,
    submittedAt: new Date(),
  });

  req.user.verificationRequestedAt = new Date();
  await req.user.save();

  try {
    await sendVerificationSubmittedEmail(req.user);
  } catch (err) {
    // Never fail the submission itself over an email hiccup — the request
    // is already saved and visible to admins.
    console.error("[verification] failed to send submission-confirmation email:", err.message);
  }

  ok(res, { request }, "Your document has been submitted for review. We'll notify you once it's checked.", 201);
});

// GET /api/verification/me
export const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const latest = await VerificationRequest.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  ok(res, {
    isProfileVerified: req.user.isProfileVerified,
    verifiedAt: req.user.verifiedAt,
    latestRequest: latest,
  });
});

// ---------------------------------------------------------------------
// ADMIN-FACING
// ---------------------------------------------------------------------

// Verification requests only populate the User document (name/email/phone/
// photos). The residential address, district, and city an admin actually
// needs to cross-check against the ID card live on Profile instead, so this
// pulls them in and merges them onto the populated userId for the frontend.
const attachProfileAddress = async (requests) => {
  const list = Array.isArray(requests) ? requests : [requests];
  const userIds = list.map((r) => r.userId?._id || r.userId).filter(Boolean);
  const profiles = await Profile.find({ user: { $in: userIds } }).select("user address city district customDistrict");
  const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

  for (const r of list) {
    const u = r.userId;
    if (u && typeof u === "object") {
      const p = profileByUser.get(String(u._id));
      u.address = p?.address || null;
      u.city = p?.city || null;
      u.district = p?.district === "Other" ? (p?.customDistrict || "Other") : (p?.district || null);
    }
  }
  return Array.isArray(requests) ? list : list[0];
};

// GET /api/admin/verification-requests?status=&page=&limit=&search=
export const listVerificationRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const ALLOWED_STATUSES = new Set(["pending", "verified", "rejected"]);
  const query = {};
  if (status && ALLOWED_STATUSES.has(String(status))) query.status = status;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  // Text search (name/email/phone/profile code) has to go through the
  // populated User, so it's applied as a post-filter on a slightly larger
  // fetch rather than a native Mongo query across collections.
  let requestsQuery = VerificationRequest.find(query)
    .populate("userId", "fullName email phone profileCode gender dateOfBirth photos")
    .populate("reviewedBy", "fullName")
    .sort({ createdAt: -1 });

  if (search) {
    const s = String(search).trim().toLowerCase();
    const all = await requestsQuery;
    const filtered = all.filter((r) => {
      const u = r.userId;
      if (!u) return false;
      return (
        u.fullName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.includes(s) ||
        u.profileCode?.toLowerCase().includes(s)
      );
    });
    const total = filtered.length;
    const page_ = filtered.slice((safePage - 1) * safeLimit, safePage * safeLimit);
    await attachProfileAddress(page_);
    return ok(res, { requests: page_, total, page: safePage, limit: safeLimit });
  }

  const total = await VerificationRequest.countDocuments(query);
  const requests = await requestsQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  await attachProfileAddress(requests);
  ok(res, { requests, total, page: safePage, limit: safeLimit });
});

// GET /api/admin/verification-requests/:id
export const getVerificationRequestDetail = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id)
    .populate("userId")
    .populate("reviewedBy", "fullName");
  if (!request) {
    res.status(404);
    throw new Error("Verification request not found");
  }
  await attachProfileAddress(request);
  ok(res, { request });
});

// PATCH /api/admin/verification-requests/:id/approve
export const approveVerification = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id).populate("userId");
  if (!request) {
    res.status(404);
    throw new Error("Verification request not found");
  }
  if (request.status !== "pending") {
    res.status(409);
    throw new Error("This request has already been reviewed.");
  }

  request.status = "verified";
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  request.rejectionReason = null;
  await request.save();

  const user = await User.findById(request.userId._id || request.userId);
  user.isProfileVerified = true;
  user.verifiedAt = new Date();
  user.verifiedBy = req.user._id;
  await user.save();

  await AuditLog.create({
    action: "verification.approve",
    performedBy: req.user._id,
    targetType: "User",
    targetId: user._id,
    details: { verificationRequestId: request._id, documentType: request.documentType },
  });

  try {
    await sendVerificationApprovedEmail(user);
  } catch (err) {
    console.error("[verification] failed to send approval email:", err.message);
  }
  try {
    await notifyUser({
      io: req.app.get("io"),
      user: user._id,
      type: "profile_verified",
      title: "You're verified!",
      body: "Your identity has been verified — your Blue Tick is now live on your profile.",
      relatedId: request._id,
    });
  } catch (err) {
    console.error("[verification] failed to send in-app notification:", err.message);
  }

  ok(res, { request, user }, "Member verified");
});

// PATCH /api/admin/verification-requests/:id/reject   { rejectionReason }
export const rejectVerification = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const request = await VerificationRequest.findById(req.params.id).populate("userId");
  if (!request) {
    res.status(404);
    throw new Error("Verification request not found");
  }
  if (request.status !== "pending") {
    res.status(409);
    throw new Error("This request has already been reviewed.");
  }

  request.status = "rejected";
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  request.rejectionReason = rejectionReason;
  await request.save();

  const user = request.userId;

  await AuditLog.create({
    action: "verification.reject",
    performedBy: req.user._id,
    targetType: "User",
    targetId: user._id,
    details: { verificationRequestId: request._id, rejectionReason },
  });

  try {
    await sendVerificationRejectedEmail(user, rejectionReason);
  } catch (err) {
    console.error("[verification] failed to send rejection email:", err.message);
  }
  try {
    await notifyUser({
      io: req.app.get("io"),
      user: user._id,
      type: "verification_rejected",
      title: "Verification not approved",
      body: rejectionReason,
      relatedId: request._id,
    });
  } catch (err) {
    console.error("[verification] failed to send in-app notification:", err.message);
  }

  ok(res, { request }, "Request rejected");
});
