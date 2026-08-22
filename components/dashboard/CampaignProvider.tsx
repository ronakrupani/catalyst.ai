"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { Campaign } from "@/lib/campaign";
import { routeForStatus } from "@/lib/campaign";
import { useCampaignById, useHydrated } from "@/lib/useStore";
import { Button } from "@/components/ui/button";

const Ctx = createContext<{ campaign: Campaign } | null>(null);

export function useCampaign() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCampaign must be used inside <CampaignProvider>");
  return ctx;
}

/** Links are public and shared, so an id that does not resolve gets a real screen. */
function NotFound() {
  return (
    <div className="mx-auto max-w-[1120px] px-8 py-16">
      <h1 className="ct-display text-headline text-slate-100">No campaign with that id.</h1>
      <p className="mt-3 text-body-lg text-slate-300">
        It may have been removed, or the link is wrong.
      </p>
      <Button asChild className="mt-6">
        <Link href="/app">Start a campaign</Link>
      </Button>
    </div>
  );
}

/**
 * Loads the campaign from its id alone, and holds the spine: if the route does
 * not match the campaign's status, a stale link lands on the truth rather than
 * a broken screen.
 */
export function CampaignProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  // Subscribed rather than snapshotted, so a step that advances the status is
  // seen immediately instead of being judged against a stale copy and
  // redirected back to the screen it just left.
  const hydrated = useHydrated();
  const campaign = useCampaignById(params.id) ?? null;

  useEffect(() => {
    if (!campaign) return;
    const expected = routeForStatus(campaign.id, campaign.status);
    if (pathname !== expected) router.replace(expected);
  }, [campaign, pathname, router]);

  // The store is client-side, so nothing renders until it is readable.
  if (!hydrated) return null;
  if (!campaign) return <NotFound />;

  const expected = routeForStatus(campaign.id, campaign.status);
  if (pathname !== expected) return null;

  return (
    <Ctx.Provider value={{ campaign }}>{children}</Ctx.Provider>
  );
}
