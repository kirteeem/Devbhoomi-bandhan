import mongoose from "mongoose";

const kundaliReportSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "KundaliRequest", required: true, unique: true },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Priest", required: true },
    gunMilanScore: { type: Number, min: 0, max: 36 },
    manglikDosha: { type: String, enum: ["none", "partial", "full"] },
    summary: String,
    // Admin-facing remarks distinct from `summary` (which is the
    // member-facing report text) — e.g. internal notes on how the review
    // went. Optional, shown only in the admin Kundali History detail view.
    notes: { type: String, maxlength: 2000 },
    // Optional, priest-entered — falls back to (report.createdAt -
    // request.createdAt) in the admin view when not provided.
    timeTakenMinutes: { type: Number, min: 0 },
    recommendation: { type: String, enum: ["favourable", "favourable_with_remedy", "not_recommended"] },
    reportFileUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("KundaliReport", kundaliReportSchema);
