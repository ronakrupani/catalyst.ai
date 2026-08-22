"use client";

import type { RunSpan } from "@/lib/types";
import { formatDuration } from "@/lib/format";

export interface WaterfallRailProps {
  spans: RunSpan[];
  /** Total run length. Spans are positioned and scaled against this. */
  totalDurationMs: number;
  /**
   * 0..1 slides a veil across the track so the rail extends as the run opens.
   * Pure transform, driven by a CSS variable, so it costs nothing per frame.
   * Pass "inherit" to take `--p` from an ancestor that is already writing it.
   * Omit for a fully-drawn rail with no veil.
   */
  progress?: number | "inherit";
  /** 56px track with labels, or the 24px compact row. */
  variant?: "full" | "compact";
  /** The one span allowed to glow. Exactly one per screen. */
  liveSpanId?: string | null;
  selectedId?: string | null;
  onSelect?: (spanId: string) => void;
  /** Span highlighted from elsewhere on the page, e.g. a hovered placement. */
  highlightedSpanId?: string | null;
  /** Accessible name for the timeline as a whole. */
  label?: string;
  className?: string;
}

/**
 * The signature element. One horizontal spine that renders a run as spans,
 * violet on the left where Stage 1 thinks, amber on the right where Stage 2
 * scrapes. Learn it once, read it everywhere.
 *
 * Under 768px the same markup rotates to a vertical spine; positions are
 * expressed as `--start` / `--len` percentages so only the axis changes.
 */
export function WaterfallRail({
  spans,
  totalDurationMs,
  progress,
  variant = "full",
  liveSpanId = null,
  selectedId = null,
  highlightedSpanId = null,
  onSelect,
  label = "Pipeline run timeline",
  className = "",
}: WaterfallRailProps) {
  const interactive = Boolean(onSelect);

  return (
    <div
      className={`ct-rail ct-rail--${variant} ${className}`}
      style={
        typeof progress === "number"
          ? ({ "--p": progress } as React.CSSProperties)
          : undefined
      }
      role="group"
      aria-label={label}
    >
      {/* The bars carry duration in their width, so they cannot also meet the
          24px minimum target size. When the rail is presentational the spans
          are hidden from assistive tech and the list below carries the run
          instead — better announced than fourteen 10px buttons. */}
      <div className="ct-rail__track" aria-hidden={interactive ? undefined : true}>
        {spans.map((span) => {
          const start = (span.startMs / totalDurationMs) * 100;
          const len = (span.durationMs / totalDurationMs) * 100;
          const isLive = span.id === liveSpanId && span.status === "running";
          const Tag = interactive ? "button" : "div";

          return (
            <Tag
              key={span.id}
              type={interactive ? "button" : undefined}
              className="ct-span"
              data-selected={span.id === selectedId || undefined}
              data-highlighted={span.id === highlightedSpanId || undefined}
              style={{ "--start": `${start}%`, "--len": `${len}%` } as React.CSSProperties}
              onClick={interactive ? () => onSelect?.(span.id) : undefined}
              aria-pressed={interactive ? span.id === selectedId : undefined}
              aria-label={
                interactive
                  ? `${span.name}, ${span.status}, ${formatDuration(span.durationMs)}`
                  : undefined
              }
            >
              <span className="ct-span__label ct-eyebrow" aria-hidden="true">
                {span.name}
              </span>
              <span
                className="ct-span__bar"
                data-stage={span.stage}
                data-status={span.status}
                data-live={isLive || undefined}
              />
              <span className="ct-span__dur ct-num" aria-hidden="true">
                {formatDuration(span.durationMs)}
              </span>
            </Tag>
          );
        })}

        {/* Hides the not-yet-open portion of the run. Transform only. */}
        {progress !== undefined && <span className="ct-rail__veil" aria-hidden="true" />}
      </div>

      {!interactive && (
        <ul className="sr-only">
          {spans.map((span) => (
            <li key={span.id}>
              {`Stage ${span.stage}, ${span.name}, ${span.status}, ${formatDuration(
                span.durationMs,
              )}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
