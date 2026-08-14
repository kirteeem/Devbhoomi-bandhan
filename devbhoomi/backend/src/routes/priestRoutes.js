import { Router } from "express";
import { getQueue, updateRequestStatus, submitReport, updateStatusSchema, submitReportSchema } from "../controllers/priestController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.use(protect, restrictTo("priest", "admin"));
router.get("/queue", getQueue);
router.patch("/requests/:id/status", validateObjectId("id"), validate(updateStatusSchema), updateRequestStatus);
router.post("/requests/:id/report", validateObjectId("id"), validate(submitReportSchema), submitReport);

export default router;
