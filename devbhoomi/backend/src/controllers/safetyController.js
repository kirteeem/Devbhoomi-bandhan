import { z } from "zod";
import mongoose from "mongoose";
import Report from "../models/Report.js";
import Block from "../models/Block.js";
import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

export const reportUserSchema = z.object({
  reportedUser: objectId,
  reason: z.enum(["fake_profile", "spam", "wrong_information", "harassment", "other"]),
  message: z.string().max(500).optional(),
});

export const blockUserSchema = z.object({
  blocked: objectId,
  reason: z.string().max(300).optional(),
});

// POST /api/safety/reports  { reportedUser, reason, message }
export const reportUser = asyncHandler(async (req, res) => {
  const { reportedUser, reason, message } = req.body;

  if (String(reportedUser) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot report your own profile");
  }

  const target = await User.findById(reportedUser).select("_id");
  if (!target) {
    res.status(404);
    throw new Error("Profile not found");
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser,
    reason,
    message,
  });

  ok(res, { report }, "Thanks — our team will review this report shortly.", 201);
});

// POST /api/safety/blocks  { blocked, reason }
// Blocking is one-directional to record (who initiated it) but is enforced
// in both directions everywhere else in the app — see utils/blockList.js.
export const blockUser = asyncHandler(async (req, res) => {
  const { blocked, reason } = req.body;

  if (String(blocked) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot block yourself");
  }

  const target = await User.findById(blocked).select("_id");
  if (!target) {
    res.status(404);
    throw new Error("Profile not found");
  }

  const block = await Block.findOneAndUpdate(
    { blocker: req.user._id, blocked },
    { $setOnInsert: { reason } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  ok(res, { block }, "Member blocked. They can no longer view your profile or contact you.", 201);
});

// DELETE /api/safety/blocks/:userId
export const unblockUser = asyncHandler(async (req, res) => {
  await Block.findOneAndDelete({ blocker: req.user._id, blocked: req.params.userId });
  ok(res, {}, "Member unblocked");
});

// GET /api/safety/blocks — everyone the current member has blocked
export const listMyBlocks = asyncHandler(async (req, res) => {
  const blocks = await Block.find({ blocker: req.user._id })
    .populate("blocked", "fullName gender profileCode")
    .sort({ createdAt: -1 });
  ok(res, { blocks });
});

// ── Admin ────────────────────────────────────────────────────────────────

// GET /api/admin/reports?status=pending
export const listReports = asyncHandler(async (req, res) => {
  const { status = "pending" } = req.query;
  const query = status === "all" ? {} : { status };
  const reports = await Report.find(query)
    .populate("reporter", "fullName profileCode")
    .populate("reportedUser", "fullName profileCode status isProfileVerified")
    .sort({ createdAt: -1 });
  ok(res, { reports, total: reports.length });
});

export const resolveReportSchema = z.object({
  status: z.enum(["reviewed", "dismissed", "actioned"]),
});

// PATCH /api/admin/reports/:id  { status }
// "actioned" is left free of any automatic side-effect (like suspending the
// reported user) so a reviewer can still choose to suspend separately from
// the Members tab — a report being valid doesn't always warrant a ban.
export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  await AdminLog.create({
    admin: req.user._id,
    action: "resolve_report",
    targetType: "Report",
    targetId: report._id,
    meta: { status: req.body.status },
  });
  ok(res, { report }, "Report updated");
});
