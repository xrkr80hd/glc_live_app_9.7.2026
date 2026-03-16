import Link from "next/link";
import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { HomeWelcomeToast } from "@/components/app-shell/HomeWelcomeToast";
import { getHomepageContent, getSermonsContent } from "@/lib/content";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";
import {
  IconClockHour3,
  IconBible,
  IconMapPin,
  IconSpeakerphone,
} from "@tabler/icons-react";

export default async function HomePage() {
  const currentMember = await getCurrentMemberFromServerCookies();
  const [{ announcements, memberScripture }, { videos }] = await Promise.all([getHomepageContent(), getSermonsContent()]);
  const primaryAnnouncement = announcements[0] || null;
  const latestSermon = videos[0] || null;
  const memberName = currentMember?.member?.full_name || currentMember?.session?.fullName || "";
  const firstName = memberName.split(" ")?.[0] || "";

  return (
    <AppShell navKey="home" title={null} subtitle={null}>
      <HomeWelcomeToast firstName={firstName} />

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Scripture of the Day</h2>
        </div>
        <div className="lc-rich-copy">
          <div className="lc-announcement-meta">
            <IconBible size={16} stroke={1.8} />
            <span>{memberScripture.reference}</span>
          </div>
          <blockquote>{memberScripture.verse_text}</blockquote>
        </div>
      </section>

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Latest Sermon</h2>
          <p className="lc-muted">The newest message is ready when you are.</p>
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
          <p className="lc-muted">The latest church update at a glance.</p>
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

      <Link href="/member/youth" className="lc-card lc-youth-gateway-card">
        <span className="lc-hero-eyebrow">LC Youth</span>
        <div className="lc-section-head">
          <h2>Youth! Go Here!</h2>
          <p className="lc-muted">Open the youth area for student devotion, updates, and upcoming events.</p>
        </div>
      </Link>
    </AppShell>
  );
}
