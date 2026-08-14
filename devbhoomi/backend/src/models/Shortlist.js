import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shortlistedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// A user can only shortlist someone once.
shortlistSchema.index({ user: 1, shortlistedUser: 1 }, { unique: true });

export default mongoose.model("Shortlist", shortlistSchema);
