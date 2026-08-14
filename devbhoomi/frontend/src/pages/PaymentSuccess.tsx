import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Crown, Receipt } from "lucide-react";

const formatPrice = (paise?: number, currency?: string) => {
  if (!paise) return null;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(paise / 100);
};

/** Route: /payment/success — shown right after Checkout verifies a payment. */
export const PaymentSuccess = () => {
  const location = useLocation();
  const state = (location.state as { planName?: string; amount?: number; currency?: string }) || {};

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold">Payment Successful!</h1>
      <p className="mt-2 text-sm text-muted">
        {state.planName ? (
          <>
            You're now on the <span className="font-bold text-maroon">{state.planName}</span> plan.
          </>
        ) : (
          "Your subscription is now active."
        )}
      </p>

      {state.amount != null && (
        <div className="mt-6 w-full rounded-xl border border-line bg-cream px-5 py-4 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Plan</span>
            <span className="font-bold">{state.planName}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted">Amount Paid</span>
            <span className="font-bold">{formatPrice(state.amount, state.currency)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard" className="btn-primary">
          <Crown size={16} /> Go to Dashboard
        </Link>
        <Link to="/payments/history" className="btn-ghost">
          <Receipt size={16} /> View Receipt
        </Link>
      </div>
    </div>
  );
};
