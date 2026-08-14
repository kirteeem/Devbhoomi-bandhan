import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, MessageCircle, Sparkles, ShieldCheck, CheckCheck, Inbox } from "lucide-react";
import { api } from "../../lib/axios";
import type { AppNotification } from "../../types";

interface NotificationBellProps {
  isSolid: boolean;
}

const iconConfigFor = (type: AppNotification["type"]) => {
  switch (type) {
    case "new_message":
      return { icon: MessageCircle, color: "text-blue-600 bg-blue-50 border-blue-100" };
    case "kundali_ready":
      return { icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" };
    case "profile_verified":
      return { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    default:
      return { icon: Bell, color: "text-slate-600 bg-slate-50 border-slate-100" };
  }
};

const timeAgo = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * Bell icon in the navbar that opens a small popup with the most recent
 * notifications, responsive across desktop and mobile screens.
 */
export const NotificationBell = ({ isSolid }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => (await api.get("/notifications/unread-count")).data.data.unreadCount as number,
    refetchInterval: 30_000,
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-preview"],
    queryFn: async () => (await api.get("/notifications")).data.data.notifications as AppNotification[],
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-preview"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-preview"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      if (rootRef.current && !rootRef.current.contains((e.target as Node))) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const handleItemClick = async (n: AppNotification) => {
    if (!n.isRead) await markReadMutation.mutateAsync(n._id);
    setOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all duration-300 active:scale-[0.98] ${
          isSolid
            ? "border-[#241F1C]/[0.12] text-[#241F1C]/70 hover:bg-[#241F1C]/[0.05]"
            : "border-white/30 text-white hover:bg-white/10 drop-shadow-sm"
        }`}
      >
        <Bell className="h-[17px] w-[17px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute -right-12 sm:right-0 z-50 mt-2 w-[88vw] sm:w-96 max-w-sm overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 p-[3vw] sm:px-4 sm:py-3">
              <span className="text-xs sm:text-sm font-bold text-zinc-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B1F2A] hover:underline"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 p-[3vw] sm:p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-[6vh] px-[4vw] sm:px-4 text-center">
                  <Inbox size={22} className="text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-400">You're all caught up.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {notifications.slice(0, 6).map((n) => {
                    const config = iconConfigFor(n.type);
                    const Icon = config.icon;
                    return (
                      <div
                        key={n._id}
                        onClick={() => handleItemClick(n)}
                        className={`flex w-full cursor-pointer items-start gap-3 p-[3vw] sm:px-4 sm:py-3 text-left transition-colors hover:bg-zinc-50 ${
                          !n.isRead ? "bg-[#6B1F2A]/[0.02]" : ""
                        }`}
                      >
                        <div className={`flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg border ${config.color}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`truncate text-xs ${!n.isRead ? "font-bold text-zinc-900" : "font-semibold text-zinc-600"}`}>
                              {n.title || "Update"}
                            </p>
                            <span className="flex-shrink-0 text-[10px] font-medium text-zinc-400">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{n.body}</p>
                        </div>
                        {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#6B1F2A]" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="block w-full border-t border-zinc-100 py-2.5 text-center text-xs font-bold text-[#6B1F2A] hover:bg-zinc-50"
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};