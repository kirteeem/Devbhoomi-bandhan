import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, ShieldCheck, X } from "lucide-react";
import { api } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";

/**
 * Shown once on the dashboard for members who signed up with Google (so we
 * already have their real name/email straight from Google — never asked
 * twice) but don't have a phone number on file yet. Lets them add + verify
 * one via OTP, without ever re-asking for Gmail details.
 */
export const VerifyPhoneBanner = () => {
  const { user, updateUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user || user.phone || user.isPhoneVerified || dismissed) return null;

  const requestCode = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/phone/request-otp", { phone });
      setStep("code");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/phone/verify-otp", { phone, code });
      updateUser(data.data.user);
      setDismissed(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded-full p-1 text-amber-700/60 hover:bg-amber-100 hover:text-amber-900"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <span className="mt-0.5 rounded-xl bg-amber-100 p-2 text-amber-700">
            <Smartphone size={16} />
          </span>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-bold text-amber-900">Add and verify your phone number</p>
            <p className="text-xs text-amber-800/80">
              You signed up with Google, so we don't have a phone number for you yet. Add one so other members and
              our support team can reach you — it only takes a moment.
            </p>

            {step === "phone" ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={requestCode}
                  disabled={busy || !phone.trim()}
                  className="rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-32 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium tracking-widest focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={verifyCode}
                  disabled={busy || code.length < 6}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  <ShieldCheck size={13} />
                  {busy ? "Verifying…" : "Verify"}
                </button>
                <button
                  onClick={() => setStep("phone")}
                  className="text-[11px] font-semibold text-amber-700 underline underline-offset-2"
                >
                  Change number
                </button>
              </div>
            )}
            {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
