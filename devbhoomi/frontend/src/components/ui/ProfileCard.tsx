import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Lock, Crown } from "lucide-react";
import type { Profile } from "../../types";
import { getProfileDisplayPhoto, resolvePhotoUrl } from "../../lib/media";
import { useProfileGate } from "../../context/ProfileGateContext";
import { ReportBlockMenu } from "../profile/ReportBlockMenu";
import { VerifiedBadge } from "./VerifiedBadge";

export const ProfileCard = ({ profile }: { profile: Profile }) => {
  const { guardBrowse } = useProfileGate();
  const [hidden, setHidden] = useState(false);

  // Age calculation
  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const primaryPhoto = profile.photos?.find((p) => p.isProfilePhoto) ?? profile.photos?.[0];
  const uploadedPhotoUrl = primaryPhoto?.url ? resolvePhotoUrl(primaryPhoto.url) : null;
  const isLocked = Boolean(profile.isLocked);

  // Track if photo encounters a loading error
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    setPhotoFailed(false);
  }, [uploadedPhotoUrl]);

  const finalPhotoUrl = uploadedPhotoUrl && !photoFailed
    ? uploadedPhotoUrl
    : getProfileDisplayPhoto(profile.photos, profile.user?.gender, profile.user?._id);

  if (hidden) return null;

  return (
    <Link
      to={isLocked ? "/pricing" : `/profile/${profile.user._id}`}
      onClick={(e) => {
        if (isLocked) return;
        if (!guardBrowse()) {
          e.preventDefault();
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/50"
    >
      {/* PHOTO PORTRAIT CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <img
          src={finalPhotoUrl}
          alt={profile.user?.fullName || "Member"}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
            isLocked ? "blur-md scale-105" : ""
          }`}
          onError={() => setPhotoFailed(true)}
        />

        {/* Gradient Overlay for Text Legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* TOP OVERLAYS */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5">
            {!isLocked && profile.user?.isProfileVerified && (
              <VerifiedBadge verified={profile.user.isProfileVerified} size="sm" />
            )}
          </div>

          {!isLocked && (
            <ReportBlockMenu
              targetUserId={profile.user._id}
              targetUserName={profile.user.fullName}
              onBlocked={() => setHidden(true)}
              className="rounded-full bg-stone-900/40 p-1.5 text-white backdrop-blur-md hover:bg-stone-900/70"
            />
          )}
        </div>

        {/* OVERLAY TEXT (NAME, AGE & LOCATION) */}
        <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-xs truncate">
              {isLocked ? "Premium Member" : profile.user?.fullName}
            </h3>

            {age && !isLocked && (
              <span className="shrink-0 text-xs font-semibold text-stone-200 bg-stone-900/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                {age} yrs
              </span>
            )}
          </div>

          {!isLocked && (
            <div className="mt-1 flex items-center gap-1 text-xs text-stone-300 font-medium">
              <MapPin size={13} className="text-amber-400 shrink-0" />
              <span>{profile.district ? `${profile.district}, HP` : "Himachal Pradesh"}</span>
            </div>
          )}
        </div>

        {/* LOCK STATE OVERLAY */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-stone-950/60 p-4 text-center text-white backdrop-blur-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-500/90 to-amber-700/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              <Crown size={12} className="fill-current text-amber-200" /> Premium Profile
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-stone-200">
              <Lock size={14} className="text-amber-400" /> Upgrade Membership to Unlock
            </div>
          </div>
        )}
      </div>

      {/* CARD BOTTOM ACTION FOOTER */}
      <div className="flex items-center justify-between gap-2 p-4 bg-white border-t border-stone-100">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          {isLocked ? "Exclusive Match" : "Verified Member"}
        </span>
      </div>
    </Link>
  );
};
