"use client";

import { useEffect, useMemo, useRef } from "react";
import type { DemoRun, Placement } from "@/lib/types";
import { cpmBounds } from "@/lib/replay";
import { PlacementCard } from "@/components/primitives/PlacementCard";
import { useRun } from "./RunProvider";

/**
 * Act 4. Deliberately still.
 *
 * After three acts of motion, stillness is the emphasis — nothing here
 * animates on scroll. The live card holds the page's single glow while the
 * section is on screen; the docked rail yields it.
 */
export function CachedVsLive({ run }: { run: DemoRun }) {
  const { glowOwner, setStillActive } = useRun();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStillActive(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setStillActive(false);
    };
  }, [setStillActive]);

  const { min, max } = useMemo(() => cpmBounds(run.placements), [run.placements]);

  // The same placement in both states, so the only difference on screen is
  // how catalyst draws provenance.
  const live: Placement = useMemo(
    () => ({ ...run.placements[0], sourceBadge: "live", cachedAtMs: undefined }),
    [run.placements],
  );
  const cached: Placement = useMemo(
    () => ({
      ...run.placements[0],
      id: `${run.placements[0].id}_cached`,
      sourceBadge: "cached",
      cachedAtMs: run.placements.find((p) => p.cachedAtMs)?.cachedAtMs,
    }),
    [run.placements],
  );

  return (
    <section
      ref={ref}
      aria-labelledby="cached-vs-live-heading"
      className="ct-wrap py-16"
    >
      <h2 id="cached-vs-live-heading" className="ct-display text-headline text-slate-100">
        catalyst never dresses cached data as live
      </h2>
      <p className="mt-3 max-w-2xl text-body-lg leading-relaxed text-slate-300">
        The same placement, drawn twice. Amber and glowing means the scrape
        touched the platform just now. Slate and dashed means it did not, and
        the cache timestamp says when it last did.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <div className="ct-eyebrow">live</div>
          <div className="mt-2">
            <PlacementCard
              placement={live}
              cpmMin={min}
              cpmMax={max}
              glow={glowOwner === "still"}
            />
          </div>
        </div>

        <div>
          <div className="ct-eyebrow">cached</div>
          <div className="mt-2">
            <PlacementCard placement={cached} cpmMin={min} cpmMax={max} />
          </div>
        </div>
      </div>
    </section>
  );
}
