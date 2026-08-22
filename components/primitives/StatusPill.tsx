import type { SpanStatus } from "@/lib/types";

const LABEL: Record<SpanStatus, string> = {
  pending: "pending",
  running: "running",
  done: "done",
  failed: "failed",
  cached: "cached",
};

/**
 * Wash background plus a 1px dim border in the state hue. Cached is the
 * exception: slate with a dashed border, never a live colour (rule 2.7.1).
 */
const STYLE: Record<SpanStatus, string> = {
  pending: "bg-ink-200 border border-ink-400 text-slate-400",
  running: "bg-sodium-wash border border-sodium-dim text-sodium-bright",
  done: "bg-green-wash border border-green-dim text-green-bright",
  failed: "bg-red-wash border border-red-dim text-red-bright",
  cached: "border border-dashed border-ink-500 text-slate-300",
};

export interface StatusPillProps {
  status: SpanStatus;
  /**
   * Opt in to the live glow. Off by default so a screen can never end up with
   * two glowing elements — the caller decides which single element is live.
   */
  glow?: boolean;
  className?: string;
}

export function StatusPill({ status, glow = false, className = "" }: StatusPillProps) {
  return (
    <span
      className={`ct-num inline-flex items-center rounded-full px-2 py-0.5 text-eyebrow leading-none ${STYLE[status]} ${glow ? "ct-live" : ""} ${className}`}
    >
      {LABEL[status]}
    </span>
  );
}
