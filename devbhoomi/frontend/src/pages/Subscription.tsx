import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, ShieldCheck, Receipt } from "lucide-react";
import { api } from "../lib/axios";

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

const formatPrice = (paise: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(paise / 100);

export const Subscription = () => {
  const navigate = useNavigate();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => (await api.get<{ data: { plans: Plan[] } }>("/subscriptions/plans")).data.data.plans,
  });

  const { data: mySubscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () =>
      (await api.get<{ data: { isPremium: boolean; premiumUntil: string | null; subscription: any } }>("/subscriptions/me")).data
        .data,
  });

  // The actual payment-gateway flow (order creation + Razorpay checkout) now
  // lives on its own dedicated page so the plan picker stays focused on choice.
  const goToCheckout = (plan: Plan) => navigate(`/checkout/${plan._id}`);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 pt-28">
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-maroon/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-maroon">
          <Crown size={13} /> Premium Membership
        </div>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Choose your plan</h1>
        <p className="mt-2 text-sm text-muted">Unlock unlimited profile views, clear photos, and priority visibility.</p>

        {mySubscription?.isPremium && mySubscription.premiumUntil && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
            <ShieldCheck size={14} />
            Premium active until {new Date(mySubscription.premiumUntil).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="mx-auto mb-8 flex max-w-xl justify-center">
        <Link to="/payments/history" className="flex items-center gap-1.5 text-sm font-bold text-maroon hover:underline">
          <Receipt size={15} /> View payment history
        </Link>
      </div>

      {plansLoading ? (
        <div className="py-24 text-center text-muted">Loading plans...</div>
      ) : (
        <div className="mx-auto grid max-w-md gap-6">
          {plans?.map((plan) => {
            const isPopular = plan.slug === "premium";
            const isCurrent = mySubscription?.subscription?.plan?._id === plan._id && mySubscription?.isPremium;

            return (
              <div
                key={plan._id}
                className={`card relative flex flex-col p-7 ${isPopular ? "border-gold shadow-xl shadow-gold/10 sm:-translate-y-2" : ""}`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-gold to-[#b9902a] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2b1c05]">
                    Most Popular
                  </span>
                )}

                <h3 className="font-display text-xl font-extrabold">{plan.name}</h3>
                {plan.tagline && <p className="mt-1 text-xs text-muted">{plan.tagline}</p>}

                <div className="my-5">
                  <span className="font-display text-3xl font-extrabold">{formatPrice(plan.priceInPaise, plan.currency)}</span>
                  <span className="text-sm text-muted"> / {plan.durationDays} days</span>
                </div>

                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={15} className="mt-0.5 flex-shrink-0 text-forest" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => goToCheckout(plan)}
                  disabled={isCurrent}
                  className={`${isPopular ? "btn-gold" : "btn-primary"} w-full disabled:opacity-60`}
                >
                  {isCurrent ? "Current Plan" : "Choose Plan"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted">
        Payments are processed securely via Razorpay. All plans renew manually — no auto-billing.
      </p>
    </div>
  );
};
