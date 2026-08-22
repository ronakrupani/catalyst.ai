/** Campaign domain model. Shared by the mock client and every dashboard screen. */

export type CampaignStatus =
  | "READY_FOR_RESEARCH"
  | "READY_FOR_CREATIVE"
  | "READY_FOR_REVIEW"
  | "ACTIVE";

/** Human labels. The machine string renders only in the audit stream and inspector. */
export const STATUS_LABEL: Record<CampaignStatus, string> = {
  READY_FOR_RESEARCH: "Researching",
  READY_FOR_CREATIVE: "Needs creative",
  READY_FOR_REVIEW: "Needs approval",
  ACTIVE: "Live",
};

/** The URL carries the state, so a refresh lands where the user was. */
export function routeForStatus(id: string, status: CampaignStatus): string {
  switch (status) {
    case "READY_FOR_RESEARCH":
      return `/app/campaigns/${id}/research`;
    case "READY_FOR_CREATIVE":
      return `/app/campaigns/${id}/creative`;
    case "READY_FOR_REVIEW":
      return `/app/campaigns/${id}/review`;
    case "ACTIVE":
      return `/app/campaigns/${id}`;
  }
}

export const STEPS = ["intake", "research", "creative", "review"] as const;
export type StepName = (typeof STEPS)[number];

/** Which stepper segment a status sits on. Intake is always behind us. */
export function stepIndexForStatus(status: CampaignStatus): number {
  switch (status) {
    case "READY_FOR_RESEARCH":
      return 1;
    case "READY_FOR_CREATIVE":
      return 2;
    case "READY_FOR_REVIEW":
      return 3;
    case "ACTIVE":
      return 4;
  }
}

export const CAMPAIGN_GOALS = [
  "Free-trial signups",
  "Drive sales",
  "App installs",
  "Brand awareness",
  "Event or launch promotion",
  "Other",
] as const;
export type CampaignGoal = (typeof CAMPAIGN_GOALS)[number];

export type BriefField =
  | "product_name"
  | "product_url"
  | "offer_summary"
  | "target_audience"
  | "campaign_goal"
  | "maximum_spend_usd"
  | "publication_window_start"
  | "publication_window_end";

export interface CampaignBrief {
  product_name: string;
  product_url: string;
  offer_summary: string;
  target_audience: string;
  campaign_goal: CampaignGoal | "";
  maximum_spend_usd: number | null;
  publication_window_start: string;
  publication_window_end: string;
}

export interface AdUnit {
  w: number;
  h: number;
}

export interface MatchedChannel {
  rank: number;
  platform: string;
  rationale: string;
  /** 0..1. Always rendered with the numeral beside the bar. */
  confidence: number;
  cpmLow: number;
  cpmHigh: number;
  /** Unchecking excludes the channel from the creative brief. */
  included: boolean;
  source: "live" | "cached";
  adUnit: AdUnit;
}

export interface ResearchResult {
  channels: MatchedChannel[];
  platformsSearched: number;
  elapsedMs: number;
  /** Set when one platform returned and another did not. */
  failedPlatform?: string;
  /** Set when rate cards came from cache. */
  cacheAgeMinutes?: number;
}

export interface Creative {
  kind: "upload" | "generated";
  filename: string;
  sizeBytes: number;
  format: "PNG" | "GIF";
  adUnit: AdUnit;
  /** Top-ranked channel the creative was briefed against. */
  briefedAgainst?: string;
  /** Rendered asset. Absent means the frame draws a wireframe instead. */
  assetUrl?: string;
}

export interface Campaign {
  id: string;
  status: CampaignStatus;
  createdAtMs: number;
  launchedAtMs?: number;
  brief: CampaignBrief;
  research?: ResearchResult;
  creative?: Creative;
  /** Mock DSP bid payload, shown in the inspector on the live page. */
  payload?: Record<string, unknown>;
  /** Brief fields the scrape filled in, for the "from your site" tag. */
  prefilled: BriefField[];
  traceUrl: string;
  portUrl: string;
}

export interface CampaignAuditEvent {
  id: string;
  tsMs: number;
  /** Lowercase machine identifier, rendered exactly as emitted. */
  type: string;
  entityId: string;
  campaignId: string;
  portUrl: string;
}

/** Min and max CPM across matched channels, the range bar's scale. */
export function cpmScale(channels: MatchedChannel[]): { min: number; max: number } {
  if (!channels.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...channels.map((c) => c.cpmLow)),
    max: Math.max(...channels.map((c) => c.cpmHigh)),
  };
}

export function topChannel(campaign: Campaign): string | undefined {
  const included = campaign.research?.channels.filter((c) => c.included) ?? [];
  return included.length ? included[0].platform : undefined;
}
