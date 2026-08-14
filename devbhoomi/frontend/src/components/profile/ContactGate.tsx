import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Phone, Mail, MapPin, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchContactDetails } from "../../lib/profileApi";
import { resolvePhotoUrl, buildDefaultAvatar } from "../../lib/media";
import { LockedDetailsCard } from "./LockedDetailsCard";

interface Props {
  userId: string;
  unlocked: boolean;
  gender?: string;
  freeUnlocksRemaining: number;
  planUnlocksRemaining?: number;
  isPremium?: boolean;
  onUnlockClick: () => void;
}

export const ContactGate = ({
  userId,
  unlocked,
  gender = "",
  freeUnlocksRemaining,
  planUnlocksRemaining = 0,
  isPremium = false,
  onUnlockClick,
}: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["contact-details", userId],
    queryFn: () => fetchContactDetails(userId),
    enabled: !!userId && unlocked,
  });

  if (!unlocked) {
    return (
      <LockedDetailsCard
        freeUnlocksRemaining={freeUnlocksRemaining}
        planUnlocksRemaining={planUnlocksRemaining}
        isPremium={isPremium}
        onUnlockClick={onUnlockClick}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 size={24} className="animate-spin text-[#6B1F2A]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Fetching Unlocked Information...
          </span>
        </div>
      </div>
    );
  }

  const getAvatarUrl = () => {
    const anyRawPhoto = (data as any)?.contact?.photo || (data as any)?.photo;
    const isPhotoGeneric =
      anyRawPhoto &&
      (anyRawPhoto.includes("default") || anyRawPhoto.includes("avatar") || anyRawPhoto.includes("placeholder"));

    if (anyRawPhoto && !isPhotoGeneric) {
      return resolvePhotoUrl(anyRawPhoto);
    }
    return buildDefaultAvatar(gender, userId);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-emerald-50/60 px-4 sm:px-6 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          Direct Access Unlocked
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
          <ShieldCheck size={14} className="text-amber-600 shrink-0" /> Verified Member
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4 w-full">
        <div className="flex items-center gap-3.5 rounded-xl bg-stone-50 p-3 sm:p-4 border border-stone-200/60 w-full min-w-0">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-300">
            <img
              src={avatarUrl}
              alt="Member Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = buildDefaultAvatar(gender, userId);
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-base font-bold text-stone-900 truncate">
              Contact Information
            </h3>
            <p className="text-xs text-stone-500 truncate">
              Direct communication channels for this verified profile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {data?.contact?.phone && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 min-w-0 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6B1F2A]/10 text-[#6B1F2A]">
                <Phone size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                  Phone Number
                </span>
                <span className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                  {data.contact.phone}
                </span>
              </div>
            </div>
          )}

          {data?.contact?.email && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 min-w-0 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6B1F2A]/10 text-[#6B1F2A]">
                <Mail size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                  Email Address
                </span>
                <span className="font-semibold text-stone-900 text-xs sm:text-sm truncate break-all">
                  {data.contact.email}
                </span>
              </div>
            </div>
          )}

          {data?.contact?.address && (
            <div className="flex items-start gap-3 rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 sm:col-span-2 min-w-0 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6B1F2A]/10 text-[#6B1F2A] mt-0.5">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                  Location Details
                </span>
                <span className="font-semibold text-stone-900 text-xs sm:text-sm leading-relaxed break-words">
                  {data.contact.address}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-1">
          <Link
            to="/kundali"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B1F2A] px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#541821]"
          >
            <Sparkles size={16} className="text-amber-300 shrink-0" />
            <span className="truncate">Request Kundali Match</span>
            <ArrowRight size={15} className="text-white/70 shrink-0" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
};