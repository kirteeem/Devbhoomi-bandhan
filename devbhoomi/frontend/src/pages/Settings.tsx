import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, AlertTriangle, LogOut, UserRound, ShieldCheck, Sparkles, KeyRound, BadgeCheck, ShieldOff, Loader2 } from "lucide-react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { fetchMyProfile, updateMyProfile } from "../lib/profileApi";
import { fetchMyBlocks, unblockUser } from "../lib/safetyApi";
import { getFriendlyErrorMessage } from "../lib/errorMessage";
import { VerifyMyProfileSection } from "../components/ui/VerifyMyProfileSection";

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
  id,
}: {
  icon: any;
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 16 }}
    className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm shadow-zinc-100/80 transition-all duration-300 hover:border-zinc-300/90"
  >
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200/60 text-zinc-800 shadow-sm">
        <Icon size={18} />
      </span>
      <div className="space-y-0.5">
        <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-950">{title}</h2>
        {description && <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">{description}</p>}
      </div>
    </div>
    <div className="relative z-10">{children}</div>
  </motion.div>
);

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: !!user,
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");

  const changePassword = useMutation({
    mutationFn: () => api.patch("/auth/change-password", pwForm),
    onSuccess: () => {
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwError("");
    },
    onError: (err: any) => setPwError(err?.response?.data?.message || "Could not update password"),
  });

  const updateVisibility = useMutation({
    mutationFn: (visibility: "public" | "members_only" | "hidden") => updateMyProfile({ visibility }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  const { data: blockedData, isLoading: blockedLoading } = useQuery({
    queryKey: ["my-blocks"],
    queryFn: fetchMyBlocks,
    enabled: !!user,
  });
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [unblockError, setUnblockError] = useState("");
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => unblockUser(userId),
    onMutate: (userId: string) => {
      setUnblockingId(userId);
      setUnblockError("");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-blocks"] }),
    onError: (err) => setUnblockError(getFriendlyErrorMessage(err)),
    onSettled: () => setUnblockingId(null),
  });

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const deactivateAccount = useMutation({
    mutationFn: () => api.delete("/auth/me"),
    onSuccess: async () => {
      await logout();
      navigate("/");
    },
  });

  if (!user) return null;

  const visibilityOptions: { value: "public" | "members_only" | "hidden"; label: string; desc: string }[] = [
    { value: "public", label: "Public Broadcast", desc: "Visible to all indexing layers, discovery grids, and guest connections." },
    { value: "members_only", label: "Authenticated Members Only", desc: "Isolate profile parameters strictly to verified registered platform profiles." },
    { value: "hidden", label: "Fully Shadowed / Hidden", desc: "Withdraw your profile matrix cleanly from all matching feeds and searches." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-200">
      
      {/* --- AMBIENT PREMIUM BACKGROUND SPHERES --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-zinc-200/40 via-zinc-100/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-8%] h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-zinc-300/10 to-transparent blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* --- SECTION HEADER --- */}
        <div className="border-b border-zinc-200 pb-6 mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-700 shadow-sm">
            <Sparkles size={12} className="text-zinc-500 fill-current" /> Core Preferences
          </div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-950 md:text-4xl">
            Account Architectures
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
            Calibrate localization protocols, manage credential layers, and modulate platform data accessibility.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Account Info */}
          <SettingsSection icon={UserRound} title="Identity Ledger Overview">
            <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Registered Name</span>
                <p className="text-sm font-bold text-zinc-950">{user.fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Matrix Completion</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full bg-zinc-950 rounded-full" style={{ width: `${user.profileCompletion}%` }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-950">{user.profileCompletion}%</span>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Profile Visibility */}
          <SettingsSection
            icon={Eye}
            title="Profile Isolation & Visibility"
            description="Manage visibility constraints dynamically to hide or feature your bio parameters across global network search feeds."
          >
            <div className="space-y-2.5">
              {visibilityOptions.map((opt) => {
                const isSelected = profile?.visibility === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      isSelected 
                        ? "border-zinc-950 bg-zinc-50 shadow-sm" 
                        : "border-zinc-200 bg-white hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-950">{opt.label}</div>
                      <div className="text-[11px] text-zinc-500 leading-relaxed max-w-xl">{opt.desc}</div>
                    </div>
                    <input
                      type="radio"
                      name="visibility"
                      className="h-4 w-4 mt-0.5 accent-zinc-950 cursor-pointer"
                      checked={isSelected}
                      onChange={() => updateVisibility.mutate(opt.value)}
                    />
                  </label>
                );
              })}
              <AnimatePresence>
                {updateVisibility.isSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-2"
                  >
                    <ShieldCheck size={12} /> Access status successfully synchronized.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </SettingsSection>

          {/* Identity Verification (Blue Tick) */}
          <SettingsSection
            id="verify-my-profile"
            icon={BadgeCheck}
            title="Verify My Profile"
            description="Submit one government ID (Aadhaar or PAN) and get a Blue Verified Badge on your profile once our team confirms it matches your account."
          >
            <VerifyMyProfileSection />
          </SettingsSection>

          {/* Blocked Users */}
          <SettingsSection
            icon={ShieldOff}
            title="Blocked Members"
            description="Members you've blocked can't view your profile or contact you — and you won't see them in Browse Matches either."
          >
            {blockedLoading ? (
              <p className="text-xs text-zinc-400">Loading…</p>
            ) : blockedData && blockedData.blocks.length > 0 ? (
              <div className="space-y-2">
                {blockedData.blocks.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-zinc-900">{b.blocked?.fullName || "Deleted member"}</p>
                      {b.blocked?.profileCode && (
                        <p className="text-[10px] text-zinc-400">{b.blocked.profileCode}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => unblockMutation.mutate(b.blocked._id)}
                      disabled={unblockingId === b.blocked._id}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                    >
                      {unblockingId === b.blocked._id ? <Loader2 size={11} className="animate-spin" /> : null}
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">You haven't blocked anyone.</p>
            )}
            {unblockError && <p className="mt-2 text-xs font-bold text-red-600">{unblockError}</p>}
          </SettingsSection>

          {/* Change Password */}
          <SettingsSection 
            icon={KeyRound} 
            title="Change Password"
            description="Update your account password. Use a strong password you don't use anywhere else."
          >
            <form
              className="space-y-3.5 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                if (pwForm.newPassword !== pwForm.confirmPassword) {
                  setPwError("New passwords don't match");
                  return;
                }
                changePassword.mutate();
              }}
            >
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-medium placeholder-zinc-400 transition-all focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={changePassword.isPending}
                  className="!rounded-xl !bg-zinc-950 !px-4 !py-2.5 !text-xs !font-bold !text-white hover:!bg-zinc-800"
                >
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </Button>
                
                <AnimatePresence>
                  {pwError && (
                    <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-rose-700">{pwError}</motion.p>
                  )}
                  {changePassword.isSuccess && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-emerald-700">Password updated successfully.</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </SettingsSection>

          {/* Logout */}
          <SettingsSection icon={LogOut} title="Log Out" description="Sign out of your account on this device.">
            <button 
              type="button"
              onClick={() => logout().then(() => navigate("/"))}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              <LogOut size={13} /> Log Out
            </button>
          </SettingsSection>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 md:p-8"
          >
            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 border border-rose-200/60 text-rose-800 shadow-sm">
                <AlertTriangle size={18} />
              </span>
              <div className="space-y-0.5">
                <h2 className="font-serif text-lg font-bold tracking-tight text-rose-950">Systemic Deactivation Slate</h2>
                <p className="text-xs text-rose-600/90 leading-relaxed max-w-xl">
                  Deactivating isolates your data arrays from all indexing algorithms instantly, freezing your relational footprint. Direct security clearance validation is mandated to restore account indices.
                </p>
              </div>
            </div>
            
            <div className="pt-2">
              {!confirmDeactivate ? (
                <button 
                  type="button"
                  onClick={() => setConfirmDeactivate(true)}
                  className="rounded-xl bg-rose-100 border border-rose-200/80 px-4 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-200/70 transition-colors"
                >
                  Request Archive Status
                </button>
              ) : (
                <div className="rounded-xl border border-rose-200 bg-white p-4 space-y-4 max-w-md shadow-sm">
                  <p className="text-xs font-bold text-rose-950 leading-tight">
                    Confirm complete matrix freeze? You will be disconnected immediately across active interfaces.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deactivateAccount.mutate()}
                      disabled={deactivateAccount.isPending}
                      className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-40 transition-colors"
                    >
                      {deactivateAccount.isPending ? "Freezing Node..." : "Yes, Terminate Grid Entry"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setConfirmDeactivate(false)}
                      className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
          <ShieldCheck size={14} className="text-emerald-600" /> Account architecture protected under high-grade multi-tenant permission validation layers.
        </div>

      </div>
    </div>
  );
};