import { CampaignProvider } from "@/components/dashboard/CampaignProvider";

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return <CampaignProvider>{children}</CampaignProvider>;
}
