import { Router } from "express";
import { listPlans, getMySubscription, getSubscriptionHistory } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/plans", listPlans);
router.get("/me", protect, getMySubscription);
router.get("/history", protect, getSubscriptionHistory);

export default router;
