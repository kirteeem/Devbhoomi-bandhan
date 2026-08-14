import multer from "multer";

// Shared multer configuration for every endpoint that accepts a profile
// photo. Centralised here so all upload routes get the same checks —
// previously one route's multer instance had no file-type filter at all.
//
// Two layers of file-type checking are used:
//   1. mimetype from the multipart header (cheap, but fully attacker
//      controlled — a renamed .exe can claim to be "image/jpeg").
//   2. a magic-byte (file signature) check on the actual buffer contents,
//      run in `assertValidImageBuffer` below, before the file is ever sent
//      to Cloudinary or saved anywhere. This is what actually stops a
//      disguised non-image file from getting through.
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
  }
  cb(null, true);
};

// Memory storage only — never write uploads to local disk. Render's
// filesystem isn't persistent anyway, and keeping the file only in memory
// means there's no path on disk that could ever be requested/executed.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter,
});

// Known file signatures (magic bytes) for the formats we accept.
const SIGNATURES = [
  { format: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { format: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // WEBP: "RIFF" .... "WEBP" — bytes 0-3 and 8-11
];

const matchesSignature = (buffer, sig) => sig.bytes.every((byte, i) => buffer[i] === byte);

const isWebp = (buffer) =>
  buffer.length >= 12 &&
  buffer.toString("ascii", 0, 4) === "RIFF" &&
  buffer.toString("ascii", 8, 12) === "WEBP";

// Throws if the buffer's actual content doesn't match a known image
// signature, regardless of what extension/mimetype the client claimed.
// Call this on every uploaded file before it's forwarded to Cloudinary.
export const assertValidImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 12) {
    throw new Error("Uploaded file is not a valid image");
  }
  const ok = SIGNATURES.some((sig) => matchesSignature(buffer, sig)) || isWebp(buffer);
  if (!ok) {
    throw new Error("Uploaded file is not a valid image");
  }
};
