// Client for Message Central's "Verify Now" SMS OTP API
// (https://www.messagecentral.com/product/verify-now/api-india).
//
// Unlike the Brevo transactional-SMS path elsewhere in this codebase (which
// sends a code WE generate as a plain SMS), Message Central generates and
// owns the OTP itself: we call `send`, they text the user a code and hand
// back a `verificationId`, and we later call `validateOtp` with that ID +
// whatever the user typed to ask them "was this code right?" — there's no
// local code to compare against.
//
// Needs three env vars: MESSAGE_CENTRAL_CUSTOMER_ID, MESSAGE_CENTRAL_EMAIL,
// MESSAGE_CENTRAL_PASSWORD (the plain-text account password — this file
// base64-encodes it before sending, per their API's requirement, which is
// NOT the same thing as real encryption; it just satisfies their transport
// format). Leave MESSAGE_CENTRAL_CUSTOMER_ID unset to disable this provider
// entirely — callers fall back to logging/other channels.

const BASE_URL = "https://cpaas.messagecentral.com";

export const isMessageCentralConfigured = () =>
  Boolean(
    process.env.MESSAGE_CENTRAL_CUSTOMER_ID &&
      process.env.MESSAGE_CENTRAL_PASSWORD &&
      process.env.MESSAGE_CENTRAL_EMAIL
  );

let cachedToken = null;
let cachedTokenExpiresAt = 0;

// Message Central's auth tokens are long-lived (documented as valid for
// months), so we cache it in memory and only fetch a new one when it's
// missing/stale rather than on every single OTP send. If Render restarts
// the process, the cache is simply empty again and this fetches fresh.
const getAuthToken = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const key = Buffer.from(process.env.MESSAGE_CENTRAL_PASSWORD).toString("base64");
  const params = new URLSearchParams({
    customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
    key,
    scope: "NEW",
    country: "91",
    email: process.env.MESSAGE_CENTRAL_EMAIL,
  });

  const response = await fetch(`${BASE_URL}/auth/v1/authentication/token?${params.toString()}`, {
    method: "GET",
    headers: { accept: "*/*" },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.token) {
    throw new Error(`[MessageCentral] Auth failed (${response.status}): ${JSON.stringify(data)}`);
  }

  cachedToken = data.token;
  // Cache for 6 days at a time — comfortably inside the real (much longer)
  // expiry, while avoiding hitting the auth endpoint on every OTP.
  cachedTokenExpiresAt = Date.now() + 6 * 24 * 60 * 60 * 1000;
  return cachedToken;
};

// Normalizes to the bare national number Message Central expects
// (countryCode is passed as a separate parameter) — strips a leading "+91",
// "91", spaces, dashes, etc. and keeps the last 10 digits.
const toNationalNumber = (phone) => String(phone).replace(/\D/g, "").slice(-10);

/**
 * Triggers Message Central to text a fresh OTP to `phone`. Returns the
 * `verificationId` needed to validate whatever code the user types back —
 * store this alongside the OTP request so verifyPhoneOtp() can use it later.
 */
export const sendPhoneOtp = async (phone, { otpLength = 6, countryCode = "91" } = {}) => {
  const mobileNumber = toNationalNumber(phone);

  const doSend = async (token) => {
    const params = new URLSearchParams({
      countryCode,
      flowType: "SMS",
      mobileNumber,
      otpLength: String(otpLength),
    });
    return fetch(`${BASE_URL}/verification/v3/send?${params.toString()}`, {
      method: "POST",
      headers: { authToken: token },
    });
  };

  let token = await getAuthToken();
  let response = await doSend(token);

  // A cached token can go stale between the "6 days" we assume and Message
  // Central's real (undocumented) expiry — if they reject it, fetch one
  // fresh token and retry once rather than failing the whole OTP send.
  if (response.status === 401) {
    token = await getAuthToken({ forceRefresh: true });
    response = await doSend(token);
  }

  const data = await response.json().catch(() => null);
  const verificationId = data?.data?.verificationId;
  if (!response.ok || data?.responseCode !== 200 || !verificationId) {
    throw new Error(`[MessageCentral] Send OTP failed: ${JSON.stringify(data)}`);
  }

  return { verificationId, timeoutSeconds: Number(data.data.timeout) || undefined };
};

/**
 * Asks Message Central whether `code` matches the OTP they sent for
 * `verificationId`. Returns true only on their explicit
 * VERIFICATION_COMPLETED status — anything else (wrong code, expired,
 * already used) is treated as invalid.
 */
export const validatePhoneOtp = async (verificationId, code) => {
  const doValidate = async (token) => {
    const params = new URLSearchParams({ verificationId: String(verificationId), code: String(code) });
    return fetch(`${BASE_URL}/verification/v3/validateOtp?${params.toString()}`, {
      method: "GET",
      headers: { authToken: token },
    });
  };

  let token = await getAuthToken();
  let response = await doValidate(token);
  if (response.status === 401) {
    token = await getAuthToken({ forceRefresh: true });
    response = await doValidate(token);
  }

  const data = await response.json().catch(() => null);
  return data?.data?.verificationStatus === "VERIFICATION_COMPLETED";
};
