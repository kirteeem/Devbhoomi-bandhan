import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { generateAndSendOtp, verifyOtp } from "../utils/otp.js";
import { getLockStatus, registerFailedLoginAttempt, resetLoginAttempts } from "../utils/accountLockout.js";
import { sendPasswordResetEmail, sendEmailVerificationEmail } from "../utils/email.js";
import { ok } from "../utils/apiResponse.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createRawToken = () => crypto.randomBytes(32).toString("hex");

// Transforms user database documents into consistent frontend payloads
const toPublicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  gender: user.gender,
  profileCode: user.profileCode,
  preferredLanguage: user.preferredLanguage,
  profileCompletion: user.profileCompletion,
  isProfileVerified: user.isProfileVerified,
  isPhoneVerified: user.isPhoneVerified,
  isEmailVerified: user.isEmailVerified,
  lastLoginAt: user.lastLoginAt,
  isPremium: user.isPremium(),
  premiumUntil: user.premiumUntil,
  freeUnlocksRemaining: user.freeUnlocksLeft(),
  planUnlocksRemaining: user.planUnlocksRemaining(),
  freeKundaliRemaining: user.freeKundaliLeft(),
  kundaliMatchesRemaining: user.kundaliMatchesRemaining(),
  idCardName: user.idCardName,
  aadharImage: user.aadharImage,
  panImage: user.panImage,
  selfieImage: user.selfieImage,
  verificationRequestedAt: user.verificationRequestedAt,
  verifiedAt: user.verifiedAt,
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  gender: z.enum(["male", "female", "other"]),
  createdFor: z.enum(["self", "son", "daughter", "sibling", "relative"]).default("self"),
  // Issued by /auth/signup/email-otp/verify once the member proves they own
  // the email address they typed in. Signup is rejected without a valid,
  // matching token — see requireVerifiedSignupEmail below.
  emailVerificationToken: z.string().min(10, "Please verify your email address before continuing"),
  // Issued by /auth/signup/phone-otp/verify once the member proves they own
  // the phone number they typed in — same pattern as the email token above.
  phoneVerificationToken: z.string().min(10, "Please verify your phone number before continuing"),
});

export const signupPhoneOtpRequestSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
});

export const signupPhoneOtpVerifySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  code: z.string().trim().min(4).max(8),
});

export const signupEmailOtpRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const signupEmailOtpVerifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  code: z.string().trim().min(4).max(8),
});

export const verificationRequestSchema = z.object({
  idCardName: z.string().trim().min(2, "Enter the name exactly as printed on your ID card").max(100),
  aadharImage: z.string().trim().url("Upload a valid Aadhaar card image first").optional(),
  panImage: z.string().trim().url("Upload a valid PAN card image first").optional(),
  selfieImage: z.string().trim().url("Upload a clear selfie first"),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Username or password identifier must be provided"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const updatePreferencesSchema = z.object({
  preferredLanguage: z.enum(["en", "hi"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Reset token is missing or invalid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const requestEmailVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
});

export const confirmEmailVerificationSchema = z.object({
  token: z.string().min(10, "Verification token is missing or invalid"),
});

const issueTokensAndRespond = async (res, user, statusCode = 200) => {
  console.log("issueTokensAndRespond called");
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  user.lastLoginAt = new Date();
  await user.save();

  return res.status(statusCode).json({
    success: true,
    message: "Success",
    data: {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    },
  });
};

// A signup email-verification token is a short-lived JWT (not stored in
// Mongo) proving "this email address's OTP was verified a few minutes ago".
// Kept stateless/self-contained so it slots into the existing signup
// request without a new collection — see requestSignupEmailOtp /
// verifySignupEmailOtp / signup below.
const SIGNUP_EMAIL_TOKEN_PURPOSE = "signup_email_verified";
const SIGNUP_EMAIL_TOKEN_TTL = "20m";

const issueSignupEmailToken = (email) =>
  jwt.sign({ email, purpose: SIGNUP_EMAIL_TOKEN_PURPOSE }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: SIGNUP_EMAIL_TOKEN_TTL,
  });

// Same pattern as the email token above, for phone number verification.
const SIGNUP_PHONE_TOKEN_PURPOSE = "signup_phone_verified";
const SIGNUP_PHONE_TOKEN_TTL = "20m";

const issueSignupPhoneToken = (phone) =>
  jwt.sign({ phone, purpose: SIGNUP_PHONE_TOKEN_PURPOSE }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: SIGNUP_PHONE_TOKEN_TTL,
  });

// POST /api/auth/signup/email-otp/request  { email }
// First step of email verification on the Signup page: sends a 6-digit code
// to the address the member just typed, before any account is created.
export const requestSignupEmailOtp = asyncHandler(async (req, res) => {
  const { email } = signupEmailOtpRequestSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  await generateAndSendOtp(email, { purpose: "signup_email_verify", channel: "email" });
  ok(res, {}, "OTP sent to your email. It will expire in a few minutes.");
});

// POST /api/auth/signup/email-otp/verify  { email, code }
// Second step: checks the code and, on success, hands back a short-lived
// token the frontend attaches to the actual /auth/signup submission —
// proof that this email was verified without creating an account yet.
export const verifySignupEmailOtp = asyncHandler(async (req, res) => {
  const { email, code } = signupEmailOtpVerifySchema.parse(req.body);

  const isValid = await verifyOtp(email, code, { purpose: "signup_email_verify" });
  if (!isValid) {
    res.status(400);
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  const emailVerificationToken = issueSignupEmailToken(email);
  ok(res, { emailVerificationToken }, "Email verified. You can now complete your signup.");
});

// POST /api/auth/signup/phone-otp/request  { phone }
// Verifies phone ownership on the Signup page before an account is
// created — reduces fake/junk accounts signing up with numbers they don't
// actually control. Sent via Message Central when configured (see
// utils/messageCentral.js), otherwise falls back to whatever
// generateAndSendOtp's default SMS path is set up to do.
export const requestSignupPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = signupPhoneOtpRequestSchema.parse(req.body);

  const existing = await User.findOne({ phone });
  if (existing) {
    res.status(409);
    throw new Error("An account with this phone number already exists. Please sign in instead.");
  }

  await generateAndSendOtp(phone, { purpose: "signup_phone_verify", channel: "sms" });
  ok(res, {}, "OTP sent to your phone. It will expire in a few minutes.");
});

// POST /api/auth/signup/phone-otp/verify  { phone, code }
// Second step: checks the code and, on success, hands back a short-lived
// token the frontend attaches to the actual /auth/signup submission —
// proof that this phone number was verified without creating an account yet.
export const verifySignupPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, code } = signupPhoneOtpVerifySchema.parse(req.body);

  const isValid = await verifyOtp(phone, code, { purpose: "signup_phone_verify" });
  if (!isValid) {
    res.status(400);
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  const phoneVerificationToken = issueSignupPhoneToken(phone);
  ok(res, { phoneVerificationToken }, "Phone number verified. You can now complete your signup.");
});

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  console.log("STEP 1: Request received");

  // FIXED: Destructured fields explicitly from the validation parse result
  const {
    fullName,
    phoneNumber,
    email,
    password,
    gender,
    createdFor,
    emailVerificationToken,
    phoneVerificationToken,
  } = signupSchema.parse(req.body);

  console.log("STEP 2: Validation complete");

  // Confirm the member actually verified this exact email address via OTP
  // (see requestSignupEmailOtp / verifySignupEmailOtp above) before we ever
  // create the account.
  let decodedEmailToken;
  try {
    decodedEmailToken = jwt.verify(emailVerificationToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    res.status(400);
    throw new Error("Your email verification has expired. Please verify your email again.");
  }
  if (
    decodedEmailToken.purpose !== SIGNUP_EMAIL_TOKEN_PURPOSE ||
    decodedEmailToken.email !== email
  ) {
    res.status(400);
    throw new Error("Please verify this email address before continuing.");
  }

  // Same check for the phone number — see requestSignupPhoneOtp /
  // verifySignupPhoneOtp above. Compared by last-10-digits so formatting
  // differences (+91 vs no prefix, spaces, etc.) between the OTP step and
  // this submission don't cause a false mismatch.
  let decodedPhoneToken;
  try {
    decodedPhoneToken = jwt.verify(phoneVerificationToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    res.status(400);
    throw new Error("Your phone verification has expired. Please verify your phone number again.");
  }
  const lastTenDigits = (value) => String(value || "").replace(/\D/g, "").slice(-10);
  if (
    decodedPhoneToken.purpose !== SIGNUP_PHONE_TOKEN_PURPOSE ||
    lastTenDigits(decodedPhoneToken.phone) !== lastTenDigits(phoneNumber)
  ) {
    res.status(400);
    throw new Error("Please verify this phone number before continuing.");
  }

const emailUser = await User.findOne({ email });
const phoneUser = await User.findOne({ phone: phoneNumber });

console.log("Email User:", emailUser);
console.log("Phone User:", phoneUser);

if (emailUser || phoneUser) {
  res.status(409);
  throw new Error("An account with this phone or email already exists");
}

  console.log("STEP 3: Inserting user record");

  // No Aadhaar / government-ID number is collected at signup any more.
  // New accounts start unverified (isProfileVerified: false) and are
  // reviewed manually by the admin/priest team once the member has filled
  // in their profile and (optionally) a photo — see adminController.js
  // verifyProfile and the /admin panel on the frontend.
  const user = await User.create({
    fullName,
    phone: phoneNumber,
    email,
    passwordHash: password,
    gender,
    createdFor,
    authProvider: "password",
    // The signup OTP steps above already proved ownership of this email
    // and this phone number.
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  console.log("STEP 7: Initializing user application profiles");

  await Profile.create({ user: user._id });

  console.log("STEP 8: Handing off to token issuer");

  await issueTokensAndRespond(res, user, 201);

  console.log("STEP 9: Pipeline finished cleanly");
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] }).select(
    "+passwordHash +refreshTokens +failedLoginAttempts +lockUntil"
  );

  // Per-account lockout check — independent of the per-IP authLimiter.
  // Checked before comparing the password so a locked-out account can't be
  // used to keep probing passwords during its own cooldown window.
  if (user) {
    const { locked, retryAfterSeconds } = getLockStatus(user);
    if (locked) {
      res.status(429);
      res.set("Retry-After", String(retryAfterSeconds));
      throw new Error(
        `Too many failed attempts on this account. Please try again in ${Math.ceil(retryAfterSeconds / 60) || 1} minute(s).`
      );
    }
  }

  const passwordMatch = user ? await user.comparePassword(password) : false;

  if (!user || !user.passwordHash || !passwordMatch) {
    // Only register a failed attempt when the account actually exists —
    // otherwise this would let an attacker distinguish valid from invalid
    // identifiers by whether a lockout eventually appears.
    if (user) await registerFailedLoginAttempt(user);
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account is not active");
  }

  await resetLoginAttempts(user);
  await issueTokensAndRespond(res, user);
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number");

const otpEmailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

// Both /otp/request and /otp/verify accept either { phone } (channel: "sms",
// the original behaviour) or { email } (channel: "email" — a fallback for
// when SMS delivery isn't set up/working, e.g. no DLT-registered SMS sender
// yet). Exactly one of the two must be provided.
const resolveOtpIdentifier = (body) => {
  if (body.email) {
    return { identifier: otpEmailSchema.parse(body.email), channel: "email" };
  }
  return { identifier: phoneSchema.parse(body.phone), channel: "sms" };
};

// POST /api/auth/otp/request
export const requestOtp = asyncHandler(async (req, res) => {
  const { identifier, channel } = resolveOtpIdentifier(req.body);
  await generateAndSendOtp(identifier, { purpose: "login_or_signup", channel });
  ok(
    res,
    { channel },
    channel === "email"
      ? "OTP sent to your email. It will expire in a few minutes."
      : "OTP sent successfully. It will expire in a few minutes."
  );
});

// POST /api/auth/otp/verify
export const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { identifier, channel } = resolveOtpIdentifier(req.body);
  const code = String(req.body.code || "").trim();
  const fullName = req.body.fullName;

  const isValid = await verifyOtp(identifier, code, { purpose: "login_or_signup" });
  if (!isValid) {
    res.status(400);
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  const lookup = channel === "email" ? { email: identifier } : { phone: identifier };
  let user = await User.findOne(lookup);
  if (!user) {
    user = await User.create({
      fullName: fullName || "New User",
      ...lookup,
      authProvider: "otp",
      ...(channel === "email" ? { isEmailVerified: true } : { isPhoneVerified: true }),
    });
    await Profile.create({ user: user._id });
  } else if (channel === "email" && !user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  } else if (channel === "sms" && !user.isPhoneVerified) {
    user.isPhoneVerified = true;
    await user.save();
  }

  await issueTokensAndRespond(res, user);
});

// POST /api/auth/phone/request-otp  (protected — binds a phone number to an
// already-logged-in account, e.g. a member who signed up with Google and
// doesn't have a phone number on file yet).
export const requestPhoneBindOtp = asyncHandler(async (req, res) => {
  const phone = phoneSchema.parse(req.body.phone);

  const existing = await User.findOne({ phone });
  if (existing && String(existing._id) !== String(req.user._id)) {
    res.status(409);
    throw new Error("This phone number is already linked to another account.");
  }

  await generateAndSendOtp(phone, { purpose: "bind_phone", userId: req.user._id });
  ok(res, {}, "OTP sent to your phone. It will expire in a few minutes.");
});

// POST /api/auth/phone/verify-otp  (protected)
export const verifyPhoneBindOtp = asyncHandler(async (req, res) => {
  const phone = phoneSchema.parse(req.body.phone);
  const code = String(req.body.code || "").trim();

  const isValid = await verifyOtp(phone, code, { purpose: "bind_phone" });
  if (!isValid) {
    res.status(400);
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  const existing = await User.findOne({ phone });
  if (existing && String(existing._id) !== String(req.user._id)) {
    res.status(409);
    throw new Error("This phone number is already linked to another account.");
  }

  const user = await User.findById(req.user._id);
  user.phone = phone;
  user.isPhoneVerified = true;
  await user.save();

  ok(res, { user: toPublicUser(user) }, "Phone number verified and linked to your account.");
});

// POST /api/auth/google
// Accepts the Google OAuth access token obtained on the frontend via
// @react-oauth/google's useGoogleLogin(), and verifies it server-side by
// asking Google's own userinfo endpoint who it belongs to — the frontend
// can't be trusted to self-report an email/name, so we never accept those
// fields directly from the client. This also means the member's name,
// email, and (verified) email status come straight from Google's own
// records at signup, and are stored once — they are never asked for again.
export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Missing Google authentication token");
  }

  let googleProfile;
  try {
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!googleRes.ok) throw new Error("Google rejected this token");
    googleProfile = await googleRes.json();
  } catch (err) {
    res.status(401);
    throw new Error("Could not verify Google account. Please try again.");
  }

  const { sub: googleId, email, name: fullName, email_verified: emailVerified } = googleProfile;
  if (!googleId || !email) {
    res.status(400);
    throw new Error("Google did not return the required account details");
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({
      fullName: fullName || "New User",
      email,
      googleId,
      authProvider: "google",
      isEmailVerified: Boolean(emailVerified),
    });
    await Profile.create({ user: user._id });
  } else if (!user.googleId) {
    // Existing password/OTP account signing in with Google for the first
    // time — link it instead of creating a duplicate account.
    user.googleId = googleId;
    if (emailVerified) user.isEmailVerified = true;
    await user.save();
  }

  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account is not active");
  }

  await issueTokensAndRespond(res, user);
});

// POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens?.includes(refreshToken)) {
    res.status(401);
    throw new Error("Refresh token not recognised");
  }

  const newAccessToken = generateAccessToken(user._id);
  ok(res, { accessToken: newAccessToken }, "Token refreshed");
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken && req.user) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t !== refreshToken);
    await req.user.save();
  }
  ok(res, {}, "Logged out");
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  ok(res, { user: toPublicUser(req.user) });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user.passwordHash || !(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.passwordHash = newPassword;
  user.refreshTokens = [];
  await user.save();

  ok(res, {}, "Password updated. Please log in again on other devices.");
});

// PATCH /api/auth/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const validatedBody = updatePreferencesSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: validatedBody },
    { new: true, runValidators: true }
  );
  ok(res, { user: toPublicUser(user) }, "Preferences updated");
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const genericMessage = "If an account with that email exists, a reset link has been sent.";

  const user = await User.findOne({ email });
  if (!user) return ok(res, {}, genericMessage);

  const rawToken = createRawToken();
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl);
 } catch (err) {
  console.error("BREVO EMAIL ERROR:");
  console.error(err);
  console.error(err.message);
  console.error(err.response);

  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(500);
  throw err;
}

  ok(res, {}, genericMessage);
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired. Please request a new one.");
  }

  user.passwordHash = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  ok(res, {}, "Your password has been reset. Please log in with your new password.");
});

// POST /api/auth/verify-email/request
export const requestEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.email) {
    res.status(400);
    throw new Error("Add an email address to your account before verifying it.");
  }
  if (user.isEmailVerified) {
    return ok(res, {}, "Your email is already verified.");
  }

  const rawToken = createRawToken();
  user.emailVerificationTokenHash = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;
  await sendEmailVerificationEmail(user, verifyUrl);

  ok(res, {}, "Verification email sent. Please check your inbox.");
});

// POST /api/auth/verify-email/confirm
export const confirmEmailVerification = asyncHandler(async (req, res) => {
  const { token } = confirmEmailVerificationSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("This verification link is invalid or has expired. Please request a new one.");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  ok(res, {}, "Your email has been verified.");
});

// POST /api/auth/verification-request  { idCardName }
// Lets a member submit the name printed on their government ID so the
// admin/priest team can manually compare it to their account name (and
// their uploaded photo) before granting the "Verified" badge.
export const requestVerification = asyncHandler(async (req, res) => {
  const { idCardName, aadharImage, panImage, selfieImage } = verificationRequestSchema.parse(req.body);

  const user = await User.findById(req.user._id);
  user.idCardName = idCardName;
  if (aadharImage) user.aadharImage = aadharImage;
  if (panImage) user.panImage = panImage;
  user.selfieImage = selfieImage;
  user.verificationRequestedAt = new Date();
  await user.save();

  ok(res, { user: toPublicUser(user) }, "Submitted for verification. Our team will review it shortly.");
});

// DELETE /api/auth/me
export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { status: "deactivated", refreshTokens: [] } });
  ok(res, {}, "Your account has been deactivated");
});