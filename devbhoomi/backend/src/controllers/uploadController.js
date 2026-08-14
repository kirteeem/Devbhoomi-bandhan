import Profile from "../models/Profile.js";
import User from "../models/User.js";
import cloudinary, { uploadBuffer } from "../utils/cloudinary.js";
import { recalculateAndPersistCompletion } from "../utils/profileCompletion.js";
import { assertValidImageBuffer } from "../middleware/imageUpload.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// FIX (images disappearing in production): this used to write files to local
// disk via multer.diskStorage and store a relative "/uploads/<file>" URL.
// Render's standard web service filesystem is not persistent — any file
// written to disk is wiped on every redeploy/restart, so photos would work
// right after upload and then vanish. This now uploads through the same
// Cloudinary pipeline already used by the "/api/upload/photo" route, so
// photos are stored on a real CDN and survive restarts/redeploys. The
// response shape is unchanged ({id, url, isProfilePhoto}) so no frontend
// changes are needed — `url` is now an absolute https://res.cloudinary.com/
// URL, and the shared resolvePhotoUrl() helper already passes absolute URLs
// through untouched.
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image uploaded");
  }

  // The multer fileFilter only checks the client-supplied mimetype header,
  // which is trivially spoofable. This checks the actual file bytes so a
  // renamed/disguised non-image file can't be stored as a "profile photo".
  assertValidImageBuffer(req.file.buffer);

  const profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  const isProfilePhoto = req.body.isProfilePhoto === "true";

  const result = await uploadBuffer(req.file.buffer, `devbhoomi-bandhan/profiles/${req.user._id}`);

  const newPhoto = {
    url: result.secure_url,
    publicId: result.public_id,
    isProfilePhoto,
    isPrivate: false,
  };

  // Find existing photo of the same type
  const existingIndex = profile.photos.findIndex(
    (photo) => photo.isProfilePhoto === isProfilePhoto
  );

  if (existingIndex !== -1) {
    // Delete old Cloudinary asset (best-effort — don't fail the upload if
    // the old asset is already gone or the delete call has a hiccup).
    const oldPublicId = profile.photos[existingIndex].publicId;
    if (oldPublicId) {
      cloudinary.uploader.destroy(oldPublicId).catch(() => {});
    }

    // Replace photo
    profile.photos[existingIndex] = newPhoto;
  } else {
    // Add new slot
    profile.photos.push(newPhoto);
  }

  // Safety: only 2 photos
  profile.photos = profile.photos.slice(0, 2);

  await profile.save();

  // Photos are the single heaviest-weighted field in the completion
  // score (see utils/profileCompletion.js), but this route bypasses the
  // main PATCH /profiles/me flow entirely — so without this, a member who
  // uploads a photo would see their profile-strength percentage stuck at
  // its old value (both in the DB and on screen) until they happened to
  // save the rest of the wizard again. Recomputing here keeps it accurate
  // the moment the upload finishes.
  const profileCompletion = await recalculateAndPersistCompletion(profile, User);

  const uploaded = profile.photos.find(
    (p) => p.url === newPhoto.url
  );

  res.json({
    id: uploaded._id,
    url: uploaded.url,
    isProfilePhoto: uploaded.isProfilePhoto,
    profileCompletion,
  });
  // Errors thrown above (including Cloudinary/DB failures) are caught by
  // asyncHandler and handled by the central errorHandler, which logs full
  // details server-side but only ever sends a generic message to the
  // client — so we no longer leak raw err.message (e.g. internal Cloudinary
  // or Mongo error text) to the browser as this route used to.
});