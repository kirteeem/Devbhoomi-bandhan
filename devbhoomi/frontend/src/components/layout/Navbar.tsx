import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import {
  Crown, X, Menu, LayoutDashboard, UserRound, Heart,
  Settings, LogOut, Sparkles, ChevronRight, Home, Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyProfile } from "../../lib/profileApi";
import { resolvePhotoUrl, getDisplayPhoto } from "../../lib/media";
import type { ProfilePhoto } from "../../types/wizard";
import { Button } from "../ui/Button";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBell } from "./NotificationBell";

const Logo = new URL("../../assets/logo.jpeg", import.meta.url).href;

export const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const isFrontPage = location.pathname === "/";
  const isPremiumUser = Boolean(user?.isPremium);

  // Fetch full profile data to resolve the exact avatar image URL
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: !!user,
    staleTime: 60_000,
  });

  const primaryPhoto =
    profile?.photos?.find((p: ProfilePhoto) => p.isProfilePhoto) ||
    profile?.photos?.[0];

  const uploadedPhotoUrl = primaryPhoto ? resolvePhotoUrl(primaryPhoto.url) : undefined;
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [uploadedPhotoUrl]);

  const finalPhotoUrl =
    uploadedPhotoUrl && !photoFailed
      ? uploadedPhotoUrl
      : getDisplayPhoto(null, user?.gender || profile?.gender, user?.id);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);

    if (latest <= 30) {
      setIsVisible(true);
      lastScrollY.current = latest;
      return;
    }

    if (latest > lastScrollY.current + 8) {
      setIsVisible(false);
    } else if (latest < lastScrollY.current - 8) {
      setIsVisible(true);
    }

    lastScrollY.current = latest;
  });

  const isSolid = scrolled || !isFrontPage;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubscriptionClick = () => {
    setOpen(false);
    if (!user) {
      navigate("/login");
      return;
    }
    isPremiumUser ? navigate("/profile/billing") : navigate("/pricing");
  };

  const desktopLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/matches", label: t("nav.matches") },
    { to: "/kundali", label: t("nav.kundali") },
    { to: "/success-stories", label: t("nav.stories") },
  ];

  // Clean, focused mobile navigation items
  const mobileNavItems = [
    { icon: Home, label: t("nav.home", "Home"), path: "/" },
    { icon: Users, label: t("nav.matches", "Matches"), path: "/matches" },
    { icon: Sparkles, label: t("nav.kundali", "Free Kundali"), path: "/kundali" },
    { icon: Heart, label: "Shortlisted Profiles", path: "/shortlist" },
    ...(user
      ? [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: UserRound, label: "My Profile", path: `/profile/${user.id}` },
          { icon: Settings, label: "Settings", path: "/settings" },
        ]
      : []),
  ];

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 w-full transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isSolid
            ? "bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        {/* Container: Max width with min-height instead of fixed pixel heights so zoomed text scales naturally */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between min-h-[4.5rem] px-4 sm:px-6 lg:px-8 py-2">
          
          {/* 1. BRAND LOGO SECTION */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/10 shadow-sm flex items-center justify-center">
              <img 
                src={Logo} 
                alt="Devbhoomi Bandhan Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center leading-snug">
              <span className={`font-serif text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-300 ${
                isSolid ? "text-[#241F1C]" : "text-white drop-shadow-md"
              }`}>
                देवभूमि बंधन
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                isSolid ? "text-[#241F1C]/60" : "text-zinc-200 drop-shadow-sm"
              }`}>
                Devbhoomi Bandhan
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP NAV LINKS (Scalable Gap & Responsive Layout) */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 shrink-0">
            {desktopLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group relative inline-flex flex-col items-center py-1 text-sm font-bold tracking-wide transition-colors duration-300 ${
                    isActive
                      ? isSolid ? "text-[#241F1C]" : "text-white drop-shadow-sm"
                      : isSolid ? "text-[#241F1C]/70 hover:text-[#241F1C]" : "text-white/85 hover:text-white drop-shadow-sm"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className={`h-[2px] bg-[#A9792C] transition-all duration-300 ease-out mt-0.5 rounded-full ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 3. RIGHT ACTIONS (Desktop Buttons & Mobile Drawer Trigger) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {!isPremiumUser && (
              <button
                onClick={handleSubscriptionClick}
                className={`hidden md:inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ${
                  isSolid 
                    ? "bg-[#A9792C] text-white hover:bg-[#8e6423] shadow-sm"
                    : "bg-amber-500 text-zinc-950 hover:bg-amber-400 font-extrabold shadow-md"
                }`}
              >
                <Crown className="h-3.5 w-3.5 fill-current shrink-0" />
                <span>{t("nav.upgrade", "Go Premium")}</span>
              </button>
            )}

            {/* Notification Bell */}
            {user && (
              <div className="flex items-center shrink-0">
                <NotificationBell isSolid={isSolid} />
              </div>
            )}

            {/* Desktop User Profile Controls */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {user ? (
                <UserProfileMenu variant="desktop" />
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className={`px-3 py-1.5 text-sm font-bold transition-colors duration-300 ${
                      isSolid ? "text-[#241F1C]/80 hover:text-[#241F1C]" : "text-white/90 hover:text-white drop-shadow-sm"
                    }`}
                  >
                    {t("nav.login")}
                  </button>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/signup")}
                    className="!rounded-xl !bg-[#6B1F2A] px-4 py-2 text-sm font-bold !text-white shadow-none transition-colors duration-300 hover:!bg-[#591824]"
                  >
                    {t("nav.signup")}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              type="button"
              className={`flex md:hidden items-center justify-center h-10 w-10 rounded-xl transition-all active:scale-95 shrink-0 ${
                isSolid 
                  ? "bg-stone-100 text-[#241F1C] hover:bg-stone-200" 
                  : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
              }`}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* LUXURY MOBILE DRAWER PANEL */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <div className="md:hidden">
              {/* Overlay Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
              />

              {/* Drawer Container Panel */}
              <motion.div
                key="mobile-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                className="fixed inset-y-0 right-0 z-[9999] flex h-full w-4/5 max-w-xs flex-col justify-between bg-[#0F1E19] text-white p-5 shadow-2xl overflow-y-auto border-l border-white/10"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
                      <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                    </span>
                    <div>
                      <h2 className="font-serif text-sm font-extrabold tracking-tight text-white">
                        देवभूमि बंधन
                      </h2>
                      <p className="text-[8px] font-bold tracking-widest text-[#D4AF37] uppercase">
                        Devbhoomi Bandhan
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info Header Card */}
                {user ? (
                  <div 
                    onClick={() => go(`/profile/${user.id}`)}
                    className="my-3 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 border border-white/10 backdrop-blur-md cursor-pointer active:scale-[0.98] transition-all shrink-0"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#D4AF37]/80 bg-stone-900 shadow-md">
                      <img
                        src={finalPhotoUrl}
                        alt={user.fullName || "User"}
                        className="h-full w-full object-cover"
                        onError={() => setPhotoFailed(true)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-serif text-sm font-semibold text-white">
                        {user.fullName || "Member"}
                      </h3>
                      <p className="truncate text-xs text-stone-400">{user.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  </div>
                ) : null}

                {/* Vertical Navigation List */}
                <nav className="flex-1 my-3 flex flex-col justify-center space-y-1">
                  {mobileNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => go(item.path)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30"
                            : "text-stone-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#D4AF37]" : "text-stone-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-40 shrink-0 ${isActive ? "text-[#D4AF37] opacity-100" : ""}`} />
                      </button>
                    );
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-white/10 space-y-2.5 shrink-0">
                  {!isPremiumUser && (
                    <button
                      onClick={handleSubscriptionClick}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CD7A] to-[#D4AF37] text-xs font-extrabold uppercase tracking-wider text-stone-950 shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Crown className="h-4 w-4 fill-current shrink-0" />
                      <span>{t("nav.upgrade", "Go Premium")}</span>
                    </button>
                  )}

                  {user ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        logout().then(() => navigate("/"));
                      }}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 active:scale-[0.98] transition-all"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate("/login");
                        }}
                        className="flex h-10 items-center justify-center rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10"
                      >
                        {t("nav.login")}
                      </button>
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate("/signup");
                        }}
                        className="flex h-10 items-center justify-center rounded-xl bg-[#6B1F2A] text-xs font-bold text-white shadow-md hover:bg-[#591824]"
                      >
                        {t("nav.signup")}
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};