import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animates a number from 0 -> target once the element scrolls into view.
 * Used by StatsBar.tsx for the "12,000+ Verified Families" style counters.
 */
export const useCountUp = (target: number, durationMs = 1600) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, durationMs]);

  return { ref, value };
};
