import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The default palette and type scale are replaced wholesale in globals.css, so
 * tailwind-merge has to be taught the ct- scales. Without this it cannot tell
 * `text-body-sm` (a size) from `text-text-on-neon` (a colour), classifies both
 * as font-size, and silently drops one — which is how a primary button ends up
 * rendering slate text on violet.
 */
const COLORS = [
  "ink-000", "ink-050", "ink-100", "ink-200", "ink-300", "ink-400", "ink-500",
  "slate-100", "slate-200", "slate-300", "slate-400", "slate-500",
  "violet-bright", "violet-base", "violet-dim", "violet-wash",
  "sodium-bright", "sodium-base", "sodium-dim", "sodium-wash",
  "green-bright", "green-base", "green-dim", "green-wash",
  "red-bright", "red-base", "red-dim", "red-wash",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-grid",
  "bg", "panel", "card", "hover",
  "border", "border-strong", "border-active",
  "text", "text-secondary", "text-muted", "text-on-neon",
  "stage-1", "stage-2", "accent",
];

const FONT_SIZES = [
  "eyebrow", "label", "body-sm", "body", "body-lg",
  "title", "headline", "metric", "hero",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
      "text-color": [{ text: COLORS }],
      "bg-color": [{ bg: COLORS }],
      "border-color": [{ border: COLORS }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
