"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./store";
import type { Campaign, CampaignAuditEvent } from "./campaign";

/**
 * The campaign store is external and mutable, so it is read through
 * useSyncExternalStore rather than an effect that calls setState. That keeps
 * the server render on the shipped fixtures and swaps to the live store on the
 * client without a tearing window.
 */

/** False during the server render and the hydration pass, true after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function useSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Newest first. */
export function useCampaigns(): Campaign[] {
  const snapshot = useSnapshot();
  return useMemo(
    () => [...snapshot.campaigns].sort((a, b) => b.createdAtMs - a.createdAtMs),
    [snapshot],
  );
}

export function useCampaignById(id: string): Campaign | undefined {
  const snapshot = useSnapshot();
  return useMemo(() => snapshot.campaigns.find((c) => c.id === id), [snapshot, id]);
}

export function useEvents(campaignId?: string): CampaignAuditEvent[] {
  const snapshot = useSnapshot();
  return useMemo(() => {
    const scoped = campaignId
      ? snapshot.events.filter((e) => e.campaignId === campaignId)
      : snapshot.events;
    return [...scoped].sort((a, b) => b.tsMs - a.tsMs);
  }, [snapshot, campaignId]);
}
