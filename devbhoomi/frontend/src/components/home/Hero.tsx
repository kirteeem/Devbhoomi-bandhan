import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlayCircle } from "lucide-react";
import { SearchCard } from "./SearchCard";

export const Hero = () => {
  // Resolves asset directly via string URL reference to bypass TypeScript modules mismatch
  const Background = new URL("../../assets/background.jpeg", import.meta.url).href;

  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 60,
    damping: 20,
  });

  const springY = useSpring(mouseY, {
    stiffness: 60,
    damping: 20,
  });

  // Parallax values converted to look fluid relative to screen scaling
  const farLayerX = useTransform(springX, [-1, 1], ["-1.5vw", "1.5vw"]);
  const farLayerY = useTransform(springY, [-1, 1], ["-1vh", "1vh"]);

  const nearLayerX = useTransform(springX, [-1, 1], ["-3vw", "3vw"]);
  const nearLayerY = useTransform(springY, [-1, 1], ["-2vh", "2vh"]);

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const particles = Array.from({ length: 14 });

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative w-full min-h-screen overflow-hidden bg-[#0f1a15] flex flex-col justify-center items-center pt-[14vh] pb-[6vh]"
    >
      {/* Background Image Wrapper */}
      {/* Background Image Wrapper */}
{/* Background Image Wrapper */}
<div className="absolute inset-0 z-0 flex justify-center items-center bg-[#0f1a15]">
  {/* Background Image Wrapper */}
      <div className="absolute inset-0 z-0">
        <img
          src={Background}
          alt="Background"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
        {/* Subtle full-bleed vignette edge shadows instead of harsh solid gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a15]/30 via-transparent to-[#0f1a15]/30" />
      </div>
</div>
      {/* Sky Wrapper / Sun Overlay */}
      <motion.div className="absolute inset-0 -z-30 opacity-40 mix-blend-screen">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7fa3c4" />
              <stop offset="45%" stopColor="#f0c896" />
              <stop offset="100%" stopColor="#f6ddb4" />
            </linearGradient>

            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="#fff6df" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fff6df" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect
            width="1440"
            height="900"
            fill="url(#heroSky)"
          />

          <circle
            cx="1150"
            cy="210"
            r="180"
            fill="url(#sunGlow)"
          />

          <circle
            cx="1150"
            cy="210"
            r="58"
            fill="#fff8e6"
          />
        </svg>
      </motion.div>

      {/* Mountains Overlay */}
      <motion.div
        className="absolute inset-0 -z-20 opacity-20"
        style={{
          x: farLayerX,
          y: farLayerY,
        }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="h-full w-full"
        >
          <path
            d="M0,460 L130,370 L260,430 L390,320 L520,410 L660,280 L800,400 L940,310 L1080,410 L1220,340 L1360,430 L1440,370 L1440,900 L0,900 Z"
            fill="#6c8a78"
            opacity="0.55"
          />
        </svg>
      </motion.div>

      {/* Forest Overlay */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-10"
        style={{
          x: nearLayerX,
          y: nearLayerY,
        }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="h-full w-full"
        >
          <path
            d="M0,620 L150,540 L300,600 L460,500 L620,580 L780,490 L960,590 L1120,510 L1280,590 L1440,540 L1440,900 L0,900 Z"
            fill="#2b3d33"
          />
        </svg>
      </motion.div>

      {/* Dark gradient mask for textual readability */}
      <div className="absolute inset-0 -z-[5] bg-gradient-to-b from-black/20 via-black/40 to-[#0f1a15]" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-[0.8vh] w-[0.8vh] rounded-full bg-gold-soft/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{
              y: [0, "-3vh", 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 5 + (i % 5),
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Hero Content Wrapper */}
      <div className="relative z-10 mx-auto flex max-w-[85vw] flex-col items-center px-[4vw] text-center text-cream">

        <motion.div
          initial={{ opacity: 0, y: "-2vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-[3vh] flex items-center justify-center gap-[1.5vw]"
        >
          <div className="h-[0.15vh] w-[10vw] bg-gradient-to-r from-transparent to-[#D4AF37]" />

          <p className="font-hindi text-[2.6vh] font-medium tracking-wide text-[#D4AF37] md:text-[3.2vh]">
            {t("hero.blessing")}
          </p>

          <div className="h-[0.15vh] w-[10vw] bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: "3vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2 }}
          className="
            font-heading
            text-[5vh]
            font-bold
            leading-none
            tracking-tight
            text-white
            drop-shadow-[0_1.2vh_4.2vh_rgba(0,0,0,0.65)]
            sm:text-[6.5vh]
            lg:text-[8.5vh]
          "
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .4 }}
          className="
            mt-[3vh]
            max-w-[65vw]
            font-sans
            text-[1.9vh]
            leading-[3.6vh]
            tracking-wide
            text-white/90
            drop-shadow-[0_0.5vh_1.2vh_rgba(0,0,0,0.5)]
            md:text-[2.2vh]
          "
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .6 }}
          className="mt-[4vh] flex flex-wrap justify-center gap-[1.5vw]"
        >
          <Link
            to="/signup"
            className="
              rounded-[2vh]
              bg-gradient-to-r
              from-[#D4AF37]
              to-[#B88A1B]
              px-[3vw]
              py-[1.8vh]
              font-sans
              text-[1.8vh]
              font-semibold
              text-[#1E1E1E]
              shadow-xl
              transition
              duration-300
              hover:scale-105
              hover:shadow-yellow-500/40
            "
          >
            {t("hero.createProfile")}
          </Link>

          <Link
            to="/matches"
            className="rounded-[2vh] border border-white/40 px-[2.5vw] py-[1.8vh] font-bold text-[1.8vh] text-white backdrop-blur bg-white/5 hover:bg-white/10 transition"
          >
            {t("hero.browseMatches")}
          </Link>

          <button className="
            flex
            items-center
            gap-[0.8vw]
            rounded-[2vh]
            px-[1.5vw]
            py-[1.8vh]
            font-sans
            text-[1.8vh]
            font-medium
            text-white
            transition
            hover:text-[#6e5a16]
          ">
            <PlayCircle className="w-[2.2vh] h-[2.2vh]" />
            Watch Stories
          </button>
        </motion.div>

        {/* SEARCH CARD */}
        <motion.div
          initial={{ opacity: 0, y: "4vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.8,
          }}
          className="mt-[6vh] w-full max-w-[80vw]"
        >
          <SearchCard />
        </motion.div>

      </div>
    </section>
  );
};