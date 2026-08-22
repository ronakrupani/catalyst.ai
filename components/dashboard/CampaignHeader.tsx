import { CampaignStatusPill } from "@/components/primitives/CampaignStatusPill";
import { PipelineStepper } from "@/components/primitives/PipelineStepper";
import type { Campaign } from "@/lib/campaign";
import { stepIndexForStatus } from "@/lib/campaign";
import { MonoValue } from "@/components/primitives/MonoValue";

/** Sticky header plus the four-segment stepper, on every campaign route. */
export function CampaignHeader({
  campaign,
  researchSpans,
  failedStep,
}: {
  campaign: Campaign;
  researchSpans?: { label: string; done: boolean }[];
  failedStep?: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1120px] px-8 pb-4 pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-title font-medium text-slate-100">
              {campaign.brief.product_name}
            </h1>
            <MonoValue size="eyebrow" tone="muted">
              {campaign.id}
            </MonoValue>
          </div>
          <CampaignStatusPill status={campaign.status} />
        </div>
        <div className="mt-4">
          <PipelineStepper
            currentStep={stepIndexForStatus(campaign.status)}
            researchSpans={researchSpans}
            failedStep={failedStep}
          />
        </div>
      </div>
    </header>
  );
}
