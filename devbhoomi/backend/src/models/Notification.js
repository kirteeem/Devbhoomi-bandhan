import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // The user this notification is *about* (e.g. the person who verified
    // your profile). Lets the frontend link straight to that person's
    // profile instead of trying to reuse relatedId (which points at the
    // other document id, not a user id).
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["new_message", "kundali_ready", "profile_verified", "verification_rejected", "system"],
      required: true,
    },
    title: String,
    body: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
