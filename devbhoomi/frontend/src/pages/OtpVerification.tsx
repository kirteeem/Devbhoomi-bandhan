import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ShieldAlert, ArrowLeft } from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

const otpSchema = z.object({
  otp: z.string().length(6, "Verification code must be exactly 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export const OtpVerification = () => {
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  
  const [serverError, setServerError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Mocking the phone number. In a real app, read this from location state or local storage
  const phoneNumber = localStorage.getItem("pendingPhone") || "8219777250";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Countdown timer logic for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (values: OtpFormData) => {
    setServerError("");
    try {
      // 1. Send OTP verification request to backend
      const { data } = await api.post("/auth/verify-otp", {
        phoneNumber,
        otp: values.otp,
      });

      // 2. Authorize user session using response tokens
      loginWithTokens(data.data.user, data.data.accessToken, data.data.refreshToken);
      
      // Cleanup staging data
      localStorage.removeItem("pendingPhone");
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid validation code. Please check and retry.");
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;
    
    setServerError("");
    setIsResending(true);
    try {
      await api.post("/auth/resend-otp", { phoneNumber });
      setResendTimer(30); // Reset fallback countdown
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Failed to dispatch a new secure token.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center bg-[#FAF8F5] px-4 font-['Inter'] antialiased">
      <div className="w-full max-w-md bg-white border border-[#ECE8E2] rounded-3xl p-8 shadow-xl shadow-[#1A1A1A]/02">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#7B1E3D]/05 flex items-center justify-center text-[#7B1E3D] mb-4 border border-[#7B1E3D]/10">
            <KeyRound size={22} />
          </div>
          <h2 className="font-['Manrope'] text-2xl font-bold tracking-tight text-[#1A1A1A]">Enter verification code</h2>
          <p className="text-xs text-[#1A1A1A]/50 mt-1.5 leading-relaxed">
            Code sent to <span className="font-semibold text-[#1A1A1A]/80">{phoneNumber}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* OTP Input Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
              6-Digit Code
            </label>
            <div className="relative group">
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                {...register("otp")}
                className="w-full bg-transparent border-b border-[#ECE8E2] py-3 text-center tracking-[0.5em] font-mono text-lg font-bold text-[#1A1A1A] placeholder-[#1A1A1A]/20 outline-none transition-colors duration-300 focus:border-[#7B1E3D]"
              />
            </div>
            {errors.otp && (
              <p className="text-[11px] text-[#7B1E3D] font-medium text-center mt-1">{errors.otp.message}</p>
            )}
          </div>

          {/* Operational Errors */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-xl border border-[#7B1E3D]/10 bg-[#7B1E3D]/05 p-4 text-xs text-[#7B1E3D] font-medium"
            >
              <ShieldAlert size={15} className="flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </motion.div>
          )}

          {/* Core Sign-In Trigger */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden rounded-xl bg-[#7B1E3D] hover:bg-[#63142B] py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 flex items-center justify-center min-h-[50px]"
          >
            {isSubmitting ? "Validating Session Auth..." : "Verify & Log In"}
          </Button>

          {/* Resend Actions Frame */}
          <div className="text-center">
            <button
              type="button"
              disabled={resendTimer > 0 || isResending}
              onClick={handleResendCode}
              className={`text-xs font-bold transition-colors ${
                resendTimer > 0 
                  ? "text-[#1A1A1A]/30 cursor-not-allowed" 
                  : "text-[#7B1E3D] hover:underline"
              }`}
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend validation code"}
            </button>
          </div>

        </form>

        <div className="mt-8 pt-6 border-t border-[#ECE8E2] space-y-4">
          {/* Fallback Nav Triggers */}
          <button 
            type="button"
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft size={13} /> Change Phone Number
          </button>

          <p className="text-center text-xs text-[#1A1A1A]/40">
            New here?{" "}
            <Link to="/signup" className="font-bold text-[#7B1E3D] hover:underline ml-0.5">
              Create your profile
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};