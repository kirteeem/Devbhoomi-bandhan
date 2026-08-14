import { api } from "./axios";
import type { WizardFormData } from "../types/wizard";

/** Interface definitions matching the backend data envelope contracts */
export interface ProfileApiResponse {
  success: boolean;
  data: {
    profile: any; // Mapped accurately dynamically using profileToWizardData
  };
}

// Updated interface to precisely match what your backend controller responds with
export interface PhotoItemResponse {
  id: string;
  url: string;
  isProfilePhoto: boolean;
  profileCompletion: number;
}

/**
 * Fetches the active authenticated user profile payload.
 * Used during wizard mount sequence initialization.
 */
export const fetchMyProfile = async (): Promise<any> => {
  const { data } = await api.get<ProfileApiResponse>("/profiles/me");
  return data.data.profile;
};

/**
 * Persists the core progressive wizard payload (Draft or Complete submission).
 * Dispatched dynamically by the footer action controller ribbon.
 */
export const updateMyProfile = async (profileData: Partial<WizardFormData>): Promise<any> => {
  const { data } = await api.patch<ProfileApiResponse>("/profiles/me", profileData);
  return data.data;
};

/**
 * Transmits binary file blobs to the asset processing destination engine.
 * Calibrated specifically to handle premium drag & drop configurations.
 */
export const uploadProfilePhoto = async (
  file: File,
  isProfilePhoto: boolean
): Promise<PhotoItemResponse> => {
  const formData = new FormData();

  // Changed key name from "photo" to "image" to perfectly match your backend Multer setup
  formData.append("image", file);
  formData.append("isProfilePhoto", String(isProfilePhoto));

  // Destructure and return "data" directly since the backend does not wrap it in another object
  const { data } = await api.post<PhotoItemResponse>(
    "/profiles/upload-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * The single unlock action for a profile. Spends one of the member's 5
 * free lifetime unlocks (or confirms an already-mutual/Premium unlock) to
 * permanently reveal a profile's full details AND contact info together —
 * there is intentionally only one unlock button in the whole app.
 */
export const unlockProfile = async (
  userId: string
): Promise<{
  detailsUnlocked: boolean;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
  message: string;
}> => {
  const { data } = await api.post(`/profiles/${userId}/unlock`);
  return { ...data.data, message: data.message };
};

export interface ContactDetails {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
}

/**
 * Reads this member's contact info (address/phone/email) once the profile
 * has already been unlocked — via Premium membership, spending a free
 * unlock, or their own profile. Never triggers a spend; unlocking always
 * happens through unlockProfile() above.
 */
export const fetchContactDetails = async (
  userId: string
): Promise<{
  contactUnlocked: boolean;
  contact?: ContactDetails;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
}> => {
  const { data } = await api.get(`/profiles/${userId}/contact`);
  return data.data;
};