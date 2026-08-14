import mongoose from "mongoose";

// Permanent record that `viewer` may see `unlockedUser`'s sensitive contact
// info — address, phone, email. This is intentionally separate from
// ProfileUnlock (which only gates About/Family/Horoscope/Gallery): contact
// details are more sensitive and are gated more strictly:
//   - "premium"   → the viewer spent one of their 10 premium contact reveals
//                   on this profile (see User.contactViewQuota).
//   - "self"      → viewing your own contact details, always allowed.
const contactUnlockSchema = new mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unlockedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["premium", "self"], default: "premium" },
  },
  { timestamps: true }
);

contactUnlockSchema.index({ viewer: 1, unlockedUser: 1 }, { unique: true });

export default mongoose.model("ContactUnlock", contactUnlockSchema);
