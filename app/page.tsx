import { demoRun } from "@/lib/demo-run";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { StageSplit } from "@/components/site/StageSplit";
import { AuditStream } from "@/components/site/AuditStream";
import { CachedVsLive } from "@/components/site/CachedVsLive";
import { ConnectionsStrip } from "@/components/site/ConnectionsStrip";
import { Footer } from "@/components/site/Footer";
import { PostHeroRegion, RunProvider } from "@/components/site/RunProvider";

export default function Page() {
  return (
    <RunProvider run={demoRun}>
      <Nav />
      <Hero run={demoRun} />
      <PostHeroRegion>
        <StageSplit run={demoRun} />
        <AuditStream run={demoRun} />
        <CachedVsLive run={demoRun} />
        <ConnectionsStrip />
        <Footer />
      </PostHeroRegion>
    </RunProvider>
  );
}
