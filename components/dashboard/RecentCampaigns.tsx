"use client";

import Link from "next/link";
import type { Campaign } from "@/lib/campaign";
import { routeForStatus, stepIndexForStatus } from "@/lib/campaign";
import { CampaignStatusPill } from "@/components/primitives/CampaignStatusPill";
import { StepperRow } from "@/components/primitives/PipelineStepper";
import { MonoValue } from "@/components/primitives/MonoValue";

export function RecentCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section className="mt-12 max-w-2xl">
      <h2 className="ct-eyebrow">Recent campaigns</h2>
      <ul className="mt-3">
        {campaigns.slice(0, 3).map((c) => (
          <li key={c.id}>
            <Link
              href={routeForStatus(c.id, c.status)}
              className="flex items-center gap-4 border-t border-border px-2 py-3 transition-colors duration-[120ms] ease-ct hover:bg-ink-200"
            >
              <span className="min-w-0 flex-1 truncate text-body text-slate-100">
                {c.brief.product_name}
              </span>
              <MonoValue size="body-sm" tone="muted" className="hidden sm:block">
                {c.id}
              </MonoValue>
              <StepperRow currentStep={stepIndexForStatus(c.status)} />
              <CampaignStatusPill status={c.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
