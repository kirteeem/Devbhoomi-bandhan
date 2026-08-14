import { api } from "./axios";

export type ReportReason = "fake_profile" | "spam" | "wrong_information" | "harassment" | "other";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fake_profile: "Fake profile",
  spam: "Spam",
  wrong_information: "Wrong information",
  harassment: "Harassment",
  other: "Other",
};

export interface BlockedUser {
  _id: string;
  blocked: { _id: string; fullName: string; gender?: string; profileCode?: string };
  reason?: string;
  createdAt: string;
}

export const reportUser = async (reportedUser: string, reason: ReportReason, message?: string) => {
  const { data } = await api.post("/safety/reports", { reportedUser, reason, message });
  return data.data;
};

export const blockUser = async (blocked: string, reason?: string) => {
  const { data } = await api.post("/safety/blocks", { blocked, reason });
  return data.data;
};

export const unblockUser = async (userId: string) => {
  const { data } = await api.delete(`/safety/blocks/${userId}`);
  return data.data;
};

export const fetchMyBlocks = async (): Promise<{ blocks: BlockedUser[] }> => {
  const { data } = await api.get("/safety/blocks");
  return data.data;
};
