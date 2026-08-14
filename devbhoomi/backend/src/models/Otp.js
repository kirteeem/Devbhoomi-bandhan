import mongoose from "mongoose";

// OTP codes are stored hashed (never in plaintext) and MongoDB automatically
// deletes the document once `expiresAt` passes — this is what makes the OTP
// "expire in a few minutes like big websites" without any cron job or manual
// cleanup. The TTL index below polls roughly every 60s, which is standard
// Mongo behaviour and fine for this use case (verification itself also
// checks expiresAt directly, so a code can never be accepted late even in
// the small window before Mongo's background reaper runs).
const otpSchema = new mongoose.Schema(
  {
    // Historically always a phone number — now also holds an email address
    // when channel === "email". Kept as one field (rather than two) so the
    // resend-cooldown / max-attempts / TTL logic below works identically no
    // matter which channel the code went out on.
    phone: { type: String, required: true, index: true },
    // Which channel this code was actually sent over. Lets a member request
    // "send by email instead" without colliding with an in-flight SMS code
    // for the same purpose.
    channel: { type: String, enum: ["sms", "email"], default: "sms" },
    codeHash: { type: String, required: true },
    // Set only when the code was generated and is owned by an external
    // provider (Message Central) rather than by us — in that case codeHash
    // is a placeholder and verifyOtp() asks the provider directly instead
    // of comparing hashes locally. See utils/messageCentral.js.
    providerVerificationId: { type: String, default: null },
    // What this code is for — keeps a "login" OTP from being reusable to,
    // say, bind a phone number to someone else's account.
    purpose: {
      type: String,
      enum: ["login_or_signup", "bind_phone", "signup_email_verify", "signup_phone_verify"],
      default: "login_or_signup",
    },
    // If purpose is "bind_phone", this ties the code to the specific
    // already-logged-in account that requested it.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
