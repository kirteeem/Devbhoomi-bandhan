import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import signupImg from "../assets/signup.jpeg"; 
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ChevronDown, 
  Check,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Loader2
} from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { getFriendlyErrorMessage } from "../lib/errorMessage";

const signupSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender selection is required" }),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the values & terms" }) })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

export const Signup = () => {
  const { loginWithTokens } = useAuth(); 
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  // --- Email OTP verification (must happen before the account is created) ---
  const [emailOtpStep, setEmailOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

  // --- Phone OTP verification (same pattern as email — reduces fake
  // accounts signing up with a phone number they don't actually control) ---
  const [phoneOtpStep, setPhoneOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ 
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      gender: undefined,
      agreeToTerms: false as unknown as true
    }
  });

  const selectedGender = watch("gender");
  const emailValue = watch("email");
  const phoneValue = watch("phoneNumber");

  const startEmailOtpCooldown = () => {
    setEmailOtpCooldown(30);
    const interval = setInterval(() => {
      setEmailOtpCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Any edit to the email field after it was verified invalidates that
  // verification — the token is only good for the exact address it was
  // issued for, and the backend checks this again anyway.
  const resetEmailVerificationIfChanged = (value: string) => {
    if (emailOtpStep !== "idle" && value.trim().toLowerCase() !== verifiedEmail) {
      setEmailOtpStep("idle");
      setEmailOtpCode("");
      setEmailOtpError("");
      setEmailVerificationToken("");
    }
  };

  const handleSendEmailOtp = async () => {
    setEmailOtpError("");
    const parsed = z.string().email().safeParse(emailValue);
    if (!parsed.success) {
      setEmailOtpError("Enter a valid email address first");
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      await api.post("/auth/signup/email-otp/request", { email: emailValue.trim().toLowerCase() });
      setEmailOtpStep("sent");
      startEmailOtpCooldown();
    } catch (err: any) {
      setEmailOtpError(getFriendlyErrorMessage(err, "Could not send OTP. Please try again."));
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailOtpError("");
    if (emailOtpCode.trim().length < 4) {
      setEmailOtpError("Enter the code sent to your email");
      return;
    }
    setIsVerifyingEmailOtp(true);
    try {
      const { data } = await api.post("/auth/signup/email-otp/verify", {
        email: emailValue.trim().toLowerCase(),
        code: emailOtpCode.trim(),
      });
      setEmailVerificationToken(data.data.emailVerificationToken);
      setVerifiedEmail(emailValue.trim().toLowerCase());
      setEmailOtpStep("verified");
    } catch (err: any) {
      setEmailOtpError(getFriendlyErrorMessage(err, "Invalid or expired OTP. Please try again."));
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const startPhoneOtpCooldown = () => {
    setPhoneOtpCooldown(30);
    const interval = setInterval(() => {
      setPhoneOtpCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Any edit to the phone field after it was verified invalidates that
  // verification, same as the email field above.
  const resetPhoneVerificationIfChanged = (value: string) => {
    if (phoneOtpStep !== "idle" && value.trim() !== verifiedPhone) {
      setPhoneOtpStep("idle");
      setPhoneOtpCode("");
      setPhoneOtpError("");
      setPhoneVerificationToken("");
    }
  };

  const handleSendPhoneOtp = async () => {
    setPhoneOtpError("");
    const parsed = z
      .string()
      .regex(/^\+?[0-9]{10,15}$/)
      .safeParse(phoneValue);
    if (!parsed.success) {
      setPhoneOtpError("Enter a valid phone number first");
      return;
    }
    setIsSendingPhoneOtp(true);
    try {
      await api.post("/auth/signup/phone-otp/request", { phone: phoneValue.trim() });
      setPhoneOtpStep("sent");
      startPhoneOtpCooldown();
    } catch (err: any) {
      setPhoneOtpError(getFriendlyErrorMessage(err, "Could not send OTP. Please try again."));
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError("");
    if (phoneOtpCode.trim().length < 4) {
      setPhoneOtpError("Enter the code sent to your phone");
      return;
    }
    setIsVerifyingPhoneOtp(true);
    try {
      const { data } = await api.post("/auth/signup/phone-otp/verify", {
        phone: phoneValue.trim(),
        code: phoneOtpCode.trim(),
      });
      setPhoneVerificationToken(data.data.phoneVerificationToken);
      setVerifiedPhone(phoneValue.trim());
      setPhoneOtpStep("verified");
    } catch (err: any) {
      setPhoneOtpError(getFriendlyErrorMessage(err, "Invalid or expired OTP. Please try again."));
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

 const onSubmit = async (values: SignupFormData) => {
  setServerError("");

  if (emailOtpStep !== "verified" || values.email.trim().toLowerCase() !== verifiedEmail) {
    setServerError("Please verify your email address with the OTP before continuing.");
    return;
  }

  if (phoneOtpStep !== "verified" || values.phoneNumber.trim() !== verifiedPhone) {
    setServerError("Please verify your phone number with the OTP before continuing.");
    return;
  }

  try {
    const { data } = await api.post("/auth/signup", { ...values, emailVerificationToken, phoneVerificationToken });
    loginWithTokens(data.data.user, data.data.accessToken, data.data.refreshToken);
    navigate("/dashboard");
 } catch (err: any) {
  console.error(err);

  const status = err?.response?.status;
  const message = err?.response?.data?.message;

  if (status === 409) {
    setServerError(
      "An account already exists with this email or phone number. Please sign in instead."
    );
  } else if (status === 422) {
    setServerError(message);
  } else if (status === 401) {
    setServerError("Invalid credentials.");
  } else {
    setServerError(message || "Something went wrong. Please try again.");
  }
}
};

  // Google OAuth Login handler
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      setServerError("");
      try {
        // Send the short-lived auth code to the backend so the server can
        // exchange it directly with Google and verify the identity server-side.
        const { data } = await api.post("/auth/google", {
          code: tokenResponse.code,
        });
        loginWithTokens(data.data.user, data.data.accessToken, data.data.refreshToken);
        navigate("/dashboard");
      } catch (err: any) {
        setServerError(getFriendlyErrorMessage(err, "Google authentication failed. Please try again."));
      }
    },
    onError: () => setServerError("Google login initialization encountered an error."),
  });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FAF8F5] font-['Inter'] antialiased text-[#1A1A1A] selection:bg-[#7B1E3D]/10 selection:text-[#7B1E3D]">
      
      {/* Structural Ambient Background Lighting Elements */}
      <div className="absolute top-0 right-0 h-[700px] w-[700px] rounded-full bg-[#C89A45]/03 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-[#7B1E3D]/02 blur-[120px] pointer-events-none" />

      {/* Main Structural Layout Canvas */}
      <div className="mx-auto max-w-[1600px] px-6 pb-8 pt-8 lg:px-16 lg:pb-12 lg:pt-10">
        
        {/* Asymmetrical Frame Composition */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-stretch">
          
          {/* LEFT COLUMN: Clean Full-Height Immersive Background Card Layout */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-[#ECE8E2] min-h-[450px] lg:min-h-[680px] bg-[#ECE8E2] shadow-sm flex flex-col justify-between p-8 lg:p-10 lg:sticky lg:top-32">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${signupImg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/20 via-transparent to-[#1A1A1A]/40 mix-blend-multiply" />
          </div>

          {/* RIGHT COLUMN: Native Seamless Form Side Layout */}
          <div className="lg:col-span-7 xl:pl-4 flex items-center">
            <div className="w-full max-w-2xl">
              
              <div className="mb-10">
                <h2 className="font-['Manrope'] text-2xl font-bold tracking-tight text-[#1A1A1A]">Create your Profile</h2>
                <p className="text-xs text-[#1A1A1A]/50 mt-1">
                  All registration structures are completely private and background checked.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* 2x2 Grid Architecture for Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      <User size={12} className="text-[#1A1A1A]/30" /> Full Name
                    </label>
                    <div className="relative group">
                      <input 
                        type="text"
                        placeholder="E.g., Aarav Sharma"
                        {...register("fullName")}
                        className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D]"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      <Mail size={12} className="text-[#1A1A1A]/30" /> Email Address
                    </label>
                    <div className="flex items-end gap-3">
                      <div className="relative group flex-1">
                        <input
                          type="email"
                          placeholder="aarav@heritage.com"
                          disabled={emailOtpStep === "verified"}
                          {...register("email", {
                            onChange: (e) => resetEmailVerificationIfChanged(e.target.value),
                          })}
                          className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D] disabled:text-[#1A1A1A]/50"
                        />
                      </div>
                      {emailOtpStep !== "verified" && (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={isSendingEmailOtp || emailOtpCooldown > 0 || !emailValue}
                          className="flex-shrink-0 rounded-lg border border-[#7B1E3D]/30 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#7B1E3D] transition-colors hover:bg-[#7B1E3D]/5 disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isSendingEmailOtp ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : emailOtpCooldown > 0 ? (
                            `Resend (${emailOtpCooldown}s)`
                          ) : emailOtpStep === "sent" ? (
                            "Resend OTP"
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                      {emailOtpStep === "verified" && (
                        <span className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.email.message}</p>
                    )}

                    {/* OTP code entry — appears once an OTP has been sent and until verified */}
                    {emailOtpStep === "sent" && (
                      <div className="mt-2 flex items-end gap-3">
                        <div className="relative group flex-1">
                          <div className="relative flex items-center rounded-lg border border-[#ECE8E2] bg-[#FAF8F5]">
                            <KeyRound size={14} className="absolute left-3 text-[#1A1A1A]/30" />
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Enter 6-digit code"
                              value={emailOtpCode}
                              onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm tracking-[0.2em] text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={isVerifyingEmailOtp}
                          className="flex-shrink-0 rounded-lg bg-[#7B1E3D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#63142B] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isVerifyingEmailOtp ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
                        </button>
                      </div>
                    )}
                    {emailOtpError && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{emailOtpError}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      <Phone size={12} className="text-[#1A1A1A]/30" /> Phone Number
                    </label>
                    <div className="flex items-end gap-3">
                      <div className="relative group flex-1">
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          disabled={phoneOtpStep === "verified"}
                          {...register("phoneNumber", {
                            onChange: (e) => resetPhoneVerificationIfChanged(e.target.value),
                          })}
                          className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D] disabled:text-[#1A1A1A]/50"
                        />
                      </div>
                      {phoneOtpStep !== "verified" && (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={isSendingPhoneOtp || phoneOtpCooldown > 0 || !phoneValue}
                          className="flex-shrink-0 rounded-lg border border-[#7B1E3D]/30 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#7B1E3D] transition-colors hover:bg-[#7B1E3D]/5 disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isSendingPhoneOtp ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : phoneOtpCooldown > 0 ? (
                            `Resend (${phoneOtpCooldown}s)`
                          ) : phoneOtpStep === "sent" ? (
                            "Resend OTP"
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                      {phoneOtpStep === "verified" && (
                        <span className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      )}
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.phoneNumber.message}</p>
                    )}

                    {/* OTP code entry — appears once an OTP has been sent and until verified */}
                    {phoneOtpStep === "sent" && (
                      <div className="mt-2 flex items-end gap-3">
                        <div className="relative group flex-1">
                          <div className="relative flex items-center rounded-lg border border-[#ECE8E2] bg-[#FAF8F5]">
                            <KeyRound size={14} className="absolute left-3 text-[#1A1A1A]/30" />
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Enter 6-digit code"
                              value={phoneOtpCode}
                              onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ""))}
                              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm tracking-[0.2em] text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyPhoneOtp}
                          disabled={isVerifyingPhoneOtp}
                          className="flex-shrink-0 rounded-lg bg-[#7B1E3D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#63142B] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isVerifyingPhoneOtp ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
                        </button>
                      </div>
                    )}
                    {phoneOtpError && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{phoneOtpError}</p>
                    )}
                  </div>

                  {/* Gender Selector */}
                  <div className="space-y-2 relative">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      Gender Alignment
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsGenderOpen(!isGenderOpen)}
                        className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-left flex items-center justify-between text-[#1A1A1A] outline-none transition-colors duration-300 focus:border-[#7B1E3D]"
                      >
                        <span className={selectedGender ? "text-[#1A1A1A]" : "text-[#1A1A1A]/20"}>
                          {selectedGender ? selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1) : "Select Gender Identity"}
                        </span>
                        <ChevronDown size={14} className={`text-[#1A1A1A]/40 transition-transform duration-300 ${isGenderOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isGenderOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-[#ECE8E2] bg-white p-1.5 shadow-xl shadow-[#1A1A1A]/05"
                          >
                            {["male", "female", "other"].map((genderOption) => (
                              <button
                                key={genderOption}
                                type="button"
                                onClick={() => {
                                  setValue("gender", genderOption as any, { shouldValidate: true });
                                  setIsGenderOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#FAF8F5] transition-colors duration-150 flex items-center justify-between capitalize text-[#1A1A1A]"
                              >
                                {genderOption}
                                {selectedGender === genderOption && <Check size={12} className="text-[#7B1E3D]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {errors.gender && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      <Lock size={12} className="text-[#1A1A1A]/30" /> Security Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D]"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                      <Lock size={12} className="text-[#1A1A1A]/30" /> Confirm Password
                    </label>
                    <div className="relative group">
                      <input 
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="w-full bg-transparent border-b border-[#ECE8E2] py-2.5 px-0 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D]"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-[#7B1E3D] font-medium mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                </div>

                {/* Terms and Agreements */}
                <div className="pt-2">
                  <Controller
                    control={control}
                    name="agreeToTerms"
                    render={({ field: { value, onChange } }) => (
                      <label className="flex items-start gap-3 group cursor-pointer select-none">
                        <div className="relative flex items-center mt-0.5">
                          <input 
                            type="checkbox"
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className={`h-4 w-4 rounded border transition-all duration-200 flex items-center justify-center ${value ? 'bg-[#7B1E3D] border-[#7B1E3D]' : 'border-[#ECE8E2] bg-transparent group-hover:border-[#7B1E3D]'}`}>
                            <Check size={10} className={`text-white transition-opacity duration-200 ${value ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                        </div>
                        <span className="text-xs text-[#1A1A1A]/60 leading-normal font-light">
                          I agree to Devbhoomi Bandhan's{" "}
                          <Link to="/terms-and-policies" className="text-[#7B1E3D] underline hover:no-underline" onClick={(e) => e.stopPropagation()}>
                            Terms & Conditions and Privacy Policy
                          </Link>
                          , and confirm that all details I've provided are accurate.
                        </span>
                      </label>
                    )}
                  />
                  {errors.agreeToTerms && (
                    <p className="text-[11px] text-[#7B1E3D] font-medium mt-1.5">{errors.agreeToTerms.message}</p>
                  )}
                </div>

               {serverError && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 mt-4">
    <p className="text-red-700">{serverError}</p>

    {serverError.includes("already exists") && (
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mt-3 font-semibold text-red-700 underline"
      >
        Sign In Instead →
      </button>
    )}
  </div>
)}

                {/* CTA Action Block */}
                <div className="space-y-6 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full relative overflow-hidden rounded-xl bg-[#7B1E3D] hover:bg-[#63142B] py-4 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-[#7B1E3D]/15 transition-all duration-200 flex items-center justify-center min-h-[52px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3.5">
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Composing Pedigree Profile...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">Initiate Account Activation <ArrowRight size={13} /></span>
                    )}
                  </Button>

                  {/* Separator */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-[#ECE8E2]" />
                    <span className="mx-4 flex-shrink text-[9px] font-bold tracking-widest text-[#1A1A1A]/30 uppercase">Alternative Gateways</span>
                    <div className="flex-grow border-t border-[#ECE8E2]" />
                  </div>

                  {/* Clean Center-Aligned Google Button Block */}
                  <div className="w-full">
                    <button 
                      type="button" 
                      onClick={() => handleGoogleLogin()}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 border border-[#ECE8E2] rounded-xl text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70 bg-white hover:bg-[#FAF8F5] transition-all duration-200 hover:border-[#1A1A1A]/20 shadow-sm"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google Identity
                    </button>
                  </div>

                  <p className="text-center text-xs text-[#1A1A1A]/50 mt-6">
                    Already bound to an account?{" "}
                    <Link to="/login" className="font-bold text-[#7B1E3D] hover:underline transition-all duration-150 ml-0.5">
                      Sign In here
                    </Link>
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-[#ECE8E2] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#1A1A1A]/30 font-semibold tracking-widest uppercase">
          <span>© 2026 DEVBHOOMI BANDHAN. DEEPLY ROOTED IN TRADITION.</span>
          <div className="flex gap-6">
            <Link to="/terms-and-policies" className="hover:text-[#7B1E3D]">Privacy Policy</Link>
            <Link to="/terms-and-policies" className="hover:text-[#7B1E3D]">Terms & Conditions</Link>
          </div>
        </footer>

      </div>
    </div>
  );
};
