import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface WizardStep { id: number; title: string; icon: React.ComponentType<{ size?: number }> }

/**
 * Top stepper: numbered circles connected by an animated fill line.
 * Collapses to a compact "Step X of N" bar with the same progress line on mobile.
 */
export const WizardStepper = ({
  steps, current, furthestReached, onJump,
}: { steps: WizardStep[]; current: number; furthestReached: number; onJump: (id: number) => void }) => {
  const progressPct = (current / (steps.length - 1)) * 100;

  return (
    <div className="mb-10">
      {/* Desktop: full stepper */}
      <div className="relative hidden md:block">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-line" />
        <motion.div
          className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-deep to-gold"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const done = step.id < current;
            const active = step.id === current;
            const reachable = step.id <= furthestReached;
            return (
              <button
                key={step.id}
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(step.id)}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{
                    scale: active ? 1.12 : 1,
                    backgroundColor: done || active ? "#0B4D3B" : "#FFFFFF",
                    borderColor: done || active ? "#0B4D3B" : "#EFE8DD",
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm"
                >
                  {done ? <Check size={16} className="text-cream" /> : (
                    <span className={`text-xs font-extrabold ${active ? "text-cream" : "text-muted"}`}>{step.id + 1}</span>
                  )}
                </motion.div>
                <span className={`max-w-[80px] text-center text-[11px] font-bold leading-tight ${active ? "text-deep" : "text-muted"}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
          <span>Step {current + 1} of {steps.length}</span>
          <span className="text-deep">{steps[current].title}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-deep to-gold"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};
