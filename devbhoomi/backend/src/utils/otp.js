import crypto from "crypto";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "./email.js";
import { sendPhoneOtp, validatePhoneOtp, isMessageCentralConfigured } from "./messageCentral.js";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30);
const OTP_MAX_ATTEMPTS = 5;

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");

// Sends an SMS OTP via Brevo's Transactional SMS API (a separate product
// from the Brevo SMTP relay used for emails elsewhere in this codebase —
// it needs its own BREVO_API_KEY from Brevo > SMS Campaigns > API Keys, and
// a BREVO_SMS_SENDER name). Note: for Indian numbers, Brevo (like every SMS
// gateway) requires the message template + sender ID to be registered with
// a DLT provider before delivery will actually succeed — having a Brevo
// account alone isn't enough. Falls back to logging in dev/when unconfigured
// so nothing throws if it isn't set up yet; callers should treat this as
// best-effort and offer the email channel as a fallback.
const sendSms = async (phone, code) => {
  if (!process.env.BREVO_API_KEY) {
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
      return { delivered: false, logged: false };
    }

    return { delivered: true, logged: false };
  } catch (err) {
    console.error("[OTP][SMS] Brevo SMS request errored:", err.message);
    return { delivered: false, logged: false };
  }
};

/**
 * Generates a 6-digit OTP, stores only its SHA-256 hash in MongoDB with a
 * TTL of a few minutes (auto-deleted by Mongo — no code ever lives forever),
 * and sends it over the requested channel (SMS or email). Enforces a short
 * resend cooldown per identifier+channel so a single phone/email can't be
 * spammed with requests.
 *
 * `identifier` is a phone number when channel is "sms", or an email address
 * when channel is "email". Switching channel for the same purpose starts a
 * fresh cooldown/code — e.g. a member can request SMS, then immediately hit
 * "send by email instead" without waiting.
 */
export const generateAndSendOtp = async (
  identifier,
  { purpose = "login_or_signup", userId = null, channel = "sms" } = {}
) => {
  const recentOtp = await Otp.findOne({ phone: identifier, purpose, channel, consumed: false }).sort({
    createdAt: -1,
  });
  if (recentOtp) {
    const secondsSinceLastSend = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      const err = new Error(`Please wait ${wait}s before requesting another OTP.`);
      err.statusCode = 429;
      throw err;
    }
  }

  // Message Central (Verify Now) generates and owns the OTP itself for SMS
  // — we don't create our own code in that case, we just remember the
  // verificationId it hands back so verifyOtp() can check with them later.
  // This takes priority over the Brevo SMS path below whenever it's
  // configured, since it doesn't need DLT template registration to work
  // for Indian numbers the way Brevo's generic transactional SMS does.
  if (channel === "sms" && isMessageCentralConfigured()) {
    await Otp.deleteMany({ phone: identifier, purpose, consumed: false });

    const { verificationId } = await sendPhoneOtp(identifier);

    await Otp.create({
      phone: identifier,
      channel,
      purpose,
      userId,
      // No local code exists for provider-owned OTPs — this is a
      // placeholder, never compared against (see verifyOtp below).
      codeHash: "provider-managed",
      providerVerificationId: verificationId,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    });
    return true;
  }

  const code = String(crypto.randomInt(100000, 1000000));

  // Invalidate any previous unconsumed codes for this identifier/purpose
  // (across both channels) so only the most recently sent OTP is ever valid.
  await Otp.deleteMany({ phone: identifier, purpose, consumed: false });

  const otpRecord = await Otp.create({
    phone: identifier,
    channel,
    purpose,
    userId,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  if (channel === "email") {
    try {
      await sendOtpEmail({ email: identifier, code, purpose });
    } catch (err) {
      // The code was already saved above (so codeHash lookups work if the
      // send actually got through some retry/queue) but the member never
      // received it — remove it so the resend cooldown doesn't force them
      // to wait 30s for a code that was never delivered in the first place.
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

      const friendlyErr = new Error(
        "We couldn't send your verification code by email right now. Please try again in a moment, or request the code by SMS instead."
      );
      friendlyErr.statusCode = 502;
      throw friendlyErr;
    }
  } else {
    await sendSms(identifier, code);
  }
  return true;
};

/**
 * Verifies a submitted code against MongoDB. Locks the OTP out after too
 * many wrong attempts (rather than letting a code be brute-forced) and
 * always deletes/consumes it on success so it can never be reused. Works
 * for either channel — a code is looked up purely by identifier + purpose.
 */
export const verifyOtp = async (identifier, code, { purpose = "login_or_signup" } = {}) => {
  const entry = await Otp.findOne({ phone: identifier, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!entry) return false;

  // Belt-and-braces: even though Mongo's TTL index removes expired documents
  // in the background, we never trust a code past its expiry ourselves.
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
