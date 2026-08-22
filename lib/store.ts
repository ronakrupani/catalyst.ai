"use client";

import type { Campaign, CampaignAuditEvent } from "./campaign";
import raw from "@/fixtures/campaigns.json";

/**
 * Client-side campaign store. The backend is stubbed, so fixtures seed the
 * store and anything created during a session is mirrored to localStorage —
 * that is state persistence so a refresh lands where the user was, not
 * ownership. There is no user, no guest id, and the list shows everything.
 */

const KEY = "catalyst.campaigns.v1";

interface Snapshot {
  campaigns: Campaign[];
  events: CampaignAuditEvent[];
}

interface StoredOverlay extends Snapshot {
  /** Identifies the fixture set the overlay was written against. */
  seedVersion: string;
}

const seed = raw as unknown as Snapshot;

/**
 * Changes whenever the shipped fixtures change. An overlay written against an
 * older set is discarded rather than shadowing the new one — without this, the
 * first session to write to storage would pin that browser to a fixture set
 * forever and no future deploy could ever be seen.
 */
const SEED_VERSION = seed.campaigns
  .map((c) => c.id)
  .sort()
  .join("|");

function readOverlay(): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredOverlay>;
    if (parsed.seedVersion !== SEED_VERSION) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return { campaigns: parsed.campaigns ?? [], events: parsed.events ?? [] };
  } catch {
    return null;
  }
}

function writeOverlay(snapshot: Snapshot) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredOverlay = { ...snapshot, seedVersion: SEED_VERSION };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Storage unavailable; the session still works, it just will not survive.
  }
}

let memory: Snapshot | null = null;
const listeners = new Set<() => void>();

function load(): Snapshot {
  if (memory) return memory;
  const overlay = readOverlay();
  memory = overlay ?? { campaigns: [...seed.campaigns], events: [...seed.events] };
  return memory;
}

/**
 * A new object identity per mutation, stable in between, so
 * useSyncExternalStore can compare snapshots without looping.
 */
function commit() {
  if (!memory) return;
  memory = { campaigns: [...memory.campaigns], events: [...memory.events] };
  writeOverlay(memory);
  listeners.forEach((fn) => fn());
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getSnapshot(): Snapshot {
  return load();
}

/** The server has no localStorage, so it sees the shipped fixtures. */
export function getServerSnapshot(): Snapshot {
  return seed;
}

/** Newest first. */
export function listCampaigns(): Campaign[] {
  return [...load().campaigns].sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function getCampaign(id: string): Campaign | undefined {
  return load().campaigns.find((c) => c.id === id);
}

export function putCampaign(next: Campaign) {
  const snapshot = load();
  const i = snapshot.campaigns.findIndex((c) => c.id === next.id);
  if (i >= 0) snapshot.campaigns[i] = next;
  else snapshot.campaigns.push(next);
  commit();
}

export function listEvents(campaignId?: string): CampaignAuditEvent[] {
  const all = load().events;
  const scoped = campaignId ? all.filter((e) => e.campaignId === campaignId) : all;
  return [...scoped].sort((a, b) => b.tsMs - a.tsMs);
}

export function appendEvent(event: CampaignAuditEvent) {
  load().events.push(event);
  commit();
}

/** Drops the overlay and returns to the shipped fixtures. */
export function resetStore() {
  memory = null;
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  listeners.forEach((fn) => fn());
}
