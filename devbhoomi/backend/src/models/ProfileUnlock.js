import mongoose from "mongoose";

// Permanent record that `viewer` spent one free unlock (or already had
// premium/was viewing their own profile) to reveal `unlockedUser`'s full
// profile details. Once created it never expires — the viewer can revisit
// that profile's full details for free forever, even after the free-unlock
// balance runs out or the account logs out and back in.
const profileUnlockSchema = new mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unlockedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // "free" = spent one of the 5 trial unlocks. "premium" = was already a
    // premium member at the time (recorded for analytics only; premium
    // members don't need this record to see full details).
    method: { type: String, enum: ["free", "premium"], default: "free" },
  },
  { timestamps: true }
);

profileUnlockSchema.index({ viewer: 1, unlockedUser: 1 }, { unique: true });

export default mongoose.model("ProfileUnlock", profileUnlockSchema);