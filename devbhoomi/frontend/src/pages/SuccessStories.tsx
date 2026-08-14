import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, MapPin, Calendar, Sparkles, CheckCircle, HelpCircle } from "lucide-react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/Button";

interface Testimonial {
  _id: string;
  coupleNames: string;
  district?: string;
  story: string;
  marriedOn?: string;
}

// Framer motion variants to match luxury platform flow
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 16 } }
};

export const SuccessStories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ coupleNames: "", district: "", story: "" });

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get("/testimonials")).data.data.testimonials as Testimonial[],
  });

  const submitStory = useMutation({
    mutationFn: () => api.post("/testimonials", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setForm({ coupleNames: "", district: "", story: "" });
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-200">
      
      {/* --- AMBIENT BRANDING LAYER --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-zinc-200/30 via-zinc-100/10 to-transparent blur-[130px]" />
        <div className="absolute bottom-[15%] left-[-8%] h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* --- PREMIUM CENTER HEADER --- */}
        <div className="mx-auto mb-16 max-w-xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200/60 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-700 shadow-sm">
            <Sparkles size={11} className="text-amber-500 fill-current" /> Sacred Unions
          </div>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
            Success Stories
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Real couples brought together under traditional ideals, regional roots, and family blessings via Devbhoomi Bandhan.
          </p>
        </div>

        {/* --- CORE STATES MANAGEMENT --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
            <p className="mt-4 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Loading Union Archives...</p>
          </div>
        ) : !testimonials || testimonials.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-200 bg-white/60 max-w-md mx-auto">
            <Heart size={20} className="mx-auto text-zinc-300" />
            <p className="mt-3 text-xs font-medium text-zinc-500">No entries currently published on this timeline layer.</p>
          </div>
        ) : (
          
          /* --- DYNAMIC CARD GRID --- */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Removed unused index parameter 'i' here to prevent compilation error */}
            {testimonials.map((s) => (
              <motion.div
                key={s._id}
                variants={cardVariants}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-100/50 hover:shadow-md hover:border-zinc-300 transition-all duration-300"
              >
                {/* Visual Anchor Block: Replaces raw solid colors with aesthetic backdrop styling placeholders */}
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem] opacity-40" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="relative z-10 text-3xl transition-transform duration-500 group-hover:scale-110">💞</span>
                </div>

                {/* Content Elements */}
                <div className="flex flex-col flex-1 p-6 space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="font-serif text-base font-bold text-zinc-950 tracking-tight group-hover:text-zinc-800">
                      {s.coupleNames}
                    </h3>
                    {s.district && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <MapPin size={11} className="text-amber-600" /> {s.district}, HP
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs font-medium leading-relaxed text-zinc-500 italic flex-1">
                    "{s.story}"
                  </p>

                  {s.marriedOn && (
                    <div className="pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Calendar size={11} /> Married {new Date(s.marriedOn).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* --- INTERACTIVE UNION SUBMISSION WIDGET --- */}
        <div className="mx-auto mt-24 max-w-xl">
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div 
                key="prompt"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-2xl border border-dashed border-zinc-200 bg-white/70 backdrop-blur-sm p-8 text-center shadow-sm"
              >
                <h2 className="font-serif text-lg font-bold text-zinc-950 tracking-tight">Found your lifecycle companion with us?</h2>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  Document your traditional family journey and inspire other clans across Himachal Pradesh.
                </p>
                <div className="mt-5">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    className="!rounded-xl !bg-zinc-950 !px-5 !py-2.5 !text-xs !font-bold !text-white hover:!bg-zinc-900 inline-flex items-center gap-2 shadow-sm"
                  >
                    <PenLine size={13} /> Share Your Union Chronicle
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-xl shadow-zinc-200/40"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-zinc-950 tracking-tight">Chronicle Your Match</h2>
                    <p className="text-[11px] text-zinc-400">All submissions enter dynamic validation before network broadcast.</p>
                  </div>
                  <HelpCircle size={14} className="text-zinc-300" />
                </div>

                {submitStory.isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 text-center space-y-2"
                  >
                    <CheckCircle size={20} className="mx-auto text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-800">Transmission Successfully Synced</p>
                    <p className="text-[11px] text-emerald-600/90 leading-relaxed">Your family record has passed point-to-point staging and is waiting for administrator compliance authorization.</p>
                  </motion.div>
                ) : (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitStory.mutate();
                    }}
                  >
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
                        placeholder="Partner Names (e.g., Priya & Rohan)"
                        value={form.coupleNames}
                        onChange={(e) => setForm((f) => ({ ...f, coupleNames: e.target.value }))}
                        required
                        minLength={2}
                      />
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
                        placeholder="Home District Context (e.g., Mandi)"
                        value={form.district}
                        onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                      />
                      <textarea
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10 min-h-[120px] resize-none"
                        placeholder="Describe your matrimonial path, compatibility mapping, and family connection..."
                        value={form.story}
                        onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                        required
                        minLength={10}
                      />
                    </div>

                    {submitStory.isError && (
                      <p className="text-xs font-bold text-rose-700">
                        Systemic exception — verification failed. Please align data inputs and retry.
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={submitStory.isPending}
                        className="!rounded-xl !bg-zinc-950 !px-4 !py-2.5 !text-xs !font-bold !text-white hover:!bg-zinc-800"
                      >
                        {submitStory.isPending ? "Broadcasting..." : "Publish Timeline Entry"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={() => setShowForm(false)}
                        className="!rounded-xl !text-xs !font-bold !text-zinc-500 hover:!text-zinc-950"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};