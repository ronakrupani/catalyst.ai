import Link from "next/link";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#audit-trail", label: "Audit trail" },
];

export function Nav() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-sm bg-violet-base px-4 py-2 text-text-on-neon focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to main content
      </a>

      <header className="ct-nav sticky top-0 z-40 h-14">
        {/* Separate layer so the hairline and the fill share one opacity ramp,
            keeping the scroll effect on opacity rather than on a filter. */}
        <span className="ct-nav__bg" aria-hidden="true" />
        <nav
          aria-label="Primary"
          className="ct-wrap relative flex h-14 items-center justify-between gap-4"
        >
          <Link href="/" className="ct-display text-body-lg text-slate-100">
            catalyst.ai
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden rounded-sm px-3 py-2 text-body text-slate-300 transition-colors duration-[120ms] ease-ct hover:text-slate-100 sm:inline-block"
              >
                {link.label}
              </a>
            ))}
            <Button asChild size="sm">
              <Link href="/discover" prefetch={false}>
                Launch app
              </Link>
            </Button>
          </div>
        </nav>
      </header>
    </>
  );
}
