import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("block text-body font-medium text-slate-200", className)}
      {...props}
    />
  );
}
export { Label };
