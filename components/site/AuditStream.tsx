"use client";

import { useCallback, useMemo, useState } from "react";
import type { DemoRun } from "@/lib/types";
import { formatCpmRange, formatTimestamp } from "@/lib/format";
import { MonoValue } from "@/components/primitives/MonoValue";
import { useRun } from "./RunProvider";

/**
 * Act 3. The differentiator.
 *
 * Newest at top, the way a log reads: scrolling down walks back through the
 * run. Rows reveal on entering the viewport via a native view() timeline, so
 * space is reserved up front and nothing shifts. Not pinned.
 *
 * Hovering a placement highlights the span that produced it on the docked rail
 * above, and the event row that recorded it.
 */
export function AuditStream({ run }: { run: DemoRun }) {
  const {
    highlightedPlacementId,
    setHighlightedPlacementId,
    setHighlightedSpanId,
  } = useRun();
  const [copied, setCopied] = useState<string | null>(null);

  const stageBySpan = useMemo(() => {
    const map = new Map<string, 1 | 2>();
    for (const span of run.spans) map.set(span.id, span.stage);
    return map;
  }, [run.spans]);

  const spanByPlacement = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of run.placements) map.set(p.id, p.spanId);
    return map;
  }, [run.placements]);

  /** Newest first. */
  const events = useMemo(() => [...run.events].reverse(), [run.events]);

  const hover = useCallback(
    (placementId: string | null) => {
      setHighlightedPlacementId(placementId);
      setHighlightedSpanId(placementId ? spanByPlacement.get(placementId) ?? null : null);
    },
    [setHighlightedPlacementId, setHighlightedSpanId, spanByPlacement],
  );

  const copyEntity = useCallback(async (entityId: string) => {
    try {
      await navigator.clipboard.writeText(entityId);
      setCopied(entityId);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable; the id is selectable as text either way.
    }
  }, []);

  return (
    <section
      id="audit-trail"
      aria-labelledby="audit-trail-heading"
      className="ct-wrap py-16"
    >
      <h2 id="audit-trail-heading" className="ct-display text-headline text-slate-100">
        A price you cannot trace is a guess
      </h2>
      <p className="mt-3 max-w-2xl text-body-lg leading-relaxed text-slate-300">
        Every placement above is emitted to Port as an entity, with the span
        that found it attached. Hover a placement to light up the span on the
        rail and the event that recorded it.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* ---- Placements, the hover source ---- */}
        <div className="min-w-0">
          <div className="ct-eyebrow">placements</div>
          <ul className="mt-2">
            {run.placements.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-baseline gap-3 rounded-sm border-t border-border px-2 py-3 text-left transition-colors duration-[120ms] ease-ct hover:bg-ink-200 data-[on]:bg-ink-200"
                  data-on={highlightedPlacementId === p.id || undefined}
                  onMouseEnter={() => hover(p.id)}
                  onMouseLeave={() => hover(null)}
                  onFocus={() => hover(p.id)}
                  onBlur={() => hover(null)}
                >
                  <span className="min-w-0 flex-1 truncate text-body text-slate-200">
                    {p.publisher}
                  </span>
                  <MonoValue size="body-sm" tone="stage-2" className="shrink-0">
                    {formatCpmRange(p.cpmLow, p.cpmHigh)}
                  </MonoValue>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- The Port event stream ---- */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between">
            <div className="ct-eyebrow">port event stream</div>
            <MonoValue size="eyebrow" tone="muted">
              {run.events.length} events
            </MonoValue>
          </div>

          <ol className="ct-log mt-2">
            {events.map((e) => {
              const stage = stageBySpan.get(e.spanId) ?? 1;
              const on =
                highlightedPlacementId !== null && e.placementId === highlightedPlacementId;
              return (
                <li key={e.id} className="ct-log__row" data-on={on || undefined}>
                  <MonoValue size="body-sm" tone="muted" className="shrink-0">
                    {formatTimestamp(e.tsMs)}
                  </MonoValue>

                  <MonoValue
                    size="body-sm"
                    tone={stage === 1 ? "stage-1" : "stage-2"}
                    className="min-w-0 flex-1 truncate"
                  >
                    {e.type}
                  </MonoValue>

                  <button
                    type="button"
                    onClick={() => copyEntity(e.entityId)}
                    className="ct-num min-w-0 shrink truncate rounded-xs px-1 text-body-sm text-slate-200 transition-colors duration-[120ms] ease-ct hover:bg-ink-300"
                    aria-label={`Copy entity id ${e.entityId}`}
                  >
                    {copied === e.entityId ? "copied" : e.entityId}
                  </button>

                  <a
                    href={e.portUrl}
                    className="shrink-0 rounded-xs px-1 text-body-sm text-slate-400 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
                    aria-label={`Open ${e.entityId} in Port`}
                  >
                    Port ↗
                  </a>
                </li>
              );
            })}
          </ol>

          <p aria-live="polite" className="sr-only">
            {copied ? `${copied} copied to clipboard` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
