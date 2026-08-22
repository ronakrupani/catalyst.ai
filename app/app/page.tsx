"use client";

import { useState } from "react";
import type { CampaignBrief } from "@/lib/campaign";
import type { ScrapeResult } from "@/lib/api";
import { useCampaigns } from "@/lib/useStore";
import { IntakeStageA } from "@/components/dashboard/IntakeStageA";
import { IntakeStageB } from "@/components/dashboard/IntakeStageB";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";

type Field = keyof CampaignBrief;

/**
 * Two stages, not one form. The URL is collected first so the brief can be
 * prefilled before the user ever sees it.
 */
export default function IntakePage() {
  const [stage, setStage] = useState<"a" | "b">("a");
  const [initial, setInitial] = useState<Partial<CampaignBrief>>({});
  const [prefilled, setPrefilled] = useState<Field[]>([]);
  const campaigns = useCampaigns();

  function done(url: string, result: ScrapeResult | null) {
    setInitial(result?.brief ?? { product_url: url });
    setPrefilled((result?.prefilled as Field[]) ?? []);
    setStage("b");
  }

  return (
    <div className="mx-auto max-w-[1120px] px-8 py-12">
      {stage === "a" ? (
        <IntakeStageA onDone={done} onSkip={() => setStage("b")} />
      ) : (
        <IntakeStageB initial={initial} prefilled={prefilled} />
      )}
      <RecentCampaigns campaigns={campaigns} />
    </div>
  );
}
