import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { IconBroadcast, IconHeartDollar, IconMessageCircleHeart, IconPlayerPlay } from "@tabler/icons-react";

export default function LivePage() {
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

      <section className="lc-media-placeholder video">
        <div className="lc-poster-copy">
          <IconBroadcast size={42} stroke={1.7} />
          <strong>Sunday Worship Livestream</strong>
          <span className="lc-muted">The live player will appear here whenever the church stream is active.</span>
        </div>
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Liberty Church Worship Service</h2>
          <p className="lc-muted">Sundays at 10:00 AM</p>
        </div>
        <p>Use this screen for the live service, then jump straight into prayer, giving, or the latest sermon library after the stream.</p>
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
