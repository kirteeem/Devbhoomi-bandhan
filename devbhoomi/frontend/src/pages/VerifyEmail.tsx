import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { api } from "../lib/axios";

gsap.registerPlugin(useGSAP);

type Status = "verifying" | "success" | "error";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  const pageContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(".animate-fade", { opacity: 0 });
      gsap.to(".animate-fade", { opacity: 1, duration: 0.6, stagger: 0.1, ease: "power4.out" });
    },
    { scope: pageContainerRef, dependencies: [status] }
  );

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setStatus("error");
        setMessage("This verification link is missing its token.");
        return;
      }
      try {
        const { data } = await api.post("/auth/verify-email/confirm", { token });
        setStatus("success");
        setMessage(data.message || "Your email has been verified.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link is invalid or has expired.");
      }
    };
    confirm();
  }, [token]);

  return (
    <div
      ref={pageContainerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent font-sans antialiased text-[#2D2D2D] px-6 py-24"
    >
      <div className="ambient-glow-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#7A1E3A]/03 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        <div className="rounded-[24px] border border-black/[0.04] bg-white/80 p-8 shadow-xl shadow-black/[0.01] backdrop-blur-md sm:p-10 text-center">
          <div className="animate-fade flex items-center justify-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7A1E3A] to-[#c9924a] p-[1px] shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
                <Sparkles size={14} className="text-[#7A1E3A]" />
              </div>
            </div>
            <span className="font-hindi text-sm font-black tracking-tight text-[#1A1A1A]">देवभूमि बंधन</span>
          </div>

          <div className="animate-fade mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7A1E3A]/08 mb-4">
            {status === "verifying" && <Loader2 size={26} className="text-[#7A1E3A] animate-spin" />}
            {status === "success" && <CheckCircle2 size={26} className="text-[#7A1E3A]" />}
            {status === "error" && <XCircle size={26} className="text-[#7A1E3A]" />}
          </div>

          <h1 className="animate-fade text-xl font-bold tracking-tight text-[#1A1A1A] mb-1.5">
            {status === "verifying" && "Verifying your email"}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </h1>
          <p className="animate-fade text-xs text-[#6B7280] leading-relaxed mb-6">{message}</p>

          {status !== "verifying" && (
            <Link
              to={status === "success" ? "/dashboard" : "/settings"}
              className="animate-fade inline-flex w-full items-center justify-center rounded-xl bg-[#7A1E3A] py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-all duration-150 shadow-md shadow-[#7A1E3A]/10 hover:bg-[#63142B] active:scale-[0.99]"
            >
              {status === "success" ? "Go to Dashboard" : "Go to Settings"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
