import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    // Snapshot of the plan at purchase time — protects historical invoices
    // from changing if an admin edits the plan's price/name later.
    planSnapshot: {
      name: String,
      priceInPaise: Number,
      currency: String,
      durationDays: Number,
      maxProfileViews: { type: Number, default: null },
      freeKundaliMatches: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },

    startDate: Date,
    endDate: Date,

    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    razorpaySubscriptionId: String,
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
