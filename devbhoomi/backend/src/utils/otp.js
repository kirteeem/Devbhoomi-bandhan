import crypto from "crypto";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "./email.js";
import { sendPhoneOtp, validatePhoneOtp, isMessageCentralConfigured } from "./messageCentral.js";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30);
const OTP_MAX_ATTEMPTS = 5;

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");

// Sends an SMS OTP via Brevo's Transactional SMS API
const sendSms = async (phone, code) => {
  if (!process.env.BREVO_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[OTP][SMS] BREVO_API_KEY is not set in this environment (and Message Central isn't configured " +
          "either) — there is no way to actually deliver this SMS. Set MESSAGE_CENTRAL_CUSTOMER_ID/" +
          "MESSAGE_CENTRAL_EMAIL/MESSAGE_CENTRAL_PASSWORD or BREVO_API_KEY in Render's Environment tab."
      );
      const err = new Error(
        "SMS delivery isn't configured on this server right now. Please request the code by email instead."
      );
      err.statusCode = 502;
      throw err;
    }
    console.log(`[OTP][SMS] (BREVO_API_KEY not configured — logging only) Sending ${code} to ${phone}`);
    return { delivered: false, logged: true };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: (process.env.BREVO_SMS_SENDER || "DevBand").slice(0, 11),
        recipient: phone.replace(/^\+/, ""),
        content: `${code} is your Devbhoomi Bandhan verification code. It expires in a few minutes.`,
        type: "transactional",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[OTP][SMS] Brevo SMS request failed (${response.status}): ${body}`);
      const err = new Error(
        "We couldn't send your verification code by SMS right now. Please try again in a moment, or request the code by email instead."
      );
      err.statusCode = 502;
      throw err;
    }

    console.log(`[OTP][SMS] Accepted by Brevo for delivery to ${phone}`);
    return { delivered: true, logged: false };
  } catch (err) {
    if (err.statusCode) throw err;
    console.error("[OTP][SMS] Brevo SMS request errored:", err.message);
    const friendlyErr = new Error(
      "We couldn't send your verification code by SMS right now. Please try again in a moment, or request the code by email instead."
    );
    friendlyErr.statusCode = 502;
    throw friendlyErr;
  }
};

/**
 * Generates a 6-digit OTP, stores its SHA-256 hash in MongoDB, and delivers
 * via SMS or Email.
 */
export const generateAndSendOtp = async (
  identifier,
  { purpose = "login_or_signup", userId = null, channel = "sms" } = {}
) => {
  // Auto-detect channel if not explicitly supplied (e.g., email vs phone strings)
  const resolvedChannel = channel || (identifier.includes("@") ? "email" : "sms");

  console.log(`[OTP] Generating OTP for ${identifier} via [${resolvedChannel.toUpperCase()}] (Purpose: ${purpose})`);

  const recentOtp = await Otp.findOne({ 
    phone: identifier, 
    purpose, 
    channel: resolvedChannel, 
    consumed: false 
  }).sort({ createdAt: -1 });

  if (recentOtp) {
    const secondsSinceLastSend = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      const err = new Error(`Please wait ${wait}s before requesting another OTP.`);
      err.statusCode = 429;
      throw err;
    }
  }

  // 1. Message Central Delivery Path (SMS Only)
  if (resolvedChannel === "sms" && isMessageCentralConfigured()) {
    await Otp.deleteMany({ phone: identifier, purpose, consumed: false });

    const { verificationId } = await sendPhoneOtp(identifier);
    console.log(`[OTP][SMS] Accepted by Message Central — verificationId: ${verificationId}`);

    await Otp.create({
      phone: identifier,
      channel: resolvedChannel,
      purpose,
      userId,
      codeHash: "provider-managed",
      providerVerificationId: verificationId,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    });
    return true;
  }

  // 2. Local Code Generation for Brevo Email / Brevo SMS
  const code = String(crypto.randomInt(100000, 1000000));

  await Otp.deleteMany({ phone: identifier, purpose, consumed: false });

  const otpRecord = await Otp.create({
    phone: identifier,
    channel: resolvedChannel,
    purpose,
    userId,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  if (resolvedChannel === "email") {
    try {
      // Brevo SMTP Email Delivery
      await sendOtpEmail({ email: identifier, code, purpose });
      console.log(`[OTP][EMAIL] Successfully dispatched email OTP to ${identifier}`);
    } catch (err) {
      await otpRecord.deleteOne();

      // "525 5.7.1 Unauthorized IP address" is a Brevo-account-level SMTP
      // setting (IP-authorization for the SMTP key is turned on and this
      // server's outbound IP isn't on the allowed list yet) — not something
      // a code fix or retry here can resolve. Log a hint pointing straight
      // at the fix so it isn't confused with a generic delivery failure.
      if (/unauthorized ip/i.test(err.message || "")) {
        console.error(
          "[OTP][EMAIL] Brevo rejected this server's IP (525 5.7.1 Unauthorized IP address). " +
            "Fix: Brevo dashboard → Settings → Senders, Domains & Dedicated IPs → Authorized IPs — " +
            "add this server's outbound IP, or disable SMTP IP-authorization if the IP is expected to change " +
            "(e.g. a cloud host without a static egress IP)."
        );
      } else {
        console.error("[OTP][EMAIL] Failed to send OTP email:", err.message);
      }

      // NOTE: deliberately NOT forwarding err.message to the client — it
      // can contain raw provider/API response details (e.g. a Brevo error
      // payload) that shouldn't be shown to end users. Full detail is
      // already logged above for debugging.
      const friendlyErr = new Error(
        "We couldn't send your verification code by email right now. Please try again in a moment, or request the code by SMS instead."
      );
      friendlyErr.statusCode = 502;
      throw friendlyErr;
    }
  } else {
    try {
      await sendSms(identifier, code);
    } catch (err) {
      await otpRecord.deleteOne();
      throw err;
    }
  }
  return true;
};

/**
 * Verifies submitted OTP against MongoDB record or external provider
 */
export const verifyOtp = async (identifier, code, { purpose = "login_or_signup" } = {}) => {
  const entry = await Otp.findOne({ phone: identifier, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!entry) return false;

  if (entry.expiresAt.getTime() < Date.now()) {
    await entry.deleteOne();
    return false;
  }

  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    await entry.deleteOne();
    return false;
  }

  const isValid = entry.providerVerificationId
    ? await validatePhoneOtp(entry.providerVerificationId, code).catch((err) => {
        console.error("[OTP][MessageCentral] Validate call failed:", err.message);
        return false;
      })
    : entry.codeHash === hashCode(String(code || ""));

  if (!isValid) {
    entry.attempts += 1;
    await entry.save();
    return false;
  }

  entry.consumed = true;
  await entry.save();
  await entry.deleteOne();
  return true;
};