import { BodyClass } from "@/components/BodyClass";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getYouthPageContent } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";
import Link from "next/link";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture } = await getYouthPageContent();
  const primaryAnnouncement = youthAnnouncements[0] || null;
  const primaryAnnouncementImageUrl = String(primaryAnnouncement?.imageUrl || primaryAnnouncement?.image_url || "").trim();
  const primaryAnnouncementImageAlt =
    String(primaryAnnouncement?.imageAlt || primaryAnnouncement?.image_alt || "").trim() ||
    (primaryAnnouncement?.title ? `${primaryAnnouncement.title} announcement image` : "Announcement image");

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
          <details className="lc-accordion-card lc-home-announcement-accordion">
            <summary className="lc-accordion-summary">
              <span className="lc-accordion-copy">
                <strong>Announcements and Events</strong>
                <span>Open to read the latest update.</span>
              </span>
              <span className="lc-accordion-chevron" aria-hidden="true">v</span>
            </summary>
            <div className="lc-accordion-panel">
              {primaryAnnouncement ? (
                <article className="lc-home-announcement-scroll">
                  <h3>{primaryAnnouncement.title}</h3>
                  <p className="lc-muted">{formatMemberDate(primaryAnnouncement.startsAt || primaryAnnouncement.createdAt)}</p>
                  {primaryAnnouncementImageUrl ? (
                    <div
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid rgba(140, 152, 164, 0.24)",
                        margin: "0.45rem 0 0.7rem",
                      }}
                    >
                      <img
                        src={primaryAnnouncementImageUrl}
                        alt={primaryAnnouncementImageAlt}
                        loading="lazy"
                        style={{
                          width: "100%",
                          display: "block",
                          aspectRatio: "16 / 9",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : null}
                  <p>{primaryAnnouncement.body}</p>
                  <p>
                    <Link href="/member/youth/announcements" className="lc-link-inline">View all youth announcements</Link>
                  </p>
                </article>
              ) : (
                <article className="lc-home-announcement-scroll">
                  <p className="lc-muted">No youth announcements have been published yet.</p>
                  <p>
                    <Link href="/member/youth/announcements" className="lc-link-inline">Open youth announcements</Link>
                  </p>
                </article>
              )}
            </div>
          </details>
        </section>

      </div>
    </AppShell>
  );
}
