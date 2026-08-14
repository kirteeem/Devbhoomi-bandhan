import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import priestImage from "../../assets/priest.jpeg";

export const KundaliShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // GSAP Micro-interaction for Priest Card
  useEffect(() => {
    const avatar = avatarRef.current;
    if (!avatar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = avatar.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(avatar, {
        x: x * 0.15,
        y: y * 0.15,
        rotationY: x * 0.03,
        rotationX: -y * 0.03,
        ease: "power2.out",
        duration: 0.4
      });
    };

    const handleMouseLeave = () => {
      gsap.to(avatar, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.3)",
        duration: 0.8
      });
    };

    avatar.addEventListener("mousemove", handleMouseMove);
    avatar.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      avatar.removeEventListener("mousemove", handleMouseMove);
      avatar.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative z-20 w-full overflow-hidden bg-[#FBF8F3] px-[4vw] py-[5vh] border-t border-[#6B1F2A]/5"
    >
      {/* Background Watermark Layer */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#6B1F2A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] sm:w-[40vw] aspect-square bg-[radial-gradient(circle,rgba(169,121,44,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4vh] lg:gap-[4vw] items-center">
          
          {/* Left Column: Text & Content Focus */}
          <div className="lg:col-span-7 space-y-[2vh] text-left">
            <span className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] rounded-full bg-[#6B1F2A]/5 px-[3vw] sm:px-[1.2vw] py-[0.8vh] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold uppercase tracking-widest text-[#6B1F2A] border border-[#6B1F2A]/10">
              <Sparkles className="w-[3vw] h-[3vw] sm:w-[1.2vw] sm:h-[1.2vw] lg:w-[0.9vw] lg:h-[0.9vw] text-[#A9792C]" />
              Our Signature Service
            </span>
            
            <h2 className="font-display text-[7vw] sm:text-[5vw] lg:text-[3.2vw] font-extrabold text-[#6B1F2A] tracking-tight leading-[1.15]">
              निःशुल्क कुंडली मिलान <br />
              <span className="bg-gradient-to-r from-[#6B1F2A] via-[#A9792C] to-[#6B1F2A] bg-clip-text text-transparent">
                Trusted Vedic Matchmaking
              </span>
            </h2>
            
            <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[1vw] text-[#241F1C]/75 leading-relaxed max-w-xl font-normal">
              Every family deserves guidance they can trust. Get completely free, absolute, and pristine horoscope gun milan evaluations mapped meticulously for families looking for ideal partners across the hills.
            </p>

            {/* Metric Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.5vh] sm:gap-[1vw] pt-[1vh] text-[#241F1C]/80 font-medium text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw]">
              <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
                <CheckCircle2 className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1vw] lg:h-[1vw] text-[#A9792C] flex-shrink-0" />
                <span>100% Free Consultation</span>
              </div>
              <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
                <CheckCircle2 className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1vw] lg:h-[1vw] text-[#A9792C] flex-shrink-0" />
                <span>Traditional Gun Milan Algorithms</span>
              </div>
              <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
                <CheckCircle2 className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1vw] lg:h-[1vw] text-[#A9792C] flex-shrink-0" />
                <span>Approved by Local Priests</span>
              </div>
              <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
                <CheckCircle2 className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1vw] lg:h-[1vw] text-[#A9792C] flex-shrink-0" />
                <span>Secure & Confidential Data</span>
              </div>
            </div>

            {/* CTA Link Button */}
            <div className="pt-[2vh]">
              <Link 
                to="/kundali" 
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-[2vw] sm:rounded-[1vw] lg:rounded-xl bg-gradient-to-r from-[#6B1F2A] to-[#8A2B39] px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] text-[3.5vw] sm:text-[2vw] lg:text-[0.9vw] font-bold text-white shadow-[0_4px_20px_rgba(107,31,42,0.2)] hover:opacity-95 transition-opacity duration-300"
              >
                Request Free Kundali Match
              </Link>
            </div>
          </div>

          {/* Right Column: Priest Profile Card Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              ref={avatarRef}
              className="relative w-full max-w-[90vw] sm:max-w-[50vw] lg:max-w-sm rounded-[4vw] sm:rounded-[2vw] lg:rounded-3xl bg-white border border-[#6B1F2A]/10 p-[4vw] sm:p-[2vw] lg:p-6 shadow-[0_15px_40px_rgba(107,31,42,0.05)] [perspective:1000px] group"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] max-h-[35vh] sm:max-h-[45vh] rounded-[3vw] sm:rounded-[1.5vw] lg:rounded-2xl bg-[#F6F1E8] border border-[#A9792C]/20 overflow-hidden mb-[2vh]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                
                <img 
                  src={priestImage}
                  alt="Pandit Jagat Ram Sharma" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute bottom-[1.5vh] left-[1.5vw] sm:left-[1vw] z-20 bg-white/90 backdrop-blur-md px-[2.5vw] sm:px-[1.2vw] py-[0.5vh] rounded-lg border border-[#A9792C]/30 flex items-center gap-[1vw] sm:gap-[0.5vw] shadow-sm">
                  <span className="text-[3vw] sm:text-[1.5vw] lg:text-[0.8vw]">🕉️</span>
                  <span className="text-[2.2vw] sm:text-[1.2vw] lg:text-[0.65vw] font-bold text-[#6B1F2A] tracking-wider uppercase">
                    Head Astrologer
                  </span>
                </div>
              </div>

              <div className="space-y-[0.5vh] text-left">
                <div className="text-[4.5vw] sm:text-[2.8vw] lg:text-[1.3vw] font-display font-black text-[#6B1F2A]">
                  पंडित जगत राम शर्मा
                </div>
                <div className="text-[2.8vw] sm:text-[1.6vw] lg:text-[0.8vw] font-semibold text-[#A9792C] tracking-wide">
                  25+ Years Experience • 3,200+ Kundalis Matched
                </div>
                <p className="text-[2.8vw] sm:text-[1.6vw] lg:text-[0.75vw] text-[#241F1C]/60 pt-[0.5vh] leading-relaxed font-normal">
                  Expert guidance rooted firmly in regional Vedic traditions approved by temple councils.
                </p>
              </div>

              <div className="absolute -inset-px rounded-[4vw] sm:rounded-[2vw] lg:rounded-3xl border border-transparent group-hover:border-[#A9792C]/30 transition-colors pointer-events-none duration-500" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};