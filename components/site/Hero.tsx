"use client";

import { useCallback, useRef, useState } from "react";
import type { DemoRun } from "@/lib/types";
import { runStateAt, runSummary } from "@/lib/replay";
import { formatCpmRange, formatDuration } from "@/lib/format";
import { usePrefersReducedMotion, useActProgress } from "@/lib/scroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MonoValue } from "@/components/primitives/MonoValue";
import { ReplayDemo } from "./ReplayDemo";
import { useRun } from "./RunProvider";

/** The description this run was actually recorded against. */
const RECORDED_DESCRIPTION = "I sell energy drinks to esports gamers.";

/** Real verticals, not lorem. Chip labels stay sentence case. */
const EXAMPLES = [
  { chip: "Coffee roastery", text: "I run an independent coffee roastery shipping nationwide." },
  { chip: "Restaurant payroll", text: "We sell payroll software to independent restaurants." },
  { chip: "PT clinic", text: "I own a physical therapy clinic in Austin." },
];

interface Act1State {
  spanIndex: number;
  placementCount: number;
  progress: number;
}

/**
 * Act 1. The hero is the run.
 *
 * Scroll progress across the pin maps directly onto run time, so scrolling
 * down opens spans left to right and scrolling up rewinds exactly. The
 * continuous part rides on the `--p` custom property this container writes,
 * inherited by the rail; React state changes only when a span opens or a
 * placement lands — about two dozen times across 220vh.
 */
export function Hero({ run }: { run: DemoRun }) {
  const { setHeroDone, glowOwner } = useRun();
  const pinRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const [description, setDescription] = useState(RECORDED_DESCRIPTION);
  const [act, setAct] = useState<Act1State>({
    spanIndex: -1,
    placementCount: run.placements.length,
    progress: 1,
  });

  const last = useRef({ spanIndex: -2, placementCount: -1, heroDone: false });

  const handleProgress = useCallback(
    (p: number) => {
      const state = runStateAt(run, p);
      const spanIndex = state.liveSpanId
        ? run.spans.findIndex((s) => s.id === state.liveSpanId)
        : -1;
      const placementCount = state.placements.length;

      if (
        spanIndex !== last.current.spanIndex ||
        placementCount !== last.current.placementCount
      ) {
        last.current.spanIndex = spanIndex;
        last.current.placementCount = placementCount;
        setAct({ spanIndex, placementCount, progress: p });
      }

      const done = p >= 0.995;
      if (done !== last.current.heroDone) {
        last.current.heroDone = done;
        setHeroDone(done);
      }
    },
    [run, setHeroDone],
  );

  useActProgress(pinRef, { onProgress: handleProgress });

  const state = runStateAt(run, act.progress);
  const liveSpanId = glowOwner === "hero" ? state.liveSpanId : null;
  const summary = runSummary(run);
  const swapped = description.trim() !== RECORDED_DESCRIPTION;

  /** Runs the pipeline by scrolling through the act. Native behaviour only. */
  const findPlacements = useCallback(() => {
    const el = pinRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const travel = Math.max(0, rect.height - window.innerHeight);
    window.scrollTo({
      top: top + travel,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [reduced]);

  return (
    <section data-pin="act1" ref={pinRef} id="main" aria-label="Live pipeline run">
      <div data-pin-inner>
        <div className="ct-wrap py-3 sm:py-6">
          <p className="ct-eyebrow">two agents · one line</p>

          <h1 className="ct-display mt-2 text-[1.75rem] leading-[1.1] text-slate-100 sm:mt-3 sm:text-hero">
            Find where your audience actually is
          </h1>

          <p className="mt-3 max-w-2xl text-body leading-relaxed text-slate-300 sm:mt-4 sm:text-body-lg">
            Stage 1 reads your business and ranks channels. Stage 2 goes out to
            live ad platforms and comes back with{" "}
            <MonoValue size="body-lg" tone="default">
              {summary.placementCount}
            </MonoValue>{" "}
            placements at{" "}
            <MonoValue size="body-lg" tone="stage-2">
              {formatCpmRange(summary.cpmLow, summary.cpmHigh)}
            </MonoValue>{" "}
            CPM, in{" "}
            <MonoValue size="body-lg" tone="default">
              {formatDuration(summary.totalDurationMs)}
            </MonoValue>
            .
          </p>

          <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
            <div className="min-w-0">
              <label
                htmlFor="business-description"
                className="ct-eyebrow block"
              >
                your business
              </label>
              <Textarea
                id="business-description"
                className="mt-2 min-h-[76px] sm:min-h-[132px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={RECORDED_DESCRIPTION}
                aria-describedby="business-description-help"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.chip}
                    type="button"
                    onClick={() => setDescription(example.text)}
                    className="rounded-full bg-ink-200 px-3 py-1.5 text-label text-slate-300 transition-colors duration-[120ms] ease-ct hover:bg-ink-300 hover:text-slate-100 sm:py-2"
                  >
                    {example.chip}
                  </button>
                ))}
              </div>

              <Button className="mt-4 w-full sm:w-auto" onClick={findPlacements}>
                Find placements
              </Button>

              <p id="business-description-help" className="mt-3 hidden text-body-sm text-slate-400 sm:block">
                {swapped ? (
                  <>
                    This page replays one recorded run, against{" "}
                    <MonoValue size="body-sm" tone="muted">
                      {RECORDED_DESCRIPTION}
                    </MonoValue>{" "}
                    Launch the app to run yours.
                  </>
                ) : (
                  <>
                    Recorded run{" "}
                    <MonoValue size="body-sm" tone="muted">
                      {run.runId}
                    </MonoValue>
                    . Scroll to replay it, or scroll back to rewind.
                  </>
                )}
              </p>
            </div>

            <ReplayDemo
              run={run}
              spans={state.spans}
              liveSpanId={liveSpanId}
              placements={state.placements}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
