"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MonoValue } from "@/components/primitives/MonoValue";
import { CpmRangeBar, ConfidenceBar } from "@/components/primitives/CpmRangeBar";
import { CampaignHeader } from "@/components/dashboard/CampaignHeader";
import { useCampaign } from "@/components/dashboard/CampaignProvider";
import { cpmScale, type MatchedChannel } from "@/lib/campaign";
import { formatCpm, formatDuration, formatScore } from "@/lib/format";
import {
  CHANNEL_ARRIVAL_MS,
  RESEARCH_STEPS,
  RESEARCH_STEP_MS,
  advance,
  saveChannelSelection,
} from "@/lib/api";
import { usePrefersReducedMotion } from "@/lib/scroll";

export default function ResearchPage() {
  const { campaign } = useCampaign();
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  const all = useMemo(() => campaign.research?.channels ?? [], [campaign.research]);
  const [stepsDone, setStepsDone] = useState(0);
  const [arrived, setArrived] = useState(0);
  const [channels, setChannels] = useState<MatchedChannel[]>(all);

  // Auto-runs on load. No mount guard: the cleanup below cancels every timer,
  // so a double-invoked effect re-arms them rather than being skipped.
  useEffect(() => {
    // Reduced motion resolves the run without timers; the derived values below
    // stand in, so nothing is set from inside this effect.
    if (reduced) return;

    const timers: number[] = [];
    let elapsed = 0;
    RESEARCH_STEP_MS.forEach((ms, i) => {
      elapsed += ms;
      timers.push(window.setTimeout(() => setStepsDone(i + 1), elapsed));
    });
    for (let i = 0; i < all.length; i++) {
      timers.push(
        window.setTimeout(() => setArrived(i + 1), elapsed + (i + 1) * CHANNEL_ARRIVAL_MS),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [all.length, reduced]);

  // Reduced motion shows the finished run rather than an empty one.
  const shownSteps = reduced ? RESEARCH_STEPS.length : stepsDone;
  const shownArrived = reduced ? all.length : arrived;

  const running = shownSteps < RESEARCH_STEPS.length;
  const complete = !running && shownArrived >= all.length;
  const visible = channels.slice(0, shownArrived);
  const { min, max } = cpmScale(all);
  const included = channels.filter((c) => c.included);
  const research = campaign.research;

  function toggle(rank: number) {
    const next = channels.map((c) => (c.rank === rank ? { ...c, included: !c.included } : c));
    setChannels(next);
    saveChannelSelection(campaign.id, next);
  }

  function next() {
    saveChannelSelection(campaign.id, channels);
    advance(campaign.id, "READY_FOR_CREATIVE");
    router.push(`/app/campaigns/${campaign.id}/creative`);
  }

  if (!research || all.length === 0) {
    return (
      <>
        <CampaignHeader campaign={campaign} />
        <div className="mx-auto max-w-[1120px] px-8 py-12">
          <h1 className="ct-display text-headline text-slate-100">Where your audience is</h1>
          <p className="mt-3 max-w-xl text-body-lg text-slate-300">
            No channels scored above the threshold. Try a broader audience description.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <CampaignHeader
        campaign={campaign}
        researchSpans={RESEARCH_STEPS.map((label, i) => ({ label, done: i < shownSteps }))}
        failedStep={research.failedPlatform && complete ? undefined : undefined}
      />

      <div className="mx-auto max-w-[1120px] px-8 py-10">
        <h1 className="ct-display text-headline text-slate-100">
          {running ? "Finding where your audience is" : "Where your audience is"}
        </h1>

        {/* Steps stream in and check off. */}
        <ul className="mt-6 flex flex-col gap-3">
          {RESEARCH_STEPS.map((label, i) => {
            const done = i < shownSteps;
            const current = i === shownSteps;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex size-5 items-center justify-center rounded-full border ${
                    done
                      ? "border-green-dim bg-green-wash text-green-bright"
                      : current
                        ? "border-violet-dim bg-violet-wash"
                        : "border-ink-500"
                  }`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="ct-check-in size-3" aria-hidden="true">
                      <path
                        d="M2.5 6.2 4.8 8.5 9.5 3.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={done || current ? "text-body text-slate-200" : "text-body text-slate-400"}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Partial: results still render, and the banner names the platform. */}
        {complete && research.failedPlatform && (
          <p className="mt-6 rounded-sm border border-red-dim bg-red-wash px-4 py-3 text-body text-red-bright">
            {research.failedPlatform} returned no inventory. The channels below are complete
            without it.
          </p>
        )}

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <MonoValue size="title" tone="default">
            {shownArrived} channels matched
          </MonoValue>
          {research.cacheAgeMinutes !== undefined && complete && (
            <span className="ct-cached ct-num rounded-full px-2 py-0.5 text-label leading-none">
              cached
            </span>
          )}
        </div>

        <ul className="mt-3">
          {visible.map((c, i) => (
            <li
              key={c.platform}
              className={reduced ? "" : "ct-row-enter"}
              style={reduced ? undefined : { animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div className="flex items-start gap-3 border-t border-border py-3">
                <Checkbox
                  checked={c.included}
                  onChange={() => toggle(c.rank)}
                  aria-label={`Include ${c.platform}`}
                />
                <MonoValue size="title" tone="muted" className="w-8 shrink-0 pt-2">
                  {c.rank}
                </MonoValue>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="text-body font-medium text-slate-100">{c.platform}</div>
                  <p className="mt-0.5 line-clamp-2 text-body-sm text-slate-300">{c.rationale}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-3">
                  <ConfidenceBar value={c.confidence} />
                  <MonoValue size="body-sm" tone="secondary">
                    {formatScore(c.confidence)}
                  </MonoValue>
                </div>
                <div className="w-[136px] shrink-0 pt-2">
                  <MonoValue size="body-sm" tone="stage-2" className="block text-right">
                    {formatCpm(c.cpmLow)}–{formatCpm(c.cpmHigh)}
                  </MonoValue>
                  <div className="mt-1.5">
                    <CpmRangeBar low={c.cpmLow} high={c.cpmHigh} min={min} max={max} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {complete && (
          <div
            className={`mt-8 rounded-md px-5 py-4 ${
              research.cacheAgeMinutes !== undefined
                ? "border border-dashed border-ink-500"
                : "ct-elev-2"
            }`}
          >
            <MonoValue size="metric" tone="default">
              {included.length}
            </MonoValue>{" "}
            <span className="text-body text-slate-300">channels, CPM</span>{" "}
            <MonoValue size="body-lg" tone="stage-2">
              {formatCpm(min)} to {formatCpm(max)}
            </MonoValue>
            <span className="text-body text-slate-300">, </span>
            <MonoValue size="body-lg" tone="default">
              {research.platformsSearched}
            </MonoValue>{" "}
            <span className="text-body text-slate-300">platforms, </span>
            <MonoValue size="body-lg" tone="default">
              {formatDuration(research.elapsedMs)}
            </MonoValue>
            {research.cacheAgeMinutes !== undefined && (
              <p className="mt-2 text-body-sm text-slate-300">
                Rate cards from cache, pulled{" "}
                <MonoValue size="body-sm" tone="muted">
                  {research.cacheAgeMinutes}
                </MonoValue>{" "}
                min ago.
              </p>
            )}
          </div>
        )}

        {complete && (
          <Button className="mt-8" onClick={next} disabled={included.length === 0}>
            Add creative
          </Button>
        )}
      </div>
    </>
  );
}
