import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { FieldShell } from "./FieldShell";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

/** Custom-skinned <select> — native under the hood (best accessibility/mobile UX), styled to disappear into the glass card. */
export const SelectField = ({ label, required, error, hint, placeholder, options, className = "", ...rest }: Props) => (
  <FieldShell label={label} required={required} error={error} hint={hint}>
    <div className="relative">
      <select
        {...rest}
        className={`w-full appearance-none rounded-2xl border bg-white/70 px-4 py-3 pr-10 text-sm font-medium text-ink outline-none backdrop-blur-sm transition-all duration-200 focus:bg-white ${
          error ? "border-maroon focus:ring-2 focus:ring-maroon/20" : "border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
        } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  </FieldShell>
);
