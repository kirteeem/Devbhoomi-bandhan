import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, Award } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import page2 from "../../assets/page2.jpeg";
import pagetwo from "../../assets/pagetwo.jpeg";
import priestImage from "../../assets/priest.jpeg";

const stats = [
  { value: 3500, suffix: "+", label: "Successful Matches", desc: "Couples who found their lifelong partner across the hills" },
  { value: 100, suffix: "%", label: "Free Kundali Matching", desc: "Accurate Gun Milan algorithms approved by local pandits" },
  { value: 12, suffix: "", label: "Districts Covered", desc: "Operational presence across Himachal & Uttarakhand" },
];

const trustSlides = [
  {
    image: page2,
    title: "Rooted in Devbhoomi Traditions",
    subtitle: "Connecting traditional heritage with safe, community-trusted matching."
  },
  {
    image: pagetwo,
    title: "100% Secure Registrations",
    subtitle: "Every family profile goes through real credential validation."
  }
];

export const StatsBar = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trustSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full min-h-screen bg-[#FBF8F3] text-[#241F1C] px-[4vw] py-[8vh] flex flex-col justify-center relative overflow-hidden">
      
      {/* SECTION 1: HEADER & HERO SUBTEXT */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#6B1F2A]/10 pb-[4vh] mb-[6vh] gap-[3vh]">
        <div className="w-full lg:w-[60vw]">
          <div className="flex items-center gap-[2vw] lg:gap-[0.8vw] mb-[1.5vh]">
            <span className="h-[1px] w-[6vw] lg:w-[3vw] bg-[#A9792C]" />
            <span className="text-[2.8vw] sm:text-[1.8vw] lg:text-[0.85vw] font-black uppercase tracking-widest text-[#A9792C]">
              Our Footprint
            </span>
          </div>
          <h4 className="text-[8vw] sm:text-[6vw] lg:text-[3.8vw] font-display font-light text-[#6B1F2A] tracking-tight leading-[1.1]">
            Why Himachali <br />
            <span className="font-serif italic font-normal text-[#A9792C]">Families Trust Us</span>
          </h4>
        </div>

        <div className="w-full lg:w-[30vw] lg:text-right">
          <p className="text-[3.8vw] sm:text-[2.4vw] lg:text-[1.1vw] text-[#241F1C]/75 font-sans leading-relaxed">
            We understand Himachali traditions, family values, and the importance of finding the right life partner.
            Our platform offers secure profiles, free Kundali matching, and a trusted matrimonial experience.
          </p>
        </div>
      </div>

      {/* COMPOSITION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4vh] lg:gap-[4vw] items-center">

        {/* COLUMN A: SLIDER CONTAINER */}
        <div className="lg:col-span-5 flex flex-col gap-[2vh] w-full h-full">
          <div className="relative w-full h-full rounded-[4vw] sm:rounded-[2vw] overflow-hidden bg-[#241F1C] min-h-[40vh] sm:min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-between p-[5vw] sm:p-[3vw]">

            {/* Background Image Layer */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 0.65, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${trustSlides[currentSlide].image})` }}
              />
            </AnimatePresence>

            {/* Gradient Mask Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Top Indicator */}
            <div className="relative z-10 self-start inline-flex items-center gap-[1.5vw] sm:gap-[0.8vw] bg-white/10 backdrop-blur-md border border-white/20 px-[3vw] sm:px-[1.5vw] py-[1vh] rounded-full">
              <span className="w-[2vw] h-[2vw] sm:w-[0.6vw] sm:h-[0.6vw] rounded-full bg-green-400 animate-pulse" />
              <span className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold uppercase tracking-widest text-white">
                Live Verification
              </span>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="relative z-10 text-white mt-[8vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-display text-[5vw] sm:text-[3.2vw] lg:text-[1.6vw] font-semibold tracking-wide leading-tight text-white">
                    {trustSlides[currentSlide].title}
                  </h3>
                  <p className="mt-[1vh] text-[3.2vw] sm:text-[2vw] lg:text-[0.95vw] text-white/80 font-light leading-relaxed">
                    {trustSlides[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Slider Pagination Controls */}
              <div className="flex gap-[1.5vw] sm:gap-[0.8vw] mt-[2.5vh]">
                {trustSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-[0.5vh] transition-all duration-500 rounded-full ${
                      idx === currentSlide ? "w-[8vw] sm:w-[4vw] lg:w-[2vw] bg-[#A9792C]" : "w-[2vw] sm:w-[1vw] lg:w-[0.5vw] bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN B: METRICS & HERO-SIZED PRIEST FEATURE */}
        <div className="lg:col-span-7 flex flex-col gap-[3vh]">

          {/* STATS GRID */}
          <div className="border-t border-[#6B1F2A]/10 pt-[3vh] grid grid-cols-1 sm:grid-cols-2 gap-[4vh] sm:gap-[3vw]">
            <StatSectionItem {...stats[0]} index={0} />
            <StatSectionItem {...stats[1]} index={1} />
          </div>

          {/* PROMINENT SIGNATURE SERVICE SECTION */}
          <div className="relative w-full pt-[2vh]">
            
            {/* Soft Ambient Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[#A9792C]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-[4vw] sm:gap-[3vw] bg-white/80 backdrop-blur-md border border-[#A9792C]/30 p-[5vw] sm:p-[2.5vw] rounded-[4vw] sm:rounded-[2.5vw] shadow-[0_15px_35px_rgba(107,31,42,0.06)]">
              
              {/* HERO PORTRAIT FRAME (TEMPLE ARCH STYLE) */}
              <div className="relative group flex-shrink-0">
                <div className="relative w-[70vw] h-[75vw] sm:w-[28vw] sm:h-[32vw] lg:w-[22vw] lg:h-[26vw] rounded-t-[10vw] sm:rounded-t-[5vw] rounded-b-[2vw] p-[0.8vw] bg-gradient-to-b from-[#A9792C] via-[#6B1F2A] to-[#A9792C] shadow-xl overflow-hidden">
                  <div className="w-full h-full rounded-t-[9vw] sm:rounded-t-[4.5vw] rounded-b-[1.5vw] overflow-hidden bg-[#F6F1E8] relative">
                    <img 
                      src={priestImage} 
                      alt="Pandit Jagat Ram Sharma" 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Pandit Name Badge directly on image */}
                    <div className="absolute bottom-[2vh] left-[2vw] right-[2vw] text-center">
                      <span className="text-[3.5vw] sm:text-[1.4vw] lg:text-[0.9vw] font-serif italic text-white font-bold tracking-wide block">
                        Pt. Jagat Ram Sharma
                      </span>
                      <span className="text-[2.2vw] sm:text-[0.9vw] lg:text-[0.65vw] text-[#A9792C] uppercase tracking-widest font-semibold block">
                        Lead Vedic Astrologer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Seal Emblem */}
                <div className="absolute -top-3 -right-3 bg-[#6B1F2A] text-white p-[2.5vw] sm:p-[0.8vw] rounded-full border-2 border-[#A9792C] shadow-lg flex items-center justify-center">
                  <Award className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[1.2vw] lg:h-[1.2vw] text-[#A9792C]" />
                </div>
              </div>

              {/* ACTION & BADGES */}
              <div className="flex-1 flex flex-col justify-between items-center md:items-start text-center md:text-left space-y-[2.5vh]">
                <div className="space-y-[1vh]">
                  <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] px-[3.5vw] sm:px-[1.2vw] py-[0.8vh] rounded-full bg-[#6B1F2A]/5 border border-[#6B1F2A]/15">
                    <Sparkles className="w-[3.8vw] h-[3.8vw] sm:w-[1.3vw] sm:h-[1.3vw] lg:w-[0.9vw] lg:h-[0.9vw] text-[#A9792C]" />
                    <span className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.75vw] font-black uppercase tracking-widest text-[#6B1F2A]">
                      Our Signature Service
                    </span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-[1.5vw] sm:gap-[0.5vw] text-[#241F1C]/80 font-medium text-[3vw] sm:text-[1.2vw] lg:text-[0.8vw]">
                    <ShieldCheck className="w-[4vw] h-[4vw] sm:w-[1.4vw] sm:h-[1.4vw] lg:w-[0.9vw] lg:h-[0.9vw] text-[#A9792C]" />
                    <span>Approved & Verified Astrological Guidance</span>
                  </div>
                </div>

                {/* Call To Action */}
                <Link 
                  to="/kundali" 
                  className="inline-flex items-center justify-center gap-[2vw] sm:gap-[0.8vw] w-full md:w-auto rounded-[2vw] sm:rounded-[1vw] bg-gradient-to-r from-[#6B1F2A] to-[#8A2B39] hover:from-[#8A2B39] hover:to-[#6B1F2A] px-[6vw] sm:px-[2.2vw] py-[1.8vh] text-[3.5vw] sm:text-[1.3vw] lg:text-[0.85vw] font-bold text-white transition-all duration-300 shadow-lg group"
                >
                  <span>Free Kundali Match</span>
                  <ArrowRight className="w-[4vw] h-[4vw] sm:w-[1.3vw] sm:h-[1.3vw] lg:w-[0.9vw] lg:h-[0.9vw] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

const StatSectionItem = ({ value, suffix, label, desc, index }: { value: number; suffix: string; label: string; desc: string; index: number }) => {
  const { ref, value: animated } = useCountUp(value);

  return (
    <div ref={ref} className="group flex flex-col">
      <span className="text-[2.8vw] sm:text-[1.6vw] lg:text-[0.8vw] font-mono text-[#A9792C]/70 mb-[0.5vh] font-bold">
        [0{index + 1}]
      </span>

      <div className="text-[10vw] sm:text-[6vw] lg:text-[3.5vw] font-display font-black tracking-tight text-[#6B1F2A] mb-[0.5vh] flex items-baseline">
        <span>{animated.toLocaleString()}</span>
        <span className="text-[#A9792C] font-light ml-[0.5vw]">{suffix}</span>
      </div>

      <h5 className="text-[3.5vw] sm:text-[2vw] lg:text-[1vw] font-bold tracking-wide text-[#241F1C] uppercase mb-[0.5vh]">
        {label}
      </h5>

      <p className="text-[3vw] sm:text-[1.8vw] lg:text-[0.85vw] text-[#241F1C]/60 leading-relaxed max-w-[80vw] sm:max-w-[20vw]">
        {desc}
      </p>
    </div>
  );
};