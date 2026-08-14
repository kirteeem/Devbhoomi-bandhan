import { Router } from "express";
import { listNotifications, markAsRead, getUnreadCount, markAllAsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validate.js";

const router = Router();

router.get("/", protect, listNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, validateObjectId("id"), markAsRead);

export default router;
