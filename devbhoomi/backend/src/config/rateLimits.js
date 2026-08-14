import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

// All thresholds below are configurable via environment variables so they
// can be tuned per-deployment (e.g. looser in staging, stricter in prod)
// without a code change / redeploy. Sensible defaults are provided.
const num = (envVar, fallback) => {
  const v = Number(process.env[envVar]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

const minutes = (n) => n * 60 * 1000;

// ─── Auth routes (login, signup, otp/password-reset requests) ───────────
// Strict — brute-forcing credentials or spamming signups/resets is the
// highest-value target for an attacker.
export const AUTH_WINDOW_MS = minutes(num("RATE_LIMIT_AUTH_WINDOW_MIN", 15));
export const AUTH_MAX = num("RATE_LIMIT_AUTH_MAX", 20);

// ─── OTP routes ──────────────────────────────────────────────────────────
export const OTP_WINDOW_MS = minutes(num("RATE_LIMIT_OTP_WINDOW_MIN", 15));
export const OTP_MAX = num("RATE_LIMIT_OTP_MAX", 10);

// ─── Public (unauthenticated, non-auth) routes ──────────────────────────
// Moderate — enough headroom for normal browsing (home page widgets,
// testimonials, pricing, contact form) without allowing scraping/abuse.
export const PUBLIC_WINDOW_MS = minutes(num("RATE_LIMIT_PUBLIC_WINDOW_MIN", 15));
export const PUBLIC_MAX = num("RATE_LIMIT_PUBLIC_MAX", 300);

// ─── Authenticated user actions ─────────────────────────────────────────
// Looser — a logged-in member browsing matches, loading
// notifications etc. legitimately makes many more requests than an
// anonymous visitor.
export const AUTHED_WINDOW_MS = minutes(num("RATE_LIMIT_AUTHED_WINDOW_MIN", 15));
export const AUTHED_MAX = num("RATE_LIMIT_AUTHED_MAX", 1000);

const jsonMessage = (message) => ({ success: false, message });

// Best-effort, non-throwing peek at the JWT (if any) so we can tell apart
// "public" vs "authenticated" traffic for rate-limit tiering *before* the
// real `protect` middleware runs. This never rejects the request itself —
// an invalid/missing token is simply treated as an anonymous caller, and
// `protect` still runs later on any route that actually requires auth.
const isAuthenticatedRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  try {
    jwt.verify(authHeader.slice(7), process.env.JWT_ACCESS_SECRET);
    return true;
  } catch {
    return false;
  }
};

// Single limiter applied to all /api/* traffic that isn't already covered by
// a more specific limiter below. Dynamically picks the "moderate" (public)
// or "loose" (authenticated) threshold per request.
export const apiLimiter = rateLimit({
  windowMs: Math.max(PUBLIC_WINDOW_MS, AUTHED_WINDOW_MS),
  limit: (req) => (isAuthenticatedRequest(req) ? AUTHED_MAX : PUBLIC_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many requests, please try again later."),
});

export const authLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  limit: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many auth attempts from this device, please try again later."),
});

// OTP endpoints get their own tighter limit — a phone/email's own resend
// cooldown (in otp.js) prevents rapid resends of the *same* identifier,
// this stops someone from hammering many different identifiers from one IP
// to run up SMS costs.
export const otpLimiter = rateLimit({
  windowMs: OTP_WINDOW_MS,
  limit: OTP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many OTP requests from this device, please try again later."),
});
