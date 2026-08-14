// Per-account login lockout with exponential backoff.
//
// This is deliberately separate from (and complementary to) the per-IP
// `authLimiter` in config/rateLimits.js:
//   - authLimiter stops one IP from hammering many accounts (or one).
//   - This stops one ACCOUNT from being brute-forced from many different
//     IPs/devices, which a pure per-IP limiter can't catch.
//
// Rather than a hard/permanent lockout (which is itself a denial-of-service
// vector — an attacker can lock a victim out just by failing their
// password a few times), each additional failure past a small free
// allowance doubles the lockout window, up to a configurable cap. The
// account unlocks itself automatically once the window elapses; a
// successful login immediately clears the counters.
//
// All thresholds are configurable via environment variables so they can be
// tuned per-deployment without a code change.
const num = (envVar, fallback) => {
  const v = Number(process.env[envVar]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

// Failed attempts allowed before any lockout kicks in at all.
export const LOGIN_FREE_ATTEMPTS = num("LOGIN_LOCKOUT_FREE_ATTEMPTS", 5);
// Base lockout duration applied on the first attempt past the free allowance.
export const LOGIN_BASE_LOCK_MS = num("LOGIN_LOCKOUT_BASE_MS", 30 * 1000); // 30s
// Upper bound on the lockout window, no matter how many failures pile up.
export const LOGIN_MAX_LOCK_MS = num("LOGIN_LOCKOUT_MAX_MS", 15 * 60 * 1000); // 15m

// attempts is the count *after* the failure currently being processed.
const computeLockDurationMs = (attempts) => {
  const overage = attempts - LOGIN_FREE_ATTEMPTS;
  if (overage <= 0) return 0;
  // 30s, 60s, 120s, 240s, ... capped at LOGIN_MAX_LOCK_MS
  const duration = LOGIN_BASE_LOCK_MS * 2 ** (overage - 1);
  return Math.min(duration, LOGIN_MAX_LOCK_MS);
};

// Returns { locked: boolean, retryAfterSeconds: number }.
export const getLockStatus = (user) => {
  if (!user?.lockUntil) return { locked: false, retryAfterSeconds: 0 };
  const remainingMs = new Date(user.lockUntil).getTime() - Date.now();
  if (remainingMs <= 0) return { locked: false, retryAfterSeconds: 0 };
  return { locked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
};

// Call after a failed password check. Persists the updated counters.
export const registerFailedLoginAttempt = async (user) => {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  const lockMs = computeLockDurationMs(user.failedLoginAttempts);
  user.lockUntil = lockMs > 0 ? new Date(Date.now() + lockMs) : user.lockUntil || null;
  await user.save();
  return getLockStatus(user);
};

// Call after a successful login. Clears any lockout state.
export const resetLoginAttempts = async (user) => {
  if (!user.failedLoginAttempts && !user.lockUntil) return;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
};
