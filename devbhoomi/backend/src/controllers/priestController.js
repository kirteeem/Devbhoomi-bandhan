import { z } from "zod";
import KundaliRequest from "../models/KundaliRequest.js";
import KundaliReport from "../models/KundaliReport.js";
import Priest from "../models/Priest.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { notifyUser } from "../utils/notify.js";

export const updateStatusSchema = z.object({
  status: z.enum(["pending", "in_review", "completed", "cancelled"]),
  notes: z.string().max(1000).optional(),
});

export const submitReportSchema = z.object({
  gunMilanScore: z.number().min(0).max(36).optional(),
  manglikDosha: z.enum(["none", "partial", "full"]).optional(),
  summary: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  timeTakenMinutes: z.number().min(0).max(10000).optional(),
  recommendation: z.enum(["favourable", "favourable_with_remedy", "not_recommended"]).optional(),
  reportFileUrl: z.string().url().optional(),
});

// GET /api/priest/queue — pending + in-review kundalis for the logged-in priest
export const getQueue = asyncHandler(async (req, res) => {
  const priest = await Priest.findOne({ user: req.user._id });
  if (!priest) {
    res.status(404);
    throw new Error("Priest profile not found");
  }

  const pending = await KundaliRequest.find({ assignedPriest: priest._id, status: { $in: ["pending", "in_review"] } })
    .populate("profileA profileB", "fullName")
    .sort({ createdAt: 1 });

  const completed = await KundaliRequest.countDocuments({ assignedPriest: priest._id, status: "completed" });

  ok(res, { pending, completedCount: completed });
});

// PATCH /api/priest/requests/:id/status
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await KundaliRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  request.status = req.body.status;
  request.notes = req.body.notes ?? request.notes;
  await request.save();
  ok(res, { request });
});

// POST /api/priest/requests/:id/report
export const submitReport = asyncHandler(async (req, res) => {
  const priest = await Priest.findOne({ user: req.user._id });
  if (!priest) {
    res.status(404);
    throw new Error("Priest profile not found");
  }
  const request = await KundaliRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const { gunMilanScore, manglikDosha, summary, notes, timeTakenMinutes, recommendation, reportFileUrl } = req.body;
  const report = await KundaliReport.create({
    request: request._id,
    preparedBy: priest._id,
    gunMilanScore,
    manglikDosha,
    summary,
    notes,
    timeTakenMinutes,
    recommendation,
    reportFileUrl,
  });

  request.status = "completed";
  await request.save();
  priest.totalMatchesReviewed += 1;
  await priest.save();

  await notifyUser({
    io: req.app.get("io"),
    user: request.requestedBy,
    type: "kundali_ready",
    title: "Your Kundali Report is Ready",
    body: "Pandit ji has completed your kundali review.",
    relatedId: report._id,
  });

  ok(res, { report }, "Report submitted", 201);
});

// =========================================================================
// ADMIN — Priest management (Admin Panel → Priests)
// =========================================================================
// "Active Jobs" = pending/in_review kundalis currently assigned to this
// priest. "Completed Kundalis" reuses the existing totalMatchesReviewed
// counter (already incremented in submitReport above), so it never drifts
// out of sync with the counter used elsewhere in the app.
// "Enable/Disable" reuses the existing `isAvailable` flag rather than
// adding a parallel status field — it already gates auto-assignment of new
// kundali requests in kundaliController.js, which is exactly what
// "disabling" a priest should mean.

// GET /api/admin/priests
export const listPriestsAdmin = asyncHandler(async (req, res) => {
  const priests = await Priest.find()
    .populate("user", "fullName phone email status photos")
    .sort({ createdAt: -1 });

  const withStats = await Promise.all(
    priests.map(async (p) => {
      const activeJobs = await KundaliRequest.countDocuments({
        assignedPriest: p._id,
        status: { $in: ["pending", "in_review"] },
      });
      return {
        ...p.toObject(),
        activeJobs,
        completedKundalis: p.totalMatchesReviewed,
      };
    })
  );

  ok(res, { priests: withStats });
});

// GET /api/admin/priests/:id
export const getPriestDetailAdmin = asyncHandler(async (req, res) => {
  const priest = await Priest.findById(req.params.id).populate("user", "fullName phone email status photos createdAt");
  if (!priest) {
    res.status(404);
    throw new Error("Priest not found");
  }

  const requests = await KundaliRequest.find({ assignedPriest: priest._id })
    .populate("profileA", "fullName profileCode")
    .populate("profileB", "fullName profileCode")
    .populate("requestedBy", "fullName profileCode")
    .sort({ createdAt: -1 });

  const requestIds = requests.map((r) => r._id);
  const reports = await KundaliReport.find({ request: { $in: requestIds } });
  const reportByRequest = new Map(reports.map((r) => [String(r.request), r]));

  const history = requests.map((r) => ({
    request: r,
    report: reportByRequest.get(String(r._id)) || null,
  }));

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    inReview: requests.filter((r) => r.status === "in_review").length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
    // No per-kundali payment/commission model exists in this platform today
    // (kundali matching is a free member benefit, not a paid marketplace —
    // see kundaliController.js) so there is no income figure to show here.
    incomeApplicable: false,
  };

  ok(res, { priest, history, stats });
});

// PATCH /api/admin/priests/:id/disable
export const disablePriestAdmin = asyncHandler(async (req, res) => {
  const priest = await Priest.findById(req.params.id);
  if (!priest) {
    res.status(404);
    throw new Error("Priest not found");
  }
  priest.isAvailable = false;
  await priest.save();
  await AuditLog.create({
    action: "priest.disable",
    performedBy: req.user._id,
    targetType: "Priest",
    targetId: priest._id,
  });
  ok(res, { priest }, "Priest disabled — they will no longer receive new kundali assignments");
});

// PATCH /api/admin/priests/:id/enable
export const enablePriestAdmin = asyncHandler(async (req, res) => {
  const priest = await Priest.findById(req.params.id);
  if (!priest) {
    res.status(404);
    throw new Error("Priest not found");
  }
  priest.isAvailable = true;
  await priest.save();
  await AuditLog.create({
    action: "priest.enable",
    performedBy: req.user._id,
    targetType: "Priest",
    targetId: priest._id,
  });
  ok(res, { priest }, "Priest enabled");
});

// =========================================================================
// ADMIN — Kundali History (Admin Panel → Kundali History)
// =========================================================================

// GET /api/admin/kundali-history?status=&priestId=&page=&limit=&search=
export const listKundaliHistoryAdmin = asyncHandler(async (req, res) => {
  const { status, priestId, page = 1, limit = 20, search } = req.query;
  const ALLOWED_STATUSES = new Set(["pending", "in_review", "completed", "cancelled"]);
  const query = {};
  if (status && ALLOWED_STATUSES.has(String(status))) query.status = status;
  if (priestId) query.assignedPriest = priestId;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  let baseQuery = KundaliRequest.find(query)
    .populate("requestedBy", "fullName profileCode")
    .populate("profileA", "fullName profileCode")
    .populate("profileB", "fullName profileCode")
    .populate("assignedPriest", "displayName")
    .sort({ createdAt: -1 });

  let requests;
  let total;
  if (search) {
    const s = String(search).trim().toLowerCase();
    const all = await baseQuery;
    const filtered = all.filter((r) => {
      const names = [r.requestedBy?.fullName, r.profileA?.fullName, r.profileB?.fullName, r.assignedPriest?.displayName]
        .filter(Boolean)
        .map((n) => n.toLowerCase());
      return names.some((n) => n.includes(s));
    });
    total = filtered.length;
    requests = filtered.slice((safePage - 1) * safeLimit, safePage * safeLimit);
  } else {
    total = await KundaliRequest.countDocuments(query);
    requests = await baseQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  }

  const requestIds = requests.map((r) => r._id);
  const reports = await KundaliReport.find({ request: { $in: requestIds } });
  const reportByRequest = new Map(reports.map((r) => [String(r.request), r]));

  const history = requests.map((r) => ({
    request: r,
    report: reportByRequest.get(String(r._id)) || null,
  }));

  ok(res, { history, total, page: safePage, limit: safeLimit });
});

// GET /api/admin/kundali-history/:id
export const getKundaliDetailAdmin = asyncHandler(async (req, res) => {
  const request = await KundaliRequest.findById(req.params.id)
    .populate("requestedBy", "fullName profileCode phone email")
    .populate("profileA", "fullName profileCode")
    .populate("profileB", "fullName profileCode")
    .populate("assignedPriest", "displayName phone");
  if (!request) {
    res.status(404);
    throw new Error("Kundali request not found");
  }
  const report = await KundaliReport.findOne({ request: request._id });
  ok(res, { request, report });
});
