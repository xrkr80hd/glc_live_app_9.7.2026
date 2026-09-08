import { BodyClass } from "@/components/BodyClass";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { HomeAnnouncementsCarousel } from "@/components/public-site/HomeAnnouncementsCarousel";
import { getYouthPageContent } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";

function announcementSlides(items) {
  return (items || []).map((item) => {
    const imageUrl = String(item?.imageUrl || item?.image_url || "").trim();
    const imageAlt = String(item?.imageAlt || item?.image_alt || "").trim() || (item?.title ? `${item.title} announcement image` : "Announcement image");
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      dateLabel: formatMemberDate(item.startsAt || item.starts_at || item.createdAt || item.created_at),
      imageUrl,
      imageAlt,
    };
  });
}

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture } = await getYouthPageContent();
  const slides = announcementSlides(youthAnnouncements);

  return (
    <AppShell navKey="youth" theme="youth" title="Youth" subtitle="Youth devotional and latest updates.">
      <BodyClass className="youth" />
      <div className="lc-member-youth-page">
        <BackRow fallbackHref="/member/more" />

        <section className="lc-card alt lc-youth-weekly-devotional-card">
          <div className="lc-section-head">
            <h2>Scripture of the Week</h2>
          </div>
          <div className="lc-rich-copy">
            <h3>Scripture</h3>
            <p>{youthScripture.title || "Scripture"}</p>
            <h3>The Actual Scripture Used</h3>
            <p className="lc-muted">{youthScripture.reference}</p>
            <h3>The Text</h3>
            <blockquote>{youthScripture.verse_text}</blockquote>
            <h3>Lean In</h3>
            <p>{youthScripture.devotional_text || "Take this verse with you this week and ask God how to live it out today."}</p>
          </div>
        </section>

        <section className="lc-stack">
          <div className="lc-section-head">
            <h2>Announcements and Events</h2>
          </div>
          <HomeAnnouncementsCarousel announcements={slides} variant="youth" />
        </section>
      </div>
    </AppShell>
  );
}
