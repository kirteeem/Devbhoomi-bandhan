import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    // Professional matrimonial ID show
    // n across the platform (e.g. "DBB100042")
    // so members can share/reference each other without exposing Mongo ids.
    profileCode: { type: String, unique: true, sparse: true, index: true },

    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, select: false },
    authProvider: { type: String, enum: ["password", "otp", "google"], default: "password" },
    googleId: { type: String, select: false },

    role: { type: String, enum: ["user", "priest", "admin"], default: "user" },
    gender: { type: String, enum: ["male", "female", "other"] },
    createdFor: { type: String, enum: ["self", "son", "daughter", "sibling", "relative"], default: "self" },

    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isProfileVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended", "deactivated", "deleted"], default: "active" },

    preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
    profileCompletion: { type: Number, default: 10 },

    // Denormalized for fast reads on every profile view / match list — the
    // Subscription collection remains the source of truth and is what
    // actually gets written to on payment verification / expiry.
    premiumUntil: { type: Date, default: null },
    activePlan: {
      type: String, // Changes type to string to accept plan names/slugs
      enum: ["free", "premium_monthly", "premium_yearly"], 
      default: "free"
    },
    // When the current plan was activated — used to know the window over
    // which the quotas below apply (reset every time a new plan is bought).
    planActivatedAt: { type: Date, default: null },

    // Free kundali-matching requests granted by the active plan.
    planKundaliQuota: { type: Number, default: 0 },
    planKundaliUsed: { type: Number, default: 0 },

    // Every new member gets 5 free full-profile-detail unlocks, independent
    // of the premium plan's view quota above. Spending one permanently
    // unlocks that specific profile's full details (see ProfileUnlock) —
    // it does NOT unlock contact info, which stays premium-only.
    freeUnlocksRemaining: {
      type: Number,
      default: 5,
    },

    // Premium members can reveal contact info (address, phone, email) for
    // up to 10 other members. Free members never get a quota here — they
    // rely on their free profile unlocks instead (see ContactUnlock).
    // Reset to 10 every time a new plan is activated.
    planUnlockQuota: {
      type: Number,
      default: 0
    },
    planUnlocksUsed: {
      type: Number,
      default: 0
    },

    // Set once, the first time this member's profile is complete enough
    // to be sent to the priest/admin team for a manual identity check —
    // prevents sending the same verification-request email repeatedly.
    idVerificationEmailSent: { type: Boolean, default: false },

    // --- Manual identity verification -----------------------------------
    // Instead of an automated Aadhaar-number check at signup, members can
    // (optionally) submit the name printed on their government ID from
    // Settings so the admin/priest team can eyeball it against their
    // account name and their uploaded photo before granting the
    // "Verified" badge (isProfileVerified above).
    idCardName: { type: String, trim: true, default: null },
    // Government-ID document photos, uploaded once from Settings and stored
    // on Cloudinary (see uploadRoutes.js `/verification-doc`). The admin
    // panel shows these next to idCardName so a reviewer can eyeball the
    // printed name against the account name and tap one button to verify.
    aadharImage: { type: String, default: null },
    panImage: { type: String, default: null },
    // A plain selfie (no ID card in frame), uploaded alongside the ID docs
    // so the reviewer can also eyeball a face match against the profile
    // photo — catches a stolen/borrowed ID being used with someone else's
    // account, which idCardName + aadharImage/panImage alone can't.
    selfieImage: { type: String, default: null },
    verificationRequestedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },

    // Every free member gets 1 lifetime free kundali-matching request.
    // Premium members instead draw from planKundaliQuota (3 per plan
    // period, reset on renewal — see paymentController.js).
    freeKundaliRemaining: { type: Number, default: 1 },

    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: Date,
    // Updated (best-effort, not awaited) on every authenticated request so we
    // can show a real "online" indicator instead of a hardcoded one.
    lastActiveAt: Date,

    // --- Account-level login lockout (exponential backoff) --------------
    // Tracks consecutive failed password-login attempts for THIS account,
    // independent of the IP-based authLimiter in rateLimits.js. After a
    // small number of free tries, each additional failure doubles the
    // lockout window (capped) instead of a hard/permanent lockout — the
    // account unlocks itself once the backoff window elapses. Reset to 0 /
    // null on any successful login. See utils/accountLockout.js.
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Every browse/match/dashboard read filters candidates by
// { gender, status: "active" } (see matchController.js, dashboardController.js)
// via a populate `match` clause — without this index Mongo falls back to a
// full collection scan of the users table on every one of those requests.
userSchema.index({ gender: 1, status: 1 });
// Backs the "recently active" / "online now" sort + badge, and general
// activity lookups.
userSchema.index({ status: 1, lastActiveAt: -1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Mints a sequential, human-friendly professional ID once, on first save —
// used everywhere the platform needs to reference a member without exposing
// their Mongo _id (kundali matching, profile menu, sharing, etc).
userSchema.pre("save", async function (next) {
  if (!this.isNew || this.profileCode) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      "profileCode",
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.profileCode = `DBB${counter.seq}`;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.isPremium = function () {
  return !!this.premiumUntil && this.premiumUntil.getTime() > Date.now();
};

userSchema.methods.planUnlocksRemaining = function () {
  return Math.max(
    0,
    (this.planUnlockQuota || 0) - (this.planUnlocksUsed || 0)
  );
};

userSchema.methods.kundaliMatchesRemaining = function () {
  return Math.max(0, (this.planKundaliQuota || 0) - (this.planKundaliUsed || 0));
};

userSchema.methods.freeUnlocksLeft = function () {
  return Math.max(0, this.freeUnlocksRemaining || 0);
};

userSchema.methods.freeKundaliLeft = function () {
  return Math.max(0, this.freeKundaliRemaining || 0);
};

export default mongoose.model("User", userSchema);