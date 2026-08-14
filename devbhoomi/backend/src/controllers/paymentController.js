import crypto from "crypto";
import { z } from "zod";
import mongoose from "mongoose";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getRazorpay } from "../utils/razorpay.js";
import { ok } from "../utils/apiResponse.js";

export const createOrderSchema = z.object({
  planId: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid plan id"),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/** Activates a subscription + rolls the user's premiumUntil forward. Shared by
 * verify-on-client and the webhook so both paths behave identically. */
const activateSubscription = async ({ subscription, razorpayPaymentId }) => {
  const now = new Date();
  const endDate = new Date(now.getTime() + subscription.planSnapshot.durationDays * 24 * 60 * 60 * 1000);

  subscription.status = "active";
  subscription.startDate = now;
  subscription.endDate = endDate;
  subscription.razorpayPaymentId = razorpayPaymentId;
  await subscription.save();

  const user = await User.findById(subscription.user);
  // Stacking: if the user already has time left on a premium plan, extend
  // from whichever is later rather than overwriting a longer remaining term.
  const base = user.premiumUntil && user.premiumUntil.getTime() > now.getTime() ? user.premiumUntil : now;
  user.premiumUntil = new Date(base.getTime() + subscription.planSnapshot.durationDays * 24 * 60 * 60 * 1000);
  user.activePlan = subscription.plan;

  // A fresh purchase resets the usage quotas to the newly bought plan's
  // limits — kundali-matching requests and the 10 contact-detail unlocks
  // both restart. (NOTE: this previously wrote to `planProfileViewQuota` /
  // `contactViewQuota` / `contactViewsUsed`, fields that don't exist on the
  // User schema — Mongoose silently drops unknown fields on save, so
  // premium purchases never actually granted any contact unlocks. Fixed to
  // use the real schema fields: planUnlockQuota / planUnlocksUsed.)
  user.planActivatedAt = now;
  user.planKundaliQuota = subscription.planSnapshot.freeKundaliMatches ?? 0;
  user.planKundaliUsed = 0;

  // Every premium activation grants 10 contact-detail reveals (address,
  // phone, email) for this plan period — separate from the kundali quota
  // above. See User.planUnlocksRemaining().
  user.planUnlockQuota = 10;
  user.planUnlocksUsed = 0;

  await user.save();

  return subscription;
};

// POST /api/payments/create-order  { planId }
export const createOrder = asyncHandler(async (req, res) => {
  const { planId } = req.body;

  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    res.status(404);
    throw new Error("Selected plan is not available");
  }

  const subscription = await Subscription.create({
    user: req.user._id,
    plan: plan._id,
    planSnapshot: {
      name: plan.name,
      priceInPaise: plan.priceInPaise,
      currency: plan.currency,
      durationDays: plan.durationDays,
      maxProfileViews: plan.maxProfileViews,
      freeKundaliMatches: plan.freeKundaliMatches,
    },
    status: "pending",
  });

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: plan.priceInPaise,
    currency: plan.currency,
    receipt: String(subscription._id),
    notes: { userId: String(req.user._id), planId: String(plan._id) },
  });

  subscription.razorpayOrderId = order.id;
  await subscription.save();

  await Payment.create({
    user: req.user._id,
    subscription: subscription._id,
    plan: plan._id,
    razorpayOrderId: order.id,
    amount: plan.priceInPaise,
    currency: plan.currency,
    status: "created",
  });

  ok(res, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    subscriptionId: subscription._id,
    plan: { name: plan.name, durationDays: plan.durationDays },
  });
});

// POST /api/payments/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Never trusts the frontend's claim of success — recomputes the HMAC signature
// server-side against RAZORPAY_KEY_SECRET before activating anything.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment || String(payment.user) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (expectedSignature !== razorpay_signature) {
    payment.status = "failed";
    payment.failureReason = "Signature mismatch";
    await payment.save();
    await Subscription.findByIdAndUpdate(payment.subscription, { status: "cancelled" });
    res.status(400);
    throw new Error("Payment verification failed");
  }

  // Idempotent: webhook or a retried client call may race this exact same order.
  if (payment.status !== "paid") {
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    const subscription = await Subscription.findById(payment.subscription);
    if (subscription.status !== "active") {
      await activateSubscription({ subscription, razorpayPaymentId: razorpay_payment_id });
    }
  }

  ok(res, {}, "Payment verified. Your premium plan is now active.");
});

// POST /api/payments/webhook — Razorpay server-to-server event notifications.
// Mounted with express.raw() in server.js so the raw body is available for signature verification.
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not set — ignoring webhook");
    return res.status(200).json({ received: true });
  }

  const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  if (expected !== signature) {
    res.status(400);
    throw new Error("Invalid webhook signature");
  }

  const event = JSON.parse(req.body.toString("utf8"));
  const entity = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && entity) {
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (payment && payment.status !== "paid") {
      payment.status = "paid";
      payment.razorpayPaymentId = entity.id;
      await payment.save();

      const subscription = await Subscription.findById(payment.subscription);
      if (subscription && subscription.status !== "active") {
        await activateSubscription({ subscription, razorpayPaymentId: entity.id });
      }
    }
  }

  if (event.event === "payment.failed" && entity) {
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (payment && payment.status === "created") {
      payment.status = "failed";
      payment.failureReason = entity.error_description || "Payment failed";
      await payment.save();
      await Subscription.findByIdAndUpdate(payment.subscription, { status: "cancelled" });
    }
  }

  res.status(200).json({ received: true });
});

// GET /api/payments/history
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("plan", "name durationDays")
    .sort({ createdAt: -1 });
  ok(res, { payments });
});
