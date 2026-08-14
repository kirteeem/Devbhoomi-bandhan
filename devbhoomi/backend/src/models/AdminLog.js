import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: mongoose.Schema.Types.ObjectId,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
