import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { YouthGlassCard } from "@/components/app-shell/YouthGlassCard";
import { youthEventPlaceholders } from "@/lib/mobile-app-content";
import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";

export default function YouthEventPage() {
  return (
    <AppShell navKey="more" theme="youth" title="Youth Event" subtitle="Event details, timing, and location for the next youth gathering.">
      <BackRow fallbackHref="/member/youth" useHistory={false} />

      <section className="lc-event-poster">
        <div className="lc-poster-copy">
          <strong>Liberty Youth Night</strong>
          <span className="lc-muted">Student event artwork and preview area</span>
        </div>
      </section>

      <YouthGlassCard>
        <div className="lc-section-head">
          <h2>{youthEventPlaceholders.title}</h2>
          <p className="lc-muted">{youthEventPlaceholders.description}</p>
        </div>
        <div className="lc-stack">
          <div className="lc-announcement-meta">
            <IconCalendarEvent size={16} stroke={1.8} />
            <span>
              {youthEventPlaceholders.date} • {youthEventPlaceholders.time}
            </span>
          </div>
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>{youthEventPlaceholders.location}</span>
          </div>
          <ButtonRow actions={[{ label: youthEventPlaceholders.cta, href: "/member/youth", variant: "ghost" }]} />
        </div>
      </YouthGlassCard>
    </AppShell>
  );
}
