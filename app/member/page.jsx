import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { HomeQuickLinksAccordion } from "@/components/app-shell/HomeQuickLinksAccordion";
import { getHomepageContent } from "@/lib/content";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { formatMemberDate } from "@/lib/member-page-data";
import {
  IconBrandFacebook,
  IconBrandYoutube,
  IconPhone,
  IconChevronDown,
  IconClockHour3,
  IconBible,
  IconMapPin,
  IconSpeakerphone,
} from "@tabler/icons-react";

export default async function HomePage() {
  const currentMember = await getCurrentMemberFromServerCookies();
  const { announcements, memberScripture } = await getHomepageContent();
  const primaryAnnouncement = announcements[0] || null;
  const memberName = currentMember?.member?.full_name || currentMember?.session?.fullName || "";
  const firstName = memberName.split(" ")?.[0] || "";
  const memberEmail = currentMember?.user?.email || currentMember?.member?.email || currentMember?.session?.email || "";
  const memberUsername = currentMember?.member?.username || currentMember?.session?.username || "";
  const memberLoginId = memberEmail || (memberUsername ? `@${memberUsername}` : "");
  const homeTitle = firstName ? `Welcome, ${firstName}` : "Welcome";
  const homeSubtitle = memberLoginId || "Member";

  return (
    <AppShell navKey="home" title={homeTitle} subtitle={homeSubtitle}>
      <section className="lc-card alt lc-home-daily-verse-card">
        <div className="lc-section-head">
          <h2>Daily Verse</h2>
        </div>
        <div className="lc-rich-copy">
          <div className="lc-announcement-meta">
            <IconBible size={16} stroke={1.8} />
            <span>{memberScripture.reference}</span>
          </div>
          <blockquote>{memberScripture.verse_text}</blockquote>
        </div>
      </section>

      <HomeQuickLinksAccordion />

      <section className="lc-stack">
        {primaryAnnouncement ? (
          <details className="lc-accordion-card lc-home-announcement-accordion">
            <summary className="lc-accordion-summary">
              <span className="lc-accordion-copy">
                <strong>Announcements</strong>
                <span>Open to read the latest update.</span>
              </span>
              <span className="lc-accordion-chevron" aria-hidden="true">
                <IconChevronDown size={18} stroke={2} />
              </span>
            </summary>
            <div className="lc-accordion-panel">
              <article className="lc-home-announcement-scroll">
                <h3>{primaryAnnouncement.title}</h3>
                <p className="lc-muted">{formatMemberDate(primaryAnnouncement.startsAt || primaryAnnouncement.createdAt)}</p>
                <p>{primaryAnnouncement.body}</p>
              </article>
              <Link href={`/member/announcements/${primaryAnnouncement.id}`} className="lc-action-link primary">
                Read More
              </Link>
            </div>
          </details>
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

      <section className="lc-card lc-home-social-card">
        <div className="lc-section-head">
          <h2>Social Links</h2>
          <p className="lc-muted">Connect with Liberty Church.</p>
        </div>
        <div className="lc-home-social-links">
          <a href="tel:+13184483880" className="lc-home-social-link" aria-label="Call church" title="Call Church">
            <IconPhone size={22} stroke={1.9} />
          </a>
          <a href="https://www.facebook.com/CenlaChurch" target="_blank" rel="noopener noreferrer" className="lc-home-social-link" aria-label="Facebook" title="Facebook">
            <IconBrandFacebook size={22} stroke={1.9} />
          </a>
          <a href="https://www.youtube.com/@libertychurchcenla" target="_blank" rel="noopener noreferrer" className="lc-home-social-link" aria-label="Liberty Church Cenla YouTube" title="Liberty Church Cenla YouTube">
            <IconBrandYoutube size={22} stroke={1.9} />
          </a>
        </div>
      </section>
    </AppShell>
  );
}
