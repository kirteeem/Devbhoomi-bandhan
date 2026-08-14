import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck, Users, UserCog, Ban, XCircle,
  Search, Loader2, ChevronDown, AlertTriangle, Flag, CircleSlash, Eye, BadgeCheck, Sparkles,
  LayoutGrid, Radio, LogIn, UserPlus, FileWarning, ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDisplayPhoto } from "../../lib/media";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";
import {
  fetchAdminUsers, fetchTeamMembers, fetchAdminAnalytics,
  verifyAdminUser, unverifyAdminUser, suspendAdminUser, changeAdminUserRole,
  fetchAdminReports, resolveAdminReport,
  type AdminUser, type AdminReport,
} from "../../lib/adminApi";
import { VerificationRequestsPanel } from "../../components/admin/VerificationRequestsPanel";
import { PriestsPanel } from "../../components/admin/PriestsPanel";
import { KundaliHistoryPanel } from "../../components/admin/KundaliHistoryPanel";

type Tab = "overview" | "verification" | "priests" | "kundali" | "members" | "team" | "reports";

// --- Overview tab: site-wide numbers an admin actually needs at a glance. ---
// Deliberately NOT the member-facing dashboard (no "New Matches", "Free
// Unlocks", "Suggested Profiles" etc.) — this is operational data about the
// platform itself.
const StatCard = ({
  icon: Icon, label, value, hint, tone = "default",
}: {
  icon: any; label: string; value: number | string; hint?: string; tone?: "default" | "warn" | "danger";
}) => {
  const toneClasses =
    tone === "warn" ? "text-amber-700 bg-amber-50" : tone === "danger" ? "text-red-700 bg-red-50" : "text-[#7B1E3D] bg-[#7B1E3D]/10";
  return (
    <div className="rounded-2xl border border-[#ECE8E2] bg-white p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon size={16} />
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1A1A1A]">{value}</div>
      <div className="mt-0.5 text-xs font-bold text-neutral-800">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-neutral-400">{hint}</div>}
    </div>
  );
};

const OverviewPanel = ({ isAdmin }: { isAdmin: boolean }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAdminAnalytics,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-[#ECE8E2] bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} hint="Registered members" />
        <StatCard icon={Radio} label="Online Now" value={data.onlineNow} hint="Active in the last 10 min" />
        <StatCard icon={LogIn} label="Logged In Today" value={data.loggedInToday} hint="Since midnight" />
        <StatCard icon={UserPlus} label="New Signups Today" value={data.newSignupsToday} hint="Since midnight" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BadgeCheck}
          label="Pending Verification"
          value={data.pendingVerificationRequests}
          hint="Aadhaar/PAN awaiting review"
          tone={data.pendingVerificationRequests > 0 ? "warn" : "default"}
        />
        <StatCard icon={ShieldCheck} label="Verified Profiles" value={data.verifiedProfiles} hint="Blue tick granted" />
        <StatCard
          icon={FileWarning}
          label="Pending Reports"
          value={data.pendingReports}
          hint="Flagged by members"
          tone={data.pendingReports > 0 ? "warn" : "default"}
        />
        {isAdmin ? (
          <StatCard icon={UserCog} label="Total Priests" value={data.totalPriests} hint="Kundali review team" />
        ) : (
          <StatCard icon={Sparkles} label="Verified Profiles" value={data.verifiedProfiles} hint="Blue tick granted" />
        )}
      </div>
      {isAdmin && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShieldAlert} label="Suspended Users" value={data.suspendedUsers} hint="Currently blocked" tone={data.suspendedUsers > 0 ? "danger" : "default"} />
        </div>
      )}
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = {
    admin: "bg-[#7B1E3D]/10 text-[#7B1E3D]",
    priest: "bg-[#C89A45]/15 text-[#8a6a26]",
    user: "bg-zinc-100 text-zinc-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[role] || map.user}`}>
      {role}
    </span>
  );
};

const MemberRow = ({
  member,
  onVerify,
  onUnverify,
  onSuspend,
  onRoleChange,
  isAdmin,
  busyId,
}: {
  member: AdminUser;
  onVerify: (id: string) => void;
  onUnverify: (id: string) => void;
  onSuspend: (id: string) => void;
  onRoleChange: (id: string, role: "user" | "priest" | "admin") => void;
  isAdmin: boolean;
  busyId: string | null;
}) => {
  const [roleOpen, setRoleOpen] = useState(false);
  const photo = member.photos?.find((p) => p.isProfilePhoto) || member.photos?.[0];
  const avatar = getDisplayPhoto(photo?.url, member.gender, member._id);
  const isBusy = busyId === member._id;

  // Simple heuristic to help a reviewer eyeball a name mismatch at a glance —
  // never blocks the action, just flags it visually for a human decision.
  const nameLikelyMismatch =
    !!member.idCardName &&
    !member.idCardName.toLowerCase().includes(member.fullName.toLowerCase().split(" ")[0]) &&
    !member.fullName.toLowerCase().includes(member.idCardName.toLowerCase().split(" ")[0]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#ECE8E2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5 min-w-0">
        <img src={avatar} alt={member.fullName} className="h-12 w-12 flex-shrink-0 rounded-full object-cover border border-[#ECE8E2]" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#1A1A1A] truncate">{member.fullName}</p>
            <RoleBadge role={member.role} />
            {member.isProfileVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
            {member.status !== "active" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {member.status}
              </span>
            )}
          </div>
          <p className="text-xs text-[#1A1A1A]/50 truncate">
            {member.profileCode ? `${member.profileCode} · ` : ""}{member.email || member.phone}
          </p>

          {(member.idCardName || member.verificationRequestedAt) && (
            <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${nameLikelyMismatch ? "text-amber-700" : "text-[#1A1A1A]/60"}`}>
              {nameLikelyMismatch && <AlertTriangle size={11} />}
              ID name submitted: <span className="font-bold">{member.idCardName || "—"}</span>
              <span className="text-[#1A1A1A]/30">vs</span> account name: <span className="font-bold">{member.fullName}</span>
            </div>
          )}

          {(member.aadharImage || member.panImage || member.selfieImage) && (
            <div className="mt-2 flex items-center gap-2">
              {member.selfieImage && (
                <a href={member.selfieImage} target="_blank" rel="noreferrer" className="group relative block">
                  <img
                    src={member.selfieImage}
                    alt="Selfie"
                    className="h-12 w-12 rounded-full border border-[#ECE8E2] object-cover"
                  />
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-[#1A1A1A]/80 px-1 text-[8px] font-bold uppercase tracking-wide text-white">
                    Selfie
                  </span>
                </a>
              )}
              {member.aadharImage && (
                <a href={member.aadharImage} target="_blank" rel="noreferrer" className="group relative block">
                  <img
                    src={member.aadharImage}
                    alt="Aadhaar card"
                    className="h-12 w-20 rounded-lg border border-[#ECE8E2] object-cover"
                  />
                  <span className="absolute -bottom-1.5 left-1 rounded bg-[#1A1A1A]/80 px-1 text-[8px] font-bold uppercase tracking-wide text-white">
                    Aadhaar
                  </span>
                </a>
              )}
              {member.panImage && (
                <a href={member.panImage} target="_blank" rel="noreferrer" className="group relative block">
                  <img
                    src={member.panImage}
                    alt="PAN card"
                    className="h-12 w-20 rounded-lg border border-[#ECE8E2] object-cover"
                  />
                  <span className="absolute -bottom-1.5 left-1 rounded bg-[#1A1A1A]/80 px-1 text-[8px] font-bold uppercase tracking-wide text-white">
                    PAN
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        {!member.isProfileVerified ? (
          <button
            onClick={() => onVerify(member._id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B1E3D] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#63142B] disabled:opacity-50"
          >
            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />} Verify
          </button>
        ) : (
          <button
            onClick={() => onUnverify(member._id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE8E2] px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#FAF8F5] disabled:opacity-50"
          >
            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Revoke
          </button>
        )}

        {isAdmin && (
          <>
            <button
              onClick={() => onSuspend(member._id)}
              disabled={isBusy || member.status !== "active"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              <Ban size={13} /> Suspend
            </button>

            <div className="relative">
              <button
                onClick={() => setRoleOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE8E2] px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#FAF8F5]"
              >
                <UserCog size={13} /> Role <ChevronDown size={12} />
              </button>
              {roleOpen && (
                <div className="absolute right-0 top-full z-20 mt-1.5 w-36 rounded-xl border border-[#ECE8E2] bg-white p-1 shadow-lg">
                  {(["user", "priest", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => { onRoleChange(member._id, r); setRoleOpen(false); }}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold capitalize hover:bg-[#FAF8F5]"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Fake profile",
  spam: "Spam",
  wrong_information: "Wrong information",
  harassment: "Harassment",
  other: "Other",
};

const ReportRow = ({
  report,
  onDismiss,
  onMarkReviewed,
  onSuspendReported,
  isAdmin,
  busyId,
}: {
  report: AdminReport;
  onDismiss: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onSuspendReported: (userId: string) => void;
  isAdmin: boolean;
  busyId: string | null;
}) => {
  const isBusy = busyId === report._id || busyId === report.reportedUser?._id;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#ECE8E2] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
            <Flag size={10} /> {REASON_LABELS[report.reason] || report.reason}
          </span>
          {report.status !== "pending" && (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              {report.status}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#1A1A1A]/40">{new Date(report.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Reported member</span>
          <p className="font-bold text-[#1A1A1A]">
            {report.reportedUser?.fullName || "Deleted member"}{" "}
            {report.reportedUser?.profileCode ? `· ${report.reportedUser.profileCode}` : ""}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Reported by</span>
          <p className="font-bold text-[#1A1A1A]">
            {report.reporter?.fullName || "Unknown"}{" "}
            {report.reporter?.profileCode ? `· ${report.reporter.profileCode}` : ""}
          </p>
        </div>
      </div>

      {report.message && (
        <p className="rounded-lg bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A]/70 italic">"{report.message}"</p>
      )}

      {report.status === "pending" && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isAdmin && (
            <button
              onClick={() => onSuspendReported(report.reportedUser?._id)}
              disabled={isBusy || !report.reportedUser?._id}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              <Ban size={13} /> Suspend Member
            </button>
          )}
          <button
            onClick={() => onMarkReviewed(report._id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE8E2] px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#FAF8F5] disabled:opacity-50"
          >
            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />} Reviewed
          </button>
          <button
            onClick={() => onDismiss(report._id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE8E2] px-3.5 py-2 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#FAF8F5] disabled:opacity-50"
          >
            <CircleSlash size={13} /> Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const isAdmin = user?.role === "admin";

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => fetchAdminUsers({ search: search || undefined, limit: 50 }),
    enabled: tab === "members",
  });
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: fetchTeamMembers,
    enabled: tab === "team",
  });
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => fetchAdminReports("pending"),
    enabled: tab === "reports",
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-team"] });
    queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  };

  const runAction = async (id: string, fn: (id: string) => Promise<any>) => {
    setBusyId(id);
    setActionError("");
    try {
      await fn(id);
      invalidateAll();
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (id: string, role: "user" | "priest" | "admin") => {
    setBusyId(id);
    setActionError("");
    try {
      await changeAdminUserRole(id, role);
      invalidateAll();
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleResolveReport = async (id: string, status: "reviewed" | "dismissed" | "actioned") => {
    setBusyId(id);
    setActionError("");
    try {
      await resolveAdminReport(id, status);
      invalidateAll();
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspendReportedMember = async (userId: string) => {
    if (!userId) return;
    setBusyId(userId);
    setActionError("");
    try {
      await suspendAdminUser(userId);
      invalidateAll();
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // Admins get the full operational panel (site-wide members, team roster,
  // priest management, reports). Priests only need their actual day-to-day
  // work — reviewing verification documents and kundali matches — so their
  // panel is intentionally smaller, not just the admin one with fewer
  // buttons enabled.
  const tabs: { id: Tab; label: string; icon: any }[] = isAdmin
    ? [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "verification", label: "Verification Requests", icon: BadgeCheck },
        { id: "priests", label: "Priests", icon: UserCog },
        { id: "kundali", label: "Kundali History", icon: Sparkles },
        { id: "reports", label: "Reports", icon: Flag },
        { id: "members", label: "Members", icon: Users },
        { id: "team", label: "Team", icon: ShieldCheck },
      ]
    : [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "verification", label: "Verification Requests", icon: BadgeCheck },
        { id: "kundali", label: "Kundali History", icon: Sparkles },
      ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-['Inter']">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#7B1E3D] bg-[#7B1E3D]/5 px-3 py-1 rounded-full border border-[#7B1E3D]/10 mb-3">
            <ShieldCheck size={12} /> {isAdmin ? "Admin Panel" : "Priest Panel"}
          </span>
          <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {isAdmin ? "Admin Dashboard" : "Priest Dashboard"}
          </h1>
          <p className="text-xs text-[#1A1A1A]/50 mt-1">
            {isAdmin
              ? "Site overview, identity verification, priest management, reports, and member accounts."
              : "Review identity verification documents and kundali matching requests assigned to you."}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                tab === t.id ? "bg-[#7B1E3D] text-white" : "bg-white border border-[#ECE8E2] text-[#1A1A1A]/60 hover:bg-[#FAF8F5]"
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {actionError}
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && <OverviewPanel isAdmin={isAdmin} />}

        {/* Verification Requests (Blue Tick) */}
        {tab === "verification" && <VerificationRequestsPanel />}

        {/* Priest Management */}
        {tab === "priests" && <PriestsPanel />}

        {/* Kundali History */}
        {tab === "kundali" && <KundaliHistoryPanel />}

        {/* Reports */}
        {tab === "reports" && (
          <div className="space-y-3">
            {reportsLoading ? (
              <p className="text-xs text-[#1A1A1A]/40">Loading…</p>
            ) : reports && reports.reports.length > 0 ? (
              reports.reports.map((r) => (
                <ReportRow
                  key={r._id}
                  report={r}
                  busyId={busyId}
                  isAdmin={isAdmin}
                  onDismiss={(id) => handleResolveReport(id, "dismissed")}
                  onMarkReviewed={(id) => handleResolveReport(id, "reviewed")}
                  onSuspendReported={handleSuspendReportedMember}
                />
              ))
            ) : (
              <p className="text-xs text-[#1A1A1A]/40">No pending reports right now.</p>
            )}
          </div>
        )}

        {/* All Members */}
        {tab === "members" && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, or ID"
                className="w-full rounded-xl border border-[#ECE8E2] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#7B1E3D]"
              />
            </div>
            <div className="space-y-3">
              {usersLoading ? (
                <p className="text-xs text-[#1A1A1A]/40">Loading…</p>
              ) : (
                (allUsers?.users || []).map((m) => (
                  <MemberRow
                    key={m._id}
                    member={m}
                    isAdmin={isAdmin}
                    busyId={busyId}
                    onVerify={(id) => runAction(id, verifyAdminUser)}
                    onUnverify={(id) => runAction(id, unverifyAdminUser)}
                    onSuspend={(id) => runAction(id, suspendAdminUser)}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Team */}
        {tab === "team" && (
          <div className="space-y-3">
            {teamLoading ? (
              <p className="text-xs text-[#1A1A1A]/40">Loading…</p>
            ) : (
              (team?.members || []).map((m) => (
                <MemberRow
                  key={m._id}
                  member={m}
                  isAdmin={isAdmin}
                  busyId={busyId}
                  onVerify={(id) => runAction(id, verifyAdminUser)}
                  onUnverify={(id) => runAction(id, unverifyAdminUser)}
                  onSuspend={(id) => runAction(id, suspendAdminUser)}
                  onRoleChange={handleRoleChange}
                />
              ))
            )}
            <p className="text-[11px] text-[#1A1A1A]/40 pt-2">
              Team members (role: priest) can review and verify profiles here, but only admins can suspend accounts or change roles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
