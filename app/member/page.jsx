import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { getHomepageContent, getSermonsContent } from "@/lib/content";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";
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

export default async function HomePage() {
  const currentMember = await getCurrentMemberFromServerCookies();
  const [{ announcements, livestream }, { videos }] = await Promise.all([getHomepageContent(), getSermonsContent()]);
  const primaryAnnouncement = announcements[0] || null;
  const latestSermon = videos[0] || null;
  const memberName = currentMember?.member?.full_name || currentMember?.session?.fullName || "";
  const firstName = memberName.split(" ")?.[0] || "there";
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
          <h1 className="lc-home-title">{`Welcome back, ${firstName}`}</h1>
          <p className="lc-muted">Stay connected with Liberty Church through live worship, sermons, prayer, and church updates.</p>
        </div>
        <div className="lc-kpi-row">
          <div className="lc-stat-card">
            <strong>Service Times</strong>
            <span>Sundays at 10:00 AM</span>
          </div>
          <div className="lc-stat-card">
            <strong>Live Status</strong>
            <span>{livestream?.isLive ? "Streaming now" : "Offline right now"}</span>
          </div>
        </div>
        <div className="lc-hero-note">
          <div className="lc-announcement-meta">
            <IconSpeakerphone size={16} stroke={1.8} />
            <span>Today at a glance: worship, prayer, messages, and church updates in one place.</span>
          </div>
        </div>
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Quick Access</h2>
          <p className="lc-muted">Jump into the most-used areas of the app.</p>
        </div>
        <ButtonRow actions={quickActions} columns={2} />
      </section>

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Latest Sermon</h2>
          <p className="lc-muted">Keep the newest message within easy reach from the member home screen.</p>
        </div>
        {latestSermon ? (
          <AnnouncementCard
            title={latestSermon.title}
            summary={summarizeText(latestSermon.description || "Open the sermon library to watch the newest message.", 130)}
            date={formatMemberDate(latestSermon.publishedAt, "Recent message")}
            href="/member/sermons"
            ctaLabel="Watch Sermon"
          />
        ) : (
          <div className="lc-rich-copy">
            <p>New sermon uploads will appear here as soon as they are published.</p>
          </div>
        )}
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Announcements</h2>
          <p className="lc-muted">Preview the latest update, then open the full announcement list.</p>
        </div>
        {primaryAnnouncement ? (
          <AnnouncementCard
            title={primaryAnnouncement.title}
            summary={summarizeText(primaryAnnouncement.body, 130)}
            date={formatMemberDate(primaryAnnouncement.startsAt || primaryAnnouncement.createdAt)}
            href={`/member/announcements/${primaryAnnouncement.id}`}
            ctaLabel="Read Update"
          />
        ) : (
          <section className="lc-card alt flat">
            <div className="lc-announcement-meta">
              <IconSpeakerphone size={16} stroke={1.8} />
              <span>No announcements have been published yet.</span>
            </div>
          </section>
        )}
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Service Times</h2>
          <p className="lc-muted">Keep weekly gathering details visible at a glance.</p>
        </div>
        <div className="lc-stack">
          <div className="lc-announcement-meta">
            <IconClockHour3 size={16} stroke={1.8} />
            <span>Sundays at 10:00 AM</span>
          </div>
          <div className="lc-announcement-meta">
            <IconClockHour3 size={16} stroke={1.8} />
            <span>Youth Devotion at 9:20 AM</span>
          </div>
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>100 McKeithen Dr, Alexandria, LA</span>
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
