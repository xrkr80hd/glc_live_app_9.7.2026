import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { getLivestreamContent } from "@/lib/content";
import { IconBroadcast, IconHeartDollar, IconMessageCircleHeart, IconPlayerPlay } from "@tabler/icons-react";

export default async function LivePage() {
  const livestream = await getLivestreamContent();
  const actions = [
    {
      label: "Watch Sermons",
      href: "/member/sermons",
      icon: IconPlayerPlay,
      variant: "primary",
    },
    {
      label: "Submit Prayer Request",
      href: "/member/prayer",
      icon: IconMessageCircleHeart,
      variant: "secondary",
    },
    {
      label: "Give",
      href: "/member/give",
      icon: IconHeartDollar,
      variant: "ghost",
    },
  ];

  return (
    <AppShell navKey="live" title="Watch Live" subtitle="Join the current stream and follow along with today's service.">
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
      ) : (
        <section className="lc-media-placeholder video">
          <div className="lc-poster-copy">
            <IconBroadcast size={42} stroke={1.7} />
            <strong>{livestream?.title || "Sunday Worship Livestream"}</strong>
            <span className="lc-muted">{livestream?.note || "The live player will appear here whenever the church stream is active."}</span>
          </div>
        </section>
      )}

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>{livestream?.title || "Liberty Church Worship Service"}</h2>
          <p className="lc-muted">{livestream?.isLive ? "Live right now" : "Sundays at 10:00 AM"}</p>
        </div>
        <p>{livestream?.note || "Use this screen for the live service, then jump straight into prayer, giving, or the latest sermon library after the stream."}</p>
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Helpful Links</h2>
          <p className="lc-muted">A few nearby places you may want after the stream.</p>
        </div>
        <ButtonRow actions={actions} />
      </section>
    </AppShell>
  );
}
