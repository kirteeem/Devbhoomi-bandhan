import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown, LayoutDashboard, UserRound, Pencil, HeartHandshake,
  Settings, LogOut, BadgeCheck, Bookmark, Bell, Receipt, Crown, Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyProfile } from "../../lib/profileApi";
import { resolvePhotoUrl, getDisplayPhoto } from "../../lib/media";
import type { ProfilePhoto } from "../../types/wizard";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface UserProfileMenuProps {
  variant?: "desktop" | "mobile";
}

export const UserProfileMenu = ({ variant = "desktop" }: UserProfileMenuProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: !!user,
    staleTime: 60_000,
  });
  

  useEffect(() => {
    if (variant === "mobile") return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant]);

  useEffect(() => {
    if (variant === "mobile") return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [variant]);

  if (!user) return null;

  // 1. Resolve uploaded photo if it exists
  const primaryPhoto =
    profile?.photos?.find((p: ProfilePhoto) => p.isProfilePhoto) ||
    profile?.photos?.[0];

  const uploadedPhotoUrl = primaryPhoto ? resolvePhotoUrl(primaryPhoto.url) : undefined;

  // 2. Track layout-breaking images (404s, expired tokens, etc.)
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    setPhotoFailed(false);
  }, [uploadedPhotoUrl]);

  // 3. Fallback: reliable auto-generated avatar (never a broken image link)
  const getAvatarUrl = () => {
    if (uploadedPhotoUrl && !photoFailed) {
      return uploadedPhotoUrl;
    }
    const gender = user?.gender || profile?.gender;
    return getDisplayPhoto(null, gender, user?.id);
  };

  const finalPhotoUrl = getAvatarUrl();
  

  const friendlyId = profile?.user?.profileCode ? `ID: ${profile.user.profileCode}` : "—";

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };
 

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", action: () => go("/dashboard") },
    { icon: UserRound, label: "My Profile", action: () => go(`/profile/${user.id}`) },
    { icon: Pencil, label: "Edit Profile", action: () => go("/profile/create") },
    { icon: HeartHandshake, label: "Matches", action: () => go("/matches") },
    { icon: Sparkles, label: "Free Kundali Match", action: () => go("/kundali") },
    { icon: Bookmark, label: "Shortlisted Profiles", action: () => go("/shortlist") },
    { icon: Bell, label: "Notifications", action: () => go("/notifications") },
    { icon: Crown, label: "Subscription", action: () => go("/pricing") },
    { icon: Receipt, label: "Payment History", action: () => go("/payments/history") },
    { icon: Settings, label: "Settings", action: () => go("/settings") },
    ...(user.role === "admin" || user.role === "priest"
      ? [{ icon: BadgeCheck, label: "Admin Panel", action: () => go("/admin") }]
      : []),
  ];

  // Elegant luxury header design
  const ProfileHeader = () => (
    <div className="bg-gradient-to-br from-[#0F241D] via-[#163329] to-[#0A1A15] p-5 text-white">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#D4AF37]/50 bg-white/5 ring-4 ring-black/10">
          <img
            src={finalPhotoUrl}
            alt={user.fullName}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setPhotoFailed(true)}
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-serif text-base font-medium tracking-wide text-white/95">{user.fullName}</p>
            {user.isProfileVerified && <VerifiedBadge verified size="sm" />}
          </div>
          <p className="text-[11px] font-mono tracking-wider text-white/50">{friendlyId}</p>
        </div>
      </div>

      <div className="mt-4 pt-1">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium tracking-wide text-white/60">
          <span>Profile Completion</span>
          <span className="font-mono text-[#E8CD7A]">{user.profileCompletion}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user.profileCompletion}%` }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8CD7A] to-[#D4AF37]"
          />
        </div>
      </div>
    </div>
  );

  // --- MOBILE SIDEBAR LAYOUT VARIANT ---
  if (variant === "mobile") {
    return (
      <div className="w-full flex flex-col overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm">
        <ProfileHeader />
        <div className="py-2 bg-stone-50/50">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-3.5 px-5 py-3 text-left text-[14px] font-medium text-stone-700 transition-all active:bg-stone-100"
            >
              <item.icon size={17} className="text-stone-400" />
              {item.label}
            </button>
          ))}
          <div className="mt-2 border-t border-stone-200/60 pt-2">
            <button
              onClick={() => logout().then(() => navigate("/"))}
              className="flex w-full items-center gap-3.5 px-5 py-3 text-left text-[14px] font-semibold text-rose-700 active:bg-rose-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PREMIUM DESKTOP DROP DOWN VARIANT ---
  return (
    <div ref={rootRef} className="relative z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] p-1.5 pr-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12] hover:border-white/20 group"
      >
        <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/40 bg-stone-900 text-sm font-semibold text-white shadow-inner">
          <img 
            src={finalPhotoUrl} 
            alt={user.fullName} 
            className="h-full w-full object-cover" 
            onError={() => setPhotoFailed(true)} 
          />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B1511] bg-emerald-500 animate-pulse" />
        </span>
        <motion.span 
          animate={{ rotate: open ? 180 : 0 }} 
          transition={{ duration: 0.2, ease: "easeInOut" }} 
          className="hidden text-white/70 group-hover:text-white/90 sm:block"
        >
          <ChevronDown size={15} strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+12px)] w-[285px] origin-top-right overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"
          >
            <ProfileHeader />

            {/* Navigation links with refined list interactions */}
            <div className="p-1.5 bg-white">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={item.action}
                  className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[13.5px] font-medium text-stone-600 transition-all duration-200 hover:bg-stone-50 hover:text-stone-900 hover:translate-x-0.5"
                >
                  <item.icon size={16} className="text-stone-400 transition-colors group-hover:text-stone-600" strokeWidth={2} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Signout container footer */}
            <div className="border-t border-stone-100 p-1.5 bg-stone-50/60">
              <button
                role="menuitem"
                onClick={() => { setOpen(false); logout().then(() => navigate("/")); }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[13.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut size={16} strokeWidth={2} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};