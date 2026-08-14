import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Lock, Smartphone, ShieldAlert } from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
// 1. Imported your couple image here
import couple from "../assets/couple.jpeg";

gsap.registerPlugin(useGSAP);

const schema = z.object({
  identifier: z.string().min(3, "Enter your phone or email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export const Login = () => {
  const { t } = useTranslation();
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const leftHeroRef = useRef<HTMLDivElement>(null);
  const rightFormRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    gsap.set(['.animate-fade', '.animate-stagger'], { opacity: 0 });
    
    tl.fromTo(leftHeroRef.current, { scale: 1.02, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 })
      .fromTo(rightFormRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1 }, '-=1.0')
      .to('.animate-fade', { opacity: 1, duration: 0.6, stagger: 0.12 }, '-=0.6')
      .fromTo('.animate-stagger', { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, '-=0.5');

    gsap.to('.ambient-glow-1', { x: '+=20', y: '-=20', duration: 15, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }, { scope: pageContainerRef });

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const wrapper = e.target.closest('.input-group-container');
    if (!wrapper) return;
    gsap.to(wrapper, { borderColor: '#7A1E3A', scale: 1.005, duration: 0.25 });
    gsap.to(wrapper.querySelector('.input-icon'), { color: '#7A1E3A', duration: 0.25 });
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const wrapper = e.target.closest('.input-group-container');
    if (!wrapper) return;
    gsap.to(wrapper, { borderColor: 'rgba(0, 0, 0, 0.06)', scale: 1, duration: 0.25 });
    gsap.to(wrapper.querySelector('.input-icon'), { color: '#888888', duration: 0.25 });
  };

  const onSubmit = async (values: FormData) => {
    setServerError("");
    try {
     const { data } = await api.post("/auth/login", values);

console.log("LOGIN RESPONSE:", data);

loginWithTokens(data.data.user, data.data.accessToken, data.data.refreshToken);     navigate("/dashboard");
 } catch (err: any) {
  console.log("LOGIN ERROR", err.response);
  console.log("LOGIN ERROR DATA", err.response?.data);
  setServerError(err.response?.data?.message || "Login failed");
}
  };

  // Hands off to the dedicated OTP login page, which requests and verifies
  // its own code (see LoginOtp.tsx) — no separate pre-fetch needed here.
  const handleOtpRequest = async () => {
    setIsOtpLoading(true);
    navigate("/login/otp");
  };

  return (
    <div ref={pageContainerRef} className="relative flex min-h-screen w-full overflow-hidden bg-transparent font-sans antialiased text-[#2D2D2D]">
      
      {/* Background Ambient Flare */}
      <div className="ambient-glow-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#7A1E3A]/03 blur-[120px] pointer-events-none" />

      <div className="flex w-full items-stretch">
        
        {/* LEFT CANVAS */}
        <div 
          ref={leftHeroRef}
          className="relative hidden w-1/2 overflow-hidden border-r border-black/[0.04] bg-[#FDFBF7] lg:flex items-center justify-center p-6"
        >
          <img 
            src={couple} 
            alt="Devbhoomi Bandhan Matchmaking" 
            className="w-full h-full object-contain transition-transform duration-700 hover:scale-102"
          />
        </div>

        {/* RIGHT CANVAS */}
        <div className="flex w-full flex-col items-center justify-center bg-transparent px-6 pb-12 lg:w-1/2 xl:px-24">
          <div ref={rightFormRef} className="relative w-full max-w-[420px] mt-8">
            
            <div className="rounded-[24px] border border-black/[0.04] bg-white/80 p-8 shadow-xl shadow-black/[0.01] backdrop-blur-md sm:p-10">
              <div className="space-y-6">
                
                {/* Header Copy Block */}
                <div className="space-y-1.5">
                  <h1 className="animate-stagger text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
                    {t("auth.loginTitle")}
                  </h1>
                  <p className="animate-stagger text-xs text-[#6B7280]">
                    Log in to continue your search for the right family.
                  </p>
                </div>

                {/* Form Processing Fields */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      {t("auth.phone")} / Email
                    </label>
                    <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                      <Mail className="input-icon absolute left-4 text-[#888888]" size={16} />
                      <input 
                        type="text"
                        placeholder="9876543210 or you@email.com" 
                        {...register("identifier")}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="mt-1 text-xs text-[#7A1E3A] font-semibold animate-fade">
                        {errors.identifier.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      {t("auth.password")}
                    </label>
                    <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                      <Lock className="input-icon absolute left-4 text-[#888888]" size={16} />
                      <input 
                        type="password"
                        placeholder="••••••••" 
                        {...register("password")}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-[#7A1E3A] font-semibold animate-fade">
                        {errors.password.message}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-xs font-semibold text-[#7A1E3A] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Operational Server Error Block */}
                  {serverError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#7A1E3A]/10 bg-[#7A1E3A]/05 p-3.5 text-xs text-[#7A1E3A] font-medium animate-fade">
                      <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Submission Core Trigger Button */}
                  <button
                    ref={primaryBtnRef}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[#7A1E3A] py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-all duration-150 disabled:opacity-50 select-none shadow-md shadow-[#7A1E3A]/10 hover:bg-[#63142B] active:scale-[0.99] mt-2 flex items-center justify-center min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Verifying Account...</span>
                      </div>
                    ) : (
                      <span>{t("auth.loginBtn")}</span>
                    )}
                  </button>

                </form>

                {/* Micro Section Splitter */}
                <div className="animate-fade relative flex items-center py-1">
                  <div className="flex-grow border-t border-black/[0.04]" />
                  <span className="mx-3 flex-shrink text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">OR</span>
                  <div className="flex-grow border-t border-black/[0.04]" />
                </div>

                {/* Secondary OTP Trigger Link Option */}
                <button 
                  type="button"
                  onClick={handleOtpRequest}
                  disabled={isOtpLoading}
                  className="animate-fade flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 py-3 text-xs font-bold tracking-wider text-[#2D2D2D] uppercase transition-all duration-200 hover:bg-white hover:border-black/[0.12] active:scale-[0.98] min-h-[44px]"
                >
                  {isOtpLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                  ) : (
                    <Smartphone size={14} className="text-[#6B7280]" />
                  )}
                  <span>{isOtpLoading ? "Sending OTP..." : t("auth.orOtp")}</span>
                </button>

                {/* Sign-Up Navigation Redirection Prompt */}
                <p className="animate-fade mt-6 text-center text-xs text-[#6B7280]">
                  New here?{" "}
                  <Link to="/signup" className="font-bold text-[#7A1E3A] hover:underline ml-1">
                    Create your profile
                  </Link>
                </p>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};