import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, X, Star, Languages, Briefcase, Phone, CheckCircle2, PauseCircle, PlayCircle,
} from "lucide-react";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";
import {
  fetchAdminPriests, fetchAdminPriestDetail, disableAdminPriest, enableAdminPriest,
  type AdminPriest,
} from "../../lib/adminApi";

const KUNDALI_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_review: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export const PriestsPanel = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["admin-priests"], queryFn: fetchAdminPriests });
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-priest-detail", selectedId],
    queryFn: () => fetchAdminPriestDetail(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-priests"] });
    queryClient.invalidateQueries({ queryKey: ["admin-priest-detail"] });
  };

  const toggleAvailability = async (p: AdminPriest) => {
    setBusy(true);
    setActionError("");
    try {
      if (p.isAvailable) await disableAdminPriest(p._id);
      else await enableAdminPriest(p._id);
      refresh();
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const priests = data?.priests || [];

  return (
    <div className="space-y-5">
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{actionError}</div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-xs text-[#1A1A1A]/40">
          <Loader2 size={14} className="animate-spin" /> Loading priests…
        </div>
      ) : priests.length === 0 ? (
        <p className="py-10 text-center text-xs font-semibold text-[#1A1A1A]/40">No priest/team accounts yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priests.map((p) => (
            <div key={p._id} className="flex flex-col rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={p.photoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(p.displayName)}
                  alt={p.displayName}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#1A1A1A]">{p.displayName}</p>
                  <p className="flex items-center gap-1 text-[10px] text-[#1A1A1A]/40">
                    <Star size={11} className="text-amber-500" fill="#f59e0b" /> {p.rating?.toFixed?.(1) ?? "—"} · {p.yearsOfExperience} yrs exp.
                  </p>
                </div>
                <span
                  className={`ml-auto flex-shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                    p.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {p.isAvailable ? "Active" : "Disabled"}
                </span>
              </div>

              {p.languages?.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#1A1A1A]/60">
                  <Languages size={12} /> {p.languages.join(", ")}
                </p>
              )}
              {p.user?.phone && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#1A1A1A]/60">
                  <Phone size={12} /> {p.user.phone}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-[#FAF8F5] py-2">
                  <p className="text-sm font-bold text-[#1A1A1A]">{p.activeJobs}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Active Jobs</p>
                </div>
                <div className="rounded-xl bg-[#FAF8F5] py-2">
                  <p className="text-sm font-bold text-[#1A1A1A]">{p.completedKundalis}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Completed</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedId(p._id)}
                  className="flex-1 rounded-xl border border-[#ECE8E2] py-2 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#FAF8F5]"
                >
                  View
                </button>
                <button
                  onClick={() => toggleAvailability(p)}
                  disabled={busy}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold disabled:opacity-50 ${
                    p.isAvailable ? "border border-red-200 text-red-700 hover:bg-red-50" : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {p.isAvailable ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                  {p.isAvailable ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Priest detail drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedId(null)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A]">Priest Profile</h3>
              <button onClick={() => setSelectedId(null)} className="rounded-lg p-1 text-[#1A1A1A]/40 hover:bg-[#FAF8F5]">
                <X size={18} />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="flex items-center gap-2 py-10 text-xs text-[#1A1A1A]/40">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{detail.priest.displayName}</p>
                  <p className="text-xs text-[#1A1A1A]/50">{detail.priest.bio}</p>
                  {detail.priest.specializations?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detail.priest.specializations.map((s) => (
                        <span key={s} className="rounded-full bg-[#7B1E3D]/5 px-2 py-0.5 text-[10px] font-semibold text-[#7B1E3D]">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Pending", detail.stats.pending],
                    ["In Review", detail.stats.inReview],
                    ["Completed", detail.stats.completed],
                    ["Cancelled", detail.stats.cancelled],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-xl bg-[#FAF8F5] py-2.5">
                      <p className="text-sm font-bold text-[#1A1A1A]">{value as number}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/50 p-3 text-[11px] text-[#1A1A1A]/50">
                  <Briefcase size={12} className="mb-1 inline" /> Income tracking isn't applicable — kundali matching is a free member
                  benefit on this platform, not a paid marketplace, so there's no per-kundali payment to show here.
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Kundali History</p>
                  {detail.history.length === 0 ? (
                    <p className="text-xs text-[#1A1A1A]/40">No kundali requests assigned yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.history.map(({ request, report }) => (
                        <div key={request._id} className="rounded-xl border border-[#ECE8E2] p-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-[#1A1A1A]">
                              {request.profileA?.fullName || "—"} & {request.profileB?.fullName || "—"}
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${KUNDALI_STATUS_STYLES[request.status]}`}>
                              {request.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] text-[#1A1A1A]/40">
                            Requested by {request.requestedBy?.fullName || "—"} · {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          {report && (
                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700">
                              <CheckCircle2 size={12} /> Compatibility: {report.gunMilanScore ?? "—"}/36
                              {report.recommendation ? ` · ${report.recommendation.replace(/_/g, " ")}` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
