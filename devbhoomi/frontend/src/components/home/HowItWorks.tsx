import { useEffect, useRef } from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP ONLY (>= 1024px): Pin left header column smoothly
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top+=80",
          end: "bottom bottom",
          pin: leftSideRef.current,
          pinSpacing: false,
          scrub: 1,
        });
      });

      // Continuous growth tracking for the vertical progress line (All Devices)
      gsap.fromTo(
        ".editorial-progress-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative z-20 w-full bg-[#FBF8F3] text-[#241F1C] px-[4vw] py-[6vh] border-b border-[#6B1F2A]/10"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[4vh] lg:gap-[4vw] relative">
        
        {/* LEFT COLUMN: HEADER PANEL */}
        <div 
          ref={leftSideRef} 
          className="lg:col-span-4 lg:h-[calc(100vh-160px)] flex flex-col justify-between py-[1vh]"
        >
          <div>
            <div className="flex items-center gap-[2vw] sm:gap-[0.8vw] mb-[1.5vh]">
              <span className="h-[2px] w-[5vw] sm:w-[2vw] lg:w-[1.5vw] bg-[#6B1F2A]" />
              <span className="text-[2.8vw] sm:text-[1.8vw] lg:text-[0.75vw] font-black uppercase tracking-widest text-[#6B1F2A]">
                The Methodology
              </span>
            </div>
            
            <h2 className="font-display text-[7.5vw] sm:text-[5.5vw] lg:text-[3.2vw] font-light text-[#6B1F2A] tracking-tight leading-[1.12] mb-[2vh]">
              A Cultured Approach <br />
              <span className="font-serif italic font-normal text-[#A9792C]">to Matrimony</span>
            </h2>
            
            <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[0.95vw] text-[#241F1C]/70 font-sans leading-relaxed max-w-md">
              We mapped out a traditional lineage system into a high-utility native architecture. Built consciously, avoiding modern chaotic dating metrics.
            </p>
          </div>

          {/* Micro Index Tracker (Desktop Only) */}
          <div className="hidden lg:flex flex-col gap-[1.5vh] border-t border-[#6B1F2A]/10 pt-[2vh] mt-[4vh]">
            <div className="text-[0.7vw] uppercase font-bold tracking-widest text-[#241F1C]/40">System Milestones</div>
            <div className="flex items-center gap-[0.8vw] text-[0.8vw] font-mono text-[#6B1F2A]">
              <span>Identity Verification</span>
              <ArrowRight size={12} className="opacity-40" />
              <span>Lineage Filter</span>
              <ArrowRight size={12} className="opacity-40" />
              <span>Unification</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE MASONRY */}
        <div className="lg:col-span-8 relative pl-[6vw] sm:pl-[4vw] lg:pl-[3vw]">
          
          {/* Asymmetric Vertical Progress Line */}
          <div className="absolute left-0 top-[1vh] bottom-[1vh] w-[1px] bg-[#6B1F2A]/10">
            <div className="editorial-progress-line absolute top-0 left-0 w-full h-full bg-[#A9792C] origin-top scale-y-0" />
          </div>

          <div className="flex flex-col gap-[6vh] lg:gap-[10vh]">

            {/* STEP 1 */}
            <div className="relative group">
              <div className="absolute -left-[calc(6vw+11px)] sm:-left-[calc(4vw+14px)] lg:-left-[calc(3vw+14px)] top-0 flex w-[22px] h-[22px] sm:w-[28px] sm:h-[28px] items-center justify-center rounded-full bg-[#6B1F2A] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-mono font-bold text-white shadow-md">
                01
              </div>
              
              <div className="max-w-2xl space-y-[1vh]">
                <span className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold tracking-widest text-[#A9792C] uppercase block">
                  Phase One
                </span>
                <h3 className="text-[5vw] sm:text-[3.2vw] lg:text-[1.8vw] font-display font-medium text-[#6B1F2A]">
                  Create Verified Profile
                </h3>
                <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[0.95vw] text-[#241F1C]/70 leading-relaxed">
                  Quick signup with easy background verification. Add the rest of your documentation whenever you are ready.
                </p>

                <div className="inline-flex items-center gap-[3vw] sm:gap-[1.2vw] bg-white p-[3vw] sm:p-[1.2vw] rounded-xl border border-[#6B1F2A]/10 shadow-sm mt-[1vh]">
                  <div className="w-[8vw] h-[8vw] sm:w-[3.5vw] sm:h-[3.5vw] lg:w-[2.2vw] lg:h-[2.2vw] rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    <ShieldCheck className="w-[60%] h-[60%]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#241F1C] text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw]">
                      Telephonic & ID Checked
                    </div>
                    <div className="text-[#241F1C]/50 text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw]">
                      Secure community access standard
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="relative group">
              <div className="absolute -left-[calc(6vw+11px)] sm:-left-[calc(4vw+14px)] lg:-left-[calc(3vw+14px)] top-0 flex w-[22px] h-[22px] sm:w-[28px] sm:h-[28px] items-center justify-center rounded-full bg-[#6B1F2A] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-mono font-bold text-white shadow-md">
                02
              </div>

              <div className="max-w-2xl space-y-[1vh]">
                <span className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold tracking-widest text-[#A9792C] uppercase block">
                  Phase Two
                </span>
                <h3 className="text-[5vw] sm:text-[3.2vw] lg:text-[1.8vw] font-display font-medium text-[#6B1F2A]">
                  Browse Local Lineages
                </h3>
                <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[0.95vw] text-[#241F1C]/70 leading-relaxed">
                  Smart filters designed natively to explore profiles across specific districts, gotras, and generational values.
                </p>

                <div className="space-y-[1vh] max-w-md mt-[1vh]">
                  {[
                    { label: "District Preference", val: "Kangra, Mandi, Shimla" },
                    { label: "Community Heritage", val: "Traditional Devbhoomi Values" }
                  ].map((filter, i) => (
                    <div key={i} className="flex items-center justify-between p-[2.5vw] sm:p-[1vw] bg-[#6B1F2A]/5 rounded-lg border border-[#6B1F2A]/5 text-[3vw] sm:text-[1.6vw] lg:text-[0.8vw]">
                      <span className="font-medium text-[#6B1F2A]">{filter.label}</span>
                      <span className="text-[#241F1C]/60 italic font-serif bg-white px-[2vw] sm:px-[0.8vw] py-[0.3vh] rounded shadow-sm">
                        {filter.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="relative group">
              <div className="absolute -left-[calc(6vw+11px)] sm:-left-[calc(4vw+14px)] lg:-left-[calc(3vw+14px)] top-0 flex w-[22px] h-[22px] sm:w-[28px] sm:h-[28px] items-center justify-center rounded-full bg-[#A9792C] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-mono font-bold text-white shadow-md">
                03
              </div>

              <div className="max-w-2xl bg-gradient-to-br from-[#6B1F2A] to-[#4A141C] text-white rounded-[4vw] sm:rounded-[2vw] lg:rounded-3xl p-[5vw] sm:p-[3vw] relative overflow-hidden shadow-lg">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-white/[0.04] pointer-events-none text-[20vw] lg:text-[10vw] font-black">
                  ॐ
                </div>
                
                <span className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.7vw] font-bold tracking-widest text-[#A9792C] uppercase bg-white/10 px-[3vw] sm:px-[1vw] py-[0.5vh] rounded-full border border-white/5 inline-block mb-[1.5vh]">
                  Vedic Sync
                </span>
                <h3 className="text-[5vw] sm:text-[3.2vw] lg:text-[1.8vw] font-display font-medium mb-[1vh]">
                  Authentic Gun Milan
                </h3>
                <p className="text-[3.4vw] sm:text-[2vw] lg:text-[0.9vw] text-white/80 leading-relaxed mb-[2vh]">
                  Get calculated natively using regional astronomical algorithms approved by localized temple pandits.
                </p>
                <div className="inline-flex items-center gap-[2vw] sm:gap-[0.6vw] text-[2.8vw] sm:text-[1.5vw] lg:text-[0.75vw] text-[#A9792C] font-semibold bg-white/5 border border-white/10 rounded-lg p-[2vw] sm:p-[0.8vw]">
                  <Sparkles className="w-[3.5vw] h-[3.5vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[1vw] lg:h-[1vw] animate-pulse" />
                  <span>Calculates accurate Dashakoota & Ashta-koota aspects instantly</span>
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="relative group">
              <div className="absolute -left-[calc(6vw+11px)] sm:-left-[calc(4vw+14px)] lg:-left-[calc(3vw+14px)] top-0 flex w-[22px] h-[22px] sm:w-[28px] sm:h-[28px] items-center justify-center rounded-full bg-[#6B1F2A] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-mono font-bold text-white shadow-md">
                04
              </div>

              <div className="max-w-2xl space-y-[1vh]">
                <span className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold tracking-widest text-[#A9792C] uppercase block">
                  Final Phase
                </span>
                <h3 className="text-[5vw] sm:text-[3.2vw] lg:text-[1.8vw] font-display font-medium text-[#6B1F2A]">
                  Connect Safe & Securely
                </h3>
                <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[0.95vw] text-[#241F1C]/70 leading-relaxed">
                  Initiate contact with pristine confidentiality. Move conversations ahead naturally with explicit parent and family consent.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vh] sm:gap-[1vw] mt-[1vh]">
                  <div className="border border-[#6B1F2A]/10 bg-white p-[3vw] sm:p-[1.2vw] rounded-xl flex items-start gap-[2.5vw] sm:gap-[0.8vw]">
                    <CheckCircle className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1.1vw] lg:h-[1.1vw] text-[#A9792C] mt-[0.3vh] flex-shrink-0" />
                    <div>
                      <div className="text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw] font-bold">
                        Parental Authorization
                      </div>
                      <div className="text-[2.6vw] sm:text-[1.4vw] lg:text-[0.75vw] text-[#241F1C]/50 mt-[0.3vh]">
                        Ensures match intentions remain authentic.
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#6B1F2A]/10 bg-white p-[3vw] sm:p-[1.2vw] rounded-xl flex items-start gap-[2.5vw] sm:gap-[0.8vw]">
                    <MapPin className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1.1vw] lg:h-[1.1vw] text-[#A9792C] mt-[0.3vh] flex-shrink-0" />
                    <div>
                      <div className="text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw] font-bold">
                        Intra-Valley Logistics
                      </div>
                      <div className="text-[2.6vw] sm:text-[1.4vw] lg:text-[0.75vw] text-[#241F1C]/50 mt-[0.3vh]">
                        Tailored specifically around Himalayan terrain networks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};