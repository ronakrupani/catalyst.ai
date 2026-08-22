/** Where one CPM range sits inside the whole matched set. */
export function CpmRangeBar({
  low,
  high,
  min,
  max,
  className = "",
}: {
  low: number;
  high: number;
  min: number;
  max: number;
  className?: string;
}) {
  const span = max - min || 1;
  const left = ((low - min) / span) * 100;
  const width = Math.max(2, ((high - low) / span) * 100);
  return (
    <div
      className={`relative h-1 w-full overflow-hidden rounded-xs bg-ink-400 ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute top-0 h-full rounded-xs bg-sodium-base"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

/** Confidence, always drawn beside its numeral. */
export function ConfidenceBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div
      className={`h-1 w-[72px] overflow-hidden rounded-xs bg-ink-400 ${className}`}
      aria-hidden="true"
    >
      <div className="h-full rounded-xs bg-violet-base" style={{ width: `${value * 100}%` }} />
    </div>
  );
}
