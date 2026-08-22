"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Checkbox remapped onto ct- tokens. The mark is a real SVG rather than a
 * background image, so it survives Tailwind's arbitrary-value parsing, and the
 * 16px box sits inside a 44px hit area.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <span className={cn("relative inline-flex size-11 items-center justify-center", className)}>
      <input
        type="checkbox"
        data-slot="checkbox"
        className="peer size-4 shrink-0 cursor-pointer appearance-none rounded-xs border border-ink-500 bg-ink-100 transition-colors duration-[120ms] ease-ct checked:border-violet-base checked:bg-violet-base"
        {...props}
      />
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="pointer-events-none absolute size-3 text-ink-000 opacity-0 peer-checked:opacity-100"
      >
        <path
          d="M2.5 6.2 4.8 8.5 9.5 3.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
export { Checkbox };
