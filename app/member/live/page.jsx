import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { getLivestreamContent } from "@/lib/content";
import { IconBible, IconBroadcast, IconHeartDollar, IconPlayerPlay } from "@tabler/icons-react";

export default async function LivePage() {
  const livestream = await getLivestreamContent();

  return (
    <AppShell navKey="live" title="Watch Live" subtitle="Join today's service stream.">
      <BackRow fallbackHref="/member" />

      {livestream?.isLive && livestream.liveEmbedUrl ? (
        <section className="lc-card alt">
          <div className="lc-video-frame">
            <iframe
              src={livestream.liveEmbedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              title={livestream.title || "Live stream"}
            />
          </div>
        </section>
      ) : livestream?.fallbackVideoUrl ? (
        <section className="lc-card alt">
          <div className="lc-video-frame">
            <video autoPlay muted loop playsInline preload="metadata" title={livestream.title || "Live stream fallback"}>
              <source src={livestream.fallbackVideoUrl} />
            </video>
          </div>
        </section>
      ) : (
        <section className="lc-media-placeholder video">
          <div className="lc-poster-copy">
            <IconBroadcast size={42} stroke={1.7} />
            <strong>{livestream?.title || "Sunday Worship Livestream"}</strong>
            <span className="lc-muted">{livestream?.note || "The live player will appear here whenever the church stream is active."}</span>
          </div>
        </section>
      )}

      <section className="lc-card lc-live-action-card">
        <ButtonRow
          columns={1}
          actions={[
            {
              label: "Give",
              href: "/member/give",
              variant: "primary lc-live-primary-action",
              icon: IconHeartDollar,
            },
            {
              label: "Click here to see past sermons",
              href: "/member/sermons",
              variant: "primary lc-live-primary-action",
              icon: IconPlayerPlay,
            },
            {
              label: "Beliefs",
              href: "/member/beliefs",
              variant: "primary lc-live-primary-action",
              icon: IconBible,
            },
          ]}
        />
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>{livestream?.title || "Liberty Church Worship Service"}</h2>
          <p className="lc-muted">{livestream?.isLive ? "Live right now" : "Sundays at 10:00 AM"}</p>
        </div>
        <p>{livestream?.note || "Use this screen for the live service, then jump straight into prayer, giving, or the latest sermon library after the stream."}</p>
      </section>
    </AppShell>
  );
}
