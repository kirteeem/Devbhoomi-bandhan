import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: String,

    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: "INR" },

    // "created" = order created, awaiting checkout. "paid" only ever set after
    // signature verification succeeds — the frontend's reported status is never trusted.
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    failureReason: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
