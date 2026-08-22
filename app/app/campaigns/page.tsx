"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { routeForStatus, stepIndexForStatus } from "@/lib/campaign";
import {
  deleteCampaign,
  restoreShippedCampaigns,
  undoDelete,
  type RemovedCampaign,
} from "@/lib/api";
import { useCampaigns, useHydrated } from "@/lib/useStore";
import { Button } from "@/components/ui/button";
import { MonoValue } from "@/components/primitives/MonoValue";
import { CampaignStatusPill } from "@/components/primitives/CampaignStatusPill";
import { StepperRow } from "@/components/primitives/PipelineStepper";
import { UndoToast } from "@/components/primitives/UndoToast";
import { IconTrash } from "@/components/dashboard/icons";

export default function CampaignsPage() {
  const hydrated = useHydrated();
  const campaigns = useCampaigns();
  const [removed, setRemoved] = useState<RemovedCampaign | null>(null);

  // Removed straight away and held for undo, rather than gated behind a
  // dialog: the action is reversible, so a confirmation would only add friction.
  const remove = useCallback((id: string) => {
    const snapshot = deleteCampaign(id);
    if (snapshot) setRemoved(snapshot);
  }, []);

  const undo = useCallback(() => {
    if (removed) undoDelete(removed);
    setRemoved(null);
  }, [removed]);

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
      <>
        <div className="mx-auto max-w-[1120px] px-8 py-16">
          <h1 className="ct-display text-headline text-slate-100">No campaigns yet.</h1>
          <p className="mt-3 text-body-lg text-slate-300">
            Describe a product and Catalyst finds where its audience is.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/app">New campaign</Link>
            </Button>
            <Button variant="secondary" onClick={restoreShippedCampaigns}>
              Restore sample campaigns
            </Button>
          </div>
        </div>
        {removed && (
          <UndoToast
            message="Campaign deleted"
            actionLabel="Undo"
            onAction={undo}
            onDismiss={() => setRemoved(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1120px] px-8 py-12">
        <h1 className="ct-display text-headline text-slate-100">Campaigns</h1>

        <ul className="mt-8">
          {campaigns.map((c) => (
            <li key={c.id} className="group flex items-center border-t border-border">
              <Link
                href={routeForStatus(c.id, c.status)}
                className="flex min-w-0 flex-1 items-center gap-5 rounded-sm px-2 py-4 transition-colors duration-[120ms] ease-ct hover:bg-ink-200"
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

              {/* Destructive, so it sits apart from the row's own action and
                  carries the danger colour on hover rather than by default. */}
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Delete ${c.brief.product_name}`}
                className="ml-3 flex size-11 shrink-0 items-center justify-center rounded-sm text-slate-400 opacity-0 transition-[color,opacity,background-color] duration-[120ms] ease-ct hover:bg-red-wash hover:text-red-bright focus-visible:opacity-100 group-hover:opacity-100"
              >
                <IconTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {removed && (
        <UndoToast
          message="Campaign deleted"
          actionLabel="Undo"
          onAction={undo}
          onDismiss={() => setRemoved(null)}
        />
      )}
    </>
  );
}
