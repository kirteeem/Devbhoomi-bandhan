import { motion } from "framer-motion";
import { MapPin, Briefcase, Sparkles, Lock } from "lucide-react";
import type { Profile } from "../../types";
import { getProfileDisplayPhoto, resolvePhotoUrl } from "../../lib/media";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface Props {
  profile: Profile;
  isOwnProfile: boolean;
  onRequestKundali: () => void;
  kundaliState: "idle" | "sent" | "pending";
}

export const ProfileHero = ({ profile, isOwnProfile, onRequestKundali, kundaliState }: Props) => {
  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const coverPhoto = profile.photos?.find((p) => p.isProfilePhoto) ?? profile.photos?.[0];
  const cover = resolvePhotoUrl(coverPhoto?.url);
  const fallbackPhotoUrl = getProfileDisplayPhoto(profile.photos, profile.user?.gender, profile.user?._id);
  const isBlurred = !!coverPhoto?.blurred;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-line">
      <div className="relative h-56 bg-gradient-to-br from-deep to-forest-dark sm:h-64">
        {cover && (
          <img
            src={cover}
            alt=""
            className={`h-full w-full object-cover opacity-40 ${isBlurred ? "blur-md" : ""}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackPhotoUrl;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="relative bg-cream px-6 pb-6 sm:px-10">
        <div className="-mt-16 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-cream bg-gradient-to-br from-maroon to-maroon-dark text-4xl text-cream shadow-xl">
            {cover ? (
              <img
                src={cover}
                alt={profile.user.fullName}
                className={`h-full w-full object-cover ${isBlurred ? "blur-md" : ""}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackPhotoUrl;
                }}
              />
            ) : "🌸"}
            {isBlurred && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Lock size={18} className="text-cream" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:pb-2 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-2xl font-extrabold">
                {profile.user.fullName}{age ? `, ${age}` : ""}
              </h1>
              <VerifiedBadge verified={profile.user.isProfileVerified} withLabel size="sm" />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
              {profile.user.profileCode && (
                <span className="rounded-full bg-maroon/10 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-maroon">
                  ID: {profile.user.profileCode}
                </span>
              )}
              {profile.district && <span className="flex items-center gap-1"><MapPin size={13} /> {profile.district}, HP</span>}
              {profile.occupation?.title && <span className="flex items-center gap-1"><Briefcase size={13} /> {profile.occupation.title}</span>}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-2 sm:pb-2">
              <button
                onClick={onRequestKundali}
                disabled={kundaliState !== "idle"}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-gold to-[#b9902a] px-4 py-2.5 text-xs font-bold text-[#2b1c05] shadow-lg shadow-gold/25 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Sparkles size={14} /> {kundaliState === "sent" ? "Requested" : "Free Kundali"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
