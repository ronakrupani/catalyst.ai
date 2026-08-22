"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DemoRun, RunSpan } from "@/lib/types";
import { runStateAt } from "@/lib/replay";
import { useActProgress } from "@/lib/scroll";
import { WaterfallRail } from "@/components/primitives/WaterfallRail";

/**
 * Which element currently owns the single permitted glow.
 *
 * Act 1 the hero rail holds it; once the hero pin is behind us the docked
 * rail takes it; the still section claims it while on screen; at the foot of
 * the document it moves onto the done pill. Exactly one, at every scroll
 * position.
 */
export type GlowOwner = "hero" | "docked" | "still" | "done";

interface RunContextValue {
  run: DemoRun;
  glowOwner: GlowOwner;
  /** Hero reports when its pinned act has finished and scrolled away. */
  setHeroDone: (done: boolean) => void;
  setDocComplete: (complete: boolean) => void;
  /** Act 4 claims the glow while it is on screen; the rail yields. */
  setStillActive: (active: boolean) => void;
  highlightedSpanId: string | null;
  setHighlightedSpanId: (id: string | null) => void;
  highlightedPlacementId: string | null;
  setHighlightedPlacementId: (id: string | null) => void;
  selectedSpanId: string | null;
  setSelectedSpanId: (id: string | null) => void;
}

const RunContext = createContext<RunContextValue | null>(null);

export function useRun(): RunContextValue {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used inside <RunProvider>");
  return ctx;
}

export function RunProvider({ run, children }: { run: DemoRun; children: ReactNode }) {
  // Defaults describe the finished document: with JavaScript off, or before
  // hydration, the run reads as complete and every section is resolved.
  const [heroDone, setHeroDone] = useState(false);
  const [docComplete, setDocComplete] = useState(true);
  const [stillActive, setStillActive] = useState(false);
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | null>(null);
  const [highlightedPlacementId, setHighlightedPlacementId] = useState<string | null>(null);
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);

  // Order matters: at the foot of the document the run has finished, so the
  // done pill takes the glow even though Act 4 may still be on screen.
  const glowOwner: GlowOwner = !heroDone
    ? "hero"
    : docComplete
      ? "done"
      : stillActive
        ? "still"
        : "docked";

  const value = useMemo(
    () => ({
      run,
      glowOwner,
      setHeroDone,
      setDocComplete,
      setStillActive,
      highlightedSpanId,
      setHighlightedSpanId,
      highlightedPlacementId,
      setHighlightedPlacementId,
      selectedSpanId,
      setSelectedSpanId,
    }),
    [run, glowOwner, highlightedSpanId, highlightedPlacementId, selectedSpanId],
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

interface DockState {
  /** Index of the span at the scroll head, or -1 when none is open. */
  spanIndex: number;
  /** Progress at the moment that span opened — enough to derive every status. */
  progress: number;
}

/**
 * Everything after the hero. Measuring this one container gives the docked
 * rail its fill: the page's scroll position mapped onto run time, so the
 * spine doubles as the progress indicator for the rest of the document.
 *
 * Only two pieces of React state change here across the whole scroll — the
 * span at the head and whether the document has bottomed out. The continuous
 * fill rides on a CSS variable this container writes, inherited by the rail.
 */
export function PostHeroRegion({ children }: { children: ReactNode }) {
  const {
    run,
    glowOwner,
    setDocComplete,
    highlightedSpanId,
  } = useRun();

  const regionRef = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState<DockState>({ spanIndex: -1, progress: 1 });
  const lastIndex = useRef(-1);
  const lastComplete = useRef(true);

  const handleProgress = useCallback(
    (p: number) => {
      const t = p * run.totalDurationMs;
      let idx = -1;
      for (let i = 0; i < run.spans.length; i++) {
        const s = run.spans[i];
        if (s.status === "cached") continue;
        if (t >= s.startMs && t < s.startMs + s.durationMs) {
          idx = i;
          break;
        }
      }
      if (idx !== lastIndex.current) {
        lastIndex.current = idx;
        setDock({ spanIndex: idx, progress: p });
      }
      const complete = p >= 0.995;
      if (complete !== lastComplete.current) {
        lastComplete.current = complete;
        setDocComplete(complete);
      }
    },
    [run, setDocComplete],
  );

  useActProgress(regionRef, { onProgress: handleProgress });

  const spans: RunSpan[] = useMemo(
    () => runStateAt(run, dock.progress).spans,
    [run, dock.progress],
  );

  const liveSpanId =
    glowOwner === "docked" && dock.spanIndex >= 0 ? run.spans[dock.spanIndex].id : null;

  return (
    <div ref={regionRef} className="relative">
      <div className="sticky top-14 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="ct-wrap py-2">
          <WaterfallRail
            spans={spans}
            totalDurationMs={run.totalDurationMs}
            variant="compact"
            progress="inherit"
            liveSpanId={liveSpanId}
            highlightedSpanId={highlightedSpanId}
            label="Run timeline, also the page scroll indicator"
          />
        </div>
      </div>
      {children}
    </div>
  );
}
