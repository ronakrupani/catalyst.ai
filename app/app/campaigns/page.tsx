"use client";

import Link from "next/link";
import { routeForStatus, stepIndexForStatus } from "@/lib/campaign";
import { useCampaigns, useHydrated } from "@/lib/useStore";
import { Button } from "@/components/ui/button";
import { MonoValue } from "@/components/primitives/MonoValue";
import { CampaignStatusPill } from "@/components/primitives/CampaignStatusPill";
import { StepperRow } from "@/components/primitives/PipelineStepper";

export default function CampaignsPage() {
  const hydrated = useHydrated();
  const campaigns = useCampaigns();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1120px] px-8 py-12">
        <div className="ct-skeleton h-8 w-48 rounded-sm" />
        <div className="mt-6 flex flex-col gap-px">
          {[0, 1, 2].map((i) => (
            <div key={i} className="ct-skeleton h-16 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="mx-auto max-w-[1120px] px-8 py-16">
        <h1 className="ct-display text-headline text-slate-100">No campaigns yet.</h1>
        <p className="mt-3 text-body-lg text-slate-300">
          Describe a product and Catalyst finds where its audience is.
        </p>
        <Button asChild className="mt-6">
          <Link href="/app">New campaign</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-8 py-12">
      <h1 className="ct-display text-headline text-slate-100">Campaigns</h1>

      <ul className="mt-8">
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link
              href={routeForStatus(c.id, c.status)}
              className="flex items-center gap-5 border-t border-border px-2 py-4 transition-colors duration-[120ms] ease-ct hover:bg-ink-200"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-lg text-slate-100">
                  {c.brief.product_name}
                </span>
                <MonoValue size="body-sm" tone="muted" className="mt-0.5 block truncate">
                  {c.id}
                </MonoValue>
              </span>
              <StepperRow currentStep={stepIndexForStatus(c.status)} />
              <CampaignStatusPill status={c.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
