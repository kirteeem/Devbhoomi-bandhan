import mongoose from "mongoose";

// One document per submission attempt — kept as its own collection (rather
// than flattened onto User) specifically so a rejection followed by a
// resubmission leaves a full history: what was submitted, when, by which
// admin it was reviewed, and why it was rejected. The CURRENT state (is this
// user verified right now) is still denormalized onto User.isProfileVerified
// for fast reads everywhere a badge is shown (search results, match cards,
// etc.) — see approveVerification/rejectVerification in
// controllers/verificationController.js, which keep both in sync.
const verificationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documentType: { type: String, enum: ["aadhaar", "pan"], required: true },
    documentImage: { type: String, required: true }, // Cloudinary secure_url
    documentImagePublicId: { type: String }, // for cleanup/re-upload housekeeping

    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending", index: true },

    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: null },
  },
  { timestamps: true }
);

// A member can have many historical requests, but only ever one active
// (pending) one at a time — enforced in the controller (not a unique index,
// since MongoDB can't express "unique while status=pending" without a
// partial index; a partial index is used instead, see below).
verificationRequestSchema.index({ userId: 1, createdAt: -1 });
verificationRequestSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("VerificationRequest", verificationRequestSchema);
