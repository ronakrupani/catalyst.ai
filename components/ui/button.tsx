import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button, remapped onto ct- tokens. Every colour and radius here
 * resolves through the design system; none of the stock palette survives.
 * Radius 8 for buttons (design system 2.4). Micro timing, 120ms.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-body font-medium transition-colors duration-[120ms] ease-ct disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-violet-base text-text-on-neon hover:bg-violet-bright active:bg-violet-base",
        secondary:
          "border border-border-strong bg-ink-200 text-slate-100 hover:bg-ink-300 hover:border-border-active",
        ghost: "text-slate-300 hover:bg-ink-200 hover:text-slate-100",
        link: "text-violet-bright underline-offset-4 hover:underline",
      },
      size: {
        // Minimum 44px tall so touch targets clear the platform floor.
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-body-sm",
        lg: "h-12 px-6 text-body-lg",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
