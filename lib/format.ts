/**
 * Render-time formatting. The fixture and the API carry numbers; every string
 * a human reads is produced here, so the site and the app never drift.
 * Locale-aware per the chart/data guidance; all output is mono at the call site.
 */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const whole = new Intl.NumberFormat("en-US");

/** `$8.90` */
export function formatCpm(value: number): string {
  return usd.format(value);
}

/** `$8.90–$12.40`. En dash, not a hyphen. */
export function formatCpmRange(low: number, high: number): string {
  return `${usd.format(low)}–${usd.format(high)}`;
}

/**
 * The worked example used wherever a CPM needs translating into money a
 * person actually spends. One number, defined once, so every surface quotes
 * the same rate.
 */
export const EXAMPLE_HOURLY_BUDGET = 11;

/** `$11/hour` */
export function formatHourlyBudget(dollars: number = EXAMPLE_HOURLY_BUDGET): string {
  return `${usdWhole.format(dollars)}/hour`;
}

/** Impressions an hourly budget buys at a given CPM. */
export function impressionsPerHour(cpm: number, hourlyBudget = EXAMPLE_HOURLY_BUDGET): number {
  return (hourlyBudget / cpm) * 1000;
}

/** Rounded to the nearest ten: this is arithmetic on a range, not a quote. */
export function formatImpressions(value: number): string {
  return whole.format(Math.round(value / 10) * 10);
}

/**
 * `520–590` — impressions an hour for the example rate. A higher CPM buys
 * fewer impressions, so the low CPM produces the top of the range.
 */
export function formatImpressionsPerHourRange(
  cpmLow: number,
  cpmHigh: number,
  hourlyBudget = EXAMPLE_HOURLY_BUDGET,
): string {
  const low = impressionsPerHour(cpmHigh, hourlyBudget);
  const high = impressionsPerHour(cpmLow, hourlyBudget);
  return `${formatImpressions(low)}–${formatImpressions(high)}`;
}

/** `8.4M` — for axis labels and dense rows. */
export function formatReachCompact(value: number): string {
  return compact.format(value);
}

/** `8,400,000` — for the accessible label behind the compact figure. */
export function formatReachExact(value: number): string {
  return whole.format(value);
}

/** `0.94` — scores always show the numeral, never a bar alone (rule 2.7.2). */
export function formatScore(value: number): string {
  return value.toFixed(2);
}

/** `94%` */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** `1.74s` above a second, `340ms` below it. */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** `14:22:07.340` — audit trail timestamps, fixed width. */
export function formatTimestamp(epochMs: number): string {
  const d = new Date(epochMs);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

/** `2026-03-11 14:22 UTC` — cache age, shown next to a cached badge. */
export function formatCacheStamp(epochMs: number): string {
  const d = new Date(epochMs);
  const date = d.toISOString().slice(0, 10);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${date} ${hh}:${mm} UTC`;
}

/** `970×250` or `15s`. */
export function formatFormat(
  format: { w: number; h: number } | { seconds: number },
): string {
  return "seconds" in format
    ? `${format.seconds}s`
    : `${format.w}×${format.h}`;
}

/** `18–27` */
export function formatAgeRange([low, high]: [number, number]): string {
  return `${low}–${high}`;
}

/** `$250,000` — budgets and caps, no cents. */
export function formatUsd(value: number): string {
  return usdWhole.format(value);
}

/** `250,000` — grouped digits for a money input, without the symbol. */
export function formatGrouped(value: number): string {
  return whole.format(value);
}

/** Inclusive day count across a flight, or 0 if either date is missing. */
export function flightDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = Date.parse(start);
  const b = Date.parse(end);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}
