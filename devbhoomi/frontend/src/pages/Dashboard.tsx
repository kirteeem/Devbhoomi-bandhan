import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Eye, 
  UserRound, 
  MapPin, 
  TrendingUp,
  ExternalLink,
  Unlock,
  Lock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useProfileGate } from "../context/ProfileGateContext";
import { resolvePhotoUrl, buildDefaultAvatar } from "../lib/media";
import { getFriendlyErrorMessage } from "../lib/errorMessage";
import { VerifyPhoneBanner } from "../components/dashboard/VerifyPhoneBanner";
import { GetVerifiedBanner } from "../components/ui/GetVerifiedBanner";
import { VerifiedBadge } from "../components/ui/VerifiedBadge";
import type { Profile as ProfileType } from "../types";

interface DashboardSummary {
  stats: {
    newMatchesCount: number;
    totalVisitorsCount: number;
    freeUnlocksRemaining: number;
  };
  myProfile: Omit<ProfileType, 'photos'> & {
    quota: {
      profileViewsRemaining: number | null;
      kundaliMatchesRemaining: number;
      freeUnlocksRemaining: number;
    };
    photos?: Array<{
      id: string;
      url: string;
      isProfilePhoto: boolean;
      verticalOffset?: number;
    }>;
  };
  subscription: {
    isPremium: boolean;
    planName?: string;
  };
  suggestions: ProfileType[];
}

const greetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } }
};

const calcAge = (dob?: string) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

const formatHeight = (cm?: number) => {
  if (!cm) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
};

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { guardBrowse } = useProfileGate();
  // Admins/priests have their own dedicated dashboard — this one is built
  // for members browsing matches, not for reviewing verification queues.
  const isStaff = user?.role === "admin" || user?.role === "priest";

  const { data: dashboardData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const response = await api.get("/dashboard/summary");
      return response.data.data as DashboardSummary;
    },
    retry: 1,
    enabled: !isStaff,
  });

  const metrics = dashboardData?.stats;
  const myProfile = dashboardData?.myProfile;
  const suggested = dashboardData?.suggestions;
  const isPremium = Boolean(dashboardData?.subscription?.isPremium);
  const planName = dashboardData?.subscription?.planName;
  const freeUnlocksRemaining = metrics?.freeUnlocksRemaining ?? 0;
  const partnerPref = myProfile?.partnerPreference;

  const stats = [
    { 
      label: t("dashboard.newMatches"), 
      value: metrics?.newMatchesCount ?? 0, 
      icon: Users, 
      desc: "Matching preferences", 
      trend: `${metrics?.newMatchesCount ?? 0} found`, 
      to: "/matches" 
    },
    { 
      label: "Profile Visitorsssss", 
      value: metrics?.totalVisitorsCount ?? 0, 
      icon: Eye, 
      desc: "Viewed your profile", 
      trend: isPremium ? "Full history" : "Upgrade to view", 
      to: "/visitors" 
    },
    {
      label: "Free Unlocks Left",
      value: isPremium ? "∞" : freeUnlocksRemaining,
      icon: Unlock,
      desc: "Full profile unlocks",
      trend: isPremium ? "Unlimited (Premium)" : freeUnlocksRemaining > 0 ? "Available" : "Upgrade for more",
      to: "/matches",
    },
  ];

  const isVerified = Boolean(user?.isProfileVerified);

  // --- LOGGED IN USER AVATAR SANITIZATION ---
  const myGenderNormalized = (user?.gender || myProfile?.gender || "").toLowerCase();
  const myNameLower = (user?.fullName || "").toLowerCase();
  const isMyProfileFemale = 
    myGenderNormalized === "female" || 
    myGenderNormalized === "f" || 
    myNameLower.includes("devi") || 
    myNameLower.includes("kumari");

  const fallbackMyAvatar = buildDefaultAvatar(isMyProfileFemale ? "female" : "male", user?.id);

  const primaryPhoto = myProfile?.photos?.find((p) => p.isProfilePhoto) ?? myProfile?.photos?.[0];
  
  // Ignore backend fallback strings for current user if they match common generic filenames
  const isMyPhotoGeneric = primaryPhoto?.url && (
    primaryPhoto.url.includes("default") || 
    primaryPhoto.url.includes("avatar") || 
    primaryPhoto.url.includes("placeholder")
  );

  const uploadedPhotoUrl = (primaryPhoto?.url && !isMyPhotoGeneric) ? resolvePhotoUrl(primaryPhoto.url) : null;
  
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    setPhotoFailed(false);
  }, [uploadedPhotoUrl]);

  const getMyAvatarUrl = () => {
    if (uploadedPhotoUrl && !photoFailed) {
      return uploadedPhotoUrl;
    }
    return fallbackMyAvatar;
  };

  const finalMyPhotoUrl = getMyAvatarUrl();

  const partnerPrefRows = [
    { label: "Age Bracket", value: partnerPref?.ageMin || partnerPref?.ageMax ? `${partnerPref?.ageMin ?? "18"} - ${partnerPref?.ageMax ?? "60"} Years` : "Not set" },
    { label: "Location", value: partnerPref?.districts?.length ? partnerPref.districts.join(", ") : "Any district" },
    { label: "Education", value: partnerPref?.education?.length ? partnerPref.education.join(" / ") : "Not set" },
    { label: "Marital Status", value: partnerPref?.maritalStatus?.length ? partnerPref.maritalStatus.join(", ") : "Any" },
  ];

  if (isStaff) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1A1A1A] antialiased">
      {/* Top Bar */}
      <div className="border-b border-[#ECE8E2] bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7B1E3D]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#2E6F57]"></span>
            DevBhoomi Bandhan: Trustworthy & Verified Himachali Community Matrimony
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <VerifyPhoneBanner />
        <GetVerifiedBanner isProfileVerified={isVerified} className="mb-6" />
        {/* --- HERO SECTION --- */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12 flex flex-col gap-8 rounded-[20px] border border-[#ECE8E2] bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1A1A1A]">
              {t(`dashboard.${greetingKey()}`)}, {user?.fullName?.split(" ")[0] || "Member"} 👋
            </h1>
            <p className="max-w-xl text-sm font-medium text-neutral-500 leading-relaxed">
              Welcome back to DevBhoomi Bandhan. We discovered{" "}
              <span className="text-[#7B1E3D] font-semibold">
                {metrics?.newMatchesCount ?? 0} highly compatible matches
              </span>{" "}
              living within or matching your preferred Himachali districts today.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link 
                to="/matches" 
                onClick={(e) => { if (!guardBrowse()) e.preventDefault(); }}
                className="rounded-xl bg-[#7B1E3D] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#631831] hover:shadow-md"
              >
                Browse Matches
              </Link>
              <Link to="/profile/create" className="rounded-xl border border-[#ECE8E2] bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:bg-[#FAF8F5]">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* User Meta Panel */}
          <div className="flex items-center gap-6 rounded-2xl border border-[#ECE8E2] bg-[#FAF8F5]/50 p-4 transition-all duration-300 hover:border-[#7B1E3D]/20 hover:bg-white hover:shadow-sm sm:min-w-[280px]">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#7B1E3D]/20 bg-white ring-4 ring-black/5 flex items-center justify-center">
              <img 
                src={finalMyPhotoUrl} 
                alt={user?.fullName || "Profile"} 
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
                style={{
                  objectPosition: `center ${primaryPhoto?.verticalOffset ?? 50}%`
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackMyAvatar;
                }}
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2E6F57] shadow-sm" />
            </div>
            
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display text-base font-bold text-[#1A1A1A] truncate">{user?.fullName || "Member"}</h3>
                <VerifiedBadge verified={isVerified} size="sm" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-neutral-600">
                <MapPin size={13} className="text-[#7B1E3D] shrink-0" />
                <span className="truncate">{myProfile?.district || "Himachal Pradesh"}</span>
              </div>
              <div className="pt-1">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isPremium ? "bg-[#7B1E3D]/10 text-[#7B1E3D]" : "bg-neutral-200/60 text-neutral-600"
                }`}>
                  {isPremium ? (planName || "Premium") : "Free Member"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- STATS CARDS GRID --- */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s, index) => (
            <Link 
              key={index} 
              to={s.to} 
              className="group rounded-[20px] border border-[#ECE8E2] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-neutral-400 transition-colors group-hover:text-[#7B1E3D]">
                  <s.icon size={18} strokeWidth={1.75} />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-[#2E6F57]">
                  <TrendingUp size={10} />
                  <span>{s.trend}</span>
                </div>
              </div>
              <div className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1A1A1A]">{s.value}</div>
              <div className="mt-1 text-xs font-bold text-neutral-800">{s.label}</div>
              <div className="mt-0.5 text-[10px] text-neutral-400">{s.desc}</div>
            </Link>
          ))}
        </motion.div>

        {/* --- BOTTOM GRID CORES --- */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-[#ECE8E2]/60 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1A1A1A]">{t("dashboard.suggested")}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Handpicked prospective partners matching preferences</p>
                </div>
                <Link to="/matches" className="group/link text-xs font-bold text-[#7B1E3D] flex items-center gap-1">
                  View All <ExternalLink size={12} className="transition-transform duration-200 group-hover/link:translate-x-0.5" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-[20px] border border-[#ECE8E2] bg-white p-5 space-y-4 animate-pulse">
                      <div className="aspect-square w-full rounded-xl bg-neutral-100" />
                      <div className="h-4 w-2/3 bg-neutral-200 rounded" />
                      <div className="h-8 bg-neutral-50 rounded-xl" />
                    </div>
                  ))
                ) : isError ? (
                  <div className="col-span-2 flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-[#ECE8E2] bg-white p-8 text-center">
                    <AlertTriangle size={20} className="text-[#7B1E3D]" />
                    <p className="max-w-sm text-xs font-medium text-neutral-500">
                      {getFriendlyErrorMessage(error, "We couldn't load your dashboard right now. Please check your connection and try again.")}
                    </p>
                    <button
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B1E3D] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#631831] disabled:opacity-60"
                    >
                      <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} /> Try Again
                    </button>
                  </div>
                ) : suggested && suggested.length > 0 ? (
                  suggested.slice(0, 4).map((p) => {
                    const rawPhotoUrl = p.photos?.find((ph) => ph.isProfilePhoto)?.url || p.photos?.[0]?.url;
                    const age = calcAge(p.dateOfBirth);
                    const height = formatHeight(p.heightCm);
                    const isLocked = Boolean(p.isLocked) && !isPremium;

                    // --- ROBUST FRONTEND INTERCEPTOR FOR GENDER ---
                    const genderNormalized = (p.gender || p.user?.gender || "").toLowerCase();
                    const nameLower = (p.user?.fullName || "").toLowerCase();
                    const isSuggestFemale = 
                      genderNormalized === "female" || 
                      genderNormalized === "f" || 
                      nameLower.includes("devi") || 
                      nameLower.includes("kumari");

                    const fallbackSuggestAvatar = buildDefaultAvatar(isSuggestFemale ? "female" : "male", p.user?._id);

                    // Detect if the backend is trying to serve a hardcoded generic system fallback asset string
                    const isPhotoGenericPlaceholder = rawPhotoUrl && (
                      rawPhotoUrl.includes("default") || 
                      rawPhotoUrl.includes("avatar") || 
                      rawPhotoUrl.includes("placeholder")
                    );

                    // Drop the backend URL if it isn't an actual custom photo upload
                    const resolvedSuggestPhoto = (rawPhotoUrl && !isPhotoGenericPlaceholder) 
                      ? resolvePhotoUrl(rawPhotoUrl) 
                      : null;

                    const initialAvatarUrl = resolvedSuggestPhoto || fallbackSuggestAvatar;

                    return (
                      <div key={p._id} className="group overflow-hidden rounded-[20px] border border-[#ECE8E2] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50">
                          <img
                            src={initialAvatarUrl}
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isLocked ? "blur-md scale-105" : ""}`}
                            alt={p.user?.fullName || "Profile"}
                            onError={(e) => {
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = fallbackSuggestAvatar;
                            }}
                          />
                          <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#2E6F57] shadow-sm">
                            {p.compatibilityScore ?? 50}% Match
                          </div>
                          {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-center">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                                <Lock size={16} className="text-[#7B1E3D]" />
                              </div>
                              <Link
                                to="/pricing"
                                className="rounded-lg bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#7B1E3D] shadow-sm hover:bg-white"
                              >
                                Upgrade to view
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="pt-4">
                          <h3 className={`font-display font-bold text-sm truncate group-hover:text-[#7B1E3D] ${isLocked ? "blur-sm select-none" : ""}`}>{p.user?.fullName}</h3>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-500">
                            <span className="flex items-center gap-1"><UserRound size={12} />{age ? `${age} Yrs` : ""}, {height}</span>
                            <span className="flex items-center gap-1 text-[#7B1E3D]"><MapPin size={12} />{p.district || "Himachal"}</span>
                          </div>
                          <div className="mt-5 grid grid-cols-2 gap-2">
                            {isLocked ? (
                              <Link to="/subscription" className="col-span-2 rounded-xl bg-[#7B1E3D] py-2 text-center text-xs font-semibold text-white">
                                Unlock with Premium
                            </Link>
                            ) : (
                              <Link to={`/profile/${p.user?._id}`} className="col-span-2 rounded-xl border text-center py-2 text-xs font-semibold">View Profile</Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 p-8 text-center text-xs text-neutral-400">No suggestions right now.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <div className="rounded-[20px] border border-[#ECE8E2] bg-white p-6">
              <h3 className="font-display text-sm font-bold text-[#1A1A1A] mb-4">Partner Preferences</h3>
              <ul className="space-y-2.5 text-xs text-neutral-600">
                {partnerPrefRows.map((row) => (
                  <li key={row.label} className="flex justify-between border-b border-[#FAF8F5] py-1">
                    <span className="text-neutral-400">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};