import { Router } from "express";
import {
  reportUser, reportUserSchema,
  blockUser, blockUserSchema,
  unblockUser, listMyBlocks,
} from "../controllers/safetyController.js";
import { protect } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.post("/reports", validate(reportUserSchema), reportUser);
router.post("/blocks", validate(blockUserSchema), blockUser);
router.get("/blocks", listMyBlocks);
router.delete("/blocks/:userId", validateObjectId("userId"), unblockUser);

export default router;
