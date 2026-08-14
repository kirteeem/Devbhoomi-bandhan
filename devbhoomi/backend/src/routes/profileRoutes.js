import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getProfileByCode,
  updateProfileSchema,
  getMyVisitors,
  toggleShortlist,
  getMyShortlist,
  unlockProfileDetails,
  getContactDetails,
  unlockContactDetails,
} from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { uploadProfilePhoto } from "../controllers/uploadController.js";
import { validateObjectId } from "../middleware/validate.js";
import { imageUpload } from "../middleware/imageUpload.js";

const router = Router();

router.get("/me", protect, getMyProfile);
// NOTE: PATCH /me intentionally does NOT use the generic validate(schema)
// middleware. The wizard sends the whole in-progress form on every step, so
// fields for steps the member hasn't reached yet arrive as "" (not absent).
// validate() would run updateProfileSchema against that raw body and reject
// "" for every enum/number/date field (maritalStatus, heightCm, dateOfBirth,
// etc.) with a confusing "invalid" error on fields the UI never marked
// required. updateMyProfile strips those empty strings to `undefined` first
// and THEN validates — see stripEmptyStrings in profileController.js — so
// validation is still fully enforced, just after the partial-save case is
// accounted for.
router.patch("/me", protect, updateMyProfile);
router.get("/me/visitors", protect, getMyVisitors);
router.get("/me/shortlisted", protect, getMyShortlist);
router.post(
  "/upload-photo",
  protect,
  imageUpload.single("image"),
  uploadProfilePhoto
);
// Must be registered before the catch-all :userId route below since "code"
// would otherwise be swallowed as an ObjectId path segment.
router.get("/code/:code", protect, getProfileByCode);

// Keep this catch-all last — it matches any single-segment path.
router.get("/:userId", protect, validateObjectId("userId"), getProfileByUserId);
router.post("/:userId/shortlist", protect, validateObjectId("userId"), toggleShortlist);
router.post("/:userId/unlock", protect, validateObjectId("userId"), unlockProfileDetails);
router.get("/:userId/contact", protect, validateObjectId("userId"), getContactDetails);
router.post("/:userId/contact/unlock", protect, validateObjectId("userId"), unlockContactDetails);

export default router;
