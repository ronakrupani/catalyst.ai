import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Native select, remapped onto ct- tokens. A native control keeps the mobile
 * keyboard, the platform picker and keyboard traversal for free.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-11 w-full appearance-none rounded-sm border border-ink-400 bg-ink-100 px-3 pr-9 text-body-lg text-slate-100",
          "transition-colors duration-[120ms] ease-ct focus-visible:border-violet-dim",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "aria-[invalid=true]:border-red-dim",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-slate-400"
      >
        <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
export { Select };
