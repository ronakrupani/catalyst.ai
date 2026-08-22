import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="ct-wrap flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-body-lg text-slate-200">
          Describe your business. Get real placements with real prices, and the
          trail that produced them.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/app">Start a campaign</Link>
          </Button>
          <a
            href="https://github.com/catalyst-ai/catalyst"
            className="rounded-sm px-3 py-2 text-body text-slate-300 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
          >
            GitHub
          </a>
          <a
            href="https://github.com/catalyst-ai/catalyst#demo"
            className="rounded-sm px-3 py-2 text-body text-slate-300 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
          >
            Demo video
          </a>
        </div>
      </div>
    </footer>
  );
}
