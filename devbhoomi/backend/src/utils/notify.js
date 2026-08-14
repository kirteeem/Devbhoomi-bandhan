import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendNotificationEmail } from "./email.js";

/**
 * Single entry point for creating a user notification. Handles all three
 * delivery channels so callers (priestController, etc.)
 * don't have to duplicate this wiring:
 *   1. Persists the Notification document (source of truth, powers the bell
 *      popup and /notifications page).
 *   2. Emits a realtime "notification:new" socket event, if `io` is passed.
 *   3. Emails the recipient a "you got a notification" message, best-effort —
 *      a failed/unconfigured SMTP provider never breaks the calling request.
 */
export const notifyUser = async ({ io, user, fromUser, type, title, body, relatedId }) => {
  const notification = await Notification.create({
    user,
    fromUser,
    type,
    title,
    body,
    relatedId,
  });

  io?.to(`user:${user}`).emit("notification:new", { type, title, body });

  try {
    const recipient = await User.findById(user).select("fullName email");
    if (recipient?.email) {
      await sendNotificationEmail({ user: recipient, title, body });
    }
  } catch (err) {
    // Never let an email hiccup fail the request that triggered the notification.
    console.error("[notify] failed to send notification email:", err.message);
  }

  return notification;
};
