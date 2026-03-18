import { BodyClass } from "@/components/BodyClass";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { getYouthPageContent } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";
import { IconBook2, IconChevronDown, IconSpeakerphone } from "@tabler/icons-react";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture } = await getYouthPageContent();
  const primaryAnnouncement = youthAnnouncements[0] || null;

  return (
    <AppShell navKey="youth" theme="youth" title="Youth" subtitle="Youth devotional and latest updates.">
      <BodyClass className="youth" />
      <BackRow fallbackHref="/member/more" />

      <section className="lc-card alt lc-youth-weekly-devotional-card">
        <div className="lc-section-head">
          <h2>Weekly Devotional</h2>
        </div>
        <div className="lc-rich-copy">
          <div className="lc-announcement-meta">
            <IconBook2 size={16} stroke={1.8} />
            <span>{youthScripture.reference}</span>
          </div>
          <blockquote>{youthScripture.verse_text}</blockquote>
        </div>
      </section>

      <section className="lc-stack">
        <details className="lc-accordion-card lc-home-announcement-accordion">
          <summary className="lc-accordion-summary">
            <span className="lc-accordion-copy">
              <strong>Announcements and Events</strong>
              <span>Open to read the latest update.</span>
            </span>
            <span className="lc-accordion-chevron" aria-hidden="true">
              <IconChevronDown size={18} stroke={2} />
            </span>
          </summary>
          <div className="lc-accordion-panel">
            {primaryAnnouncement ? (
              <article className="lc-home-announcement-scroll">
                <h3>{primaryAnnouncement.title}</h3>
                <p className="lc-muted">{formatMemberDate(primaryAnnouncement.startsAt || primaryAnnouncement.createdAt)}</p>
                <p>{primaryAnnouncement.body}</p>
              </article>
            ) : (
              <article className="lc-home-announcement-scroll">
                <div className="lc-announcement-meta">
                  <IconSpeakerphone size={16} stroke={1.8} />
                  <span>No youth announcements have been published yet.</span>
                </div>
              </article>
            )}
          </div>
        </details>
      </section>

      <section className="lc-card lc-live-action-card">
        <ButtonRow
          columns={1}
          actions={[
            {
              label: "See Our Past Events",
              href: "/member/youth/event",
              variant: "primary lc-live-primary-action",
            },
          ]}
        />
      </section>
    </AppShell>
  );
}
