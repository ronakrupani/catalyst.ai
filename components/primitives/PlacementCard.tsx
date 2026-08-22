import type { Placement, PlacementFormat } from "@/lib/types";
import { isVideoFormat } from "@/lib/types";
import {
  formatCacheStamp,
  formatCpm,
  formatCpmRange,
  formatDailyBudget,
  formatFormat,
  formatImpressionsPerDayRange,
  formatReachCompact,
  formatReachExact,
  formatScore,
} from "@/lib/format";
import { MonoValue } from "./MonoValue";

const WIREFRAME_MAX = 96;
const WIREFRAME_MAX_COMPACT = 52;

/** Proportional wireframe of the real ad unit. Video units draw 16:9. */
function wireframeSize(format: PlacementFormat, compact = false) {
  const [w, h] = isVideoFormat(format) ? [16, 9] : [format.w, format.h];
  const scale = (compact ? WIREFRAME_MAX_COMPACT : WIREFRAME_MAX) / Math.max(w, h);
  return {
    width: Math.round(w * scale),
    height: Math.max(6, Math.round(h * scale)),
  };
}

function Wireframe({ format, compact = false }: { format: PlacementFormat; compact?: boolean }) {
  const { width, height } = wireframeSize(format, compact);
  const video = isVideoFormat(format);
  return (
    <div
      className="flex max-w-full shrink-0 items-center justify-center rounded-xs border border-dashed border-ink-500 bg-ink-100"
      style={{ width, height }}
      aria-hidden="true"
    >
      {video && !compact && (
        <span className="ct-num rounded-full bg-ink-200 px-1.5 py-0.5 text-[10px] leading-none text-slate-300">
          {format.seconds}s
        </span>
      )}
    </div>
  );
}

/** Where this placement's price sits inside the whole result set. */
function CpmRangeBar({
  low,
  high,
  min,
  max,
}: {
  low: number;
  high: number;
  min: number;
  max: number;
}) {
  const span = max - min || 1;
  const left = ((low - min) / span) * 100;
  const width = Math.max(2, ((high - low) / span) * 100);
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-xs bg-ink-400" aria-hidden="true">
      <div
        className="absolute top-0 h-full rounded-xs bg-sodium-base"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="ct-eyebrow">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export interface PlacementCardProps {
  placement: Placement;
  /** Min and max CPM across the full result set — the range bar's scale. */
  cpmMin: number;
  cpmMax: number;
  onHover?: (placementId: string | null) => void;
  highlighted?: boolean;
  /**
   * Opt in to the live glow. Off by default so a screen can never end up with
   * two glowing elements — the caller decides which single element is live.
   */
  glow?: boolean;
  /**
   * Dense row: wireframe, identity, CPM range bar and fit score only. For
   * lists where the rationale would out-weigh the numbers.
   */
  compact?: boolean;
  className?: string;
}

export function PlacementCard({
  placement: p,
  cpmMin,
  cpmMax,
  onHover,
  highlighted = false,
  glow = false,
  compact = false,
  className = "",
}: PlacementCardProps) {
  const cached = p.sourceBadge === "cached";

  if (compact) {
    return (
      <article
        className={`flex items-center gap-4 border-t border-border py-3 ${className}`}
        onMouseEnter={onHover ? () => onHover(p.id) : undefined}
        onMouseLeave={onHover ? () => onHover(null) : undefined}
      >
        <div className="flex w-[52px] shrink-0 justify-center">
          <Wireframe format={p.format} compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-body text-slate-100">{p.publisher}</span>
            <MonoValue size="eyebrow" tone="muted" className="truncate">
              {formatFormat(p.format)}
            </MonoValue>
            {cached && (
              <span className="ct-cached ct-num shrink-0 rounded-full px-1.5 text-eyebrow leading-none">
                cached
              </span>
            )}
          </div>
          <MonoValue size="body-sm" tone="muted" className="mt-0.5 block truncate">
            {p.name}
          </MonoValue>
        </div>

        <div className="w-[128px] shrink-0">
          <MonoValue size="body-sm" tone="stage-2" className="block text-right">
            {formatCpmRange(p.cpmLow, p.cpmHigh)}
          </MonoValue>
          <div className="mt-1.5">
            <CpmRangeBar low={p.cpmLow} high={p.cpmHigh} min={cpmMin} max={cpmMax} />
          </div>
        </div>

        <MonoValue size="body-sm" tone="muted" className="w-10 shrink-0 text-right">
          {formatScore(p.fitScore)}
        </MonoValue>
      </article>
    );
  }

  return (
    <article
      className={`ct-elev-2 rounded-md p-4 transition-colors duration-[120ms] ease-ct ${
        highlighted ? "border-slate-300" : ""
      } ${glow ? "ct-live" : ""} ${className}`}
      onMouseEnter={onHover ? () => onHover(p.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <Wireframe format={p.format} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-body font-medium text-slate-100">{p.publisher}</div>
              {/* Rendered exactly as emitted (rule 2.7.3). */}
              <MonoValue size="body-sm" tone="muted" className="mt-0.5 block truncate">
                {p.name}
              </MonoValue>
            </div>

            {cached ? (
              <span className="ct-cached ct-num shrink-0 rounded-full px-2 py-0.5 text-eyebrow leading-none">
                cached
              </span>
            ) : (
              <span className="ct-num shrink-0 rounded-full border border-sodium-dim bg-sodium-wash px-2 py-0.5 text-eyebrow leading-none text-sodium-bright">
                live
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="format">
              <MonoValue size="body-sm" tone="secondary">
                {formatFormat(p.format)}
              </MonoValue>
            </Field>

            <Field label="monthly audience">
              <MonoValue size="body-sm" tone="secondary" title={formatReachExact(p.reachCount)}>
                {formatReachCompact(p.reachCount)}
              </MonoValue>
            </Field>

            <Field label="fit score" className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="h-1 w-[72px] overflow-hidden rounded-xs bg-ink-400" aria-hidden="true">
                  <div
                    className="h-full rounded-xs bg-violet-base"
                    style={{ width: `${p.fitScore * 100}%` }}
                  />
                </div>
                {/* The numeral always ships alongside the bar (rule 2.7.2). */}
                <MonoValue size="body-sm" tone="secondary">
                  {formatScore(p.fitScore)}
                </MonoValue>
              </div>
            </Field>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="ct-eyebrow">cpm range</span>
              <MonoValue size="body-sm" tone="stage-2">
                {formatCpmRange(p.cpmLow, p.cpmHigh)}
              </MonoValue>
            </div>
            <div className="mt-2">
              <CpmRangeBar low={p.cpmLow} high={p.cpmHigh} min={cpmMin} max={cpmMax} />
            </div>
            <div className="mt-1.5 flex justify-between">
              <MonoValue size="eyebrow" tone="muted">
                {formatCpm(cpmMin)}
              </MonoValue>
              <MonoValue size="eyebrow" tone="muted">
                {formatCpm(cpmMax)}
              </MonoValue>
            </div>
            {/* CPM restated as a day of spend — the unit an advertiser
                actually budgets in. Arithmetic on the range above, nothing
                new from the platform. */}
            <p className="mt-2 text-body-sm text-slate-400">
              <MonoValue size="body-sm" tone="secondary">
                {formatDailyBudget()}
              </MonoValue>{" "}
              buys{" "}
              <MonoValue size="body-sm" tone="secondary">
                {formatImpressionsPerDayRange(p.cpmLow, p.cpmHigh)}
              </MonoValue>{" "}
              impressions a day here.
            </p>
          </div>

          <p className="mt-3 line-clamp-2 text-body-sm leading-relaxed text-slate-300">{p.rationale}</p>

          {cached && p.cachedAtMs !== undefined && (
            <p className="mt-3 text-body-sm text-slate-400">
              Served from cache,{" "}
              <MonoValue size="body-sm" tone="muted">
                {formatCacheStamp(p.cachedAtMs)}
              </MonoValue>
              .
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
