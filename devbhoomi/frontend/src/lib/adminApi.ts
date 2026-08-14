import { api } from "./axios";

export interface AdminUser {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: "user" | "priest" | "admin";
  gender?: string;
  status: "active" | "suspended" | "deactivated" | "deleted";
  profileCode?: string;
  isProfileVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  idCardName?: string | null;
  aadharImage?: string | null;
  panImage?: string | null;
  selfieImage?: string | null;
  verificationRequestedAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  photos?: { url: string; isProfilePhoto?: boolean }[];
  profileCompletion?: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  onlineNow: number;
  loggedInToday: number;
  newSignupsToday: number;
  verifiedProfiles: number;
  pendingVerificationRequests: number;
  /** @deprecated use pendingVerificationRequests */
  pendingVerification: number;
  totalPriests: number;
  pendingReports: number;
  suspendedUsers: number;
}

export interface AdminReport {
  _id: string;
  reporter: { _id: string; fullName: string; profileCode?: string };
  reportedUser: { _id: string; fullName: string; profileCode?: string; status?: string; isProfileVerified?: boolean };
  reason: "fake_profile" | "spam" | "wrong_information" | "harassment" | "other";
  message?: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  createdAt: string;
}

export const fetchAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const { data } = await api.get("/admin/analytics");
  return data.data;
};

export const fetchAdminUsers = async (params: {
  status?: string;
  verified?: "true" | "false";
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ users: AdminUser[]; total: number }> => {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
};

export const fetchPendingVerification = async (): Promise<{ users: AdminUser[]; total: number }> => {
  const { data } = await api.get("/admin/users/pending-verification");
  return data.data;
};

export const fetchTeamMembers = async (): Promise<{ members: AdminUser[] }> => {
  const { data } = await api.get("/admin/team");
  return data.data;
};

export const verifyAdminUser = async (id: string) => {
  const { data } = await api.patch(`/admin/users/${id}/verify`);
  return data.data;
};

export const unverifyAdminUser = async (id: string) => {
  const { data } = await api.patch(`/admin/users/${id}/unverify`);
  return data.data;
};

export const suspendAdminUser = async (id: string) => {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data.data;
};

export const changeAdminUserRole = async (id: string, role: "user" | "priest" | "admin") => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.data;
};

export const fetchAdminReports = async (
  status: "pending" | "reviewed" | "dismissed" | "actioned" | "all" = "pending"
): Promise<{ reports: AdminReport[]; total: number }> => {
  const { data } = await api.get("/admin/reports", { params: { status } });
  return data.data;
};

export const resolveAdminReport = async (id: string, status: "reviewed" | "dismissed" | "actioned") => {
  const { data } = await api.patch(`/admin/reports/${id}`, { status });
  return data.data;
};

// ===========================================================================
// Identity Verification (Blue Tick) — dedicated per-submission workflow
// ===========================================================================

export interface VerificationRequestUser {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  profileCode?: string;
  gender?: string;
  dateOfBirth?: string;
  photos?: { url: string; isProfilePhoto?: boolean }[];
  address?: string | null;
  city?: string | null;
  district?: string | null;
}

export interface VerificationRequestItem {
  _id: string;
  userId: VerificationRequestUser | string;
  documentType: "aadhaar" | "pan";
  documentImage: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: { _id: string; fullName: string } | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export const fetchVerificationRequests = async (params: {
  status?: "pending" | "verified" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ requests: VerificationRequestItem[]; total: number; page: number; limit: number }> => {
  const { data } = await api.get("/admin/verification-requests", { params });
  return data.data;
};

export const fetchVerificationRequestDetail = async (id: string): Promise<{ request: VerificationRequestItem }> => {
  const { data } = await api.get(`/admin/verification-requests/${id}`);
  return data.data;
};

export const approveVerificationRequest = async (id: string) => {
  const { data } = await api.patch(`/admin/verification-requests/${id}/approve`);
  return data.data;
};

export const rejectVerificationRequest = async (id: string, rejectionReason: string) => {
  const { data } = await api.patch(`/admin/verification-requests/${id}/reject`, { rejectionReason });
  return data.data;
};

// ===========================================================================
// Priest Management
// ===========================================================================

export interface AdminPriest {
  _id: string;
  user: { _id: string; fullName: string; phone?: string; email?: string; status?: string; photos?: { url: string; isProfilePhoto?: boolean }[] };
  displayName: string;
  bio?: string;
  yearsOfExperience: number;
  specializations: string[];
  languages: string[];
  photoUrl?: string;
  rating: number;
  totalMatchesReviewed: number;
  isAvailable: boolean;
  activeJobs: number;
  completedKundalis: number;
  createdAt: string;
}

export interface KundaliHistoryItem {
  request: {
    _id: string;
    requestedBy?: { _id: string; fullName: string; profileCode?: string };
    profileA?: { _id: string; fullName: string; profileCode?: string };
    profileB?: { _id: string; fullName: string; profileCode?: string };
    assignedPriest?: { _id: string; displayName: string };
    requestType: string;
    status: "pending" | "in_review" | "completed" | "cancelled";
    createdAt: string;
    notes?: string;
  };
  report: {
    _id: string;
    gunMilanScore?: number;
    manglikDosha?: string;
    summary?: string;
    notes?: string;
    timeTakenMinutes?: number;
    recommendation?: string;
    createdAt: string;
  } | null;
}

export const fetchAdminPriests = async (): Promise<{ priests: AdminPriest[] }> => {
  const { data } = await api.get("/admin/priests");
  return data.data;
};

export const fetchAdminPriestDetail = async (
  id: string
): Promise<{ priest: AdminPriest; history: KundaliHistoryItem[]; stats: Record<string, any> }> => {
  const { data } = await api.get(`/admin/priests/${id}`);
  return data.data;
};

export const disableAdminPriest = async (id: string) => {
  const { data } = await api.patch(`/admin/priests/${id}/disable`);
  return data.data;
};

export const enableAdminPriest = async (id: string) => {
  const { data } = await api.patch(`/admin/priests/${id}/enable`);
  return data.data;
};

// ===========================================================================
// Kundali History (global, admin-wide)
// ===========================================================================

export const fetchAdminKundaliHistory = async (params: {
  status?: "pending" | "in_review" | "completed" | "cancelled";
  priestId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ history: KundaliHistoryItem[]; total: number; page: number; limit: number }> => {
  const { data } = await api.get("/admin/kundali-history", { params });
  return data.data;
};

export const fetchAdminKundaliDetail = async (id: string): Promise<{ request: KundaliHistoryItem["request"]; report: KundaliHistoryItem["report"] }> => {
  const { data } = await api.get(`/admin/kundali-history/${id}`);
  return data.data;
};
