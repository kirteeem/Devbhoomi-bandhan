import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, X, FileWarning } from "lucide-react";
import { fetchAdminKundaliHistory, fetchAdminKundaliDetail } from "../../lib/adminApi";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_review: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export const KundaliHistoryPanel = () => {
  const [status, setStatus] = useState<"" | "pending" | "in_review" | "completed" | "cancelled">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-kundali-history", status, search, page],
    queryFn: () => fetchAdminKundaliHistory({ status: status || undefined, search: search || undefined, page, limit: 12 }),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-kundali-detail", selectedId],
    queryFn: () => fetchAdminKundaliDetail(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const history = data?.history || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["", "pending", "in_review", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-colors ${
              status === s ? "bg-[#7B1E3D] text-white" : "bg-white border border-[#ECE8E2] text-[#1A1A1A]/60 hover:bg-[#FAF8F5]"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
        <div className="relative ml-auto max-w-xs flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customer, bride, groom, or priest"
            className="w-full rounded-xl border border-[#ECE8E2] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#7B1E3D]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-xs text-[#1A1A1A]/40">
          <Loader2 size={14} className="animate-spin" /> Loading kundali history…
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ECE8E2] bg-white py-14 text-center">
          <FileWarning size={22} className="mx-auto mb-2 text-[#1A1A1A]/20" />
          <p className="text-xs font-semibold text-[#1A1A1A]/40">No kundali requests match these filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE8E2] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Bride & Groom</th>
                <th className="px-4 py-3">Priest</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E2]">
              {history.map(({ request, report }) => (
                <tr key={request._id} className="hover:bg-[#FAF8F5]/60">
                  <td className="px-4 py-3 font-bold text-[#1A1A1A]">{request.requestedBy?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">
                    {request.profileA?.fullName || "—"} & {request.profileB?.fullName || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">{request.assignedPriest?.displayName || "Unassigned"}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">{report?.gunMilanScore != null ? `${report.gunMilanScore}/36` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[request.status]}`}>
                      {request.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedId(request._id)}
                      className="rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-[11px] font-bold text-[#1A1A1A]/70 hover:bg-white"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-xs font-bold disabled:opacity-30">Prev</button>
          <span className="text-xs font-semibold text-[#1A1A1A]/50">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-xs font-bold disabled:opacity-30">Next</button>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedId(null)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A]">Kundali Report</h3>
              <button onClick={() => setSelectedId(null)} className="rounded-lg p-1 text-[#1A1A1A]/40 hover:bg-[#FAF8F5]">
                <X size={18} />
              </button>
            </div>
            {detailLoading || !detail ? (
              <div className="flex items-center gap-2 py-10 text-xs text-[#1A1A1A]/40">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : (
              <dl className="space-y-2 text-xs">
                {[
                  ["Customer", detail.request.requestedBy?.fullName],
                  ["Bride", detail.request.profileA?.fullName],
                  ["Groom", detail.request.profileB?.fullName],
                  ["Priest", detail.request.assignedPriest?.displayName],
                  ["Date", new Date(detail.request.createdAt).toLocaleDateString()],
                  ["Status", detail.request.status.replace("_", " ")],
                  ["Compatibility Score", detail.report?.gunMilanScore != null ? `${detail.report.gunMilanScore}/36` : "Not yet reported"],
                  ["Manglik Dosha", detail.report?.manglikDosha],
                  ["Recommendation", detail.report?.recommendation?.replace(/_/g, " ")],
                  [
                    "Time Taken",
                    detail.report?.timeTakenMinutes
                      ? `${detail.report.timeTakenMinutes} min`
                      : detail.report
                        ? `${Math.round((new Date(detail.report.createdAt).getTime() - new Date(detail.request.createdAt).getTime()) / 60000)} min (estimated)`
                        : "—",
                  ],
                  ["Summary", detail.report?.summary],
                  ["Notes", detail.report?.notes],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label} className="flex justify-between gap-4 border-b border-dashed border-[#ECE8E2] pb-1.5">
                      <dt className="flex-shrink-0 font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1A]/40">{label}</dt>
                      <dd className="text-right font-medium text-[#1A1A1A]">{value}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
