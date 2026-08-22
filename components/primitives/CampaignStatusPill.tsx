import type { CampaignStatus } from "@/lib/campaign";
import { STATUS_LABEL } from "@/lib/campaign";

/** Wash background plus a 1px dim border in the state hue. */
const STYLE: Record<CampaignStatus, string> = {
  READY_FOR_RESEARCH: "bg-violet-wash border border-violet-dim text-violet-bright",
  READY_FOR_CREATIVE: "bg-sodium-wash border border-sodium-dim text-sodium-bright",
  READY_FOR_REVIEW: "bg-sodium-wash border border-sodium-dim text-sodium-bright",
  ACTIVE: "bg-green-wash border border-green-dim text-green-bright",
};

export function CampaignStatusPill({
  status,
  className = "",
}: {
  status: CampaignStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-label leading-none ${STYLE[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
