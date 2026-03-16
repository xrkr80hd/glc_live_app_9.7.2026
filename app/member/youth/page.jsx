import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { YouthGlassCard } from "@/components/app-shell/YouthGlassCard";
import { YouthHero } from "@/components/app-shell/YouthHero";
import { getYouthPageContent } from "@/lib/content";
import { IconBook2, IconCalendarEvent, IconMapPin, IconSparkles } from "@tabler/icons-react";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture, youthBanner } = await getYouthPageContent();
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
        title={youthBanner?.title || "Stay connected with youth ministry"}
        description={youthBanner?.subtitle || "Jump into devotionals, event details, and the latest youth updates."}
      >
        <ButtonRow actions={actions} />
      </YouthHero>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>Scripture of the Week</h2>
          <p className="lc-muted">This section now follows the tone and visual direction of the youth website.</p>
        </div>
        <div className="lc-stack">
          <strong>{youthScripture.reference}</strong>
          <p className="lc-muted">{youthScripture.verse_text}</p>
        </div>
      </YouthGlassCard>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>Announcements and Events</h2>
          <p className="lc-muted">Fresh youth updates pulled from the same content stream used by the youth website.</p>
        </div>
        <div className="lc-stack">
          {youthAnnouncements.map((item) => (
            <article key={item.id} className="lc-card alt flat">
              <div className="lc-stack">
                <strong>{item.title}</strong>
                <p className="lc-muted">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </YouthGlassCard>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>Gather With Us</h2>
          <p className="lc-muted">A simple reminder card for students and families opening the youth tab.</p>
        </div>
        <div className="lc-stack">
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>Liberty Church Youth Space</span>
          </div>
          <span className="lc-pill">
            <IconSparkles size={14} stroke={1.8} />
            Sundays at 9:20 AM
          </span>
        </div>
      </YouthGlassCard>
    </AppShell>
  );
}
