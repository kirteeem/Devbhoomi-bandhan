// Thin abstraction over an SMTP provider (Brevo relay) with a direct Brevo
// REST API fallback. If NEITHER is configured, emails are logged to the
// console instead of failing, but ONLY outside production — in production
// a fully unconfigured email service throws, since silently "succeeding"
// while sending nothing is exactly what caused the original "no OTP
// received on Render" symptom.
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

// Direct Brevo REST API path — used whenever SMTP_HOST isn't set but
// BREVO_API_KEY is. Handy on hosts (or trial Brevo accounts) where outbound
// SMTP port 587 is awkward but HTTPS out is always fine.
const sendViaBrevoApi = async ({ to, subject, html, text }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Devbhoomi Bandhan",
        email: process.env.BREVO_SENDER_EMAIL || "kirteemsharma.dev@gmail.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${text}</p>`,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error(`[EMAIL][BREVO-API] Failed (${response.status}): ${errBody}`);
    throw new Error(`Brevo API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  console.log(`[EMAIL][BREVO-API] Accepted by Brevo for delivery — to: ${to}, messageId: ${data.messageId}`);
  return { delivered: true, logged: false };
};

/**
 * Sends an email via SMTP if SMTP_HOST is set, else via the Brevo REST API
 * if BREVO_API_KEY is set, else logs to console in non-production only.
 * In production, an unconfigured email service throws — "OTP sent" must
 * never be a lie in prod.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();

  if (!t) {
    if (process.env.BREVO_API_KEY) {
      return sendViaBrevoApi({ to, subject, html, text });
    }

    if (process.env.NODE_ENV === "production") {
      console.error(
        "[EMAIL] CRITICAL: neither SMTP_HOST nor BREVO_API_KEY is set in this environment. " +
          "Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS (or BREVO_API_KEY) in Render's Environment tab."
      );
      throw new Error("Email service is not configured on the server.");
    }

    console.log(`[EMAIL] (SMTP/Brevo not configured — logging only)
  To: ${to}
  Subject: ${subject}
  ${text || html}`);
    return { delivered: false, logged: true };
  }

  try {
    // Logged on success too (not just failure): "accepted" here only means
    // the SMTP relay (Brevo) took the message for delivery — it does NOT
    // mean it reached the inbox. If OTPs keep "not arriving" even though
    // this line prints every time, the message is being accepted by Brevo
    // and then dropped/spam-filtered/bounced somewhere downstream — check
    // Brevo dashboard -> Transactional -> Email Activity for this exact
    // recipient/subject to see the real delivery status (delivered, soft
    // bounce, hard bounce, blocked, spam-complaint, etc.), since that's
    // information this server is never told about a "successful" SMTP send.
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || '"Devbhoomi Bandhan" <no-reply@devbhoomibandhan.com>',
      to,
      subject,
      html,
      text,
    });
    console.log(`[EMAIL] Accepted by SMTP relay for delivery — to: ${to}, messageId: ${info?.messageId || "n/a"}, response: ${info?.response || "n/a"}`);
    return { delivered: true, logged: false };
  } catch (err) {
    const message = err?.message || String(err);

    // Render/free-host SMTP connectivity can be flaky or blocked. If a Brevo
    // API key is also configured, fall back to HTTPS delivery instead of
    // failing the user-visible OTP flow on an SMTP transport timeout.
    if (process.env.BREVO_API_KEY) {
      console.warn(`[EMAIL][SMTP] Failed (${message}). Falling back to Brevo API for ${to}.`);
      return sendViaBrevoApi({ to, subject, html, text });
    }

    throw err;
  }
};

export const sendPasswordResetEmail = async (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: "Reset your Devbhoomi Bandhan password",
    text: `Hi ${user.fullName}, reset your password using this link (valid for 30 minutes): ${resetUrl}. If you did not request this, ignore this email.`,
    html: `<p>Hi ${user.fullName},</p><p>Use the link below to reset your Devbhoomi Bandhan password. This link is valid for <strong>30 minutes</strong>.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });

export const sendOtpEmail = async ({ email, code, purpose = "login" }) =>
  sendEmail({
    to: email,
    subject: `${code} is your Devbhoomi Bandhan verification code`,
    text: `Your Devbhoomi Bandhan verification code is ${code}. It expires in a few minutes. Do not share this code with anyone.${
      purpose === "bind_phone" ? " Use it to confirm the phone number you're linking to your account." : ""
    }`,
    html: `
      <p>Your Devbhoomi Bandhan verification code is:</p>
      <p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#7B1E3D;margin:12px 0;">${code}</p>
      <p>This code expires in a few minutes. Do not share it with anyone.</p>
    `,
  });

export const sendEmailVerificationEmail = async (user, verifyUrl) =>
  sendEmail({
    to: user.email,
    subject: "Verify your email — Devbhoomi Bandhan",
    text: `Hi ${user.fullName}, verify your email using this link (valid for 24 hours): ${verifyUrl}`,
    html: `<p>Hi ${user.fullName},</p><p>Please verify your email address to unlock all features of your account.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link is valid for <strong>24 hours</strong>.</p>`,
  });

export const sendNotificationEmail = async ({ user, title, body, appUrl }) => {
  if (!user?.email) return { delivered: false, logged: false };

  const notificationsUrl = `${(appUrl || process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].replace(/\/$/, "")}/notifications`;

  return sendEmail({
    to: user.email,
    subject: `${title || "You have a new notification"} — Devbhoomi Bandhan`,
    text: `Hi ${user.fullName}, you got a notification on Devbhoomi Bandhan: ${title || "New update"}. ${body || ""} View it here: ${notificationsUrl}`,
    html: `
      <p>Hi ${user.fullName},</p>
      <p>You got a notification on Devbhoomi Bandhan:</p>
      <p style="padding:12px 16px;border-left:3px solid #7B1E3D;background:#FBF9F6;">
        <strong>${title || "New update"}</strong><br/>
        ${body || ""}
      </p>
      <p><a href="${notificationsUrl}">View all your notifications</a></p>
    `,
  });
};

export const PRIEST_REQUEST_EMAIL = "kirteemsharma.dev@gmail.com";

export const sendIdVerificationEmail = async ({ user, profile }) =>
  sendEmail({
    to: PRIEST_REQUEST_EMAIL,
    subject: `New Profile ID Verification Request — ${user.profileCode}`,
    text: [
      `A member has completed their Devbhoomi Bandhan profile and needs an identity check.`,
      ``,
      `Name: ${user.fullName}`,
      `Professional ID: ${user.profileCode}`,
      `Phone: ${user.phone || "—"}`,
      `Email: ${user.email || "—"}`,
      `Address: ${profile?.address || "—"}`,
      `District: ${profile?.district || "—"}, ${profile?.city || "—"}`,
      ``,
      `Please verify this member's identity documents in the admin panel and mark the profile as verified once confirmed.`,
    ].join("\n"),
    html: `
      <p>A member has completed their Devbhoomi Bandhan profile and needs an identity check.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Name</strong></td><td>${user.fullName}</td></tr>
        <tr><td><strong>Professional ID</strong></td><td>${user.profileCode}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${user.phone || "—"}</td></tr>
        <tr><td><strong>Email</strong></td><td>${user.email || "—"}</td></tr>
        <tr><td><strong>Address</strong></td><td>${profile?.address || "—"}</td></tr>
        <tr><td><strong>District</strong></td><td>${profile?.district || "—"}, ${profile?.city || "—"}</td></tr>
      </table>
      <p>Please verify this member's identity documents in the admin panel and mark the profile as verified once confirmed.</p>
    `,
  });

export const sendKundaliMatchRequestEmail = async ({ requester, partner, phone, requestType }) =>
  sendEmail({
    to: PRIEST_REQUEST_EMAIL,
    subject: `New Kundali Matching Request — ${requester.profileCode}`,
    text: [
      `A new ${requestType.replace(/_/g, " ")} request has been submitted on Devbhoomi Bandhan.`,
      ``,
      `Requester name: ${requester.fullName}`,
      `Requester professional ID: ${requester.profileCode}`,
      `Requester phone: ${phone}`,
      ``,
      `Partner name: ${partner.fullName}`,
      `Partner professional ID: ${partner.profileCode}`,
      ``,
      `Please review both members' kundali details in the admin panel and share the report.`,
    ].join("\n"),
    html: `
      <p>A new <strong>${requestType.replace(/_/g, " ")}</strong> request has been submitted on Devbhoomi Bandhan.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Requester name</strong></td><td>${requester.fullName}</td></tr>
        <tr><td><strong>Requester professional ID</strong></td><td>${requester.profileCode}</td></tr>
        <tr><td><strong>Requester phone</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Partner name</strong></td><td>${partner.fullName}</td></tr>
        <tr><td><strong>Partner professional ID</strong></td><td>${partner.profileCode}</td></tr>
      </table>
      <p>Please review both members' kundali details and share the report.</p>
    `,
  });

export const sendVerificationSubmittedEmail = async (user) => {
  if (!user?.email) return { delivered: false, logged: false };
  return sendEmail({
    to: user.email,
    subject: "We've received your verification request — Devbhoomi Bandhan",
    text: `Hi ${user.fullName}, thanks for submitting your document for identity verification. Our team will review it and update you within 24-48 hours. You can check your status anytime from Settings.`,
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Thanks for submitting your document for identity verification on Devbhoomi Bandhan.</p>
      <p>Our team will manually review it and get back to you within <strong>24-48 hours</strong>. You can check your status anytime from <strong>Settings → Verify My Profile</strong>.</p>
    `,
  });
};

export const sendVerificationApprovedEmail = async (user) => {
  if (!user?.email) return { delivered: false, logged: false };
  return sendEmail({
    to: user.email,
    subject: "You're verified! Your Blue Tick is live — Devbhoomi Bandhan",
    text: `Congratulations ${user.fullName}! Your identity has been successfully verified on Devbhoomi Bandhan. A Blue Verified Badge has been added to your profile. Thank you for helping us keep our community trusted.`,
    html: `
      <p>Congratulations, ${user.fullName}!</p>
      <p>Your identity has been successfully verified on Devbhoomi Bandhan.</p>
      <p style="padding:12px 16px;border-left:3px solid #1D9BF0;background:#F5FAFF;">
        <strong style="color:#1D9BF0;">✔ Blue Verified Badge</strong> has been added to your profile.
      </p>
      <p>Thank you for helping us keep our community trusted.</p>
    `,
  });
};

export const sendVerificationRejectedEmail = async (user, reason) => {
  if (!user?.email) return { delivered: false, logged: false };
  return sendEmail({
    to: user.email,
    subject: "Identity Verification Rejected — Devbhoomi Bandhan",
    text: `Hello ${user.fullName}, we reviewed your verification request. Unfortunately we could not approve it. Reason: ${reason}. Please update your profile and upload a valid document. Thank you.`,
    html: `
      <p>Hello ${user.fullName},</p>
      <p>We reviewed your verification request. Unfortunately we could not approve it.</p>
      <p style="padding:12px 16px;border-left:3px solid #B3261E;background:#FBF3F2;">
        <strong>Reason:</strong> ${reason}
      </p>
      <p>Please update your profile and upload a valid document, then submit again from <strong>Settings → Verify My Profile</strong>.</p>
      <p>Thank you.</p>
    `,
  });
};
