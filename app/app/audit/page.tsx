"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useCampaigns, useEvents, useHydrated } from "@/lib/useStore";
import { formatTimestamp } from "@/lib/format";
import { MonoValue } from "@/components/primitives/MonoValue";
import { Button } from "@/components/ui/button";

/** Port event stream across every campaign. Newest first. */
export default function AuditPage() {
  const hydrated = useHydrated();
  const events = useEvents();
  const campaigns = useCampaigns();
  const [copied, setCopied] = useState<string | null>(null);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) map.set(c.id, c.brief.product_name);
    return map;
  }, [campaigns]);

  const copy = useCallback(async (entityId: string) => {
    try {
      await navigator.clipboard.writeText(entityId);
      setCopied(entityId);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable; the id stays selectable.
    }
  }, []);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1120px] px-8 py-12">
        <div className="ct-skeleton h-8 w-40 rounded-sm" />
        <div className="mt-6 flex flex-col gap-px">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ct-skeleton h-12 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="mx-auto max-w-[1120px] px-8 py-16">
        <h1 className="ct-display text-headline text-slate-100">Nothing has run yet.</h1>
        <p className="mt-3 text-body-lg text-slate-300">
          Every step Catalyst takes lands here, with the entity it wrote to Port.
        </p>
        <Button asChild className="mt-6">
          <Link href="/app">New campaign</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-8 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="ct-display text-headline text-slate-100">Audit</h1>
        <MonoValue size="eyebrow" tone="muted">
          {events.length} events
        </MonoValue>
      </div>
      <p className="mt-3 max-w-2xl text-body-lg text-slate-300">
        Every step across every campaign, as it was written to Port.
      </p>

      <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)_minmax(0,10rem)_auto_auto] items-baseline gap-x-5">
        <div className="ct-eyebrow border-b border-border pb-2">time</div>
        <div className="ct-eyebrow border-b border-border pb-2">event</div>
        <div className="ct-eyebrow border-b border-border pb-2">campaign</div>
        <div className="ct-eyebrow border-b border-border pb-2">entity</div>
        <div className="ct-eyebrow border-b border-border pb-2">port</div>

        {events.map((e) => (
          <div key={e.id} className="contents">
            <MonoValue size="body-sm" tone="muted" className="border-t border-border py-3">
              {formatTimestamp(e.tsMs)}
            </MonoValue>
            {/* Raw machine value, exactly as emitted. */}
            <MonoValue
              size="body-sm"
              tone={e.type.startsWith("stage2") ? "stage-2" : "stage-1"}
              className="truncate border-t border-border py-3"
            >
              {e.type}
            </MonoValue>
            <span className="truncate border-t border-border py-3 text-body-sm text-slate-300">
              {nameById.get(e.campaignId) ?? e.campaignId}
            </span>
            <span className="border-t border-border py-2">
              <button
                type="button"
                onClick={() => copy(e.entityId)}
                aria-label={`Copy entity id ${e.entityId}`}
                className="ct-num rounded-xs px-1 py-1 text-body-sm text-slate-200 transition-colors duration-[120ms] ease-ct hover:bg-ink-300"
              >
                {copied === e.entityId ? "Copied" : e.entityId}
              </button>
            </span>
            <a
              href={e.portUrl}
              className="border-t border-border py-3 text-body-sm text-slate-400 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
              aria-label={`Open ${e.entityId} in Port`}
            >
              Port ↗
            </a>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? `${copied} copied to clipboard` : ""}
      </p>
    </div>
  );
}
