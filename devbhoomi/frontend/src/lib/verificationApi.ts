import { api } from "./axios";

export type DocumentType = "aadhaar" | "pan";
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface MyVerificationRequest {
  _id: string;
  documentType: DocumentType;
  documentImage: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface MyVerificationStatus {
  isProfileVerified: boolean;
  verifiedAt?: string | null;
  latestRequest: MyVerificationRequest | null;
}

export const fetchMyVerificationStatus = async (): Promise<MyVerificationStatus> => {
  const { data } = await api.get("/verification/me");
  return data.data;
};

export const submitVerificationDocument = async (documentType: DocumentType, file: File) => {
  const form = new FormData();
  form.append("documentType", documentType);
  form.append("document", file);
  const { data } = await api.post("/verification/submit", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
