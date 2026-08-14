interface Props { title: string; subtitle: string }

export const StepHeader = ({ title, subtitle }: Props) => (
  <div className="mb-8">
    <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
    <p className="mt-1 text-sm text-muted">{subtitle}</p>
  </div>
);
