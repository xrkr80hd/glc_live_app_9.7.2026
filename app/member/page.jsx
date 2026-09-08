import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { HomeQuickLinksAccordion } from "@/components/app-shell/HomeQuickLinksAccordion";
import { HomeAnnouncementsCarousel } from "@/components/public-site/HomeAnnouncementsCarousel";
import { getHomepageContent, getSocialLinksContent } from "@/lib/content";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { formatMemberDate } from "@/lib/member-page-data";
import { getDashboardViewerContext } from "@/lib/role-dashboard-config";
import {
  IconBrandFacebook,
  IconBrandYoutube,
  IconPhone,
  IconClockHour3,
  IconBible,
  IconMapPin,
} from "@tabler/icons-react";

const SOCIAL_FALLBACKS = {
  facebook: "https://www.facebook.com/CenlaChurch/",
  youtube: "https://www.youtube.com/@libertychurchcenla",
};

function findSocialUrl(links, platformKey, fallback = "") {
  const list = Array.isArray(links) ? links : [];
  const matched = list.find((item) => String(item?.platformKey || "").toLowerCase() === platformKey);
  const url = String(matched?.url || "").trim();
  return url || fallback;
}

function toAnnouncementSlides(announcements) {
  return (announcements || []).map((announcement) => {
    const imageUrl = String(announcement?.imageUrl || announcement?.image_url || "").trim();
    const imageAlt = String(announcement?.imageAlt || announcement?.image_alt || "").trim() || (announcement?.title ? `${announcement.title} announcement image` : "Announcement image");
    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      dateLabel: formatMemberDate(announcement.startsAt || announcement.starts_at || announcement.createdAt || announcement.created_at),
      imageUrl,
      imageAlt,
    };
  });
}

export default async function HomePage() {
  const viewer = await getDashboardViewerContext();
  const currentMember = viewer?.currentMember || (await getCurrentMemberFromServerCookies());
  const [homepageContent, socialLinks] = await Promise.all([getHomepageContent(), getSocialLinksContent()]);
  const { announcements, memberScripture } = homepageContent;
  const announcementSlides = toAnnouncementSlides(announcements);
  const facebookUrl = findSocialUrl(socialLinks, "facebook", SOCIAL_FALLBACKS.facebook);
  const youtubeUrl = findSocialUrl(socialLinks, "youtube", SOCIAL_FALLBACKS.youtube);
  const elevatedDashboardCount = (viewer?.accessibleDashboardKeys || []).filter((key) => key !== "member").length;
  const hasElevatedAccess = elevatedDashboardCount > 0;
  const memberName = currentMember?.member?.full_name || currentMember?.session?.fullName || "";
  const firstName = memberName.split(" ")?.[0] || "";
  const memberEmail = currentMember?.user?.email || currentMember?.member?.email || currentMember?.session?.email || "";
  const memberUsername = currentMember?.member?.username || currentMember?.session?.username || "";
  const memberLoginId = memberEmail || (memberUsername ? `@${memberUsername}` : "");
  const homeTitle = firstName ? `Welcome, ${firstName}` : "Welcome";
  const homeSubtitle = memberLoginId || "Member";
  const footerContent = hasElevatedAccess ? (
    <div className="lc-home-admin-cta-wrap">
      <Link href="/dashboard" className="lc-home-admin-cta-btn">
        See My Admin
      </Link>
    </div>
  ) : null;

  return (
    <AppShell navKey="home" title={homeTitle} subtitle={homeSubtitle} footerContent={footerContent}>
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
        <div className="lc-section-head">
          <h2>Announcements</h2>
          <p className="lc-muted">Latest church updates and events.</p>
        </div>
        <HomeAnnouncementsCarousel announcements={announcementSlides} />
        <div className="flex justify-end">
          <Link href="/member/announcements" className="lc-link-inline">View all announcements</Link>
        </div>
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
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="lc-home-social-link" aria-label="Facebook" title="Facebook">
            <IconBrandFacebook size={22} stroke={1.9} />
          </a>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="lc-home-social-link" aria-label="Liberty Church Cenla YouTube" title="Liberty Church Cenla YouTube">
            <IconBrandYoutube size={22} stroke={1.9} />
          </a>
        </div>
      </section>
    </AppShell>
  );
}
