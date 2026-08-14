import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Lock, Loader2, ArrowLeft, CheckCircle2, Building, HelpCircle } from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";

interface Plan {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  priceInPaise: number;
  currency: string;
  durationDays: number;
  features: string[];
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const formatPrice = (paise: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(paise / 100);

export const Checkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"idle" | "paying" | "verifying">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => (await api.get<{ data: { plans: Plan[] } }>("/subscriptions/plans")).data.data.plans,
  });

  const plan = plans?.find((p) => p._id === planId);

  const handlePay = async () => {
    if (!plan) return;
    setError("");
    setStatus("paying");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load the payment gateway. Check your connection and try again.");
        setStatus("idle");
        return;
      }

      const { data } = await api.post("/payments/create-order", { planId: plan._id });
      const order = data.data;

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Devbhoomi Bandhan",
        description: `${plan.name} — ${plan.durationDays} days`,
        prefill: { name: user?.fullName },
        theme: { color: "#7A1E3A" },
        handler: async (response: any) => {
          setStatus("verifying");
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            navigate("/payment/success", { state: { planName: plan.name, amount: plan.priceInPaise, currency: plan.currency } });
          } catch (err: any) {
            setError(err.response?.data?.message || "Payment verification failed. If you were charged, contact support.");
            setStatus("idle");
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again or use a different payment method.");
        setStatus("idle");
      });

      razorpay.open();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not start checkout. Please try again.");
      setStatus("idle");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        <p className="text-sm font-medium text-slate-500">Securing your session...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-slate-500">This plan could not be found or has expired.</p>
        <Link to="/subscription" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to plans
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Top Professional Minimal Navbar Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-maroon transition">
            <ArrowLeft size={16} /> Back to pricing
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            <Lock size={14} className="text-emerald-600" /> Secure 256-Bit SSL Checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
        {/* Two-Column Matrix Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          
          {/* LEFT COLUMN: Payment Processing Steps */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* Step 1: Account Identification */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 ring-4 ring-emerald-50">✓</span>
                  <h2 className="text-base font-bold text-slate-800">1. Account Information</h2>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-1 rounded">Verified</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-150 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{user?.fullName || "Active User"}</p>
<div className="rounded-xl bg-slate-50 p-4 border border-slate-150 flex justify-between items-center">
  <div>
    <p className="text-sm font-semibold text-slate-700">{user?.fullName || "Active Member"}</p>
    <p className="text-xs text-slate-500">
      {/* Safely looks for phone, then email, then defaults gracefully */}
      {"phone" in (user || {}) ? (user as any).phone : "Secure Checkout Session"}
    </p>
  </div>
  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
</div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              </div>
            </div>

            {/* Step 2: Payment Selector Container */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon text-xs font-bold text-white">2</span>
                <h2 className="text-base font-bold text-slate-800">Payment Gateway Option</h2>
              </div>

              {/* Styled Interactive Option Wrapper */}
              <div className="rounded-xl border-2 border-maroon bg-maroon/[0.02] p-4 flex items-start gap-4">
                <input type="radio" checked readOnly className="mt-1 accent-maroon h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Razorpay Secure Network</p>
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">UPI</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">CARDS</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">NETBANK</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Supports Instant Refunds, Credit/Debit cards, Net Banking & instant UPI payment matching.</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* High-fidelity Pay Button */}
              <button 
                onClick={handlePay} 
                disabled={status !== "idle"} 
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#7A1E3A] hover:bg-[#61162d] text-white py-4 px-6 rounded-xl font-bold shadow-md shadow-maroon/10 hover:shadow-lg hover:shadow-maroon/20 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === "paying" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Connection established. Launching Gateway...
                  </>
                ) : status === "verifying" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Awaiting Secure Gateway Sign-Off...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Complete Secure Payment — {formatPrice(plan.priceInPaise, plan.currency)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                <span>PCI-DSS Compliant. Fully encrypted architecture.</span>
              </div>
            </div>

            {/* Corporate Reassurance / Security Badges block */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold text-slate-700">Instant Access</p>
                <p className="text-[11px] text-slate-400">Features open instantly</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-xs font-bold text-slate-700">Secure Protocol</p>
                <p className="text-[11px] text-slate-400">End-to-End Encryption</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Support Window</p>
                <p className="text-[11px] text-slate-400">Priority Assistance</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Premium Fixed/Sticky Order Details Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Order Summary</h3>
              
              {/* Product Info Block */}
              <div className="pb-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Duration: {plan.durationDays} Days Membership</p>
                </div>
                <span className="font-bold text-slate-800 text-base">{formatPrice(plan.priceInPaise, plan.currency)}</span>
              </div>

              {/* Subtotal Itemization Line Matrix */}
              <div className="py-4 space-y-2.5 border-b border-slate-100 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(plan.priceInPaise, plan.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">Platform Processing Fee <HelpCircle size={12} className="text-slate-300" /></span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Applicable Taxes / GST</span>
                  <span className="text-xs text-slate-400 font-medium">Inclusive</span>
                </div>
              </div>

              {/* True Highlighted Total Payable Area */}
              <div className="pt-4 flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-base">Total Due Today</span>
                <span className="font-black text-slate-900 text-2xl tracking-tight">{formatPrice(plan.priceInPaise, plan.currency)}</span>
              </div>

              {/* Feature/Inclusions Checklist Proofing */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Included Core Privileges:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Footer Reference inside summary */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <Building size={12} />
                <span>Billed by Devbhoomi Bandhan Premium Services Inc.</span>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};