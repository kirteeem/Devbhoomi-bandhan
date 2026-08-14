import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Sparkles, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "../lib/axios";

gsap.registerPlugin(useGSAP);

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const rightFormRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set([".animate-fade", ".animate-stagger"], { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
      tl.fromTo(rightFormRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1 })
        .to(".animate-fade", { opacity: 1, duration: 0.6, stagger: 0.12 }, "-=0.6")
        .fromTo(".animate-stagger", { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06 }, "-=0.5");
    },
    { scope: pageContainerRef }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError("");
    try {
      await api.post("/auth/forgot-password", values);
      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      ref={pageContainerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent font-sans antialiased text-[#2D2D2D] px-6 py-24"
    >
      <div className="ambient-glow-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#7A1E3A]/03 blur-[120px] pointer-events-none" />

      <div ref={rightFormRef} className="relative w-full max-w-[420px]">
        <div className="rounded-[24px] border border-black/[0.04] bg-white/80 p-8 shadow-xl shadow-black/[0.01] backdrop-blur-md sm:p-10">
          <div className="space-y-6">
            <div className="animate-fade flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7A1E3A] to-[#c9924a] p-[1px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
                  <Sparkles size={14} className="text-[#7A1E3A]" />
                </div>
              </div>
              <span className="font-hindi text-sm font-black tracking-tight text-[#1A1A1A]">देवभूमि बंधन</span>
            </div>

            {submitted ? (
              <div className="animate-fade space-y-5 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#7A1E3A]/08">
                  <CheckCircle2 size={24} className="text-[#7A1E3A]" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Check your email</h1>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    If an account exists for that address, we've sent a link to reset your password. The link
                    expires in 30 minutes.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 py-3 text-xs font-bold tracking-wider text-[#2D2D2D] uppercase transition-all duration-200 hover:bg-white hover:border-black/[0.12] active:scale-[0.98] w-full"
                >
                  <ArrowLeft size={14} className="text-[#6B7280]" />
                  <span>Back to login</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h1 className="animate-stagger text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="animate-stagger text-xs text-[#6B7280]">
                    Enter the email on your account and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Email</label>
                    <div className="input-group-container relative flex items-center rounded-xl border border-black/[0.06] bg-neutral-50/50 transition-all duration-200">
                      <Mail className="input-icon absolute left-4 text-[#888888]" size={16} />
                      <input
                        type="email"
                        placeholder="you@email.com"
                        {...register("email")}
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-black/20 outline-none"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#7A1E3A] font-semibold animate-fade">{errors.email.message}</p>
                    )}
                  </div>

                  {serverError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#7A1E3A]/10 bg-[#7A1E3A]/05 p-3.5 text-xs text-[#7A1E3A] font-medium animate-fade">
                      <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[#7A1E3A] py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-all duration-150 disabled:opacity-50 select-none shadow-md shadow-[#7A1E3A]/10 hover:bg-[#63142B] active:scale-[0.99] mt-2 flex items-center justify-center min-h-[48px]"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="animate-fade flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 py-3 text-xs font-bold tracking-wider text-[#2D2D2D] uppercase transition-all duration-200 hover:bg-white hover:border-black/[0.12] active:scale-[0.98]"
                >
                  <ArrowLeft size={14} className="text-[#6B7280]" />
                  <span>Back to login</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
