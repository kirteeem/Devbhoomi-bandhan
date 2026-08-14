import Notification from "../models/Notification.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("fromUser", "fullName gender isProfileVerified");
  ok(res, { notifications });
});

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  ok(res, {}, "Marked as read");
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  ok(res, { unreadCount });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  ok(res, {}, "All notifications marked as read");
});
