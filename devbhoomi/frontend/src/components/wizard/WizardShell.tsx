import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Loader2, Check } from "lucide-react";

/**
 * Layout wrapper for every wizard step: glass card, animated step transitions,
 * sticky prev/next footer, and a floating "Save Draft" button.
 */
export const WizardShell = ({
  children,
  onBack,
  onNext,
  onSaveDraft,
  isFirst,
  isLast,
  isSaving,
  isSubmitting,
  nextLabel = "Continue",
}: {
  children: ReactNode;
  direction: 1 | -1;
  stepKey: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  nextLabel?: string;
}) => (
  <div className="relative pb-28">
    <div className="overflow-hidden rounded-[28px] border border-white/40 bg-white/50 p-1.5 shadow-[0_30px_60px_-30px_rgba(11,77,59,0.35)] backdrop-blur-xl">
      <div className="relative min-h-[420px] rounded-[24px] bg-cream/95 p-6 sm:p-10">
        <div>
          {children}
        </div>
      </div>
    </div>

    {/* Floating Save Draft button */}
    <motion.button
      type="button"
      onClick={onSaveDraft}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-28 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-[#b9902a] px-5 py-3 text-sm font-bold text-[#2b1c05] shadow-xl shadow-gold/30 sm:bottom-8"
    >
      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      Save Draft
    </motion.button>

    {/* Sticky Prev/Next footer */}
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="flex items-center gap-1.5 rounded-2xl border border-line px-5 py-3 text-sm font-bold text-ink/70 transition-colors hover:border-deep hover:text-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-deep to-forest-dark px-6 py-3 text-sm font-bold text-cream shadow-lg shadow-deep/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isLast ? (
            <Check size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
          {isLast ? "Submit Profile" : nextLabel}
        </button>
      </div>
    </div>
  </div>
);