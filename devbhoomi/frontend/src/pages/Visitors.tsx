import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Lock, Crown, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { VerifiedBadge } from "../components/ui/VerifiedBadge";
import { motion } from "framer-motion";
import { api } from "../lib/axios";
import { getDisplayPhoto } from "../lib/media";

interface Visitor {
  user: {
    _id: string;
    fullName: string;
    gender?: string;
    isProfileVerified?: boolean;
    lastActiveAt?: string;
    photos?: { url: string; isProfilePhoto?: boolean }[];
    district?: string;
  };
  viewedAt: string;
}

const cardVariant = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
  exit: { opacity: 0, y: -10 }
};

const isOnlineNow = (lastActiveAt?: string) => {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000;
};

export const Visitors = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["visitors-full"],
    queryFn: async () =>
      (await api.get("/profiles/me/visitors")).data.data as { totalVisitors: number; visitors: Visitor[]; locked: boolean },
  });

  const totalVisitors = data?.totalVisitors ?? 0;
  const showLockedState = data?.locked;

  // FIX: If the API sends an empty list because it's locked, generate 3 realistic placeholders to blur
  const visitorsList = showLockedState && (!data?.visitors || data.visitors.length === 0)
    ? Array(3).fill(null).map((_, idx) => ({
        user: {
          _id: `mock-${idx}`,
          fullName: "Premium Candidate",
          gender: idx % 2 === 0 ? "female" : "male",
          // We provide fallback high-quality stock avatars that look amazing when blurred!
          photos: [{ url: `https://images.unsplash.com/photo-${idx === 0 ? '1494790108377-be9c29b29330' : idx === 1 ? '1507003211169-0a1dd7228f2d' : '1438761681033-6461ffad8d80'}?auto=format&fit=crop&w=150&h=150`, isProfilePhoto: true }],
          isProfileVerified: true,
          lastActiveAt: new Date().toISOString()
        },
        viewedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
      }))
    : (data?.visitors ?? []);

  return (
    <div className="min-h-screen bg-[#FBF9F6] font-sans text-[#1C1917] antialiased selection:bg-[#6B122F]/10 relative">
      
      {/* Decorative Premium Background Elements */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[600px] bg-gradient-to-b from-[#6B122F]/5 via-[#2E6F57]/0 to-transparent blur-3xl opacity-70" />

      <div className="mx-auto max-w-3xl px-6 py-16">
        
        {/* --- LUXURY HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-[#EFECE6] pb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6B122F]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6B122F]">
                <Sparkles size={10} className="fill-[#6B122F]/10" /> Activity Log
              </div>
              <h1 className="font-serif text-3xl font-black tracking-tight sm:text-4xl text-[#1C1917] lg:leading-[1.15]">
                Profile <span className="font-light italic text-[#6B122F]">Insights</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#78716C]">
                {isLoading 
                  ? "Sifting through real-time connection telemetry..." 
                  : `${totalVisitors} verified connection candidate${totalVisitors === 1 ? "" : "s"} evaluated your profile`}
              </p>
            </div>

            {!isLoading && !showLockedState && totalVisitors > 0 && (
              <div className="inline-flex items-center rounded-lg border border-[#2E6F57]/20 bg-[#2E6F57]/5 px-3 py-1.5 text-xs font-semibold text-[#2E6F57] shadow-sm backdrop-blur-sm">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#2E6F57] ring-4 ring-[#2E6F57]/20 animate-pulse" />
                Live Feed Active
              </div>
            )}
          </div>
        </motion.div>

        {/* --- DATA LAYOUT PANEL --- */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-5 rounded-2xl border border-[#EFECE6] bg-white p-5 animate-pulse">
                <div className="h-14 w-14 rounded-full bg-[#EFECE6]" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-[#EFECE6] rounded-md" />
                  <div className="h-3 w-1/5 bg-[#F5F2EB] rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : visitorsList.length === 0 ? (
          /* EMPTY LOOK CONTEXT */
          <motion.div 
            variants={cardVariant} initial="initial" animate="animate"
            className="rounded-[24px] border-2 border-dashed border-[#EFECE6] bg-white p-14 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F2EB] text-[#78716C]">
              <Sparkles size={18} />
            </div>
            <h3 className="font-serif font-bold text-[#1C1917] text-base">Awaiting Activity</h3>
            <p className="mt-1 text-xs text-[#78716C] max-w-xs mx-auto font-medium leading-relaxed">
              Enhance your profile gallery and configure precise partner criteria to attract relevant matching candidates.
            </p>
          </motion.div>
        ) : (
          /* VISITOR LISTING GRID (Handles both Free/Blurred and Premium states) */
          <div className="relative">
            <motion.div 
              initial="initial" animate="animate"
              className={`space-y-3.5 transition-all duration-500 ${showLockedState ? "pointer-events-none select-none filter blur-[8px] opacity-50" : ""}`}
            >
              {visitorsList.map((v) => {
                const primaryPhoto = v.user.photos?.find((p) => p.isProfilePhoto) ?? v.user.photos?.[0];
                const isOnline = isOnlineNow(v.user.lastActiveAt);
                
                // If it's a mock placeholder image, use its direct URL string, otherwise process through media utility helper
                const imgSource = v.user._id.startsWith("mock-") 
                  ? primaryPhoto?.url 
                  : getDisplayPhoto(primaryPhoto?.url, v.user.gender, v.user._id);
                
                return (
                  <motion.div variants={cardVariant} key={v.user._id} layout>
                    <Link
                      to={showLockedState ? "#" : `/profile/${v.user._id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#EFECE6] bg-white p-4 transition-all duration-300 hover:border-[#6B122F]/30 hover:shadow-md hover:shadow-stone-100"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        
                        {/* Profile Frame */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6B122F]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ring-2 ring-[#6B122F]/30 ring-offset-2" />
                          <img
                            src={imgSource}
                            alt={showLockedState ? "Hidden Profile" : v.user.fullName}
                            className="h-14 w-14 rounded-full object-cover border border-[#EFECE6] shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-95"
                          />
                          {isOnline && !showLockedState && (
                            <span className="absolute bottom-0 right-0 z-20 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#2E6F57] shadow-sm" />
                          )}
                        </div>

                        {/* Info cluster block */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-[#1C1917] text-base tracking-tight transition-colors duration-200 group-hover:text-[#6B122F]">
                              {showLockedState ? "Premium Candidate" : v.user.fullName}
                            </span>
                            {v.user.isProfileVerified && !showLockedState && (
                              <VerifiedBadge verified withLabel size="sm" />
                            )}
                          </div>
                          
                          <p className="text-[11px] text-[#78716C] font-medium mt-1 flex items-center gap-1.5">
                            <Calendar size={12} className="text-stone-300 shrink-0" />
                            <span>
                              Evaluated on {new Date(v.viewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Elite Inline Action Arrow */}
                      {!showLockedState && (
                        <div className="flex items-center justify-end text-[#6B122F] text-xs font-bold transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 sm:pr-2 shrink-0">
                          <span className="tracking-wide uppercase text-[10px]">Open Profile</span>
                          <ChevronRight size={14} className="ml-0.5" />
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* --- FREE PAYWALL OVERLAY --- */}
            {showLockedState && (
              <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-none">
                <motion.div 
                  variants={cardVariant} initial="initial" animate="animate"
                  className="w-full max-w-md rounded-[28px] border border-[#EFECE6] bg-white/90 p-8 text-center shadow-xl shadow-stone-200/50 backdrop-blur-md pointer-events-auto"
                >
                  <div className="mx-auto mb-5 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EFECE6] border border-[#EFECE6] shadow-sm">
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-tr from-amber-500/10 to-amber-600/0 opacity-60" />
                    <Lock size={20} className="text-amber-600 relative z-10" strokeWidth={2.25} />
                  </div>

                  <h3 className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
                    Unveil Your Admirers
                  </h3>
                  <p className="mt-2.5 text-xs text-[#78716C] leading-relaxed font-medium px-2">
                    There are <span className="text-[#6B122F] font-bold">{totalVisitors} premium members</span> actively browsing your criteria. Premium memberships unlock identity details instantly.
                  </p>

                  <div className="my-6 border-t border-dashed border-[#EFECE6]" />

                  <Link 
                    to="/pricing" 
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B122F] p-3.5 text-xs font-bold text-white shadow-md shadow-[#6B122F]/10 transition-all duration-300 hover:bg-[#520B21] hover:shadow-lg hover:shadow-[#6B122F]/20 active:scale-[0.99]"
                  >
                    <Crown size={14} className="fill-amber-400 text-amber-400 transition-transform group-hover:rotate-12" /> 
                    <span>Activate Premium Access</span>
                    <ChevronRight size={14} className="ml-0.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};