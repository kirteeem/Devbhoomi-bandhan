import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Loader2, X, Check, XCircle, ZoomIn, BadgeCheck, FileWarning,
} from "lucide-react";
import { getDisplayPhoto, resolvePhotoUrl } from "../../lib/media";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";
import {
  fetchVerificationRequests, approveVerificationRequest, rejectVerificationRequest,
  type VerificationRequestItem,
} from "../../lib/adminApi";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const REJECTION_PRESETS = [
  "Name does not match your profile.",
  "Address does not match the submitted document.",
  "Uploaded image is unclear.",
  "Invalid document.",
  "Document is expired.",
];

const StatusChip = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || ""}`}>
    {status}
  </span>
);

const calcAge = (dob?: string) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

export const VerificationRequestsPanel = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VerificationRequestItem | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-verification-requests", status, search, page],
    queryFn: () => fetchVerificationRequests({ status, search: search || undefined, page, limit: 12 }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-verification-requests"] });

  const openDetail = (r: VerificationRequestItem) => {
    setSelected(r);
    setZoomed(false);
    setRejecting(false);
    setRejectionReason("");
    setActionError("");
  };

  const handleApprove = async () => {
    if (!selected) return;
    setBusy(true);
    setActionError("");
    try {
      await approveVerificationRequest(selected._id);
      refresh();
      setSelected(null);
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (rejectionReason.trim().length < 5) {
      setActionError("Please select or type a reason (at least 5 characters).");
      return;
    }
    setBusy(true);
    setActionError("");
    try {
      await rejectVerificationRequest(selected._id, rejectionReason.trim());
      refresh();
      setSelected(null);
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const requests = data?.requests || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold capitalize transition-colors ${
              status === s ? "bg-[#7B1E3D] text-white" : "bg-white border border-[#ECE8E2] text-[#1A1A1A]/60 hover:bg-[#FAF8F5]"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="relative ml-auto max-w-xs flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone, ID"
            className="w-full rounded-xl border border-[#ECE8E2] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#7B1E3D]"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-xs text-[#1A1A1A]/40">
          <Loader2 size={14} className="animate-spin" /> Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ECE8E2] bg-white py-14 text-center">
          <FileWarning size={22} className="mx-auto mb-2 text-[#1A1A1A]/20" />
          <p className="text-xs font-semibold text-[#1A1A1A]/40">No {status} verification requests right now.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE8E2] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E2]">
              {requests.map((r) => {
                const u = typeof r.userId === "object" ? r.userId : null;
                const age = calcAge(u?.dateOfBirth);
                const photo = u?.photos?.find((p) => p.isProfilePhoto) || u?.photos?.[0];
                return (
                  <tr key={r._id} className="hover:bg-[#FAF8F5]/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={photo?.url ? resolvePhotoUrl(photo.url) : getDisplayPhoto(null, u?.gender, u?._id)}
                          alt={u?.fullName}
                          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#1A1A1A]">{u?.fullName || "—"}</p>
                          <p className="text-[10px] text-[#1A1A1A]/40">
                            {age ? `${age} Yrs · ` : ""}{u?.gender || ""} {u?.profileCode ? `· ${u.profileCode}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1A1A1A]/60">{u?.email || u?.phone || "—"}</td>
                    <td className="px-4 py-3 uppercase text-[#1A1A1A]/60">{r.documentType}</td>
                    <td className="px-4 py-3 text-[#1A1A1A]/60">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusChip status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-[11px] font-bold text-[#1A1A1A]/70 hover:bg-white"
                      >
                        View Document
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-xs font-bold disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-xs font-semibold text-[#1A1A1A]/50">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[#ECE8E2] px-3 py-1.5 text-xs font-bold disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail / Document review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A]">Verification Request</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-[#1A1A1A]/40 hover:bg-[#FAF8F5]">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Document image */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">
                  Uploaded {selected.documentType === "pan" ? "PAN" : "Aadhaar"} Card
                </p>
                <button
                  onClick={() => setZoomed(true)}
                  className="group relative block w-full overflow-hidden rounded-xl border border-[#ECE8E2]"
                >
                  <img src={selected.documentImage} alt="Submitted document" className="w-full object-contain" />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn size={12} /> Zoom
                  </span>
                </button>
              </div>

              {/* User info */}
              <div className="space-y-2 text-xs">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Profile Information</p>
                {typeof selected.userId === "object" && (
                  <dl className="space-y-1.5">
                    {[
                      ["Name", selected.userId.fullName],
                      ["Age", calcAge(selected.userId.dateOfBirth)?.toString()],
                      ["Gender", selected.userId.gender],
                      ["Email", selected.userId.email],
                      ["Phone", selected.userId.phone],
                      ["Profile Code", selected.userId.profileCode],
                      ["District", selected.userId.district],
                      ["City", selected.userId.city],
                      ["Address", selected.userId.address],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label} className="flex justify-between border-b border-dashed border-[#ECE8E2] pb-1">
                          <dt className="text-[#1A1A1A]/40">{label}</dt>
                          <dd className="font-bold text-[#1A1A1A]">{value}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>
                )}
                <p className="pt-2 text-[10px] italic text-[#1A1A1A]/40">
                  Manually check: does the name and address on the document match this member's profile and photo?
                </p>
              </div>
            </div>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                {actionError}
              </div>
            )}

            {selected.status === "pending" && !rejecting && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            )}

            {selected.status === "pending" && rejecting && (
              <div className="mt-5 space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
                <p className="text-xs font-bold text-red-800">Why is this being rejected?</p>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setRejectionReason(preset)}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        rejectionReason === preset ? "border-red-400 bg-red-100 text-red-800" : "border-[#ECE8E2] bg-white text-[#1A1A1A]/60"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Explain what's wrong with the submission…"
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Confirm Rejection
                  </button>
                  <button
                    onClick={() => setRejecting(false)}
                    className="rounded-xl border border-[#ECE8E2] px-4 py-2 text-xs font-bold text-[#1A1A1A]/60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selected.status !== "pending" && (
              <div className="mt-5">
                <StatusChip status={selected.status} />
                {selected.status === "rejected" && selected.rejectionReason && (
                  <p className="mt-2 text-xs text-red-700">Reason: {selected.rejectionReason}</p>
                )}
                {selected.status === "verified" && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck size={13} /> Verified {selected.reviewedAt ? `on ${new Date(selected.reviewedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image zoom overlay */}
      {zoomed && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6" onClick={() => setZoomed(false)}>
          <img src={selected.documentImage} alt="Zoomed document" className="max-h-full max-w-full rounded-lg object-contain" />
          <button onClick={() => setZoomed(false)} className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
