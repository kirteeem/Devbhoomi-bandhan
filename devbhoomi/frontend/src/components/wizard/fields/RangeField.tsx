import { FieldShell } from "./FieldShell";

/** Simple min/max numeric range pair, used for Partner Preference age & height. */
export const RangeField = ({
  label, minValue, maxValue, onMinChange, onMaxChange, minPlaceholder = "Min", maxPlaceholder = "Max", suffix, error,
}: {
  label: string;
  minValue: number | ""; maxValue: number | "";
  onMinChange: (v: number | "") => void; onMaxChange: (v: number | "") => void;
  minPlaceholder?: string; maxPlaceholder?: string; suffix?: string; error?: string;
}) => (
  <FieldShell label={label} error={error}>
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={minValue}
        placeholder={minPlaceholder}
        onChange={(e) => onMinChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 ${
          error ? "border-maroon focus:ring-maroon/20" : "border-line focus:border-gold focus:ring-gold/20"
        }`}
      />
      <span className="text-muted">–</span>
      <input
        type="number"
        value={maxValue}
        placeholder={maxPlaceholder}
        onChange={(e) => onMaxChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 ${
          error ? "border-maroon focus:ring-maroon/20" : "border-line focus:border-gold focus:ring-gold/20"
        }`}
      />
      {suffix && <span className="flex-shrink-0 text-xs font-bold text-muted">{suffix}</span>}
    </div>
  </FieldShell>
);
