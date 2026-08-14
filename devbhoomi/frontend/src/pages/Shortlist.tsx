import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Sparkles, Compass, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../lib/axios";
import { ProfileCard } from "../components/ui/ProfileCard";
import type { Profile } from "../types";

// Animation parameters for organic cascading grid items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export const Shortlist = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["shortlist-full"],
    queryFn: async () => (await api.get("/profiles/me/shortlisted")).data.data as { total: number; profiles: Profile[] },
  });

  const profiles = data?.profiles ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/50 text-zinc-900 antialiased selection:bg-amber-100">
      
      {/* --- ELITE AMBIENT BACKDROPS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[15%] right-[-10%] h-[650px] w-[650px] rounded-full bg-gradient-to-tl from-zinc-400/10 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* --- PREMIUM DYNAMIC HEADER --- */}
        <div className="border-b border-zinc-200/80 pb-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800 border border-amber-200/40">
              <Sparkles size={12} className="text-amber-600 fill-current" /> Curated Registry
            </div>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-950 md:text-4xl">
              Saved Archival Profiles
            </h1>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              An isolated collection of high-compatibility vectors you've bookmarked for holistic matching.
            </p>
          </div>

          {profiles.length > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
              <Bookmark size={12} className="fill-current text-zinc-600" /> {profiles.length} Profiles Tracked
            </div>
          )}
        </div>

        {/* --- CORE DATA INTERFACE REGION --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
            <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-zinc-400">Syncing Cloud Vault...</p>
          </div>
        ) : profiles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-zinc-200 bg-white/70 backdrop-blur-sm p-12 text-center shadow-sm max-w-md mx-auto mt-8"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 border border-zinc-200/60 shadow-inner">
              <Compass size={20} />
            </div>
            <h3 className="mt-5 text-sm font-bold text-zinc-900">Your shortlist ledger is empty</h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              When navigating the matches grid, engage the bookmark anchor module on profiles to isolate and evaluate them here.
            </p>
            <div className="mt-6">
              <Link 
                to="/matches" 
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold tracking-wide text-white hover:bg-zinc-900 transition-all shadow-sm hover:translate-y-[-1px]"
              >
                Discover Live Matches <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {profiles.map((p) => (
              <motion.div 
                key={p._id} 
                variants={itemVariants}
                className="hover:scale-[1.01] transition-transform duration-300"
              >
                <ProfileCard profile={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* --- SECURITY AND GOVERNANCE SLATE --- */}
        <div className="mt-24 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
          <ShieldCheck size={14} className="text-emerald-600" /> Data isolation active. Bookmarked indices remain invisible to external tracking.
        </div>

      </div>
    </div>
  );
};