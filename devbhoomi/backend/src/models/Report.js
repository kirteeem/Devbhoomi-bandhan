import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["fake_profile", "spam", "wrong_information", "harassment", "other"],
      required: true,
    },
    message: { type: String, maxlength: 500 },

    status: { type: String, enum: ["pending", "reviewed", "dismissed", "actioned"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
