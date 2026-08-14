import { motion } from "framer-motion";
import { FieldShell } from "./FieldShell";

interface Option { 
  value: string; 
  label: string; 
}

interface RadioPillGroupProps {
  label: string; 
  required?: boolean; 
  error?: string;
  options: Option[]; 
  value: string; 
  onChange: (v: string) => void; 
  columns?: number;
}

/** Custom radio buttons rendered as an animated pill group (replaces ugly native radios). */
export const RadioPillGroup = ({
  label, 
  required, 
  error, 
  options, 
  value, 
  onChange,
}: RadioPillGroupProps) => (
  <FieldShell label={label} required={required} error={error}>
    {/* Clean, robust layout system that wraps seamlessly on mobile and stays uniform on desktop */}
    <div className="flex flex-wrap items-center gap-2 w-full mt-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`group relative overflow-hidden rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-150 outline-none select-none ${
              active 
                ? "border-sky-500 text-sky-600 shadow-sm" 
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
            }`}
          >
            {/* Smooth sliding selection capsule using your exact sky-blue brand accent color */}
            {active && (
              <motion.span
                layoutId={`pill-${label}`}
                className="absolute inset-0 bg-sky-50"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            {/* Text remains strictly readable on top of layout states */}
            <span className="relative z-10">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  </FieldShell>
);