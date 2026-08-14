import { z } from "zod";
import mongoose from "mongoose";
import KundaliRequest from "../models/KundaliRequest.js";
import KundaliReport from "../models/KundaliReport.js";
import Priest from "../models/Priest.js";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { sendKundaliMatchRequestEmail } from "../utils/email.js";

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

export const requestKundaliSchema = z.object({
  profileB: objectId.optional(),
  // Professional ID of the member to match against (e.g. "DBB100042") —
  // this is the primary way members reference each other from the free
  // kundali-matching page, since they don't know Mongo ids.
  partnerProfileCode: z.string().trim().min(3).max(20).optional(),
  phone: z.string().trim().min(8).max(20),
  requestType: z.enum(["kundali_matching", "manglik_consultation", "muhurat_guidance"]).optional(),
});

// POST /api/kundali/request  — the platform's free USP.
// Members share their partner's professional ID + a contact phone number;
// the request is logged and immediately emailed to the reviewing priest.
export const requestKundali = asyncHandler(async (req, res) => {
  const { profileB, partnerProfileCode, phone, requestType } = req.body;

  const isPremium = req.user.isPremium();
  // Free members: 1 lifetime free kundali match. Premium members: draw from
  // their plan's quota (3 per plan period — see paymentController.js /
  // Plan.freeKundaliMatches, reset every renewal).
  const usingFreeQuota = !isPremium;

  if (usingFreeQuota && req.user.freeKundaliLeft() <= 0) {
    res.status(403);
    throw new Error(
      "You've already used your free kundali matching request. Upgrade to Premium to get 3 more per plan period."
    );
  }
  if (!usingFreeQuota && req.user.planKundaliUsed >= req.user.planKundaliQuota) {
    res.status(403);
    throw new Error("You've used all the free kundali matches included in your plan. Upgrade or renew to get more.");
  }

  let partner = null;
  if (partnerProfileCode) {
    partner = await User.findOne({ profileCode: partnerProfileCode.trim().toUpperCase() }).select("fullName profileCode");
    if (!partner) {
      res.status(404);
      throw new Error("No member found with that professional ID");
    }
    if (String(partner._id) === String(req.user._id)) {
      res.status(400);
      throw new Error("You cannot request a kundali match against your own profile");
    }
  } else if (profileB) {
    partner = await User.findById(profileB).select("fullName profileCode");
  }

  if (!partner) {
    res.status(400);
    throw new Error("Please provide the partner's professional ID");
  }

  const availablePriest = await Priest.findOne({ isAvailable: true }).sort({ totalMatchesReviewed: 1 });

  const request = await KundaliRequest.create({
    requestedBy: req.user._id,
    profileA: req.user._id,
    profileB: partner._id,
    requestType: requestType || "kundali_matching",
    assignedPriest: availablePriest?._id,
    contactPhone: phone,
  });

  if (usingFreeQuota) {
    req.user.freeKundaliRemaining = Math.max(0, req.user.freeKundaliLeft() - 1);
  } else {
    req.user.planKundaliUsed += 1;
  }
  await req.user.save();

  try {
    await sendKundaliMatchRequestEmail({
      requester: req.user,
      partner,
      phone,
      requestType: requestType || "kundali_matching",
    });
  } catch (err) {
    // Never fail the request over an email delivery hiccup — the request is
    // already saved and visible to admins/priest in the dashboard.
    console.error("[kundali] failed to email priest:", err.message);
  }

  ok(
    res,
    {
      request,
      kundaliMatchesRemaining: req.user.isPremium()
        ? req.user.kundaliMatchesRemaining()
        : req.user.freeKundaliLeft(),
    },
    "Kundali request submitted — our priest will review it and reach out shortly",
    201
  );
});

// GET /api/kundali/my-requests
export const getMyKundaliRequests = asyncHandler(async (req, res) => {
  const requests = await KundaliRequest.find({ requestedBy: req.user._id })
    .populate("assignedPriest", "displayName")
    .populate("profileB", "fullName profileCode")
    .sort({ createdAt: -1 });
  const isPremium = req.user.isPremium();
  ok(res, {
    requests,
    isPremium,
    kundaliMatchesRemaining: isPremium ? req.user.kundaliMatchesRemaining() : req.user.freeKundaliLeft(),
    kundaliQuota: isPremium ? req.user.planKundaliQuota : 1,
  });
});

// GET /api/kundali/report/:requestId
export const getKundaliReport = asyncHandler(async (req, res) => {
  const request = await KundaliRequest.findById(req.params.requestId)
    .populate("profileB", "fullName")
    .populate("assignedPriest", "displayName");
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  // Only the requester can view their own report.
  if (String(request.requestedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to view this report");
  }

  const report = await KundaliReport.findOne({ request: req.params.requestId });
  if (!report) {
    res.status(404);
    throw new Error("Report not ready yet");
  }
  ok(res, { report, request });
});
