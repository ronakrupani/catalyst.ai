"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonoValue } from "@/components/primitives/MonoValue";
import { AdUnitFrame } from "@/components/primitives/AdUnitFrame";
import { CampaignHeader } from "@/components/dashboard/CampaignHeader";
import { useCampaign } from "@/components/dashboard/CampaignProvider";
import { launchCampaign } from "@/lib/api";
import { cpmScale, topChannel } from "@/lib/campaign";
import { formatCpm, formatUsd } from "@/lib/format";

function Section({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="ct-eyebrow">{title}</h2>
        <Link
          href={editHref}
          className="rounded-sm text-body-sm text-slate-300 underline underline-offset-4 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
        >
          Edit
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ReviewPage() {
  const { campaign } = useCampaign();
  const router = useRouter();
  const [launching, setLaunching] = useState(false);

  const { brief, research, creative } = campaign;
  const included = research?.channels.filter((c) => c.included) ?? [];
  const { min, max } = cpmScale(included);
  const top = topChannel(campaign);

  function launch() {
    setLaunching(true);
    launchCampaign(campaign.id);
    router.push(`/app/campaigns/${campaign.id}?launched=1`);
  }

  const intake = "/app";
  const researchHref = `/app/campaigns/${campaign.id}/research`;
  const creativeHref = `/app/campaigns/${campaign.id}/creative`;

  return (
    <>
      <CampaignHeader campaign={campaign} />

      <div className="mx-auto max-w-[1120px] px-8 pb-40 pt-10">
        <h1 className="ct-display text-headline text-slate-100">Review before it goes live</h1>
        <p className="mt-3 text-body-lg text-slate-300">
          This is the only approval. Everything before it is still editable.
        </p>

        <div className="mt-8 max-w-3xl">
          <Section title="The offer" editHref={intake}>
            <p className="text-body-lg text-slate-100">{brief.product_name}</p>
            <p className="mt-1 text-body text-slate-300">{brief.offer_summary}</p>
            <MonoValue size="body-sm" tone="muted" className="mt-2 block">
              {brief.product_url}
            </MonoValue>
          </Section>

          <Section title="Who it reaches" editHref={intake}>
            <p className="text-body text-slate-200">{brief.target_audience}</p>
            <p className="mt-2 text-body-sm text-slate-400">Goal: {brief.campaign_goal}</p>
          </Section>

          <Section title="Where it runs" editHref={researchHref}>
            <ul>
              {included.map((c) => (
                <li
                  key={c.platform}
                  className="flex items-baseline gap-3 border-t border-border py-2 first:border-t-0"
                >
                  <MonoValue size="body-sm" tone="muted" className="w-6 shrink-0">
                    {c.rank}
                  </MonoValue>
                  <span className="min-w-0 flex-1 truncate text-body text-slate-200">
                    {c.platform}
                  </span>
                  <MonoValue size="body-sm" tone="stage-2">
                    {formatCpm(c.cpmLow)}–{formatCpm(c.cpmHigh)}
                  </MonoValue>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-body-sm text-slate-400">
              <MonoValue size="body-sm" tone="muted">
                {included.length}
              </MonoValue>{" "}
              channels, CPM{" "}
              <MonoValue size="body-sm" tone="muted">
                {formatCpm(min)} to {formatCpm(max)}
              </MonoValue>
            </p>
          </Section>

          <Section title="The creative" editHref={creativeHref}>
            {creative ? (
              <div className="flex items-start gap-6">
                <AdUnitFrame
                  unit={creative.adUnit}
                  maxEdge={200}
                  label={`${brief.product_name}${top ? ` · ${top}` : ""}`}
                />
                <div className="min-w-0">
                  <MonoValue size="body-sm" tone="secondary" className="block break-all">
                    {creative.filename}
                  </MonoValue>
                  <MonoValue size="body-sm" tone="muted" className="mt-1 block">
                    {creative.format}
                  </MonoValue>
                </div>
              </div>
            ) : (
              <p className="text-body text-slate-400">No creative attached yet.</p>
            )}
          </Section>

          <Section title="Budget and dates" editHref={intake}>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <div className="ct-eyebrow">maximum spend</div>
                <MonoValue size="title" tone="default" className="mt-1 block">
                  {brief.maximum_spend_usd !== null ? formatUsd(brief.maximum_spend_usd) : "—"}
                </MonoValue>
              </div>
              <div>
                <div className="ct-eyebrow">dates</div>
                <MonoValue size="title" tone="default" className="mt-1 block">
                  {brief.publication_window_start} to {brief.publication_window_end}
                </MonoValue>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* The only approval gate in the product, so it gets the full width. */}
      <div className="ct-bar-rise fixed inset-x-0 bottom-0 z-30 border-t border-border-strong bg-panel">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-8 py-4">
          <p className="text-body-sm text-slate-400">
            This pushes a bid payload to your DSP. Nothing spends in this build.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href={creativeHref}>Back to creative</Link>
            </Button>
            <Button size="lg" onClick={launch} disabled={launching}>
              Launch campaign
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
