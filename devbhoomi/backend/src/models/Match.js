import mongoose from "mongoose";

// Precomputed / cached compatibility scores between two users, refreshed periodically.
const matchSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    compatibilityScore: { type: Number, min: 0, max: 100, default: 0 },
    factors: {
      districtMatch: Boolean,
      educationMatch: Boolean,
      ageWithinRange: Boolean,
      lifestyleMatch: Boolean,
    },
  },
  { timestamps: true }
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);
