"use client";

import type { DemoRun, Placement, RunSpan } from "@/lib/types";
import { runSummary } from "@/lib/replay";
import {
  formatCpmRange,
  formatDuration,
  formatScore,
} from "@/lib/format";
import { MonoValue } from "@/components/primitives/MonoValue";
import { WaterfallRail } from "@/components/primitives/WaterfallRail";

/** Rows visible in the stream window. The counter still runs to the full set. */
const TAIL = 6;

export interface ReplayDemoProps {
  run: DemoRun;
  /** Spans with status already resolved for the current scroll position. */
  spans: RunSpan[];
  liveSpanId: string | null;
  placements: Placement[];
}

/**
 * The run as the hero renders it: the rail, the counter, the placements
 * arriving one at a time, and the summary line that resolves at the end.
 *
 * Presentational. Scroll position is resolved by the parent, which keeps this
 * component free of the pinning machinery and re-rendering only when a
 * discrete step actually changes.
 */
export function ReplayDemo({
  run,
  spans,
  liveSpanId,
  placements,
}: ReplayDemoProps) {
  const summary = runSummary(run);
  // A tail, not a list: the window stays a fixed height so the hero fits the
  // viewport and the pin can actually hold.
  const tail = placements.slice(-TAIL);

  return (
    <div className="ct-runbody">
      <div className="ct-runbody__rail">
        <WaterfallRail
          spans={spans}
          totalDurationMs={run.totalDurationMs}
          progress="inherit"
          variant="full"
          liveSpanId={liveSpanId}
          label="Pipeline run, stage 1 then stage 2"
        />
      </div>

      <div className="ct-runbody__results min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <MonoValue size="title" tone="default" className="tabular-nums sm:text-metric">
              {String(placements.length).padStart(2, "0")}
            </MonoValue>
            <MonoValue size="body-sm" tone="muted">
              / {summary.placementCount} placements
            </MonoValue>
          </div>
          <MonoValue size="eyebrow" tone="muted">
            {run.runId}
          </MonoValue>
        </div>

        <ol className="ct-stream mt-3 min-h-[216px]">
          {tail.map((p) => (
            <li key={p.id} className="ct-stream__row">
              <span className="min-w-0 flex-1 truncate text-body text-slate-200">
                {p.publisher}
                <MonoValue size="body-sm" tone="muted" className="ml-2">
                  {p.name}
                </MonoValue>
              </span>
              <MonoValue size="body-sm" tone="stage-2" className="shrink-0">
                {formatCpmRange(p.cpmLow, p.cpmHigh)}
              </MonoValue>
              <MonoValue size="body-sm" tone="muted" className="w-10 shrink-0 text-right">
                {formatScore(p.fitScore)}
              </MonoValue>
            </li>
          ))}
        </ol>

        {/* The line people screenshot. Resolves as the run closes. */}
        <p className="ct-summary mt-4 border-t border-border pt-4 text-body-lg text-slate-100">
          <MonoValue size="body-lg" tone="default">
            {summary.placementCount}
          </MonoValue>{" "}
          placements ·{" "}
          <MonoValue size="body-lg" tone="stage-2">
            {formatCpmRange(summary.cpmLow, summary.cpmHigh)}
          </MonoValue>{" "}
          CPM ·{" "}
          <MonoValue size="body-lg" tone="default">
            {summary.platformsSearched}
          </MonoValue>{" "}
          platforms searched ·{" "}
          <MonoValue size="body-lg" tone="default">
            {formatDuration(summary.totalDurationMs)}
          </MonoValue>
        </p>
      </div>
    </div>
  );
}
