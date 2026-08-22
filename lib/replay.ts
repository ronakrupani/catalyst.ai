import type { AuditEvent, DemoRun, Placement, RunSpan, SpanStatus } from "./types";

/**
 * The run rendered at a point in time. Every field is a pure function of
 * `progress`, so scrolling up rewinds exactly and there are no half-states.
 */
export interface RunState {
  progress: number;
  elapsedMs: number;
  /** Spans with status resolved for this instant. Same order as the fixture. */
  spans: RunSpan[];
  /** The single span running right now — the one element allowed to glow. */
  liveSpanId: string | null;
  /** Placements that have landed, in the order their spans found them. */
  placements: Placement[];
  /** Audit events emitted so far, chronological. */
  events: AuditEvent[];
  complete: boolean;
}

/**
 * Status of a span at elapsed time `t`.
 *
 * A cached span never passes through `running`: it flips straight to `cached`
 * at its start. Rule 2.7.1 — cached data never wears a live colour, and
 * `running` is the state that glows.
 */
export function spanStatusAt(span: RunSpan, t: number): SpanStatus {
  if (t < span.startMs) return "pending";
  if (span.status === "cached") return "cached";
  if (t < span.startMs + span.durationMs) return "running";
  return span.status;
}

export function runStateAt(run: DemoRun, progress: number): RunState {
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const elapsedMs = p * run.totalDurationMs;

  const spans = run.spans.map((span) => ({
    ...span,
    status: spanStatusAt(span, elapsedMs),
  }));

  const live = spans.find((s) => s.status === "running");

  const events = run.events.filter((e) => e.tsMs - run.startedAtMs <= elapsedMs);

  // A placement lands when the event that found it lands, so the counter and
  // the audit trail can never disagree.
  const landedIds = new Set(
    events
      .filter((e) => e.type === "stage2.inventory.found" && e.placementId)
      .map((e) => e.placementId as string),
  );
  const placements = run.placements.filter((pl) => landedIds.has(pl.id));

  return {
    progress: p,
    elapsedMs,
    spans,
    liveSpanId: live ? live.id : null,
    placements,
    events,
    complete: p >= 1,
  };
}

/** Index of the span containing `progress`, or -1. Used to throttle re-renders. */
export function liveSpanIndexAt(run: DemoRun, progress: number): number {
  const t = progress * run.totalDurationMs;
  return run.spans.findIndex((s) => spanStatusAt(s, t) === "running");
}

/** How many placements have landed. Cheap enough to call every frame. */
export function placementCountAt(run: DemoRun, progress: number): number {
  const t = progress * run.totalDurationMs;
  let n = 0;
  for (const e of run.events) {
    if (e.type !== "stage2.inventory.found" || !e.placementId) continue;
    if (e.tsMs - run.startedAtMs <= t) n += 1;
  }
  return n;
}

/** Min and max CPM across the whole result set — the range bar's scale. */
export function cpmBounds(placements: Placement[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const p of placements) {
    if (p.cpmLow < min) min = p.cpmLow;
    if (p.cpmHigh > max) max = p.cpmHigh;
  }
  return { min, max };
}

/** Where Stage 1 hands off to Stage 2, as a fraction of the run. */
export function stageBoundary(run: DemoRun): number {
  const firstStage2 = run.spans.find((s) => s.stage === 2);
  if (!firstStage2) return 1;
  return firstStage2.startMs / run.totalDurationMs;
}

export interface RunSummary {
  placementCount: number;
  cpmLow: number;
  cpmHigh: number;
  platformsSearched: number;
  totalDurationMs: number;
}

/** The line at the end of Act 1 — the one people screenshot. */
export function runSummary(run: DemoRun): RunSummary {
  const { min, max } = cpmBounds(run.placements);
  return {
    placementCount: run.placements.length,
    cpmLow: min,
    cpmHigh: max,
    platformsSearched: run.platformsSearched,
    totalDurationMs: run.totalDurationMs,
  };
}
