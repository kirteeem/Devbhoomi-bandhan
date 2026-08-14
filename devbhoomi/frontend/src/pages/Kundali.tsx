import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Copy, Check, Loader2, ShieldCheck, 
  PhoneCall, Crown, Calendar, UserCheck, ArrowRight,
  Shield, Compass, HelpCircle
} from "lucide-react";
import { api } from "../../src/lib/axios"; 
import { useAuth } from "../../src/context/AuthContext";
import { fetchMyProfile } from "../../src/lib/profileApi";

const PriestImg = new URL("../../src/assets/priest.jpeg", import.meta.url).href;

interface KundaliRequestItem {
  _id: string;
  requestType: string;
  status: string;
  contactPhone?: string;
  assignedPriest?: { displayName?: string };
  profileB?: { fullName?: string; profileCode?: string };
  createdAt: string;
}

const statusPill: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  in_review: "bg-blue-50 text-blue-700 border border-blue-200/60",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  cancelled: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

const WHY_MATCH_CARDS = [
  { title: "Guna Milan Matrix", desc: "Detailed breakdown of all 36 vital points including Ashtakoota compatibility parameters.", icon: Compass, color: "text-amber-600 bg-amber-50 border-amber-200/60" },
  { title: "Dosha Evaluations", desc: "Rigorous detection of Manglik, Nadi, and Bhakoot anomalies with corrective remedies.", icon: Shield, color: "text-rose-600 bg-rose-50 border-rose-200/60" },
  { title: "Direct Pandit Hotline", desc: "Bypass cold algorithms. Receive manual analysis reviews directly over the phone with Acharyas.", icon: PhoneCall, color: "text-emerald-600 bg-emerald-50 border-emerald-200/60" }
];

const FAQS = [
  { q: "How long does the verified Acharya analysis take?", a: "Initial digital mappings clear instantly. The custom spiritual analysis by Pandit Ji is executed and followed up via callback within 24 hours." },
  { q: "What security measures cover my birth chart data?", a: "Data packets are isolated via 256-bit point-to-point infrastructure layers. Identity parameters are hidden from search engines completely." }
];

export const Kundali = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [yourProfileCode, setYourProfileCode] = useState("");
  const [partnerProfileCode, setPartnerProfileCode] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { data: profile } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: !!user,
    staleTime: 60_000,
  });

  const { data } = useQuery({
    queryKey: ["kundali-requests"],
    queryFn: async () =>
      (await api.get("/kundali/my-requests")).data.data as {
        requests: KundaliRequestItem[];
        isPremium: boolean;
        kundaliMatchesRemaining: number;
        kundaliQuota: number;
      },
  });

  const requests = data?.requests ?? [];
  const isPremium = data?.isPremium ?? false;
  const remaining = data?.kundaliMatchesRemaining ?? 0;
  const quota = data?.kundaliQuota ?? 0;

  const myProfileCode: string | undefined = (profile as any)?.user?.profileCode ?? (user as any)?.profileCode;

  useEffect(() => {
    if (myProfileCode && !yourProfileCode) {
      setYourProfileCode(myProfileCode);
    }
  }, [myProfileCode, yourProfileCode]);

  const hasAttemptedOnce = requests.length > 0;

  const submitMutation = useMutation({
    mutationFn: async () =>
      api.post("/kundali/request", {
        partnerProfileCode: partnerProfileCode.trim().toUpperCase(),
        phone: phone.trim(),
      }),
    onSuccess: () => {
      setFormSuccess(
        "Request logged securely! Details have been configured for Pandit Ji. Expect direct contact shortly."
      );
      
      const emailTo = "kirteemsharma.dev@gmail.com";
      const emailSubject = encodeURIComponent("New Devbhoomi Bandhan Kundali Match Request");
      const emailBody = encodeURIComponent(
        `Pranam Pandit Ji,\n\nA new Kundali Matching request has been submitted.\n\n` +
        `User Profile ID: ${yourProfileCode.trim().toUpperCase()}\n` +
        `Partner Profile ID: ${partnerProfileCode.trim().toUpperCase()}\n` +
        `Contact Phone Number: ${phone.trim()}\n\n` +
        `Please analyze their compatibility charts and reach back out to them over their provided number.\n\nDhanyawad.`
      );

      window.location.href = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
      setPartnerProfileCode("");
      queryClient.invalidateQueries({ queryKey: ["kundali-requests"] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Could not submit the request. Please try again.");
    },
  });

  const handleCopy = async () => {
    if (!myProfileCode) return;
    await navigator.clipboard.writeText(myProfileCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (hasAttemptedOnce && !isPremium) {
      setFormError("You have already tried matching once. Please purchase a premium plan to continue matching.");
      return;
    }
    if (!yourProfileCode.trim()) return setFormError("Please enter your personal ID.");
    if (!partnerProfileCode.trim()) return setFormError("Please enter your partner's ID.");
    if (!phone.trim() || phone.trim().length < 8) return setFormError("Please enter a valid phone number.");
    
    submitMutation.mutate();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/60 font-sans text-zinc-900 antialiased selection:bg-amber-100">
      
      {/* BACKGROUND AMBIENT DECORATIONS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-[80px] sm:blur-[100px]" />
        <div className="absolute top-[25%] right-[-5%] h-[350px] w-[350px] sm:h-[600px] sm:w-[600px] rounded-full bg-gradient-to-bl from-blue-500/5 to-transparent blur-[100px] sm:blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-50" />
      </div>

      {/* ADJUSTED TOP PADDING: Tight lg:pt-10 / md:pt-12 on desktop to keep hero position intact */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-10 pb-16 lg:pb-24">
        
        {/* HERO GRID SECTION */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-stretch">
          
          {/* LEFT: PRIEST PROFILE BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative lg:col-span-5 min-h-[340px] sm:min-h-[420px] lg:min-h-full overflow-hidden rounded-3xl bg-zinc-950 p-6 sm:p-8 lg:p-10 shadow-xl flex flex-col justify-between group border border-zinc-800"
          >
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-95 transition-all duration-700 group-hover:scale-105">
              <img 
                src={PriestImg} 
                alt="Pandit Jagat Ram Sharma" 
                className="h-full w-full object-cover object-top"
                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/10" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-400 border border-amber-500/20 backdrop-blur-md">
                <Sparkles size={12} /> Acharya Council Verified
              </span>
            </div>

            <div className="relative z-10 mt-auto space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                  पंडित जगत राम शर्मा
                </h1>
                <p className="text-xs font-medium tracking-wide text-amber-400/90">
                  Senior Astrologer • 25+ Years Experience • 3,200+ Charts Matched
                </p>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300 max-w-sm">
                Thousands of ancestral families trust us with their sacred lifecycle alignments. Provide both identity vectors and our in-house priest will personally evaluate your cosmic alignment parameters.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: INTERACTIVE FORM CONTAINER */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* REGISTERED IDENTITY CODE BAR */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-zinc-300"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Registered Identity Code</span>
                  <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <h3 className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">{myProfileCode ?? "—"}</h3>
                    {myProfileCode && (
                      <button
                        onClick={handleCopy}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-2xs transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 shrink-0"
                        title="Copy ID"
                      >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {copied && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 shrink-0"
                    >
                      Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* PAYWALL BLOCK OR REQUEST FORM */}
            {hasAttemptedOnce && !isPremium ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8 text-center flex flex-col items-center justify-center backdrop-blur-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                  <Crown size={22} className="animate-pulse" />
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-zinc-900">Your Free Kundali Match Is Used</h3>
                <p className="mt-2 max-w-sm text-xs text-zinc-600 leading-relaxed">
                  Every member gets 1 free kundali matching request. Upgrade to Premium to get 3 kundali matches per plan period, plus unlimited profile views and contact unlocks.
                </p>
                <Link 
                  to="/pricing" 
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-amber-600/10 transition-transform hover:translate-y-[-1px] active:scale-95"
                >
                  Upgrade to Premium Plan <ArrowRight size={12} />
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 space-y-4 sm:space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8 shadow-xl shadow-zinc-200/40 flex flex-col justify-center">
                <div className="border-b border-zinc-100 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900">Request Chart Analysis</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-zinc-700 shrink-0">
                      <UserCheck size={11} className="text-amber-600" />
                      {isPremium ? `${remaining}/${quota} Left` : `${remaining}/1 Free Left`}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400">Inputs secure-routed via point-to-point architecture.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500">Your Identifier</label>
                    <input
                      value={yourProfileCode}
                      onChange={(e) => setYourProfileCode(e.target.value)}
                      placeholder="e.g. DBB100021"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-900 transition-all focus:border-amber-600/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500">Prospect Partner's Identifier</label>
                    <input
                      value={partnerProfileCode}
                      onChange={(e) => setPartnerProfileCode(e.target.value)}
                      placeholder="e.g. DBB100042"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-900 transition-all focus:border-amber-600/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500">Callback Destination Number</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-3 transition-all focus-within:border-amber-600/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500/20">
                    <PhoneCall size={14} className="text-zinc-400 shrink-0" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit primary mobile number"
                      className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                      type="tel"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-700">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-700">
                    {formSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitMutation.isPending || remaining <= 0}
                  className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-600/10 transition-all hover:bg-amber-700 active:scale-[0.99] disabled:opacity-40"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin shrink-0" /> Transferring charts...
                    </>
                  ) : remaining <= 0 ? (
                    "Quota Threshold Fulfilled"
                  ) : (
                    <>
                      <Sparkles size={14} className="text-white shrink-0" /> Dispatch to Priest for Evaluation
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-center text-[10px] text-zinc-400">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" /> Data sovereignty maintained under regional governance.
                </div>
              </form>
            )}
          </div>
        </div>

        {/* --- WHY MATCH CARDS --- */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WHY_MATCH_CARDS.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs shadow-zinc-200/30">
                <div className={`inline-flex rounded-xl p-2.5 border ${card.color}`}>
                  <IconComp size={16} />
                </div>
                <h4 className="mt-3 text-xs font-bold text-zinc-900 tracking-wide">{card.title}</h4>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* --- EVALUATION HISTORY LAYOUT --- */}
        <div className="mt-16 sm:mt-20 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">Your Evaluation History</h2>
            <p className="text-xs text-zinc-500">Track and monitor verified compatibility workflows.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {requests.map((r) => (
              <div key={r._id} className="group flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 transition-all hover:border-zinc-300 shadow-xs sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold capitalize text-zinc-900">{r.requestType.replace(/_/g, " ")}</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                    <span className="font-medium text-zinc-700">
                      {r.profileB?.profileCode ? `With Target Code: ${r.profileB.profileCode}` : "General Compatibility Query"}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1">
                      Assigned: {r.assignedPriest?.displayName ?? "Pandit Jagat Ram Sharma"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-zinc-100 pt-3 sm:border-0 sm:pt-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${statusPill[r.status] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                  {r.status === "completed" && (
                    <Link 
                      to={`/kundali/report/${r._id}`} 
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-amber-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-amber-500 transition-colors"
                    >
                      Access Analysis
                    </Link>
                  )}
                </div>
              </div>
            ))}
            
            {requests.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center bg-white shadow-xs">
                <Calendar className="mx-auto text-zinc-300 mb-2" size={24} />
                <p className="text-xs font-medium text-zinc-400">No matching requests filed on this identity record.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- FAQ ACCORDION --- */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-zinc-900">Frequently Asked Inquiries</h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
                  <button 
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold tracking-wide text-zinc-800 focus:outline-none"
                  >
                    <span className="flex items-center gap-2.5"><HelpCircle size={14} className="text-amber-600 shrink-0" /> {faq.q}</span>
                    <span className="text-zinc-400 shrink-0 ml-2">{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="p-4 pt-0 text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 bg-zinc-50/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};