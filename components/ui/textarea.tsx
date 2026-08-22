import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Textarea, remapped onto ct- tokens.
 * Business description input, design system 2.6: min-height 132, body-lg,
 * ink-100, 1px ink-400, radius 12, padding 16. Focus takes the violet ring
 * from the global focus-visible rule and darkens the border to violet-dim.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[132px] w-full rounded-md border border-ink-400 bg-ink-100 p-4 text-body-lg text-slate-100",
        "placeholder:text-slate-400",
        "transition-colors duration-[120ms] ease-ct focus-visible:border-violet-dim",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
