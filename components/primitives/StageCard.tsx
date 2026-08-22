import type { ReactNode } from "react";
import type { SpanStatus, Stage } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { MonoValue } from "./MonoValue";
import { StatusPill } from "./StatusPill";

export interface StageCardProps {
  stage: Stage;
  /** Machine label, e.g. `stage 1 / business understanding`. */
  title: string;
  status: SpanStatus;
  elapsedMs: number;
  /** Opt in to the live glow. At most one element per screen may. */
  glow?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Structured stage output. The body renders labelled fields — never raw JSON
 * in the main canvas.
 */
export function StageCard({
  stage,
  title,
  status,
  elapsedMs,
  glow = false,
  children,
  className = "",
}: StageCardProps) {
  return (
    <section
      className={`ct-elev-2 relative overflow-hidden rounded-md p-5 pl-6 ${className}`}
    >
      {/* 3px full-height bar in the stage hue. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${
          stage === 1 ? "bg-stage-1" : "bg-stage-2"
        }`}
      />

      <header className="flex items-center justify-between gap-3">
        <MonoValue size="eyebrow" tone={stage === 1 ? "stage-1" : "stage-2"}>
          {title}
        </MonoValue>
        <div className="flex shrink-0 items-center gap-2">
          <span className="ct-num text-[11px] leading-none text-slate-400">
            {formatDuration(elapsedMs)}
          </span>
          <StatusPill status={status} glow={glow} />
        </div>
      </header>

      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Labelled field for a stage card body. */
export function StageField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="ct-eyebrow">{label}</div>
      <div className="mt-1.5 text-body text-slate-200">{children}</div>
    </div>
  );
}
