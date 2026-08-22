"use client";

import { usePathname } from "next/navigation";
import { useCampaigns } from "@/lib/useStore";
import { IconRail } from "@/components/dashboard/IconRail";
import { ContextColumn } from "@/components/dashboard/ContextColumn";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const campaigns = useCampaigns();

  // The contextual column lists campaigns on campaign routes, and is hidden
  // on the intake screen.
  const showContext = pathname.startsWith("/app/campaigns") && campaigns.length > 0;

  return (
    <div className="ct-shell" data-context={showContext || undefined}>
      <IconRail />
      {showContext && <ContextColumn campaigns={campaigns} />}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
