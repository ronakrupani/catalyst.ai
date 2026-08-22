/**
 * Shared with the app repo. Every value is numeric or a machine identifier —
 * nothing here is preformatted for display. Formatting happens at render time
 * in lib/format.ts so the product and the marketing site format identically.
 */

export type Stage = 1 | 2;

export type SpanStatus = "pending" | "running" | "done" | "failed" | "cached";

export interface RunSpan {
  /** Machine identifier, e.g. `stage2.inventory_discovery.scrape_openx`. */
  id: string;
  /** Rendered exactly as emitted. Never prettified into title case. */
  name: string;
  stage: Stage;
  /** Offset from run start, milliseconds. */
  startMs: number;
  durationMs: number;
  status: SpanStatus;
}

export interface RankedChannel {
  rank: number;
  platform: string;
  rationale: string;
  /** 0..1. Always rendered with the numeral, never a bar alone. */
  confidence: number;
}

export interface AudienceProfile {
  segment: string;
  ageRange: [number, number];
  geos: string[];
  interests: string[];
  channels: RankedChannel[];
}

/** Display unit `{ w, h }` in pixels, or video `{ seconds }`. */
export type PlacementFormat = { w: number; h: number } | { seconds: number };

export function isVideoFormat(
  format: PlacementFormat,
): format is { seconds: number } {
  return "seconds" in format;
}

export type SourceBadge = "live" | "cached";

export interface Placement {
  id: string;
  publisher: string;
  /** Placement identifier as emitted by the source. */
  name: string;
  platform: string;
  format: PlacementFormat;
  /** Monthly audience, whole people. */
  reachCount: number;
  /** Dollars. */
  cpmLow: number;
  cpmHigh: number;
  /** 0..1. */
  fitScore: number;
  sourceBadge: SourceBadge;
  /** Epoch ms. Required when sourceBadge is "cached". */
  cachedAtMs?: number;
  rationale: string;
  /** Foreign key into RunSpan.id — the span that found this placement. */
  spanId: string;
}

export interface AuditEvent {
  id: string;
  /** Epoch ms. */
  tsMs: number;
  /** Lowercase machine identifier, e.g. `stage2.cache.hit`. */
  type: string;
  /** Port entity id. Copyable on click. */
  entityId: string;
  spanId: string;
  placementId?: string;
  portUrl: string;
}

export interface DemoRun {
  runId: string;
  /** Epoch ms. */
  startedAtMs: number;
  totalDurationMs: number;
  platformsSearched: number;
  spans: RunSpan[];
  profile: AudienceProfile;
  placements: Placement[];
  events: AuditEvent[];
}

export interface ConnectionStatus {
  name: string;
  /** Milliseconds. */
  lastCallMs: number;
  operational: boolean;
}
