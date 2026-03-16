import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { IconBroadcast, IconHeartDollar, IconMessageCircleHeart, IconPlayerPlay } from "@tabler/icons-react";

export default function LivePage() {
  const actions = [
    {
      label: "Watch Sermons",
      href: "/sermons",
      icon: IconPlayerPlay,
      variant: "primary",
    },
    {
      label: "Submit Prayer Request",
      href: "/prayer",
      icon: IconMessageCircleHeart,
      variant: "secondary",
    },
    {
      label: "Give",
      href: "/give",
      icon: IconHeartDollar,
      variant: "ghost",
    },
  ];

  return (
    <AppShell navKey="live" title="Watch Live" subtitle="Join the current stream and follow along with today’s service.">
      <BackRow fallbackHref="/" />

      <section className="lc-media-placeholder video">
        <div className="lc-poster-copy">
          <IconBroadcast size={42} stroke={1.7} />
          <strong>[STREAM_TITLE]</strong>
          <span className="lc-muted">Livestream player area</span>
        </div>
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>[SERVICE_NAME]</h2>
          <p className="lc-muted">[SERVICE_DATE]</p>
        </div>
        <p>[SERVICE_DESCRIPTION]</p>
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Next Actions</h2>
          <p className="lc-muted">Keep related actions close to the live experience.</p>
        </div>
        <ButtonRow actions={actions} />
      </section>
    </AppShell>
  );
}
