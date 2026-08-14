import type { InputHTMLAttributes } from "react";
import { FieldShell } from "./FieldShell";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

/** Premium text/number/date input — glass-tinted, gold focus ring, generous padding. */
export const TextField = ({ label, required, error, hint, className = "", ...rest }: Props) => (
  <FieldShell label={label} required={required} error={error} hint={hint}>
    <input
      {...rest}
      className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm font-medium text-ink outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-muted/60 focus:bg-white ${
        error ? "border-maroon focus:ring-2 focus:ring-maroon/20" : "border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
      } ${className}`}
    />
  </FieldShell>
);
