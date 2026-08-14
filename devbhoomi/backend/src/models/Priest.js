import mongoose from "mongoose";

const priestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, default: "Pandit Jagat Ram Sharma" },
    bio: String,
    yearsOfExperience: { type: Number, default: 25 },
    specializations: [{ type: String }],
    languages: [{ type: String }],
    photoUrl: String,
    rating: { type: Number, default: 5, min: 0, max: 5 },
    totalMatchesReviewed: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Priest", priestSchema);
