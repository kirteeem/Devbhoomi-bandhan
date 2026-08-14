interface Props {
  value: number; // 0-100
  label?: string;
}

export const ProgressBar = ({ value, label }: Props) => (
  <div>
    {label && (
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
        <span>{label}</span>
        <span className="text-ink">{value}%</span>
      </div>
    )}
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold to-maroon transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);
