import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { imageUpload, assertValidImageBuffer } from "../middleware/imageUpload.js";
import { uploadBuffer } from "../utils/cloudinary.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { ok } from "../utils/apiResponse.js";
import { recalculateAndPersistCompletion } from "../utils/profileCompletion.js";

const router = Router();

// POST /api/upload/photo  (multipart/form-data, field name: "photo")
router.post(
  "/photo",
  protect,
  imageUpload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    // The mimetype filter above only checks the client-supplied header;
    // this checks the actual bytes so a renamed/disguised file can't pass
    // itself off as an image.
    assertValidImageBuffer(req.file.buffer);
    const result = await uploadBuffer(req.file.buffer, `devbhoomi-bandhan/profiles/${req.user._id}`);

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { photos: { url: result.secure_url, publicId: result.public_id, isProfilePhoto: req.body.isProfilePhoto === "true" } } },
      { new: true }
    );

    const profileCompletion = await recalculateAndPersistCompletion(profile, User);

    ok(res, { profile, profileCompletion }, "Photo uploaded", 201);
  })
);

// POST /api/upload/verification-doc  (multipart/form-data, field name: "file", body: docType=aadhar|pan)
// Stores the image on Cloudinary (persistent — survives redeploys, unlike
// local disk) so it can be attached to a verification request and shown to
// the admin/priest team for a manual name-match check.
router.post(
  "/verification-doc",
  protect,
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    assertValidImageBuffer(req.file.buffer);
    const docType = ["pan", "selfie"].includes(req.body.docType) ? req.body.docType : "aadhar";
    const result = await uploadBuffer(req.file.buffer, `devbhoomi-bandhan/verification/${req.user._id}`);
    ok(res, { url: result.secure_url, docType }, "Document uploaded", 201);
  })
);

export default router;
