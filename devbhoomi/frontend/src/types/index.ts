export interface AuthUser {
  id: string;
  fullName: string;
  role: "user" | "priest" | "admin";
  preferredLanguage: "en" | "hi";
  profileCompletion: number;
  profileCode?: string;
  gender?: "male" | "female" | string;
  isProfileVerified?: boolean;
  lastLoginAt?: string;
  
  // CRITICAL FIXES FOR PREMIUM GAINS
  isPremium: boolean;         // Checked globally across UI layout blocks (e.g. user?.isPremium)
  premiumUntil?: string;      // Backing model date criteria to control session status

  // Account-level contact info — phone comes from signup/OTP login only
  // (never editable in the profile wizard, to keep numbers genuine).
  phone?: string;
  email?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  freeUnlocksRemaining?: number;
  planUnlocksRemaining?: number;
  freeKundaliRemaining?: number;
  kundaliMatchesRemaining?: number;
  contactViewsRemaining?: number | null; // null = unlimited, only Premium ever has a non-zero quota
  idCardName?: string | null;
  aadharImage?: string | null;
  panImage?: string | null;
  selfieImage?: string | null;
  verificationRequestedAt?: string | null;
  verifiedAt?: string | null;
}

export interface Profile {
  _id: string;
  user: { 
    _id: string; 
    fullName: string; 
    gender?: "male" | "female" | string;
    isProfileVerified?: boolean; 
    lastActiveAt?: string; 
    profileCode?: string;
    isPremium?: boolean;      // Added here so profile.user?.isPremium works for badges
    premiumUntil?: string;
  };
  gender?: "male" | "female" | string;
  district?: string;
  tehsil?: string;
  village?: string;
  city?: string;
  // Sensitive — only ever populated by GET /profiles/:userId/contact once unlocked.
  address?: string;
  dateOfBirth?: string;
  heightCm?: number;
  maritalStatus?: string;
  manglik?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  education?: { degree?: string; field?: string; college?: string };
  // Fixed naming convention: component maps over `profile.income`, interface used `annualIncomeRange`
  income?: string; 
  occupation?: { title?: string; company?: string; annualIncomeRange?: string };
  family?: { familyType?: string };
  lifestyle?: { diet?: string; smoking?: string; drinking?: string };
  aboutMe?: string;
  photos?: { url: string; isProfilePhoto?: boolean; blurred?: boolean }[];
  profileCompletion?: number;
  compatibilityScore?: number;
  isShortlisted?: boolean;
  
  // CRITICAL FIX FOR API COMPATIBILITY
  isLocked?: boolean;         // Extracted from the API envelope object to render conditional blur maps
  isPremiumMember?: boolean;
  isOnline?: boolean;
  isNewMember?: boolean;
  hasHoroscope?: boolean;
  partnerPreference?: {
    ageMin?: number;
    ageMax?: number;
    heightMinCm?: number;
    districts?: string[];
    education?: string[];
    maritalStatus?: string[];
  };
}

export interface AppNotification {
  _id: string;
  type: "new_message" | "kundali_ready" | "profile_verified" | "system";
  title?: string;
  body?: string;
  relatedId?: string;
  fromUser?: { _id: string; fullName?: string; gender?: string; isProfileVerified?: boolean } | string;
  isRead: boolean;
  createdAt: string;
}