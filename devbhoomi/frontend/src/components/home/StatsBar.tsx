import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import page2 from "../../assets/page2.jpeg";
import pagetwo from "../../assets/pagetwo.jpeg";
import Kundali from "../../assets/kundali.png";

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
    <section className="w-full min-h-screen bg-[#FBF8F3] text-[#241F1C] px-[4vw] py-[8vh] flex flex-col justify-center">
      
      {/* SECTION 1: HEADER & HERO SUBTEXT */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#6B1F2A]/10 pb-[4vh] mb-[6vh] gap-[3vh]">
        <div className="w-full lg:w-[60vw]">
          <div className="flex items-center gap-[2vw] mb-[1.5vh]">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4vh] lg:gap-[4vw] items-start">
        
        {/* COLUMN A: SLIDER CONTAINER */}
        <div className="lg:col-span-5 flex flex-col gap-[2vh] w-full">
          <div className="relative w-full rounded-[4vw] sm:rounded-[2vw] overflow-hidden bg-[#241F1C] min-h-[35vh] sm:min-h-[45vh] lg:min-h-[55vh] flex flex-col justify-between p-[5vw] sm:p-[3vw]">
            
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

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
                    className={`h-[0.5vh] transition-all duration-500 rounded-full ${
                      idx === currentSlide ? "w-[8vw] sm:w-[4vw] lg:w-[2vw] bg-[#A9792C]" : "w-[2vw] sm:w-[1vw] lg:w-[0.5vw] bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN B & C: METRICS & RIBBON BANNER */}
        <div className="lg:col-span-7 flex flex-col gap-[4vh] lg:gap-[5vh]">
          
          {/* STATS GRID */}
          <div className="border-t border-[#6B1F2A]/10 pt-[3vh] grid grid-cols-1 sm:grid-cols-2 gap-[4vh] sm:gap-[3vw]">
            <StatSectionItem {...stats[0]} index={0} />
            <StatSectionItem {...stats[1]} index={1} />
          </div>

          {/* IMAGE RIBBON BANNER */}
          <div className="w-full rounded-[3vw] sm:rounded-[1.5vw] overflow-hidden shadow-lg bg-[#241F1C] flex items-center justify-center">
            <img 
              src={Kundali} 
              alt="Kundali Matching" 
              className="w-full h-auto max-h-[30vh] sm:max-h-[40vh] object-cover object-center"
            />
          </div>

          {/* CHIP PANEL SECTION */}
          <div className="border-b border-[#6B1F2A]/10 pb-[4vh] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[3vh]">
            <div className="flex items-center gap-[4vw] sm:gap-[2vw]">
              <div className="w-[14vw] h-[14vw] sm:w-[7vw] sm:h-[7vw] lg:w-[4.5vw] lg:h-[4.5vw] rounded-full border border-[#A9792C]/30 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                <span className="text-[5vw] sm:text-[2.8vw] lg:text-[1.8vw] font-display font-bold text-[#6B1F2A]">
                  {stats[2].value}
                </span>
              </div>
              <div>
                <h5 className="text-[4vw] sm:text-[2.2vw] lg:text-[1.1vw] font-bold tracking-tight text-[#241F1C]">
                  {stats[2].label}
                </h5>
                <p className="text-[3vw] sm:text-[1.6vw] lg:text-[0.85vw] text-[#241F1C]/60 mt-[0.5vh]">
                  {stats[2].desc}
                </p>
              </div>
            </div>
            
            {/* DISTRICT TAGS */}
            <div className="flex flex-wrap gap-[1.5vw] sm:gap-[0.8vw] w-full sm:w-auto sm:justify-end">
              {["Shimla", "Kangra", "Mandi", "Solan", "Kullu", "Chamba", "Hamirpur"].map((city) => (
                <span 
                  key={city} 
                  className="text-[2.5vw] sm:text-[1.4vw] lg:text-[0.7vw] uppercase tracking-wider px-[3vw] sm:px-[1.2vw] py-[0.8vh] rounded-md bg-[#6B1F2A]/5 border border-[#6B1F2A]/10 font-medium text-[#6B1F2A]"
                >
                  {city}
                </span>
              ))}
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
      <span className="text-[2.8vw] sm:text-[1.6vw] lg:text-[0.8vw] font-mono text-[#A9792C]/70 mb-[1vh] font-bold">
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