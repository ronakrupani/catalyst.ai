import Image from "next/image";
import type { AdUnit } from "@/lib/campaign";
import { MonoValue } from "./MonoValue";

const MAX_EDGE = 320;

/** Proportional frame at the ad unit's real aspect ratio. */
export function adUnitBox(unit: AdUnit, maxEdge = MAX_EDGE) {
  const scale = maxEdge / Math.max(unit.w, unit.h);
  return {
    width: Math.round(unit.w * scale),
    height: Math.max(24, Math.round(unit.h * scale)),
  };
}

export function AdUnitFrame({
  unit,
  label,
  src,
  alt,
  loading = false,
  maxEdge = MAX_EDGE,
  className = "",
}: {
  unit: AdUnit;
  label?: string;
  /** Rendered asset. Without one the frame draws a wireframe. */
  src?: string;
  alt?: string;
  /** Skeleton at the real dimensions of the content, never a spinner. */
  loading?: boolean;
  maxEdge?: number;
  className?: string;
}) {
  const box = adUnitBox(unit, maxEdge);
  const showAsset = Boolean(src) && !loading;
  return (
    <div className={className}>
      {/* Width is a ceiling, not a fixed size: the frame keeps the unit's
          proportions via aspect-ratio and scales down inside its column
          instead of overflowing it. */}
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xs bg-ink-100 ${
          loading
            ? "ct-skeleton border border-ink-400"
            : showAsset
              ? "border border-ink-400"
              : "border border-dashed border-ink-500"
        }`}
        style={{
          width: box.width,
          maxWidth: "100%",
          aspectRatio: `${unit.w} / ${unit.h}`,
          minHeight: 24,
        }}
        aria-hidden={showAsset ? undefined : "true"}
      >
        {showAsset ? (
          <Image
            src={src as string}
            alt={alt ?? ""}
            fill
            sizes={`${box.width}px`}
            className="object-cover"
          />
        ) : !loading && label ? (
          <span className="px-2 text-center text-body-sm text-slate-300">{label}</span>
        ) : null}
      </div>
      <MonoValue size="eyebrow" tone="muted" className="mt-2 block">
        {unit.w}×{unit.h}
      </MonoValue>
    </div>
  );
}
