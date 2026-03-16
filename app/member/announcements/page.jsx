import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getMemberAnnouncementsContent } from "@/lib/content";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";

export default async function AnnouncementsPage() {
  const announcements = await getMemberAnnouncementsContent();

  return (
    <AppShell navKey="home" title="Announcements" subtitle="Church-wide updates and event notices.">
      <BackRow fallbackHref="/member" />

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>All Announcements</h2>
          <p className="lc-muted">Browse current updates, reminders, and upcoming event notices.</p>
        </div>
        {announcements.length ? (
          announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              title={item.title}
              summary={summarizeText(item.body, 150)}
              date={formatMemberDate(item.startsAt || item.createdAt)}
              href={`/member/announcements/${item.id}`}
              ctaLabel="Read Detail"
            />
          ))
        ) : (
          <section className="lc-card alt">
            <p className="lc-muted">Announcements will appear here as soon as they are published on the church site.</p>
          </section>
        )}
      </section>
    </AppShell>
  );
}
