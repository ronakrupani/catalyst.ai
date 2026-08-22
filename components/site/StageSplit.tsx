"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DemoRun } from "@/lib/types";
import { cpmBounds } from "@/lib/replay";
import { formatAgeRange, formatDuration } from "@/lib/format";
import { useActProgress } from "@/lib/scroll";
import { ChannelRow } from "@/components/primitives/ChannelRow";
import { MonoValue } from "@/components/primitives/MonoValue";
import { PlacementCard } from "@/components/primitives/PlacementCard";
import { StageCard } from "@/components/primitives/StageCard";

/** Where the channel reveal ends and the amber wipe begins. */
const WIPE_START = 0.45;

/** Placements shown in the amber panel. The rest are listed in Acts 1 and 3. */
const CARDS_SHOWN = 6;

/**
 * Act 2. Violet left, amber right, split by the rail device.
 *
 * The channel rows resolve in rank order against scroll, then the divider —
 * the same stage boundary the docked rail shows — travels right and the amber
 * panel wipes in behind it. Under 768px this stacks and does not pin, with the
 * colour assignment preserved.
 */
export function StageSplit({ run }: { run: DemoRun }) {
  const pinRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(run.profile.channels.length);
  const lastRevealed = useRef(-1);

  const handleProgress = useCallback(
    (p: number) => {
      const ratio = p >= WIPE_START ? 1 : p / WIPE_START;
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

            {/* ---- Stage 2, amber. Wipes in behind the travelling divider. ---- */}
            <div className="ct-split__panel ct-split__panel--wipe">
              <div className="ct-split__wipe-content">
                <StageCard
                  stage={2}
                  title="stage 2 / inventory discovery"
                  status="done"
                  elapsedMs={stage2Ms}
                >
                  <div>
                    {topPlacements.map((placement) => (
                      <PlacementCard
                        key={placement.id}
                        placement={placement}
                        cpmMin={min}
                        cpmMax={max}
                        compact
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-body-sm text-slate-400">
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

              <span className="ct-split__veil" aria-hidden="true" />
              <span className="ct-split__divider" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
