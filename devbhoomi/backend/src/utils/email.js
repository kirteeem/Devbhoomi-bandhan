// Thin abstraction over an SMTP provider (SendGrid, SES, Gmail, etc).
// If SMTP_HOST is not configured, emails are logged to the console instead of
// failing, so the auth flows keep working end-to-end in local development.
import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
};

/**
 * Sends an email. Falls back to logging when SMTP isn't configured so that
 * signup/password-reset flows never hard-fail in dev/test environments.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  console.log("[EMAIL DEBUG] Starting email send");
  console.log("[EMAIL DEBUG] SMTP_HOST:", process.env.SMTP_HOST || "MISSING");
  console.log("[EMAIL DEBUG] SMTP_PORT:", process.env.SMTP_PORT || "MISSING");
  console.log("[EMAIL DEBUG] SMTP_SECURE:", process.env.SMTP_SECURE || "MISSING");
  console.log("[EMAIL DEBUG] SMTP_USER configured:", Boolean(process.env.SMTP_USER));
  console.log("[EMAIL DEBUG] SMTP_PASS configured:", Boolean(process.env.SMTP_PASS));
  console.log("[EMAIL DEBUG] SMTP_FROM configured:", Boolean(process.env.SMTP_FROM));
  console.log("[EMAIL DEBUG] Recipient:", to);

  const t = getTransporter();

  if (!t) {
    console.log("[EMAIL DEBUG] ERROR: SMTP_HOST is missing");
    return { delivered: false, logged: true };
  }

  try {
    console.log("[EMAIL DEBUG] Calling Brevo SMTP sendMail()...");

    const info = await t.sendMail({
      from:
        process.env.SMTP_FROM ||
        '"Devbhoomi Bandhan" <no-reply@devbhoomibandhan.com>',
      to,
      subject,
      html,
      text,
    });

    console.log("[EMAIL DEBUG] Brevo accepted email");
    console.log("[EMAIL DEBUG] Message ID:", info?.messageId || "n/a");
    console.log("[EMAIL DEBUG] SMTP response:", info?.response || "n/a");

    return { delivered: true, logged: false };
  } catch (error) {
    console.error("[EMAIL DEBUG] SMTP ERROR");
    console.error("[EMAIL DEBUG] Error code:", error?.code);
    console.error("[EMAIL DEBUG] Error response:", error?.response);
    console.error("[EMAIL DEBUG] Error message:", error?.message);

    throw error;
  }
};