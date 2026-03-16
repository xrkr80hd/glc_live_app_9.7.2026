import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { YouthGlassCard } from "@/components/app-shell/YouthGlassCard";
import { YouthHero } from "@/components/app-shell/YouthHero";
import { youthDevotionalPlaceholders, youthEventPlaceholders } from "@/lib/mobile-app-content";
import { IconBook2, IconCalendarEvent, IconMapPin, IconSparkles } from "@tabler/icons-react";

export default function YouthPage() {
  const actions = [
    {
      label: "Read Devotional",
      href: "/member/youth/devotional",
      icon: IconBook2,
      variant: "primary",
    },
    {
      label: "View Event",
      href: "/member/youth/event",
      icon: IconCalendarEvent,
      variant: "ghost",
    },
  ];

  return (
    <AppShell
      navKey="more"
      theme="youth"
      title="Youth"
      subtitle="Youth nights, devotionals, and event details."
    >
      <BackRow fallbackHref="/member/more" />

      <YouthHero
        eyebrow="LC Youth"
        title="Stay connected with youth ministry"
        description="Jump into devotionals, event details, and the latest youth updates."
      >
        <ButtonRow actions={actions} />
      </YouthHero>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>Devotional</h2>
          <p className="lc-muted">The Read Devotional button routes to the dedicated devotional page.</p>
        </div>
        <div className="lc-stack">
          <strong>{youthDevotionalPlaceholders.title}</strong>
          <span className="lc-muted">{youthDevotionalPlaceholders.reference}</span>
        </div>
      </YouthGlassCard>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>Youth Event</h2>
          <p className="lc-muted">Event cards route to the youth event detail page.</p>
        </div>
        <div className="lc-stack">
          <strong>{youthEventPlaceholders.title}</strong>
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>{youthEventPlaceholders.location}</span>
          </div>
          <span className="lc-pill">
            <IconSparkles size={14} stroke={1.8} />
            Upcoming event
          </span>
        </div>
      </YouthGlassCard>
    </AppShell>
  );
}
