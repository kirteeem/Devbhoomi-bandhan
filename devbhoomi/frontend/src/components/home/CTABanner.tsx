import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

// Import local background image
import ctaBg from '../../assets/himcahlifocused.png'; 

gsap.registerPlugin(useGSAP);

export const CTABanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryBtnRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      bannerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
    );
    
    // Ambient slow movement
    gsap.to('.cta-bg-img', {
      scale: 1.06,
      x: '+=6',
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, { scope: bannerRef });

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>, targetRef: React.RefObject<HTMLAnchorElement | null>) => {
    const btn = targetRef.current;
    if (!btn) return;
    const bounds = btn.getBoundingClientRect();
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;

    gsap.to(btn, { x: x * 0.25, y: y * 0.25, scale: 1.02, duration: 0.3, ease: 'power2.out' });
  };

  const handleMagneticReset = (targetRef: React.RefObject<HTMLAnchorElement | null>) => {
    gsap.to(targetRef.current, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <section className="w-full max-w-full overflow-x-hidden mx-auto px-[4vw] py-[6vh]">
      <div
        ref={bannerRef}
        /* Extra tall banner with 75vh min-height (or 750px on desktop) */
        className="relative overflow-hidden rounded-[5vw] sm:rounded-[3vw] lg:rounded-[36px] border border-black/10 bg-black p-[8vw] sm:p-[6vw] lg:p-[6vw] shadow-2xl min-h-[75vh] lg:min-h-[750px] flex items-center"
      >
        
        {/* BRIGHT BACKGROUND IMAGE - Dynamic height coverage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src={ctaBg} 
            alt="Himachal Matrimony Background" 
            className="cta-bg-img w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.02]"
          />
        </div>

        {/* ELEGANT CINEMATIC GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/85 via-black/55 to-transparent pointer-events-none" />

        {/* FOREGROUND CONTENT */}
        <div className="relative z-10 w-full max-w-xl space-y-[3vh] text-left">
          
          {/* Mini Tag Capsule */}
          <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] rounded-full border border-amber-400/30 bg-black/40 px-[3vw] sm:px-[1.2vw] py-[1vh] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold uppercase tracking-widest text-[#F4B400] backdrop-blur-md">
            <Sparkles className="w-[3vw] h-[3vw] sm:w-[1.2vw] sm:h-[1.2vw] lg:w-[0.9vw] lg:h-[0.9vw] text-[#F4B400] animate-pulse" />
            Exclusive Matchmaking
          </div>

          {/* Hindi Typography Header */}
          <h2 className="font-hindi text-[7vw] sm:text-[5vw] lg:text-[3vw] font-extrabold tracking-tight text-white leading-[1.2] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            अपने परिवार के लिए सही रिश्ता आज ही खोजें
          </h2>
          
          {/* Subtext description */}
          <p className="text-[3.6vw] sm:text-[2.2vw] lg:text-[1vw] font-medium leading-relaxed text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-md">
            हज़ारों संस्कारी परिवार पहले से जुड़े हैं — आप भी जुड़ें, बिल्कुल निःशुल्क।
          </p>

          {/* Interactive Responsive Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-[2vh] sm:gap-[1vw] pt-[2vh]">
            <Link
              ref={primaryBtnRef}
              to="/signup"
              onMouseMove={(e) => handleMagneticMove(e, primaryBtnRef)}
              onMouseLeave={() => handleMagneticReset(primaryBtnRef)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-[2vw] sm:gap-[0.5vw] rounded-[2.5vw] sm:rounded-[1vw] bg-[#F4B400] px-[7vw] sm:px-[2.5vw] py-[2vh] font-sans text-[3.4vw] sm:text-[1.6vw] lg:text-[0.8vw] font-bold tracking-wider text-black uppercase shadow-2xl hover:bg-[#E5A800] transition-all active:scale-[0.99] select-none text-center"
            >
              <span>Create Profile</span>
            </Link>

            <Link
              ref={secondaryBtnRef}
              to="/matches"
              onMouseMove={(e) => handleMagneticMove(e, secondaryBtnRef)}
              onMouseLeave={() => handleMagneticReset(secondaryBtnRef)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-[2vw] sm:gap-[0.5vw] rounded-[2.5vw] sm:rounded-[1vw] border border-white/30 bg-black/40 px-[7vw] sm:px-[2.5vw] py-[2vh] font-sans text-[3.4vw] sm:text-[1.6vw] lg:text-[0.8vw] font-bold tracking-wider text-white uppercase hover:bg-white/20 hover:border-white/60 backdrop-blur-md transition-all active:scale-[0.99] select-none group shadow-lg text-center"
            >
              <span>Browse Matches</span>
              <ArrowUpRight className="w-[3.8vw] h-[3.8vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[0.9vw] lg:h-[0.9vw] text-[#E0E0E0] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};