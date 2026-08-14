import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FieldShell } from "./FieldShell";

/** Multi-select chips (interests, preferred districts, preferred education, etc). */
export const ChipMultiSelect = ({
  label, options, value, onChange, hint,
}: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; hint?: string }) => {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <FieldShell label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <motion.button
              key={opt}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(opt)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                active ? "border-gold bg-gold/15 text-deep" : "border-line bg-white/70 text-ink/70 hover:border-gold/60"
              }`}
            >
              {opt}
              {active && <X size={12} />}
            </motion.button>
          );
        })}
      </div>
    </FieldShell>
  );
};
