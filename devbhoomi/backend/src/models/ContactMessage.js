import mongoose from "mongoose";

// Submissions from the public Contact Us page (frontend/src/pages/ContactUs.tsx).
// Kept separate from ContactUnlock (which is about revealing a member's
// personal contact details) — this is the support/help-desk inbox.
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 20 },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    // Set if the sender happened to be logged in — optional, purely informational.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
