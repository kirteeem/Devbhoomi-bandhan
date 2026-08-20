import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, GraduationCap, Home, Heart, Moon, ArrowLeft, Sparkles, Loader2,
  CheckCircle2, MapPin, Briefcase, ShieldCheck
} from "lucide-react";
import { api } from "../lib/axios";
import { unlockProfile } from "../lib/profileApi";
import { getProfileDisplayPhoto, buildDefaultAvatar } from "../lib/media";
import { AboutSection } from "../components/profile/AboutSection";
import { ProfileGallery } from "../components/profile/ProfileGallery";
import { UnlockProfileModal } from "../components/profile/UnlockProfileModal";
import { ContactGate } from "../components/profile/ContactGate";
import { ReportBlockMenu } from "../components/profile/ReportBlockMenu";
import type { Profile } from "../types";

interface ProfileViewResponse {
  profile: Profile;
  restrictedView: boolean;
  isOwnProfile: boolean;
  isShortlisted: boolean;
  profileViewsRemaining: number | null;
  detailsUnlocked: boolean;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
  viewerIsPremium: boolean;
}

export const ProfilePreview = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4500);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => (await api.get<{ data: ProfileViewResponse }>(`/profiles/${userId}`)).data.data,
    enabled: !!userId,
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockProfile(userId as string),
    onSuccess: (result) => {
      setUnlockModalOpen(false);
      setUnlockError("");
      showToast(result.message || "Contact details unlocked!");
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["contact-details", userId] });
    },
    onError: (err: any) => {
      setUnlockError(err?.response?.data?.message || "Could not unlock this profile. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#6B1F2A]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Loading Profile Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] px-4 text-center font-sans">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm max-w-sm w-full space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#6B1F2A]">
            <User size={24} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 tracking-wide">Profile Not Found</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            The profile you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/matches")}
            className="w-full rounded-xl bg-[#6B1F2A] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#591824]"
          >
            Explore Matches
          </button>
        </div>
      </div>
    );
  }

  const { profile, isOwnProfile, detailsUnlocked, freeUnlocksRemaining, planUnlocksRemaining, viewerIsPremium } = data;

  // Until this profile is unlocked (free unlock or a Premium credit), the
  // API only ever returns a small preview slice —
  // name, age, height, community, religion, marital status. Everything
  // else (photos, about me, education/career, family, lifestyle,
  // horoscope, partner preferences) is hidden by the backend itself, not
  // just visually, so this flag drives which sections even attempt to render.
  const showFull = isOwnProfile || detailsUnlocked;

  const userMainImage = getProfileDisplayPhoto(profile.photos, (profile as any).user?.gender, profile.user?._id);
  const userCombinedName =
    (profile as any).user?.fullName ||
    (profile as any).fullName ||
    `${(profile as any).firstName || ""} ${(profile as any).lastName || ""}`.trim() ||
    "Verified Member";

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans antialiased text-stone-800 selection:bg-[#6B1F2A]/10 selection:text-[#6B1F2A]">
      
      {/* SUB-HEADER BAR */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 sm:px-8 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 tracking-wide">
            <ShieldCheck size={15} className="text-amber-600" /> Devbhoomi Verified
          </span>
          {!isOwnProfile && profile.user?._id && (
            <ReportBlockMenu
              targetUserId={profile.user._id}
              targetUserName={userCombinedName}
              onBlocked={() => navigate("/matches")}
            />
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: HERO PHOTO & QUICK SUMMARY WIDGETS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. HERO PHOTO CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-stone-900 shadow-lg border border-stone-200/80 aspect-[4/5]">
              {userMainImage ? (
                <img
                  src={userMainImage}
                  alt={userCombinedName}
                  className="h-full w-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = buildDefaultAvatar((profile as any).gender, profile.user?._id);
                  }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-stone-800 text-stone-400 gap-2">
                  <User size={56} strokeWidth={1} />
                  <span className="text-xs font-semibold uppercase tracking-wider">No Photo Uploaded</span>
                </div>
              )}

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* OVERLAY DETAILS */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(profile.religion || profile.caste) && (
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white border border-white/10">
                      {profile.religion} {profile.caste ? `• ${profile.caste}` : ""}
                    </span>
                  )}
                  {profile.user?.isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-950 shadow">
                      <Sparkles size={11} fill="currentColor" /> Premium
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="font-serif text-4xl font-bold tracking-tight text-white leading-tight">
                    {userCombinedName}
                    {(profile as any).age && <span className="font-sans font-light text-2xl text-white/80">, {(profile as any).age}</span>}
                  </h1>

                  {profile.user?.profileCode && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/70">
                      <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono tracking-wider">
                        ID: {profile.user.profileCode}
                      </span>
                    </p>
                  )}

                  <div className="mt-2 space-y-1 text-xs text-stone-300 font-normal">
                    {showFull && profile.occupation?.title && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Briefcase size={13} className="text-[#D4AF37] shrink-0" />
                        {profile.occupation.title} {profile.occupation.company ? `at ${profile.occupation.company}` : ""}
                      </p>
                    )}
                    {showFull && profile.city && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="text-[#D4AF37] shrink-0" />
                        {profile.city}
                      </p>
                    )}
                    {!showFull && (
                      <p className="flex items-center gap-1.5 text-stone-300/80">
                        <Sparkles size={13} className="text-[#D4AF37] shrink-0" />
                        Unlock this profile to see photos, career, family & more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ASTRO & KUNDALI HIGHLIGHT CARD */}
            {showFull && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2 text-[#6B1F2A]">
                  <Moon size={16} />
                  <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Astrological Summary</h3>
                </div>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 border border-amber-200/60 uppercase">
                  Astro Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Rashi</span>
                  <p className="font-medium text-stone-800 capitalize">{(profile as any).horoscope?.rashi || "Not Specified"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Nakshatra</span>
                  <p className="font-medium text-stone-800 capitalize">{(profile as any).horoscope?.nakshatra || "Not Specified"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Manglik</span>
                  <p className="font-medium text-stone-800 capitalize">{profile.manglik?.replace(/_/g, " ") || "No"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Birth Place</span>
                  <p className="font-medium text-stone-800 capitalize">{(profile as any).horoscope?.birthPlace || "Not Specified"}</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/kundali")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#6B1F2A]/20 bg-[#6B1F2A]/5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B1F2A] hover:bg-[#6B1F2A] hover:text-white transition-colors"
              >
                <Sparkles size={14} /> Request Kundali Match
              </button>
            </div>
            )}

            {/* 3. VERIFICATION & TRUST CARD */}
            {showFull && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#6B1F2A]">
                <ShieldCheck size={18} />
                <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Trust & Verification</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-100">
                  <span className="font-medium text-stone-700">Govt ID Verification</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-100">
                  <span className="font-medium text-stone-700">Contact Number</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-100">
                  <span className="font-medium text-stone-700">Photo Authenticity</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                    <CheckCircle2 size={13} /> Screened
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* 4. GALLERY PREVIEW — photos are visible to everyone, free or premium */}
            <ProfileGallery profile={profile} />

          </div>

          {/* RIGHT COLUMN: DETAILED DOSSIER CONTENT (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* GATED CONTACT DETAILS */}
            {!isOwnProfile && userId && profile?.user && (
              <ContactGate
                userId={profile.user._id}
                unlocked={detailsUnlocked}
                gender={profile.user.gender}
                freeUnlocksRemaining={freeUnlocksRemaining}
                planUnlocksRemaining={planUnlocksRemaining}
                isPremium={viewerIsPremium}
                onUnlockClick={() => setUnlockModalOpen(true)}
              />
            )}

            {/* ABOUT ME SECTION */}
            {showFull && <AboutSection aboutMe={profile.aboutMe} />}

            {/* PROFILE SPECIFICATIONS */}
            {showFull ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                    Profile Specifications
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Verified Data
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Basic Attributes */}
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-3.5 flex items-center gap-2.5 text-[#6B1F2A]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B1F2A]/10">
                        <User size={16} />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Basic Attributes</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : undefined },
                        { label: "Marital Status", value: profile.maritalStatus?.replace(/_/g, " ") },
                        { label: "Religion", value: profile.religion },
                        { label: "Caste", value: profile.caste },
                        { label: "Sub-caste", value: profile.subCaste },
                        { label: "Gotra", value: profile.gotra },
                        { label: "Tehsil", value: profile.tehsil },
                        { label: "City", value: profile.city },
                      ].map(
                        (item, idx) =>
                          item.value && (
                            <div key={idx} className="flex flex-col min-w-0">
                              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5 truncate">
                                {item.label}
                              </span>
                              <span className="font-medium text-stone-800 truncate capitalize">
                                {item.value}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  {/* Education & Career */}
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-3.5 flex items-center gap-2.5 text-[#6B1F2A]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B1F2A]/10">
                        <GraduationCap size={16} />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Education & Career</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Degree", value: profile.education?.degree },
                        { label: "Field", value: profile.education?.field },
                        { label: "College", value: profile.education?.college },
                        { label: "Title", value: profile.occupation?.title },
                        { label: "Company", value: profile.occupation?.company },
                        { label: "Income", value: profile.occupation?.annualIncomeRange },
                      ].map(
                        (item, idx) =>
                          item.value && (
                            <div key={idx} className="flex flex-col min-w-0">
                              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5 truncate">
                                {item.label}
                              </span>
                              <span className="font-medium text-stone-800 truncate capitalize">
                                {item.value}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  {/* Family & Lifestyle */}
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                    <div className="mb-3.5 flex items-center gap-2.5 text-[#6B1F2A]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B1F2A]/10">
                        <Home size={16} />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Family & Lifestyle</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: "Family Type", value: profile.family?.familyType },
                        { label: "Diet", value: profile.lifestyle?.diet?.replace(/_/g, " ") },
                        { label: "Smoking", value: profile.lifestyle?.smoking },
                        { label: "Drinking", value: profile.lifestyle?.drinking },
                      ].map(
                        (item, idx) =>
                          item.value && (
                            <div key={idx} className="flex flex-col min-w-0">
                              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5 truncate">
                                {item.label}
                              </span>
                              <span className="font-medium text-stone-800 truncate capitalize">
                                {item.value}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </div>

                {/* Partner Expectations */}
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3.5 flex items-center gap-2.5 text-[#6B1F2A]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B1F2A]/10">
                      <Heart size={16} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Partner Expectations</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    {[
                      {
                        label: "Age Range",
                        value:
                          profile.partnerPreference?.ageMin || profile.partnerPreference?.ageMax
                            ? `${profile.partnerPreference?.ageMin ?? "–"} to ${profile.partnerPreference?.ageMax ?? "–"} yrs`
                            : undefined,
                      },
                      {
                        label: "Min Height",
                        value: profile.partnerPreference?.heightMinCm ? `${profile.partnerPreference.heightMinCm} cm` : undefined,
                      },
                      { label: "Preferred Cities", value: profile.partnerPreference?.districts?.join(", ") },
                      { label: "Education Level", value: profile.partnerPreference?.education?.join(", ") },
                    ].map(
                      (item, idx) =>
                        item.value && (
                          <div key={idx} className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5 truncate">
                              {item.label}
                            </span>
                            <span className="font-medium text-stone-800 leading-tight break-words">
                              {item.value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED PREVIEW — only the free-tier basics show until this
                 profile is unlocked. Everything else (photos, about me,
                 education/career, family, lifestyle, horoscope, partner
                 preferences) is hidden by the API itself, not just this UI. */
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3.5 flex items-center gap-2.5 text-[#6B1F2A]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B1F2A]/10">
                    <User size={16} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">Basic Details</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : undefined },
                    { label: "Marital Status", value: profile.maritalStatus?.replace(/_/g, " ") },
                    { label: "Religion", value: profile.religion },
                    { label: "Community", value: profile.caste },
                  ].map(
                    (item, idx) =>
                      item.value && (
                        <div key={idx} className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-0.5 truncate">
                            {item.label}
                          </span>
                          <span className="font-medium text-stone-800 truncate capitalize">
                            {item.value}
                          </span>
                        </div>
                      )
                  )}
                </div>
                <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 text-[11px] text-amber-900 leading-relaxed">
                  Photos, about me, education, career, family & horoscope details are hidden until you unlock this profile.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* UNLOCK MODAL */}
      <UnlockProfileModal
        open={unlockModalOpen}
        freeUnlocksRemaining={freeUnlocksRemaining}
        planUnlocksRemaining={planUnlocksRemaining}
        isPremium={viewerIsPremium}
        isUnlocking={unlockMutation.isPending}
        error={unlockError}
        onCancel={() => {
          setUnlockModalOpen(false);
          setUnlockError("");
        }}
        onConfirm={() => unlockMutation.mutate()}
      />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 8, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-white shadow-2xl"
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span className="text-xs font-semibold leading-snug">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
