import { Router } from "express";
import {
  signup,
  login,
  requestOtp,
  verifyOtpAndLogin,
  requestSignupEmailOtp,
  verifySignupEmailOtp,
  requestSignupPhoneOtp,
  verifySignupPhoneOtp,
  requestPhoneBindOtp,
  verifyPhoneBindOtp,
  googleLogin,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
  updatePreferences,
  deactivateAccount,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  confirmEmailVerification,
  signupSchema,
  loginSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestEmailVerificationSchema,
  confirmEmailVerificationSchema,
  signupEmailOtpRequestSchema,
  signupEmailOtpVerifySchema,
  signupPhoneOtpRequestSchema,
  signupPhoneOtpVerifySchema,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup/email-otp/request", validate(signupEmailOtpRequestSchema), requestSignupEmailOtp);
router.post("/signup/email-otp/verify", validate(signupEmailOtpVerifySchema), verifySignupEmailOtp);
router.post("/signup/phone-otp/request", validate(signupPhoneOtpRequestSchema), requestSignupPhoneOtp);
router.post("/signup/phone-otp/verify", validate(signupPhoneOtpVerifySchema), verifySignupPhoneOtp);
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtpAndLogin);
router.post("/phone/request-otp", protect, requestPhoneBindOtp);
router.post("/phone/verify-otp", protect, verifyPhoneBindOtp);
router.post("/google", googleLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);
router.patch("/preferences", protect, validate(updatePreferencesSchema), updatePreferences);
// FIXED: this was removed, but the frontend (Settings.tsx "deactivateAccount"
// mutation) still calls DELETE /auth/me — without this route that button
// was silently 404ing. Restored so account deactivation works again.
router.delete("/me", protect, deactivateAccount);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post(
  "/verify-email/request",
  protect,
  validate(requestEmailVerificationSchema),
  requestEmailVerification
);
router.post("/verify-email/confirm", validate(confirmEmailVerificationSchema), confirmEmailVerification);

export default router;