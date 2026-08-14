import { Link } from "react-router-dom";
import { ShieldQuestion, ArrowRight } from "lucide-react";

/**
 * A dismiss-free nudge shown to unverified members, pointing them straight
 * at Settings → Verify My Profile (the actual Aadhaar/PAN upload form —
 * see components/ui/VerifyMyProfileSection.tsx). Renders nothing once the
 * member is verified, so it's safe to drop into any page unconditionally.
 *
 * NOTE: this deliberately links to /settings, not the admin panel — members
 * don't have access to the admin panel (that's reviewer-only); this button
 * takes them to the one place they CAN act: the upload form itself.
 */
export const GetVerifiedBanner = ({
  isProfileVerified,
  verificationStatus,
  className = "",
}: {
  isProfileVerified?: boolean;
  /** Pass the latest request status if you already have it, to tailor the copy. */
  verificationStatus?: "pending" | "rejected" | null;
  className?: string;
}) => {
  if (isProfileVerified) return null;

  const copy =
    verificationStatus === "pending"
      ? "Your document is being reviewed — we'll email you as soon as it's checked."
      : verificationStatus === "rejected"
        ? "Your last submission wasn't approved. Upload a clearer document to get your Blue Tick."
        : "Get a Blue Verified Badge on your profile. Upload your Aadhaar or PAN card — takes less than a minute.";

  const ctaLabel = verificationStatus === "pending" ? "View status" : "Verify My Profile";

  return (
    <div
      className={`flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#1D9BF0]/20 bg-[#1D9BF0]/5 px-4 py-3.5 sm:flex-row sm:items-center ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <ShieldQuestion size={18} className="mt-0.5 flex-shrink-0 text-[#1D9BF0]" />
        <p className="text-xs font-semibold text-slate-700 sm:text-[13px]">{copy}</p>
      </div>
      <Link
        to="/settings#verify-my-profile"
        className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-[#1D9BF0] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1a8cd8]"
      >
        {ctaLabel} <ArrowRight size={13} />
      </Link>
    </div>
  );
};
