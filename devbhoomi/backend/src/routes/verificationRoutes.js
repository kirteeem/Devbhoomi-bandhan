import { Router } from "express";
import { submitVerification, getMyVerificationStatus } from "../controllers/verificationController.js";
import { protect } from "../middleware/auth.js";
import { imageUpload } from "../middleware/imageUpload.js";
import { otpLimiter } from "../config/rateLimits.js";

const router = Router();

router.use(protect);

// Moderate rate limit — reuses the otpLimiter tier (a handful of submits per
// window is plenty for a real member; document upload is exactly the kind
// of endpoint worth throttling since it triggers a Cloudinary upload and an
// email on every call). The duplicate-pending-request check in the
// controller is the main defense against repeat submissions; this just
// bounds request volume from one device.
router.post("/submit", otpLimiter, imageUpload.single("document"), submitVerification);
router.get("/me", getMyVerificationStatus);

export default router;
