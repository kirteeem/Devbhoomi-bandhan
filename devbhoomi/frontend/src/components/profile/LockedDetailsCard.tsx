import { Lock, Sparkles, Key } from "lucide-react";

interface Props {
  freeUnlocksRemaining: number;
  planUnlocksRemaining?: number;
  isPremium?: boolean;
  onUnlockClick: () => void;
}

export const LockedDetailsCard = ({
  freeUnlocksRemaining,
  planUnlocksRemaining = 0,
  isPremium = false,
  onUnlockClick,
}: Props) => {
  const totalUnlocks = freeUnlocksRemaining + planUnlocksRemaining;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-stone-50 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B1F2A] text-white shadow-sm">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Contact Details Locked
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
              Unlock to view phone numbers, email address, and location details directly.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                <Key size={11} /> {totalUnlocks} Unlocks Available
              </span>
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#6B1F2A]/10 px-2 py-0.5 text-[10px] font-bold text-[#6B1F2A]">
                  <Sparkles size={11} /> Premium Access
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onUnlockClick}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B1F2A] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#541821] active:scale-95"
        >
          <Key size={14} />
          <span>Unlock Details</span>
        </button>
      </div>
    </div>
  );
};