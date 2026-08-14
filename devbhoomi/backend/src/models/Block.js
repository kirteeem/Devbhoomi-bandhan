import mongoose from "mongoose";

// One-directional block: `blocker` no longer wants to see or be contacted by
// `blocked`. Enforcement (hiding from Browse Matches, blocking profile
// views) checks BOTH directions — see utils/blockList.js —
// so a block is effectively mutual in its visible effect even though only
// one side had to take the action.
const blockSchema = new mongoose.Schema(
  {
    blocker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blocked: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export default mongoose.model("Block", blockSchema);
