"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CampaignStatusPill } from "@/components/primitives/CampaignStatusPill";
import { StepperRow } from "@/components/primitives/PipelineStepper";
import { stepIndexForStatus, routeForStatus } from "@/lib/campaign";
import type { Campaign } from "@/lib/campaign";

export function ContextColumn({ campaigns }: { campaigns: Campaign[] }) {
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;

  return (
    <aside
      aria-label="Campaigns"
      className="sticky top-0 h-dvh w-full overflow-y-auto border-r border-border bg-panel"
    >
      <div className="px-4 py-4">
        <h2 className="ct-eyebrow">Campaigns</h2>
      </div>
      <ul>
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link
              href={routeForStatus(c.id, c.status)}
              aria-current={c.id === activeId ? "page" : undefined}
              className={`block border-t border-border px-4 py-3 transition-colors duration-[120ms] ease-ct ${
                c.id === activeId ? "bg-ink-200" : "hover:bg-ink-200"
              }`}
            >
              <div className="truncate text-body text-slate-100">{c.brief.product_name}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StepperRow currentStep={stepIndexForStatus(c.status)} />
                <CampaignStatusPill status={c.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
