  import type { ReactNode } from "react";

  /** Common label + error wrapper every wizard field is built on. */
  export const FieldShell = ({
    label, required, error, hint, children,
  }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) => (
    <div>
      <label className="mb-2 flex items-baseline gap-1 text-[13px] font-bold text-ink/80">
        {label}
        {required && <span className="text-maroon">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-maroon">{error}</p>}
    </div>
  );
