"use client";

import type {
  Campaign,
  CampaignBrief,
  CampaignStatus,
  Creative,
  MatchedChannel,
  ResearchResult,
} from "./campaign";
import {
  appendEvent,
  getCampaign,
  listCampaigns,
  listEvents,
  putCampaign,
} from "./store";

/**
 * Typed mock client. Every call the real product would make to the Signal
 * Engine, the Bright Data scraper, Port or SigNoz is stubbed here, so the whole
 * flow runs with the server off. Swap the bodies for fetches and nothing above
 * this file changes.
 */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Deterministic id from the product name plus a counter, no Math.random. */
function makeId(productName: string): string {
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24);
  const n = listCampaigns().length + 1;
  return `cmp_${slug || "campaign"}_${String(n).padStart(2, "0")}`;
}

function event(campaignId: string, type: string, tsMs: number) {
  const entityId = `ct_${campaignId.slice(4, 7)}_${type.length.toString(16)}${tsMs.toString(16).slice(-4)}`;
  appendEvent({
    id: `${campaignId}_${type}_${tsMs}`,
    tsMs,
    type,
    entityId,
    campaignId,
    portUrl: `https://app.getport.io/entity/catalyst_campaign/${entityId}`,
  });
}


/**
 * Stubbed Signal Engine. The real one scores live inventory; this scores a
 * fixed catalogue against the brief so a campaign created during a demo has
 * real-shaped results rather than an empty screen. Deterministic, no randomness.
 */
interface CatalogEntry {
  platform: string;
  rationale: string;
  cpmLow: number;
  cpmHigh: number;
  adUnit: { w: number; h: number };
  b2b: number;
  consumer: number;
}

const CATALOG: CatalogEntry[] = [
  { platform: "LinkedIn", cpmLow: 28.0, cpmHigh: 41.5, adUnit: { w: 728, h: 90 }, b2b: 0.93, consumer: 0.31,
    rationale: "Decision makers sit here, and job-title targeting maps directly onto your buyer." },
  { platform: "Reddit", cpmLow: 9.2, cpmHigh: 14.8, adUnit: { w: 300, h: 250 }, b2b: 0.88, consumer: 0.64,
    rationale: "Dense self-selected communities. Lower reach than video, higher stated intent." },
  { platform: "Stack Overflow", cpmLow: 18.4, cpmHigh: 26.0, adUnit: { w: 300, h: 250 }, b2b: 0.85, consumer: 0.12,
    rationale: "Intent is highest where the problem is being debugged. Small reach, little waste." },
  { platform: "Carbon Ads", cpmLow: 12.0, cpmHigh: 19.5, adUnit: { w: 130, h: 100 }, b2b: 0.79, consumer: 0.18,
    rationale: "One unobtrusive unit across developer publications. Cheap endemic reach." },
  { platform: "YouTube", cpmLow: 11.3, cpmHigh: 17.2, adUnit: { w: 970, h: 250 }, b2b: 0.74, consumer: 0.71,
    rationale: "Largest absolute reach in the set. Bumper formats suit a low-consideration buy." },
  { platform: "X", cpmLow: 8.4, cpmHigh: 13.1, adUnit: { w: 300, h: 250 }, b2b: 0.68, consumer: 0.52,
    rationale: "Fast reach, though targeting has degraded and waste is higher than the rest." },
  { platform: "Instagram", cpmLow: 9.8, cpmHigh: 15.4, adUnit: { w: 1080, h: 1080 }, b2b: 0.34, consumer: 0.91,
    rationale: "Discovery is visual here, and Reels carry the format your audience already watches." },
  { platform: "TikTok", cpmLow: 6.2, cpmHigh: 11.0, adUnit: { w: 1080, h: 1920 }, b2b: 0.27, consumer: 0.89,
    rationale: "Reaction content spreads without paid support, so paid buys compound organic reach." },
  { platform: "Meta Audience Network", cpmLow: 4.9, cpmHigh: 8.6, adUnit: { w: 300, h: 250 }, b2b: 0.41, consumer: 0.82,
    rationale: "Cheapest incremental reach in the set. Weak on brand, strong on retargeting." },
  { platform: "Pinterest", cpmLow: 5.4, cpmHigh: 9.3, adUnit: { w: 1000, h: 1500 }, b2b: 0.22, consumer: 0.76,
    rationale: "Long shelf life per pin. Slower to convert, cheapest cost per saved intent." },
];

const B2B_SIGNALS = [
  "b2b", "saas", "software", "engineer", "developer", "devops", "startup", "enterprise",
  "team", "company", "platform", "api", "workflow", "manager", "agency", "compliance",
];

/** Which half of the catalogue the brief leans toward. */
function audienceLean(brief: CampaignBrief): "b2b" | "consumer" {
  const haystack = `${brief.offer_summary} ${brief.target_audience} ${brief.product_name}`.toLowerCase();
  const hits = B2B_SIGNALS.filter((w) => haystack.includes(w)).length;
  return hits >= 2 ? "b2b" : "consumer";
}

function synthesizeResearch(brief: CampaignBrief, elapsedMs: number): ResearchResult {
  const lean = audienceLean(brief);
  const scored = [...CATALOG]
    .map((entry) => ({ entry, score: lean === "b2b" ? entry.b2b : entry.consumer }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    channels: scored.map(({ entry, score }, i) => ({
      rank: i + 1,
      platform: entry.platform,
      rationale: entry.rationale,
      confidence: score,
      cpmLow: entry.cpmLow,
      cpmHigh: entry.cpmHigh,
      included: true,
      source: "live",
      adUnit: entry.adUnit,
    })),
    platformsSearched: CATALOG.length,
    elapsedMs,
  };
}

export interface ScrapeResult {
  ok: boolean;
  /** Fields the scrape could fill. Absent fields stay empty for the user. */
  brief: Partial<CampaignBrief>;
  prefilled: (keyof CampaignBrief)[];
}

/** Bright Data page read. Stubbed; the real one fetches and extracts. */
export async function scrapeSite(url: string): Promise<ScrapeResult> {
  await sleep(2200);
  const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const name = host.split(".")[0];
  const product = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    ok: true,
    brief: {
      product_name: product,
      product_url: url.startsWith("http") ? url : `https://${url}`,
      offer_summary: `Automatic meeting notes and action items for engineering teams, wired into Linear and GitHub.`,
      target_audience: `Engineering managers and staff engineers at 50 to 500 person software companies.`,
    },
    prefilled: ["product_name", "product_url", "offer_summary", "target_audience"],
  };
}

export async function createCampaign(brief: CampaignBrief, prefilled: string[]): Promise<Campaign> {
  const now = Date.now();
  const id = makeId(brief.product_name);
  const campaign: Campaign = {
    id,
    status: "READY_FOR_RESEARCH",
    createdAtMs: now,
    brief,
    research: synthesizeResearch(brief, RESEARCH_TOTAL_MS),
    prefilled: prefilled as Campaign["prefilled"],
    traceUrl: `https://signoz.catalyst.internal/trace/${id}`,
    portUrl: `https://app.getport.io/entity/catalyst_campaign/${id}`,
  };
  putCampaign(campaign);
  event(id, "campaign.created", now);
  event(id, "intake.brief.completed", now + 40);
  return campaign;
}

export function fetchCampaign(id: string): Campaign | undefined {
  return getCampaign(id);
}

export function fetchCampaigns(): Campaign[] {
  return listCampaigns();
}

export function fetchEvents(campaignId?: string) {
  return listEvents(campaignId);
}

export const RESEARCH_STEPS = [
  "Classifying your offer",
  "Scoring channel fit",
  "Pulling live rate cards",
] as const;

/** Roughly 6s of research, streamed a step at a time. */
export const RESEARCH_STEP_MS = [1400, 1600, 1400];

/** Steps plus the channel arrivals, so the summary matches what was watched. */
export const RESEARCH_TOTAL_MS =
  RESEARCH_STEP_MS.reduce((a, b) => a + b, 0) + 6 * 260;

/** Channel rows arrive one at a time at this cadence. */
export const CHANNEL_ARRIVAL_MS = 260;

export async function runResearch(id: string): Promise<ResearchResult | null> {
  const campaign = getCampaign(id);
  if (!campaign?.research) return null;
  const now = Date.now();
  event(id, "stage1.offer.classified", now + RESEARCH_STEP_MS[0]);
  event(id, "stage1.channels.scored", now + RESEARCH_STEP_MS[0] + RESEARCH_STEP_MS[1]);
  event(id, "stage2.rate_cards.pulled", now + campaign.research.elapsedMs);
  return campaign.research;
}

export function saveChannelSelection(id: string, channels: MatchedChannel[]) {
  const campaign = getCampaign(id);
  if (!campaign?.research) return;
  putCampaign({ ...campaign, research: { ...campaign.research, channels } });
}

/** Roughly 4s of generation against the top-ranked channel. */
export const GENERATE_MS = 4000;

export async function generateCreative(id: string): Promise<Creative | null> {
  const campaign = getCampaign(id);
  if (!campaign) return null;
  await sleep(GENERATE_MS);
  const top = campaign.research?.channels.find((c) => c.included);
  const unit = top?.adUnit ?? { w: 300, h: 250 };
  const creative: Creative = {
    kind: "generated",
    filename: `${campaign.brief.product_name.toLowerCase().replace(/\s+/g, "-")}-${(top?.platform ?? "display").toLowerCase()}-${unit.w}x${unit.h}.png`,
    sizeBytes: 184320,
    format: "PNG",
    adUnit: unit,
    briefedAgainst: top?.platform,
  };
  event(id, "creative.generated", Date.now());
  return creative;
}

export function attachCreative(id: string, creative: Creative) {
  const campaign = getCampaign(id);
  if (!campaign) return;
  putCampaign({ ...campaign, creative });
  event(id, "creative.accepted", Date.now());
}

/** Status advances only on the user's terminal action for each step. */
export function advance(id: string, status: CampaignStatus) {
  const campaign = getCampaign(id);
  if (!campaign) return;
  putCampaign({ ...campaign, status });
}

export function launchCampaign(id: string) {
  const campaign = getCampaign(id);
  if (!campaign) return;
  const now = Date.now();
  putCampaign({ ...campaign, status: "ACTIVE", launchedAtMs: now });
  event(id, "campaign.approved", now);
  event(id, "dsp.payload.pushed", now + 300);
  event(id, "campaign.activated", now + 700);
}
