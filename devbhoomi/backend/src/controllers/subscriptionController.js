import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

// GET /api/subscriptions/plans — public, used by the pricing page
export const listPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, priceInPaise: 1 });
  ok(res, { plans });
});

// GET /api/subscriptions/me — current user's active subscription + premium status
export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id, status: "active" })
    .populate("plan")
    .sort({ createdAt: -1 });

  ok(res, {
    isPremium: req.user.isPremium(),
    premiumUntil: req.user.premiumUntil,
    subscription,
  });
});

// GET /api/subscriptions/history — every subscription the user has ever had
export const getSubscriptionHistory = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .populate("plan")
    .sort({ createdAt: -1 });
  ok(res, { subscriptions });
});
