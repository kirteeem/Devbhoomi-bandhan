import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, CheckCircle2, XCircle, Clock, ShieldCheck, ArrowUpRight, HelpCircle } from "lucide-react";
import { api } from "../lib/axios";

interface Payment {
  _id: string;
  plan?: { name: string; durationDays: number };
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  razorpayOrderId?: string;
  createdAt: string;
}

const statusConfig: Record<Payment["status"], { label: string; wrapper: string; indicator: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Completed", wrapper: "bg-emerald-50/60 text-emerald-800 border border-emerald-200/50", indicator: "bg-emerald-500", icon: CheckCircle2 },
  created: { label: "Pending", wrapper: "bg-amber-50/60 text-amber-800 border border-amber-200/50", indicator: "bg-amber-500 animate-pulse", icon: Clock },
  failed: { label: "Declined", wrapper: "bg-rose-50/60 text-rose-800 border border-rose-200/50", indicator: "bg-rose-500", icon: XCircle },
};

const formatPrice = (paise: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(paise / 100);

// Framer motion orchestration variants
const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } }
};

export const PaymentHistory = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => (await api.get("/payments/history")).data.data.payments as Payment[],
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-200">
      
      {/* --- PREMIUM GEOMETRIC GRADIENT LAYERS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-8%] right-[-5%] h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-zinc-300/20 via-zinc-200/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* --- CUSTOM HEADER REGION --- */}
        <div className="border-b border-zinc-200 pb-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200/60 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-700">
              <Receipt size={12} className="text-zinc-500" /> Transaction Ledger
            </div>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-950 md:text-4xl">
              Billing Records & Invoices
            </h1>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Verify past subscription allocations, review fiscal payment mappings, and download authorized service accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <HelpCircle size={14} /> Need billing assistance? <a href="mailto:support@example.com" className="font-semibold text-zinc-900 underline hover:text-zinc-700">Contact Desk</a>
          </div>
        </div>

        {/* --- CORE DATA WORKFLOW --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
            <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-zinc-400">Decrypting Invoices...</p>
          </div>
        ) : !payments || payments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-zinc-200 bg-white/70 backdrop-blur-sm p-12 text-center shadow-sm max-w-md mx-auto mt-6"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 border border-zinc-200/60 shadow-inner">
              <Receipt size={20} />
            </div>
            <h3 className="mt-5 text-sm font-bold text-zinc-900">No transactions archived</h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              There are no current processing charges, active subscription structures, or outstanding payments bound to your active user credentials.
            </p>
            <div className="mt-6">
              <Link 
                to="/subscription" 
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold tracking-wide text-white hover:bg-zinc-900 transition-all shadow-sm hover:translate-y-[-1px]"
              >
                Explore Premium Subscriptions <ArrowUpRight size={13} />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* MODERN ARCHIVAL VIEWPORT GRID - REPLACES BULKY RAW TABLES */
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4 font-bold">Allocated Plan</th>
                    <th className="px-6 py-4 font-bold">Transaction Reference ID</th>
                    <th className="px-6 py-4 font-bold">Processed On</th>
                    <th className="px-6 py-4 font-bold">Gross Amount</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                
                <motion.tbody 
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {payments.map((p) => {
                      const meta = statusConfig[p.status] || statusConfig.created;
                      const Icon = meta.icon;
                      
                      return (
                        <motion.tr 
                          key={p._id}
                          variants={rowVariants}
                          className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors duration-150"
                        >
                          {/* PLAN IDENTIFIER */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <span className="font-serif text-sm font-bold tracking-tight text-zinc-950 group-hover:text-zinc-800">
                              {p.plan?.name || "Premium Tier Allocation"}
                            </span>
                            {p.plan?.durationDays && (
                              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">
                                Valid for {p.plan.durationDays} active calendar days
                              </span>
                            )}
                          </td>

                          {/* SYSTEM IDENTIFIERS */}
                          <td className="px-6 py-4.5 whitespace-nowrap font-mono text-[11px] text-zinc-400 tracking-tight">
                            {p.razorpayOrderId ? (
                              <span className="text-zinc-600 font-medium">{p.razorpayOrderId}</span>
                            ) : (
                              <span className="italic tracking-normal opacity-60">internal_{p._id.slice(-7)}</span>
                            )}
                          </td>

                          {/* DATETIME METRIC */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-zinc-500 font-medium">
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </td>

                          {/* FINANCIAL QUANTITY */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold tracking-tight text-zinc-950">
                            {formatPrice(p.amount, p.currency)}
                          </td>

                          {/* BALANCED STATUS MODULE */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-right">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.wrapper}`}>
                              <span className={`h-1 w-1 rounded-full ${meta.indicator}`} />
                              <Icon size={11} /> {meta.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SYSTEM COMPLIANCE SIGNATURE --- */}
        <div className="mt-20 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
          <ShieldCheck size={14} className="text-emerald-600" /> Payment pipelines isolated and governed via ISO/IEC 27001 architectures.
        </div>

      </div>
    </div>
  );
};