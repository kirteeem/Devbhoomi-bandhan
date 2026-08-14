import { Router } from "express";
import {
  getAnalytics, listUsers, listPendingVerification, verifyProfile, unverifyProfile,
  suspendUser, changeUserRole, listTeamMembers,
  listPendingTestimonials, approveTestimonial, changeRoleSchema,
} from "../controllers/adminController.js";
import { listReports, resolveReport, resolveReportSchema } from "../controllers/safetyController.js";
import {
  listVerificationRequests, getVerificationRequestDetail,
  approveVerification, rejectVerification, rejectVerificationSchema,
} from "../controllers/verificationController.js";
import {
  listPriestsAdmin, getPriestDetailAdmin, disablePriestAdmin, enablePriestAdmin,
  listKundaliHistoryAdmin, getKundaliDetailAdmin,
} from "../controllers/priestController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

// Every route below requires a logged-in account. Verification review is
// open to both full admins and priest/"team member" accounts -- the people
// who actually check a member's name against their ID card and photos.
// Suspending accounts, changing roles, and moderating testimonials stay
// admin-only.
router.use(protect, restrictTo("admin", "priest"));

router.get("/analytics", getAnalytics);
router.get("/users", listUsers);
router.get("/users/pending-verification", listPendingVerification);
router.get("/team", listTeamMembers);
router.patch("/users/:id/verify", validateObjectId("id"), verifyProfile);
router.patch("/users/:id/unverify", validateObjectId("id"), unverifyProfile);

router.patch("/users/:id/suspend", restrictTo("admin"), validateObjectId("id"), suspendUser);
router.patch("/users/:id/role", restrictTo("admin"), validateObjectId("id"), validate(changeRoleSchema), changeUserRole);
router.get("/testimonials/pending", restrictTo("admin"), listPendingTestimonials);
router.patch("/testimonials/:id/approve", restrictTo("admin"), validateObjectId("id"), approveTestimonial);

// Report review is open to admins + priest/team accounts, same as
// verification review above — suspending the reported member (if warranted)
// still requires the admin-only /users/:id/suspend route.
router.get("/reports", listReports);
router.patch("/reports/:id", validateObjectId("id"), validate(resolveReportSchema), resolveReport);

// --- Identity Verification (Blue Tick) -----------------------------------
// The dedicated per-submission workflow — see models/VerificationRequest.js.
// Open to admin + priest, same reviewer pool as the legacy verify/unverify
// routes above.
router.get("/verification-requests", listVerificationRequests);
router.get("/verification-requests/:id", validateObjectId("id"), getVerificationRequestDetail);
router.patch("/verification-requests/:id/approve", validateObjectId("id"), approveVerification);
router.patch(
  "/verification-requests/:id/reject",
  validateObjectId("id"),
  validate(rejectVerificationSchema),
  rejectVerification
);

// --- Priest Management ----------------------------------------------------
// Viewing is open to admin + priest; enabling/disabling another priest
// account is admin-only.
router.get("/priests", listPriestsAdmin);
router.get("/priests/:id", validateObjectId("id"), getPriestDetailAdmin);
router.patch("/priests/:id/disable", restrictTo("admin"), validateObjectId("id"), disablePriestAdmin);
router.patch("/priests/:id/enable", restrictTo("admin"), validateObjectId("id"), enablePriestAdmin);

// --- Kundali History -------------------------------------------------------
router.get("/kundali-history", listKundaliHistoryAdmin);
router.get("/kundali-history/:id", validateObjectId("id"), getKundaliDetailAdmin);

export default router;
