import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { announcementCards, homePlaceholders } from "@/lib/mobile-app-content";
import {
  IconBroadcast,
  IconClockHour3,
  IconHeartDollar,
  IconMapPin,
  IconPlayerPlay,
  IconPray,
  IconSparkles,
  IconSpeakerphone,
} from "@tabler/icons-react";

export default function HomePage() {
  const primaryAnnouncement = announcementCards[0];
  const quickActions = [
    {
      label: "Watch Live",
      href: "/member/live",
      icon: IconBroadcast,
      variant: "primary",
    },
    {
      label: "Sermons",
      href: "/member/sermons",
      icon: IconPlayerPlay,
      variant: "secondary",
    },
    {
      label: "Prayer",
      href: "/member/prayer",
      icon: IconPray,
      variant: "ghost",
    },
    {
      label: "Give",
      href: "/member/give",
      icon: IconHeartDollar,
      variant: "ghost",
    },
  ];

  return (
    <AppShell navKey="home" title={null} subtitle={null}>
      <section className="lc-hero-card">
        <span className="lc-hero-eyebrow">
          <IconSparkles size={14} stroke={1.8} />
          Welcome
        </span>
        <div className="lc-stack">
          <h1 className="lc-home-title">{homePlaceholders.welcomeMessage}</h1>
          <p className="lc-muted">{homePlaceholders.churchIdentityLine}</p>
        </div>
        <div className="lc-kpi-row">
          <div className="lc-stat-card">
            <strong>Service Times</strong>
            <span>{homePlaceholders.serviceTimePrimary}</span>
          </div>
          <div className="lc-stat-card">
            <strong>Campus</strong>
            <span>{homePlaceholders.serviceLocation}</span>
          </div>
        </div>
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Quick Access</h2>
          <p className="lc-muted">Jump into the most-used areas of the app.</p>
        </div>
        <ButtonRow actions={quickActions} />
      </section>

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Daily Verse</h2>
          <p className="lc-muted">A dedicated verse card stays near the top of Home.</p>
        </div>
        <div className="lc-rich-copy">
          <blockquote>{homePlaceholders.dailyVerseText}</blockquote>
          <strong>{homePlaceholders.dailyVerseReference}</strong>
        </div>
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Announcements</h2>
          <p className="lc-muted">Preview the latest update, then open the full announcement list.</p>
        </div>
        <AnnouncementCard
          title={primaryAnnouncement.title}
          summary={primaryAnnouncement.summary}
          date={primaryAnnouncement.date}
          href="/member/announcements"
          ctaLabel="View All Announcements"
        />
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Service Times</h2>
          <p className="lc-muted">Keep weekly gathering details visible at a glance.</p>
        </div>
        <div className="lc-stack">
          <div className="lc-announcement-meta">
            <IconClockHour3 size={16} stroke={1.8} />
            <span>{homePlaceholders.serviceTimePrimary}</span>
          </div>
          <div className="lc-announcement-meta">
            <IconClockHour3 size={16} stroke={1.8} />
            <span>{homePlaceholders.serviceTimeSecondary}</span>
          </div>
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>{homePlaceholders.serviceLocation}</span>
          </div>
        </div>
      </section>

      <section className="lc-card alt flat">
        <div className="lc-announcement-meta">
          <IconSpeakerphone size={16} stroke={1.8} />
          <span>See the full list from the announcements screen.</span>
        </div>
      </section>
    </AppShell>
  );
}
