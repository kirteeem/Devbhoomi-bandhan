import { Router } from "express";
import { requestKundali, getMyKundaliRequests, getKundaliReport, requestKundaliSchema } from "../controllers/kundaliController.js";
import { protect } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.post("/request", protect, validate(requestKundaliSchema), requestKundali);
router.get("/my-requests", protect, getMyKundaliRequests);
router.get("/report/:requestId", protect, validateObjectId("requestId"), getKundaliReport);

export default router;
