"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DemoRun } from "@/lib/types";
import { cpmBounds } from "@/lib/replay";
import {
  formatAgeRange,
  formatDailyBudget,
  formatDuration,
  formatImpressionsPerDayRange,
} from "@/lib/format";
import { useActProgress } from "@/lib/scroll";
import { ChannelRow } from "@/components/primitives/ChannelRow";
import { MonoValue } from "@/components/primitives/MonoValue";
import { PlacementCard } from "@/components/primitives/PlacementCard";
import { StageCard } from "@/components/primitives/StageCard";

/**
 * Where the channel reveal finishes. The amber panel starts arriving at 0.22
 * (see `--wipe-raw` in globals.css), so the two halves overlap rather than
 * handing off with a beat of nothing in between.
 */
const CHANNELS_END = 0.4;

/** Placements shown in the amber panel. The rest are listed in Acts 1 and 3. */
const CARDS_SHOWN = 6;

/**
 * Act 2. Violet left, amber right, split by the rail device.
 *
 * The channel rows resolve in rank order against scroll, then the stage
 * boundary — the same one the docked rail shows — walks right across the amber
 * panel while the placements cascade in behind it, in rank order. Every step
 * is a pure function of the eased scroll progress, so scrolling up rewinds it
 * exactly. Under 768px this stacks and does not pin, with the colour
 * assignment preserved.
 */
export function StageSplit({ run }: { run: DemoRun }) {
  const pinRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(run.profile.channels.length);
  const lastRevealed = useRef(-1);

  const handleProgress = useCallback(
    (p: number) => {
      const ratio = p >= CHANNELS_END ? 1 : p / CHANNELS_END;
      const next = Math.min(
        run.profile.channels.length,
        Math.ceil(ratio * run.profile.channels.length),
      );
      if (next !== lastRevealed.current) {
        lastRevealed.current = next;
        setRevealed(next);
      }
    },
    [run.profile.channels.length],
  );

  useActProgress(pinRef, { onProgress: handleProgress });

  const { min, max } = useMemo(() => cpmBounds(run.placements), [run.placements]);

  const stage1Ms = useMemo(
    () =>
      run.spans
        .filter((s) => s.stage === 1)
        .reduce((total, s) => total + s.durationMs, 0),
    [run.spans],
  );
  const stage2Ms = useMemo(
    () =>
      run.spans
        .filter((s) => s.stage === 2)
        .reduce((total, s) => total + s.durationMs, 0),
    [run.spans],
  );

  const topPlacements = useMemo(
    () => [...run.placements].sort((a, b) => b.fitScore - a.fitScore).slice(0, CARDS_SHOWN),
    [run.placements],
  );

  // The two ends of the price range, so the day-of-spend example brackets
  // the whole result set rather than quoting one placement.
  const [cheapest, dearest] = useMemo(() => {
    const byCpm = [...run.placements].sort((a, b) => a.cpmLow - b.cpmLow);
    return [byCpm[0], byCpm[byCpm.length - 1]];
  }, [run.placements]);

  const { profile } = run;

  return (
    <section
      data-pin="act2"
      ref={pinRef}
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
    >
      <div data-pin-inner>
        <div className="ct-wrap py-6">
          <h2 id="how-it-works-heading" className="ct-display text-headline text-slate-100">
            Two agents, in a line
          </h2>

          <div className="ct-split mt-4">
            {/* ---- Stage 1, violet. Holds while the channels resolve. ---- */}
            <div className="ct-split__panel">
              <StageCard
                stage={1}
                title="stage 1 / business understanding"
                status="done"
                elapsedMs={stage1Ms}
              >
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 pb-4">
                  <div className="col-span-2">
                    <div className="ct-eyebrow">segment</div>
                    <div className="mt-1 text-body-sm text-slate-200">{profile.segment}</div>
                  </div>
                  <div>
                    <div className="ct-eyebrow">age range</div>
                    <MonoValue size="body-sm" tone="secondary" className="mt-1 block">
                      {formatAgeRange(profile.ageRange)}
                    </MonoValue>
                  </div>
                  <div>
                    <div className="ct-eyebrow">geos</div>
                    <MonoValue size="body-sm" tone="secondary" className="mt-1 block">
                      {profile.geos.join(" · ")}
                    </MonoValue>
                  </div>
                  <div className="col-span-2">
                    <div className="ct-eyebrow">interests</div>
                    <div className="mt-1 line-clamp-2 text-body-sm text-slate-300">
                      {profile.interests.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="ct-eyebrow">ranked channels</div>
                  <ol className="mt-2">
                    {profile.channels.slice(0, revealed).map((channel) => (
                      <ChannelRow key={channel.platform} channel={channel} />
                    ))}
                  </ol>
                </div>
              </StageCard>

              <p className="mt-3 text-body-sm leading-relaxed text-slate-300">
                No network calls yet. Stage 1 reasons about the business and
                commits to a ranked list, so the scrape that follows has
                something to be measured against.
              </p>
            </div>

            {/* ---- Stage 2, amber. Cascades in behind the travelling boundary. ---- */}
            <div className="ct-split__panel ct-split__panel--wipe">
              <div className="ct-split__wipe-content">
                <StageCard
                  stage={2}
                  title="stage 2 / inventory discovery"
                  status="done"
                  elapsedMs={stage2Ms}
                >
                  <div>
                    {topPlacements.map((placement, i) => (
                      <div
                        key={placement.id}
                        className="ct-split__row"
                        style={{ "--i": String(i) } as React.CSSProperties}
                      >
                        <PlacementCard
                          placement={placement}
                          cpmMin={min}
                          cpmMax={max}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                  <p
                    className="ct-split__row mt-3 text-body-sm text-slate-400"
                    style={{ "--i": String(CARDS_SHOWN) } as React.CSSProperties}
                  >
                    <MonoValue size="body-sm" tone="muted">
                      {CARDS_SHOWN}
                    </MonoValue>{" "}
                    of{" "}
                    <MonoValue size="body-sm" tone="muted">
                      {run.placements.length}
                    </MonoValue>{" "}
                    shown, ranked by fit. The full set is listed above and traced
                    below.
                  </p>
                </StageCard>

                <div
                  className="ct-split__row mt-3"
                  style={{ "--i": String(CARDS_SHOWN + 1) } as React.CSSProperties}
                >
                  {/* CPM is a unit nobody budgets in. The same number, said
                      as a day of spend on the cheapest and dearest of these. */}
                  <div className="rounded-md border border-border bg-ink-100 p-3">
                    <div className="ct-eyebrow">what that costs to run</div>
                    <p className="mt-1.5 text-body-sm leading-relaxed text-slate-200">
                      <MonoValue size="body" tone="stage-2">
                        {formatDailyBudget()}
                      </MonoValue>{" "}
                      buys{" "}
                      <MonoValue size="body-sm" tone="secondary">
                        {formatImpressionsPerDayRange(cheapest.cpmLow, cheapest.cpmHigh)}
                      </MonoValue>{" "}
                      impressions a day on {cheapest.publisher}, or{" "}
                      <MonoValue size="body-sm" tone="secondary">
                        {formatImpressionsPerDayRange(dearest.cpmLow, dearest.cpmHigh)}
                      </MonoValue>{" "}
                      on {dearest.publisher}. Same budget, different shelf.
                    </p>
                  </div>

                  <p className="mt-3 text-body-sm leading-relaxed text-slate-300">
                    Stage 2 leaves the model behind and goes to the ad platforms
                    themselves. Every price here came off a real inventory
                    response in{" "}
                    <MonoValue size="body" tone="stage-2">
                      {formatDuration(stage2Ms)}
                    </MonoValue>
                    , not from an estimate.
                  </p>
                </div>
              </div>

              <span className="ct-split__front" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
