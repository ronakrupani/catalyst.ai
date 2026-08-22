import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Input, remapped onto ct- tokens. 44px tall for touch. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-sm border border-ink-400 bg-ink-100 px-3 text-body-lg text-slate-100",
        "placeholder:text-slate-400",
        "transition-colors duration-[120ms] ease-ct focus-visible:border-violet-dim",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "aria-[invalid=true]:border-red-dim",
        className,
      )}
      {...props}
    />
  );
}
export { Input };
