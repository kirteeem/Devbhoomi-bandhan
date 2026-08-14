import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mountain, Users, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Local image imports
import privacy from "../../assets/privacy.png";
import familyvalues from "../../assets/familyvalues.png";
import himcahlifocused from "../../assets/himcahlifocused.png";

gsap.registerPlugin(ScrollTrigger);

export const WhyUs = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray(".gsap-reveal-block");
      blocks.forEach((block: any) => {
        // Smooth slide-up for contents
        gsap.fromTo(
          block.querySelector(".reveal-content"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
        
        // Subtle micro-scale down on the image for a parallax effect
        const img = block.querySelector(".reveal-image");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.08, opacity: 0.85 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: "top 88%",
              },
            }
          );
        }
      });
    }, containerRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  const tracks = [
    { 
      icon: Mountain, 
      title: t("why.himachalFocused"), 
      desc: t("why.himachalFocusedDesc"),
      num: "01 / ROOTS",
      caption: "Native Lineage Architecture",
      image: himcahlifocused
    },
    { 
      icon: Users, 
      title: t("why.familyValues"), 
      desc: t("why.familyValuesDesc"),
      num: "02 / VALUES",
      caption: "Ethical Match Integrity",
      image: familyvalues
    },
    { 
      icon: ShieldCheck, 
      title: t("why.privacy"), 
      desc: t("why.privacyDesc"),
      num: "03 / SECURITY",
      caption: "Sovereign Structural Privacy",
      image: privacy
    }
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-[#FAF6F0] px-[4vw] py-[8vh] border-b border-[#6B1F2A]/10"
    >
      {/* Background Linear Matrix Layer */}
      <div className="absolute top-0 left-[8%] w-px h-full bg-[#6B1F2A]/5 hidden lg:block" />
      <div className="absolute top-0 right-[8%] w-px h-full bg-[#6B1F2A]/5 hidden lg:block" />

      <div className="w-full max-w-7xl mx-auto relative">
        
        {/* HEADER BLOCK */}
        <div className="w-full lg:w-[65%] mb-[6vh] lg:mb-[10vh] lg:pl-[4vw]">
          <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.8vw] mb-[1.5vh]">
            <div className="w-[1.8vw] h-[1.8vw] sm:w-[0.6vw] sm:h-[0.6vw] rounded-full bg-[#A9792C]" />
            <span className="text-[2.8vw] sm:text-[1.8vw] lg:text-[0.75vw] font-mono font-bold uppercase tracking-[0.2em] text-[#6B1F2A]/70">
              {t("why.eyebrow")}
            </span>
          </div>
          
          <h2 className="font-serif text-[7.5vw] sm:text-[5.5vw] lg:text-[3.5vw] font-light text-[#6B1F2A] leading-[1.12] tracking-tight">
            Designed for those who value <br />
            <span className="font-sans font-black text-[#241F1C] italic tracking-normal">
              {t("why.title")}
            </span>
          </h2>
        </div>

        {/* EDITORIAL ALTERNATING LAYOUT */}
        <div ref={elementsRef} className="flex flex-col gap-[6vh] lg:gap-[12vh]">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            const isEven = index % 2 === 0;

            return (
              <div 
                key={track.title}
                className={`gsap-reveal-block w-full flex flex-col lg:flex-row gap-[3vh] lg:gap-[4vw] items-center lg:px-[4vw] ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* CONTENT BLOCK */}
                <div className="reveal-content w-full lg:w-[55%] border-t border-[#6B1F2A]/20 pt-[2.5vh] group order-2 lg:order-1">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-[2vh] sm:gap-[2vw]">
                    
                    {/* Left Metadata Panel */}
                    <div className="w-full sm:w-[30%] space-y-[0.5vh]">
                      <span className="block font-mono text-[3vw] sm:text-[1.8vw] lg:text-[0.85vw] font-bold text-[#A9792C] tracking-widest">
                        {track.num}
                      </span>
                      <p className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.7vw] font-mono text-[#241F1C]/40 uppercase tracking-wider">
                        {track.caption}
                      </p>
                    </div>

                    {/* Center Narrative */}
                    <div className="w-full sm:w-[60%] space-y-[1.5vh]">
                      <h3 className="font-serif text-[5.5vw] sm:text-[3.5vw] lg:text-[1.8vw] font-normal text-[#6B1F2A] tracking-tight group-hover:text-[#A9792C] transition-colors duration-300">
                        {track.title}
                      </h3>
                      <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[0.95vw] leading-relaxed text-[#241F1C]/70">
                        {track.desc}
                      </p>
                    </div>

                    {/* Icon Frame */}
                    <div className="hidden sm:flex w-auto justify-end pt-[0.5vh]">
                      <div className="relative w-[8vw] h-[8vw] sm:w-[4vw] sm:h-[4vw] lg:w-[2.5vw] lg:h-[2.5vw] flex items-center justify-center text-[#6B1F2A] group-hover:text-[#A9792C] transition-colors duration-300">
                        <div className="absolute inset-0 border border-[#6B1F2A]/15 rounded-xl rotate-45 group-hover:rotate-90 group-hover:border-[#A9792C]/40 transition-transform duration-500" />
                        <Icon className="w-[50%] h-[50%] relative z-10" strokeWidth={1.5} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* MEDIA FRAME */}
                <div className="w-full lg:w-[45%] order-1 lg:order-2">
                  <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] min-h-[25vh] max-h-[45vh] lg:max-h-[none] overflow-hidden rounded-[4vw] sm:rounded-[2vw] bg-[#241F1C]/5 border border-[#6B1F2A]/10 p-[1vw] sm:p-[0.5vw]">
                    <div className="w-full h-full overflow-hidden rounded-[3vw] sm:rounded-[1.6vw]">
                      <img 
                        src={track.image} 
                        alt={track.title} 
                        className="reveal-image w-full h-full object-cover object-center filter grayscale-[15%] contrast-[1.05] hover:grayscale-0 transition-all duration-700 ease-out"
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};