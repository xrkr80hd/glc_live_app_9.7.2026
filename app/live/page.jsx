import { LiveStreamClient } from "@/components/LiveStreamClient";
import { getLivestreamContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const livestream = await getLivestreamContent();
  const autoSwitchEnabled = process.env.NEXT_PUBLIC_LIVE_AUTO_SWITCH_ENABLED === "true";
  const statusPollMs = Number.parseInt(process.env.NEXT_PUBLIC_LIVE_STATUS_POLL_MS || "30000", 10);

  return (
    <section className="container">
      <LiveStreamClient
        title={livestream.title}
        isLive={livestream.isLive}
        liveEmbedUrl={livestream.liveEmbedUrl}
        fallbackVideoUrl={livestream.fallbackVideoUrl}
        watchCtaLabel={livestream.watchCtaLabel}
        note={livestream.note}
        autoSwitchEnabled={autoSwitchEnabled}
        statusPollMs={statusPollMs}
      />
    </section>
  );
}
