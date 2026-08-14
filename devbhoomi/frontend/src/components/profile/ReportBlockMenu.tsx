import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MoreVertical, Flag, ShieldOff, X, Loader2, CheckCircle2 } from "lucide-react";
import { reportUser, blockUser, REPORT_REASON_LABELS, type ReportReason } from "../../lib/safetyApi";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";

interface Props {
  targetUserId: string;
  targetUserName?: string;
  // Optional: called after a successful block so the caller can hide/remove
  // this profile/card from the current view immediately, instead of waiting
  // for a full refetch.
  onBlocked?: () => void;
  className?: string;
}

type ModalMode = null | "report" | "block-confirm";

// Small "···" menu that opens a Report or Block flow. Self-contained —
// stops event propagation so it's safe to drop inside a clickable
// <Link>-wrapped card (see ProfileCard.tsx) without triggering navigation.
export const ReportBlockMenu = ({ targetUserId, targetUserName, onBlocked, className = "" }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [reason, setReason] = useState<ReportReason>("fake_profile");
  const [message, setMessage] = useState("");

  const reportMutation = useMutation({
    mutationFn: () => reportUser(targetUserId, reason, message || undefined),
  });

  const blockMutation = useMutation({
    mutationFn: () => blockUser(targetUserId),
    onSuccess: () => onBlocked?.(),
  });

  const stop = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const closeAll = (e?: React.MouseEvent) => {
    e && stop(e);
    setMenuOpen(false);
    setModal(null);
  };

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setMenuOpen((o) => !o);
        }}
        aria-label="More options"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition hover:bg-white hover:text-neutral-900"
      >
        <MoreVertical size={15} />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 top-full z-30 mt-1.5 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setModal("report");
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <Flag size={13} /> Report
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setModal("block-confirm");
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            <ShieldOff size={13} /> Block
          </button>
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => closeAll(e)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === "report" && !reportMutation.isSuccess && (
              <form onSubmit={(e) => { stop(e); reportMutation.mutate(); }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Report {targetUserName || "this profile"}
                  </h3>
                  <button type="button" onClick={(e) => closeAll(e)} className="text-neutral-400 hover:text-neutral-700">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(Object.keys(REPORT_REASON_LABELS) as ReportReason[]).map((r) => (
                    <label
                      key={r}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        reason === r ? "border-maroon bg-maroon/5 text-maroon" : "border-line text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        className="accent-maroon"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                      />
                      {REPORT_REASON_LABELS[r]}
                    </label>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Add any details that might help our team (optional)"
                  className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-maroon"
                />

                {reportMutation.isError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{getFriendlyErrorMessage(reportMutation.error)}</p>
                )}

                <button
                  type="submit"
                  disabled={reportMutation.isPending}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-maroon px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-maroon-dark disabled:opacity-60"
                >
                  {reportMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Submit Report
                </button>
              </form>
            )}

            {modal === "report" && reportMutation.isSuccess && (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
                <p className="text-sm font-bold text-neutral-900">Report submitted</p>
                <p className="text-xs text-neutral-500">Our team will review it shortly. Thanks for keeping the community safe.</p>
                <button
                  type="button"
                  onClick={(e) => closeAll(e)}
                  className="mt-2 rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>
              </div>
            )}

            {modal === "block-confirm" && !blockMutation.isSuccess && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900">Block {targetUserName || "this member"}?</h3>
                  <button type="button" onClick={(e) => closeAll(e)} className="text-neutral-400 hover:text-neutral-700">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-neutral-500">
                  They won't be able to view your profile or contact you — and you won't see
                  them either. You can unblock them anytime from Settings.
                </p>
                {blockMutation.isError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{getFriendlyErrorMessage(blockMutation.error)}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { stop(e); blockMutation.mutate(); }}
                    disabled={blockMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                  >
                    {blockMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                    Yes, Block
                  </button>
                  <button
                    type="button"
                    onClick={(e) => closeAll(e)}
                    className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal === "block-confirm" && blockMutation.isSuccess && (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
                <p className="text-sm font-bold text-neutral-900">Member blocked</p>
                <button
                  type="button"
                  onClick={(e) => closeAll(e)}
                  className="mt-2 rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
