import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContactMessage } from "../controllers/contactController.js";

const router = Router();

// A stricter limiter than the general /api limiter — this is a public,
// unauthenticated endpoint, so it's the easiest one to spam.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again in a little while." },
});

router.post("/", contactLimiter, submitContactMessage);

export default router;
