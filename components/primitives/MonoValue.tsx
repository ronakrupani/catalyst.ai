import type { ReactNode } from "react";

type Tone = "default" | "secondary" | "muted" | "stage-1" | "stage-2" | "green" | "red";

const TONE: Record<Tone, string> = {
  default: "text-slate-100",
  secondary: "text-slate-200",
  muted: "text-slate-400",
  "stage-1": "text-violet-bright",
  "stage-2": "text-sodium-base",
  green: "text-green-base",
  red: "text-red-base",
};

type Size = "eyebrow" | "label" | "body-sm" | "body" | "body-lg" | "title" | "metric";

const SIZE: Record<Size, string> = {
  eyebrow: "text-eyebrow",
  label: "text-label",
  "body-sm": "text-body-sm",
  body: "text-body",
  "body-lg": "text-body-lg",
  title: "text-title",
  metric: "text-metric",
};

export interface MonoValueProps {
  children: ReactNode;
  size?: Size;
  tone?: Tone;
  /** Full-precision value for assistive tech when the visible text is compact. */
  title?: string;
  className?: string;
}

/**
 * Every machine-emitted value on the site renders through here: prices, CPMs,
 * durations, span ids, timestamps, confidence scores, counts. Tabular figures
 * come from `.ct-num`, so numbers never shift width as they change.
 */
export function MonoValue({
  children,
  size = "body-sm",
  tone = "default",
  title,
  className = "",
}: MonoValueProps) {
  return (
    <span
      className={`ct-num ${SIZE[size]} ${TONE[tone]} ${className}`}
      title={title}
    >
      {children}
    </span>
  );
}
