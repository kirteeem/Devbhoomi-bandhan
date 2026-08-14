import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Lock, X } from "lucide-react";

interface Props {
  open: boolean;
  freeUnlocksRemaining: number;
  /** Only used when isPremium is true. */
  planUnlocksRemaining?: number;
  isPremium?: boolean;
  isUnlocking: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * The confirmation popup shown before a member's contact details (phone,
 * email, address) get revealed for the first time. Confirming spends one
 * credit and permanently unlocks that profile's full details together —
 * the single unlock action for the whole profile.
 *
 * Both free AND Premium members see this — Premium members used to skip it
 * entirely (contact info unlocked the instant they opened a profile, with
 * no confirmation and no visible running total). They now get the same
 * "are you sure?" step, just drawing from their 10-per-period plan quota
 * instead of the 5 lifetime free unlocks.
 */
export const UnlockProfileModal = ({
  open,
  freeUnlocksRemaining,
  planUnlocksRemaining = 0,
  isPremium = false,
  isUnlocking,
  error,
  onCancel,
  onConfirm,
}: Props) => {
  const remaining = isPremium ? planUnlocksRemaining : freeUnlocksRemaining;
  const noUnlocksLeft = remaining <= 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="card relative w-full max-w-sm overflow-hidden p-7 text-center shadow-2xl"
          >
            <button
              onClick={onCancel}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-muted transition-colors hover:bg-black/5 hover:text-foreground"
            >
              <X size={16} />
            </button>

            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                noUnlocksLeft ? "bg-line text-muted" : "bg-gold/15 text-gold"
              }`}
            >
              {noUnlocksLeft ? <Lock size={24} /> : <Sparkles size={24} />}
            </div>

            {noUnlocksLeft ? (
              <>
                <h3 className="font-display text-lg font-bold">
                  {isPremium ? "Plan Unlocks Used Up" : "Free Unlocks Used Up"}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {isPremium
                    ? "You've used all 10 of your plan's profile unlocks for this period. New unlocks refresh with your next plan renewal."
                    : "You've used all 5 of your free profile unlocks. Upgrade to Premium for 10 profile unlocks every plan period."}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button onClick={onCancel} className="btn-ghost">
                    Not Now
                  </button>
                  {!isPremium && (
                    <Link to="/subscription" className="btn-gold">
                      Upgrade to Premium
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold">Do you want to view this member's details?</h3>
                <p className="mt-2 text-sm text-muted">
                  You have <span className="font-bold text-maroon">{remaining}</span>{" "}
                  {isPremium ? "plan" : "free"} profile unlock
                  {remaining === 1 ? "" : "s"} remaining. Viewing reveals this member's full profile details —
                  including their phone number, email and address — permanently.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button onClick={onCancel} className="btn-ghost" disabled={isUnlocking}>
                    Cancel
                  </button>
                  <button onClick={onConfirm} className="btn-primary" disabled={isUnlocking}>
                    {isUnlocking ? "Unlocking..." : "Yes, View Details"}
                  </button>
                </div>
                {error && (
                  <p className="mt-3 rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-xs font-medium text-rose-600">
                    {error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
