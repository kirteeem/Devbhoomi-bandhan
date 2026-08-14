import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tagline: { type: String, trim: true },
    priceInPaise: { type: Number, required: true, min: 0 }, // ₹499 => 49900
    currency: { type: String, default: "INR" },
    durationDays: { type: Number, required: true, min: 1 },

    // Profile-view quota granted for the plan's duration. `null` = unlimited.
    maxProfileViews: { type: Number, default: null },
    // Free kundali-matching requests granted for the plan's duration.
    freeKundaliMatches: { type: Number, default: 0 },

    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
