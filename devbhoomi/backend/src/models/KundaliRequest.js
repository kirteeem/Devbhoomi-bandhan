import mongoose from "mongoose";

const kundaliRequestSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profileA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profileB: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if single-profile manglik check
    assignedPriest: { type: mongoose.Schema.Types.ObjectId, ref: "Priest" },
    requestType: { type: String, enum: ["kundali_matching", "manglik_consultation", "muhurat_guidance"], default: "kundali_matching" },
    status: { type: String, enum: ["pending", "in_review", "completed", "cancelled"], default: "pending" },
    contactPhone: { type: String, trim: true },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("KundaliRequest", kundaliRequestSchema);
