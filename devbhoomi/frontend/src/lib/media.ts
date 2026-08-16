// Central helper for turning a stored photo path into something <img> can load,
// and for giving every profile a tasteful placeholder photo when none has been
// uploaded yet.
import { resolveApiOrigin } from "./runtimeConfig";

const API_ORIGIN = resolveApiOrigin();

/** Resolves a stored photo URL string to a fully-qualified backend route. */
export const resolvePhotoUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Standardize potential Windows file system paths
  let cleanPath = url.replace(/\\/g, "/");

  // Strip any leading slash(es) first so the prefix checks below match
  // paths like "/uploads/xxx.jpg" the same way they match "uploads/xxx.jpg".
  cleanPath = cleanPath.replace(/^\/+/, "");

  // Completely clean legacy database string folder prefixes
  cleanPath = cleanPath.replace(/^backend\/src\/uploads\//, "");
  cleanPath = cleanPath.replace(/^backend\/uploads\//, "");
  cleanPath = cleanPath.replace(/^src\/uploads\//, "");
  cleanPath = cleanPath.replace(/^uploads\//, "");
  cleanPath = cleanPath.replace(/^\/+/, "");

  // Constructs perfectly clean URL: http://localhost:5000/uploads/1783518014732.jpg
  return `${API_ORIGIN}/uploads/${cleanPath}`;
};

// --- Shuffled placeholder avatars -----------------------------------------
// Every profile without an uploaded photo gets a tasteful, brand-styled
// illustrated avatar (never a real/stock photo — avoids any copyright or
// "random stranger's face" issue). Instead of one fixed image per gender,
// each gender has a small palette of distinct color/pattern variants, and
// the variant is picked deterministically from a "seed" (the user's id or
// profile code) using a simple hash — so the same member always sees the
// same avatar, but different members are visibly shuffled across the set
// instead of every man/woman on the site looking identical.
const MALE_PALETTE = [
  { bg: "#EFEAE2", accent: "#274B4B" },
  { bg: "#EAE6F2", accent: "#3B4E8A" },
  { bg: "#E8EFEA", accent: "#2E6F57" },
  { bg: "#F2EDE6", accent: "#6B4A2E" },
  { bg: "#E9EEF2", accent: "#355070" },
  { bg: "#EFEAE8", accent: "#7B1E3D" },
];

const FEMALE_PALETTE = [
  { bg: "#FBEAF0", accent: "#7B1E3D" },
  { bg: "#F5E9F2", accent: "#8E3B6B" },
  { bg: "#FBEFE6", accent: "#B45A3C" },
  { bg: "#F0E9F7", accent: "#5C4A8A" },
  { bg: "#FCEFE9", accent: "#C05B4F" },
  { bg: "#F7EAEC", accent: "#9C4763" },
];

const NEUTRAL_PALETTE = [
  { bg: "#FBF9F6", accent: "#7B1E3D" },
  { bg: "#F2F0EC", accent: "#4A4A4A" },
];

/** Small, stable string hash (djb2) used only to pick an avatar variant. */
const hashSeed = (seed: string) => {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(hash);
};

const buildAvatarSvg = (bg: string, accent: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${bg}" />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#C89A45" stroke-width="2.5" opacity="0.55" />
      <circle cx="100" cy="82" r="34" fill="${accent}" opacity="0.9" />
      <path d="M30 190 C30 138 60 112 100 112 C140 112 170 138 170 190 Z" fill="${accent}" opacity="0.9" />
    </svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Brand-styled placeholder avatar (ivory background, silhouette, gold ring),
 * shuffled across a small palette by gender so members don't all share one
 * identical fallback image. `seed` should be a stable per-user value (user
 * id or profileCode) — pass it whenever available for real variety; if
 * omitted, falls back to a single default per gender.
 */
export const buildDefaultAvatar = (gender?: string | null, seed?: string | null) => {
  const g = gender?.toLowerCase();
  const palette = g === "female" ? FEMALE_PALETTE : g === "male" ? MALE_PALETTE : NEUTRAL_PALETTE;
  const variant = seed ? palette[hashSeed(seed) % palette.length] : palette[0];
  return buildAvatarSvg(variant.bg, variant.accent);
};

export const DEFAULT_AVATAR = buildDefaultAvatar();

/**
 * Returns an absolute photo URL for profile visualization cards: uses the
 * real upload path if present, otherwise falls back to a shuffled,
 * brand-styled placeholder avatar so no image slot is ever left broken.
 * Pass `seed` (the profile/user id) wherever you have it so the fallback
 * avatar varies across different members instead of repeating one image.
 */
export const getDisplayPhoto = (
  url?: string | null,
  gender?: string | null,
  seed?: string | null,
) => {
  const real = resolvePhotoUrl(url);
  if (real) return real;
  return buildDefaultAvatar(gender, seed);
};
