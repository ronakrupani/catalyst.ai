"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MonoValue } from "@/components/primitives/MonoValue";
import { AdUnitFrame } from "@/components/primitives/AdUnitFrame";
import { JsonInspector } from "@/components/primitives/JsonInspector";
import { CampaignHeader } from "@/components/dashboard/CampaignHeader";
import { useCampaign } from "@/components/dashboard/CampaignProvider";
import { cpmScale, topChannel } from "@/lib/campaign";
import { formatCpm, formatUsd } from "@/lib/format";

function LaunchToast() {
  const params = useSearchParams();
  const [show, setShow] = useState(params.get("launched") === "1");

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-green-dim bg-green-wash px-4 py-2 text-body text-green-bright"
    >
      Campaign live
    </div>
  );
}

/** The URL people share, so it reads as a complete standalone page. */
export default function LiveCampaignPage() {
  const { campaign } = useCampaign();
  const { brief, research, creative } = campaign;
  const included = research?.channels.filter((c) => c.included) ?? [];
  const { min, max } = cpmScale(included);
  const top = topChannel(campaign);
  const since = campaign.launchedAtMs
    ? new Date(campaign.launchedAtMs).toISOString().slice(0, 10)
    : brief.publication_window_start;

  return (
    <>
      <CampaignHeader campaign={campaign} />

      <div className="mx-auto max-w-[1120px] px-8 py-10">
        <h1 className="ct-display text-headline text-slate-100">{brief.product_name}</h1>

        <p className="mt-3 text-body-lg text-slate-300">
          Live since <MonoValue size="body-lg" tone="default">{since}</MonoValue>.{" "}
          <MonoValue size="body-lg" tone="default">{included.length}</MonoValue> channels,{" "}
          <MonoValue size="body-lg" tone="default">
            {brief.maximum_spend_usd !== null ? formatUsd(brief.maximum_spend_usd) : "—"}
          </MonoValue>{" "}
          cap, ends{" "}
          <MonoValue size="body-lg" tone="default">{brief.publication_window_end}</MonoValue>.
        </p>

        <div className="mt-8 flex flex-wrap items-start gap-10">
          {creative && (
            <AdUnitFrame
              unit={creative.adUnit}
              maxEdge={260}
              label={`${brief.product_name}${top ? ` · ${top}` : ""}`}
            />
          )}

          <div className="ct-elev-2 min-w-[280px] rounded-md px-5 py-4">
            <div className="ct-eyebrow">cpm range</div>
            <MonoValue size="metric" tone="stage-2" className="mt-1 block">
              {formatCpm(min)}–{formatCpm(max)}
            </MonoValue>
            <div className="mt-4 ct-eyebrow">platforms searched</div>
            <MonoValue size="title" tone="default" className="mt-1 block">
              {research?.platformsSearched ?? 0}
            </MonoValue>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={campaign.traceUrl}
            className="rounded-sm text-body text-violet-bright underline underline-offset-4"
          >
            View pipeline trace
          </a>
          <a
            href={campaign.portUrl}
            className="rounded-sm text-body text-violet-bright underline underline-offset-4"
          >
            View in Port catalog
          </a>
        </div>

        <JsonInspector title="Bid payload" value={campaign.payload ?? {}} className="mt-8" />
      </div>

      <Suspense fallback={null}>
        <LaunchToast />
      </Suspense>
    </>
  );
}
