import type { AdUnit } from "@/lib/campaign";
import { MonoValue } from "./MonoValue";

const MAX_EDGE = 320;

/** Proportional frame at the ad unit's real aspect ratio. */
export function adUnitBox(unit: AdUnit, maxEdge = MAX_EDGE) {
  const scale = maxEdge / Math.max(unit.w, unit.h);
  return {
    width: Math.round(unit.w * scale),
    height: Math.max(24, Math.round(unit.h * scale)),
  };
}

export function AdUnitFrame({
  unit,
  label,
  loading = false,
  maxEdge = MAX_EDGE,
  className = "",
}: {
  unit: AdUnit;
  label?: string;
  /** Skeleton at the real dimensions of the content, never a spinner. */
  loading?: boolean;
  maxEdge?: number;
  className?: string;
}) {
  const box = adUnitBox(unit, maxEdge);
  return (
    <div className={className}>
      <div
        className={`flex items-center justify-center rounded-xs border bg-ink-100 ${
          loading ? "ct-skeleton border-ink-400" : "border-dashed border-ink-500"
        }`}
        style={box}
        aria-hidden="true"
      >
        {!loading && label ? (
          <span className="px-2 text-center text-body-sm text-slate-300">{label}</span>
        ) : null}
      </div>
      <MonoValue size="eyebrow" tone="muted" className="mt-2 block">
        {unit.w}×{unit.h}
      </MonoValue>
    </div>
  );
}
