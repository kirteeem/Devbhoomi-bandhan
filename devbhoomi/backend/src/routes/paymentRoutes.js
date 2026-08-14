import { Router } from "express";
import { createOrder, verifyPayment, getPaymentHistory, createOrderSchema, verifyPaymentSchema } from "../controllers/paymentController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/create-order", protect, validate(createOrderSchema), createOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);
router.get("/history", protect, getPaymentHistory);

export default router;
