import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Crown,
  ShieldCheck,
  Lock,
  Users,
  Sparkles,
  ChevronDown,
  HelpCircle,
  CreditCard,
  Eye,
  MessageCircleQuestion,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { api } from "../lib/axios";

interface BackendPlan {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  priceInPaise: number;
  currency: string;
  durationDays: number;
  maxProfileViews: number | null;
  freeKundaliMatches: number;
  features: string[];
}

const comparisonMatrix = [
  { feature: "Create Profile", free: true, premium: true },
  { feature: "Browse Matches", free: "Unlimited", premium: "Unlimited" },
  { feature: "Unlock Full Profile Details (Photos, About, Family, Horoscope)", free: "5 Free Unlocks", premium: "Unlimited" },
  { feature: "Unlock Contact Info (Phone/Email)", free: false, premium: "10 Users" },
  { feature: "Kundali Match Making", free: "1 Free Match", premium: "3 Matches" },
  { feature: "See Who Viewed Your Profile", free: false, premium: true },
  { feature: "Contact Our Priest for Queries", free: false, premium: true },
  { feature: "Search Priority Visibility", free: "Normal", premium: "Highest" },
];

export const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => (await api.get<{ data: { plans: BackendPlan[] } }>("/subscriptions/plans")).data.data.plans,
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/checkout/${planId}`);
  };

  const faqs = [
    { q: "Can I upgrade anytime?", a: "Yes, you can buy a premium plan at any point — your premium access updates instantly to match your active tier limits." },
    { q: "Is payment secure?", a: "Yes. All transactions are processed via Razorpay, and every payment is verified server-side before your plan is activated." },
    { q: "Do plans auto-renew?", a: "No. Every plan is a one-time purchase valid for its stated duration — you will never be auto-charged." },
    { q: "What happens to unused profile views or kundali matches?", a: "Each plan's quota resets whenever you buy a new plan, so unused quota doesn't carry over between purchases." },
    { q: "Will my data remain safe?", a: "Yes — your contact details and photos stay protected according to your profile's visibility settings, regardless of plan." },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B1F2A] border-t-transparent"></div>
      </div>
    );
  }

  const activePlan = plans?.[0];

  return (
    <div className="min-h-screen w-full bg-[#FBF8F3] text-[#241F1C] font-sans antialiased selection:bg-[#6B1F2A]/10">
      {/* 1. HERO */}
      <section className="relative overflow-hidden px-4 pt-12 pb-12 text-center sm:px-6 lg:px-8 bg-gradient-to-b from-[#6B1F2A]/5 to-transparent">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.amber.100),transparent)] opacity-40" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1F2A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#6B1F2A] mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Premium Matrimony Plan
          </span>
          <h1 className="font-heading text-3xl font-black tracking-tight text-[#241F1C] sm:text-5xl md:text-6xl">
            Choose the Perfect Plan to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B1F2A] to-[#A9792C]">Find Your Life Partner</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#241F1C]/70 max-w-2xl mx-auto">
            Unlock direct contact view limits and priest-reviewed kundali matching built for deep, serious connection matchmaking.
          </p>
        </motion.div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 relative">
        <div className="max-w-xl mx-auto w-full">
          {activePlan && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 transition-all duration-300 hover:shadow-2xl ring-2 ring-[#A9792C]"
            >
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md bg-gradient-to-r from-[#A9792C] to-amber-500 whitespace-nowrap">
                <Crown className="h-3.5 w-3.5 fill-white" /> Recommended Tier
              </span>

              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-2xl font-black tracking-tight text-[#A9792C]">{activePlan.name}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#241F1C]/60">
                  {activePlan.tagline || "Our most popular selection for comprehensive matchmaking metrics."}
                </p>

                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#241F1C]">
                    ₹{(activePlan.priceInPaise / 100).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-[#241F1C]/50">/{activePlan.durationDays} days</span>
                </p>

                <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-[#241F1C]/80 border-t border-gray-100 pt-6">
                  <li className="flex gap-x-3 items-start font-medium text-[#241F1C]">
                    <Check className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>Unlock full data for <strong>10 User Details</strong></span>
                  </li>
                  <li className="flex gap-x-3 items-start">
                    <Check className="h-5 w-5 shrink-0 text-[#6B1F2A] mt-0.5" />
                    <span>Includes <strong>3 Kundali Match Making</strong> operations</span>
                  </li>
                  <li className="flex gap-x-3 items-start">
                    <Check className="h-5 w-5 shrink-0 text-[#6B1F2A] mt-0.5" />
                    <span><strong>See Who Viewed Your Profile</strong></span>
                  </li>
                  <li className="flex gap-x-3 items-start">
                    <Check className="h-5 w-5 shrink-0 text-[#6B1F2A] mt-0.5" />
                    <span><strong>Direct Access to Our Priest</strong> for any queries</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  variant="gold"
                  onClick={() => handleSubscribe(activePlan._id)}
                  className="w-full !rounded-full py-3.5 text-base font-bold transition-all !bg-[#A9792C] !text-white hover:!bg-[#8E6421] shadow-lg shadow-[#A9792C]/20"
                >
                  Choose {activePlan.name}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. WHY UPGRADE */}
      <section className="bg-white border-y border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-[#241F1C] tracking-tight">Why Upgrade?</h2>
            <p className="mt-3 text-base text-[#241F1C]/60">
              Maximize your pairing opportunities within safe, verified networking built for Himachali families.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { icon: Users, title: "10 Full Profile Access", desc: "Unlock comprehensive profile details to reach matches easily." },
              { icon: Eye, title: "Profile Visitors", desc: "Instantly see who has checked out your profile." },
              { icon: MessageCircleQuestion, title: "Priest Consultation", desc: "Contact our expert priest for guidance on any matchmaking query." },
              { icon: ShieldCheck, title: "100% Protected", desc: "Your contact details and photos stay protected by your privacy settings." },
              { icon: Crown, title: "Unlimited Connections", desc: "Browse and unlock as many matches as you like without any restriction blocks." },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-2">
                <div className="mb-4 rounded-2xl bg-[#6B1F2A]/5 p-4 text-[#6B1F2A]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[#241F1C] mb-1">{item.title}</h4>
                <p className="text-xs sm:text-sm text-[#241F1C]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPARISON TABLE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 hidden md:block">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-[#241F1C]">Compare Plans</h2>
          <p className="mt-2 text-sm text-[#241F1C]/60">A quick breakdown of what each tier includes.</p>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="p-4 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#241F1C]/60">Membership Features</th>
                <th className="p-4 text-center text-xs sm:text-sm font-bold text-[#241F1C]/40">Free</th>
                <th className="p-4 text-center text-xs sm:text-sm font-bold text-[#A9792C]">Premium Membership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {comparisonMatrix.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-[#241F1C]">{row.feature}</td>
                  <td className="p-4 text-center text-[#241F1C]/70">
                    {typeof row.free === "boolean" ? (row.free ? <Check className="mx-auto h-5 w-5 text-emerald-600" /> : <X className="mx-auto h-5 w-5 text-gray-300" />) : row.free}
                  </td>
                  <td className="p-4 text-center font-semibold text-[#A9792C]">
                    {typeof row.premium === "boolean" ? (row.premium ? <Check className="mx-auto h-5 w-5 text-[#A9792C]" /> : <X className="mx-auto h-5 w-5 text-gray-300" />) : row.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="bg-gray-50/50 border-t border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#241F1C]">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-[#241F1C]/60">Everything you need to know about billing and plan quotas.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-5 font-semibold text-left text-sm sm:text-base text-[#241F1C] hover:bg-gray-50/50"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="h-4 w-4 text-[#6B1F2A] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-[#241F1C]/70 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. TRUST SEALS */}
      <section className="py-12 bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#241F1C]/40 mb-6">Guaranteed Trust Seals</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto border-b border-gray-100 pb-10">
            {["Secure Razorpay Checkout", "100% Privacy Protected", "Trusted by Himachali Families", "Instant Plan Activation"].map((text, idx) => (
              <div key={idx} className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#241F1C]/70 bg-gray-50/70 py-3 px-2 rounded-xl border border-gray-100">
                <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
            <span className="text-xs font-black tracking-widest flex items-center gap-1">
              <CreditCard className="h-4 w-4" /> UPI SECURE
            </span>
            <span className="text-xs font-black tracking-widest">NET BANKING</span>
            <span className="text-xs font-black tracking-widest">VISA / MASTERCARD</span>
            <span className="text-xs font-black tracking-widest">RU PAY SMART</span>
          </div>
        </div>
      </section>
    </div>
  );
};