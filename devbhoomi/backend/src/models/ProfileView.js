import mongoose from "mongoose";

// Records that `viewer` looked at `viewedUser`'s profile. One doc per view
// event (not deduped) so "recent activity" has real timestamps; visitor
// *counts* just use a distinct-viewer aggregation where that matters more
// than raw hit count.
const profileViewSchema = new mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    viewedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

profileViewSchema.index({ viewedUser: 1, createdAt: -1 });
profileViewSchema.index({ viewer: 1, viewedUser: 1 });

export default mongoose.model("ProfileView", profileViewSchema);
