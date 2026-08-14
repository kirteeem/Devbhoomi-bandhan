import mongoose from "mongoose";

// Lightweight, append-only trail of sensitive admin actions (verification
// approve/reject today; easy to extend to priest enable/disable, suspensions,
// etc.). Deliberately schemaless-ish on `details` so new action types don't
// need a migration — this is a audit record, not a query-heavy collection.
const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true }, // e.g. "verification.approve"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String }, // e.g. "User", "VerificationRequest", "Priest"
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
