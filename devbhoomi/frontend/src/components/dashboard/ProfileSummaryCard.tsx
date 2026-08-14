import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Circle, Pencil, Eye, Share2, Settings, MapPin, Briefcase } from "lucide-react";
import type { AuthUser, Profile } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";
import { getDisplayPhoto } from "../../lib/media";
import { VerifiedBadge } from "../ui/VerifiedBadge";

/**
 * Premium profile summary card shown at the top of the Dashboard.
 * `profileId` is a friendly short code derived from the Mongo _id (there's no
 * dedicated profileId field on the backend) — purely a cosmetic label.
 */
export const ProfileSummaryCard = ({ user, profile }: { user: AuthUser; profile?: Profile }) => {
  const age = profile?.dateOfBirth  
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const friendlyId = profile?._id ? `DB-${profile._id.slice(-6).toUpperCase()}` : "—";
  const rawPhoto =
    profile?.photos?.find((p) => p.isProfilePhoto)?.url ??
    profile?.photos?.[0]?.url;

  const profilePhoto = getDisplayPhoto(rawPhoto, user.gender, user.id);

  // lastLoginAt only exists on the user object once /auth/me has been called at least
  // once this session (see types/index.ts) — treat "seen in the last 5 minutes" as online.
  const isOnline = user.lastLoginAt ? Date.now() - new Date(user.lastLoginAt).getTime() < 5 * 60 * 1000 : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] border border-white/40 bg-gradient-to-br from-deep to-forest-dark p-1.5 shadow-[0_30px_60px_-30px_rgba(11,77,59,0.4)]"
    >
      <div className="rounded-[24px] bg-gradient-to-br from-deep to-forest-dark px-6 py-8 text-cream sm:px-10 sm:py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Circular profile photo */}
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-gold/60 bg-cream/10 text-4xl shadow-xl"
              >
                <img src={profilePhoto} alt={user.fullName} className="h-full w-full object-cover" />
              </motion.div>
              {user.isProfileVerified && (
                <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-deep bg-white shadow-sm">
                  <VerifiedBadge verified size="lg" />
                </span>
              )}
              <span
                className={`absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-deep ${isOnline ? "bg-emerald-400" : "bg-white/30"}`}
                title={isOnline ? "Online now" : "Offline"}
              />
            </div>

            {/* Identity */}
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-display text-2xl font-extrabold">{user.fullName}</h2>
                <VerifiedBadge verified={user.isProfileVerified} withLabel size="sm" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-cream/80 sm:justify-start">
                {age && <span>{age} yrs</span>}
                {profile?.district && (
                  <span className="flex items-center gap-1"><MapPin size={13} /> {profile.district}</span>
                )}
                {profile?.occupation?.title && (
                  <span className="flex items-center gap-1"><Briefcase size={13} /> {profile.occupation.title}</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-cream/60 sm:justify-start">
                <Circle size={6} className={isOnline ? "fill-emerald-400 text-emerald-400" : "fill-cream/40 text-cream/40"} />
                {isOnline ? "Online now" : "Offline"}
                <span className="text-cream/30">•</span>
                Profile ID: {friendlyId}
              </div>
            </div>
          </div>

          {/* Completion ring/bar */}
          <div className="w-full max-w-[220px] sm:w-56">
            <ProgressBar value={user.profileCompletion} label="Profile Completion" />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-cream/15 pt-6">
          <Link to="/profile/create" className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-[#2b1c05] transition-transform hover:-translate-y-0.5">
            <Pencil size={14} /> Edit Profile
          </Link>
          <Link to={profile?.user?._id ? `/profile/${profile.user._id}` : "#"} className="flex items-center gap-2 rounded-xl border border-cream/30 px-4 py-2.5 text-xs font-bold hover:bg-cream/10">
            <Eye size={14} /> Preview Profile
          </Link>
          <button
            onClick={() => navigator.share ? navigator.share({ title: "My Devbhoomi Bandhan Profile", url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-2 rounded-xl border border-cream/30 px-4 py-2.5 text-xs font-bold hover:bg-cream/10"
          >
            <Share2 size={14} /> Share Profile
          </button>
          <Link to="/settings" className="flex items-center gap-2 rounded-xl border border-cream/30 px-4 py-2.5 text-xs font-bold hover:bg-cream/10">
            <Settings size={14} /> Settings
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
