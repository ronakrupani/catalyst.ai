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

const whole = new Intl.NumberFormat("en-US");

/** `$8.90` */
export function formatCpm(value: number): string {
  return usd.format(value);
}

/** `$8.90–$12.40`. En dash, not a hyphen. */
export function formatCpmRange(low: number, high: number): string {
  return `${usd.format(low)}–${usd.format(high)}`;
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
