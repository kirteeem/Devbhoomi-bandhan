import { BadgeCheck } from "lucide-react";

/**
 * The single, consistent "Blue Tick" verified indicator — used everywhere a
 * member's name/photo appears (search results, match cards, profile page,
 * visitors, messages, shortlists, profile preview, dashboard,
 * admin panel). Previously every one of those places had its own
 * hand-rolled badge in a different color (forest green, gold, emerald) —
 * this replaces all of them with one component so "verified" always looks
 * the same, the way it does on Instagram/LinkedIn/X.
 *
 * Renders nothing at all when `verified` is false/undefined — callers don't
 * need to guard with `{user.isProfileVerified && <VerifiedBadge />}`
 * themselves, though doing so is harmless.
 */
export const VerifiedBadge = ({
  verified,
  size = "md",
  withLabel = false,
  className = "",
}: {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
  className?: string;
}) => {
  if (!verified) return null;

  const iconSize = size === "sm" ? 12 : size === "lg" ? 18 : 14;

  if (!withLabel) {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-[#1D9BF0] text-white ${className}`}
        style={{ padding: size === "sm" ? 1 : 2 }}
        title="Verified profile"
        aria-label="Verified profile"
      >
        <BadgeCheck size={iconSize} fill="#1D9BF0" strokeWidth={2.5} className="text-white" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#1D9BF0]/10 px-2 py-0.5 text-[10px] font-bold text-[#1D9BF0] ${className}`}
      title="Verified profile"
    >
      <BadgeCheck size={iconSize} fill="#1D9BF0" strokeWidth={2.5} className="text-white" />
      Verified
    </span>
  );
};
